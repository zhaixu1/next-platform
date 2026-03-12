
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

// ─────────────────────────────────────────────────────────────
// 常量
// ─────────────────────────────────────────────────────────────

/** JWT 签名算法标识符（写入 header，标明使用 HMAC-SHA256） */
const ACCESS_TOKEN_ALG = 'HS256';

/** Access Token 默认有效时长：15 分钟（单位：秒） */
const DEFAULT_ACCESS_TOKEN_EXPIRES_IN_SECONDS = 15 * 60;

/** 生成 Refresh Token 时使用的随机字节数（32 字节 = 256 位随机性） */
const DEFAULT_REFRESH_TOKEN_BYTES = 32;


// ─────────────────────────────────────────────────────────────
// 类型定义
// ─────────────────────────────────────────────────────────────

/**
 * Access Token 的业务载荷（由调用方传入）
 *
 * - sub：用户 ID（subject，JWT 标准字段）
 * - username：用户名，前端可以直接读取显示
 * - role：用户角色，用于权限校验
 * - sessionId：关联的会话 ID，用于绑定 refresh_token / 踢下线
 */
export type AccessTokenPayload = {
  sub: string;
  username: string;
  role: string;
  sessionId: string;
};

/**
 * Access Token 完整 claims（载荷 + JWT 标准字段）
 * 这是最终被编码进 JWT 的内容。
 *
 * - iss：签发方（issuer）
 * - aud：受众（audience），防止 token 被用于其他服务
 * - iat：签发时间（issued at，Unix 时间戳，秒）
 * - exp：过期时间（expiration，Unix 时间戳，秒）
 */
type AccessTokenClaims = AccessTokenPayload & {
  iss: string;
  aud: string;
  iat: number;
  exp: number;
};


// ─────────────────────────────────────────────────────────────
// 读取配置
// ─────────────────────────────────────────────────────────────

/**
 * 从环境变量读取 JWT 签名密钥。
 * 如果未配置，直接抛错，避免用空密钥签名出来的 token 被当成有效 token。
 *
 * 环境变量：JWT_ACCESS_SECRET
 */
function getAccessTokenSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('缺少环境变量 JWT_ACCESS_SECRET');
  }
  return secret;
}

/**
 * 从环境变量读取 JWT 签发方（iss 字段）。
 * 未配置时默认使用 'next-platform'。
 *
 * 环境变量：JWT_ISSUER
 */
function getAccessTokenIssuer() {
  return process.env.JWT_ISSUER ?? 'next-platform';
}

/**
 * 从环境变量读取 JWT 受众（aud 字段）。
 * 未配置时默认使用 'next-platform-web'。
 *
 * 环境变量：JWT_AUDIENCE
 */
function getAccessTokenAudience() {
  return process.env.JWT_AUDIENCE ?? 'next-platform-web';
}

/**
 * 从环境变量读取 Access Token 有效时长（单位：秒）。
 * 未配置或配置不合法时，回退到默认值 15 分钟。
 *
 * 环境变量：JWT_ACCESS_EXPIRES_IN_SECONDS
 */
function getAccessTokenExpiresInSeconds() {
  const value = Number(process.env.JWT_ACCESS_EXPIRES_IN_SECONDS);
  return Number.isFinite(value) && value > 0
    ? value
    : DEFAULT_ACCESS_TOKEN_EXPIRES_IN_SECONDS;
}


// ─────────────────────────────────────────────────────────────
// Base64Url 编解码
// JWT 标准要求使用 base64url 编码（和普通 base64 相比，替换了 + / = 字符）
// ─────────────────────────────────────────────────────────────

/**
 * 将字符串或 Buffer 转成 base64url 格式。
 *
 * base64url 规则：
 * - '+' 替换成 '-'
 * - '/' 替换成 '_'
 * - 末尾的 '=' 填充去掉
 *
 * 用于编码 JWT 的 header、payload 和 signature。
 */
function base64UrlEncode(input: string | Buffer) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

/**
 * 将 base64url 格式字符串还原成 Buffer。
 * 是 base64UrlEncode 的逆操作，用于解码 JWT 的 payload 和 signature。
 *
 * 处理步骤：
 * 1. 把 base64url 特有的 '-' '_' 还原成标准 base64 的 '+' '/'
 * 2. 补全 '=' 填充（base64 要求长度为 4 的倍数）
 * 3. 用 Buffer 做 base64 解码
 */
function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding =
    normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, 'base64');
}


// ─────────────────────────────────────────────────────────────
// JWT 签名
// ─────────────────────────────────────────────────────────────

/**
 * 对 JWT 的 header + payload 做 HMAC-SHA256 签名。
 *
 * @param unsignedToken - JWT 的前两段，格式为：encodedHeader.encodedPayload
 * @param secret - JWT 签名密钥
 * @returns 签名结果（Buffer）
 */
function signJwtPart(unsignedToken: string, secret: string) {
  return createHmac('sha256', secret).update(unsignedToken).digest();
}


// ─────────────────────────────────────────────────────────────
// 对外暴露的工具函数
// ─────────────────────────────────────────────────────────────

/**
 * 签发 Access Token（JWT）
 *
 * 流程：
 * 1. 构造 JWT header（包含算法和类型）
 * 2. 构造 JWT claims（业务载荷 + 标准字段）
 * 3. 对 header + payload 做 base64url 编码
 * 4. 使用 HMAC-SHA256 + 密钥对前两段做签名
 * 5. 拼接成完整 JWT：encodedHeader.encodedPayload.encodedSignature
 *
 * @param payload - 业务载荷（userId、username、role、sessionId）
 * @returns 完整的 JWT 字符串
 */
export function signAccessToken(payload: AccessTokenPayload) {
  const secret = getAccessTokenSecret();
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + getAccessTokenExpiresInSeconds();

  // JWT header：标明签名算法
  const header = {
    alg: ACCESS_TOKEN_ALG,
    typ: 'JWT',
  };

  // JWT claims：业务载荷 + 标准字段
  const claims: AccessTokenClaims = {
    ...payload,
    iss: getAccessTokenIssuer(),
    aud: getAccessTokenAudience(),
    iat: issuedAt,
    exp: expiresAt,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(claims));

  // 待签名的部分：header.payload
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // 签名
  const signature = base64UrlEncode(signJwtPart(unsignedToken, secret));

  // 最终 JWT：header.payload.signature
  return `${unsignedToken}.${signature}`;
}

/**
 * 校验 Access Token（JWT）
 *
 * 校验步骤：
 * 1. 检查格式，必须是三段（header.payload.signature）
 * 2. 重新用密钥对 header.payload 签名，和 token 里的签名做比较
 *    使用 timingSafeEqual 恒定时间比较，防止时序攻击
 * 3. 校验 iss（签发方是否匹配）
 * 4. 校验 aud（受众是否匹配）
 * 5. 校验 exp（是否已过期）
 *
 * 任何一步失败都会直接抛错，调用方可以 catch 后返回 401。
 *
 * @param token - 待校验的 JWT 字符串
 * @returns 校验通过后的完整 claims
 */
export function verifyAccessToken(token: string) {
  const secret = getAccessTokenSecret();
  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');

  // 第一步：格式检查
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error('access token 格式不正确');
  }

  // 第二步：签名验证
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = signJwtPart(unsignedToken, secret);
  const actualSignature = base64UrlDecode(encodedSignature);

  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
    // timingSafeEqual：恒定时间比较，防止攻击者通过比较耗时推测签名内容
  ) {
    throw new Error('access token 签名无效');
  }

  // 解码 payload
  const claims = JSON.parse(
    base64UrlDecode(encodedPayload).toString('utf8')
  ) as AccessTokenClaims;

  const now = Math.floor(Date.now() / 1000);

  // 第三步：issuer 校验（防止其他服务签发的 token 被接受）
  if (claims.iss !== getAccessTokenIssuer()) {
    throw new Error('access token issuer 无效');
  }

  // 第四步：audience 校验（防止 token 被跨服务滥用）
  if (claims.aud !== getAccessTokenAudience()) {
    throw new Error('access token audience 无效');
  }

  // 第五步：过期校验
  if (claims.exp <= now) {
    throw new Error('access token 已过期');
  }

  return claims;
}

/**
 * 生成 Refresh Token
 *
 * 使用 32 字节（256 位）加密随机数，转成 base64url 编码字符串。
 * 这个值会通过 HttpOnly Cookie 下发给浏览器，
 * 服务端数据库里只保存它的哈希值，不保存明文。
 *
 * @returns 随机的 Refresh Token 字符串（约 43 个字符）
 */
export function generateRefreshToken() {
  return randomBytes(DEFAULT_REFRESH_TOKEN_BYTES).toString('base64url');
}

/**
 * 对 Refresh Token 做 SHA-256 哈希
 *
 * 目的：
 * - 数据库只存哈希值，即使数据库泄露，攻击者也无法直接用这个值登录
 * - 校验时把客户端传来的 refresh token 哈希后，再和数据库比较
 *
 * @param token - 原始 Refresh Token 字符串
 * @returns SHA-256 哈希的十六进制字符串
 */
export function hashRefreshToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * 生成会话 ID（sessionId）
 *
 * 用于唯一标识一次登录会话，存入 user_sessions 表，
 * 也会写入 Access Token 的 payload，用于绑定 token 和 session。
 *
 * 使用 16 字节随机数，转成 32 个十六进制字符。
 *
 * @returns 32 位十六进制字符串
 */
export function generateSessionId() {
  return randomBytes(16).toString('hex');
}
