// ─────────────────────────────────────────────────────────────
// 会话（user_sessions 表）相关类型
// ─────────────────────────────────────────────────────────────

/**
 * 对应数据库 user_sessions 表的完整结构
 */
export interface UserSession {
  id: number;

  /** 会话唯一标识，也写入 Access Token 的 payload */
  sessionId: string;

  /** 归属的用户 ID */
  userId: number;

  /** Refresh Token 的 SHA-256 哈希值，数据库只存哈希 */
  refreshTokenHash: string;

  /** 发起登录的客户端 User-Agent（可选） */
  userAgent: string | null;

  /** 发起登录时的 IP 地址（可选） */
  ipAddress: string | null;

  /** Refresh Token 的过期时间 */
  expiresAt: Date;

  /** 主动撤销时间（为 null 表示会话仍然有效） */
  revokedAt: Date | null;

  /** 最近一次被使用的时间（每次 refresh 时更新） */
  lastUsedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * 创建会话时需要传入的字段（id / createdAt / updatedAt 由数据库生成）
 */
export type CreateSessionDTO = {
  sessionId: string;
  userId: number;
  refreshTokenHash: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
};

