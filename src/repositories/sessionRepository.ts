import { query, OkPacket } from '@/lib/mysql';
import { CreateSessionDTO, UserSession } from '@/types/session';

// ─────────────────────────────────────────────────────────────
// sessionRepository
// 职责：只负责 user_sessions 表的增删改查，不包含任何业务逻辑
// ─────────────────────────────────────────────────────────────

export const sessionRepository = {

  /**
   * 创建新会话
   *
   * 在用户登录成功后调用，往 user_sessions 表插入一条记录，
   * 把 refresh token 的哈希值和会话元信息一起保存。
   *
   * @param dto - 创建会话所需字段
   * @returns 插入结果（包含 insertId）
   */
  create: async (dto: CreateSessionDTO): Promise<OkPacket> => {
    const sql = `
      INSERT INTO user_sessions
        (session_id, user_id, refresh_token_hash, user_agent, ip_address, expires_at)
      VALUES
        (?, ?, ?, ?, ?, ?)
    `;
    return await query<OkPacket>(sql, [
      dto.sessionId,
      dto.userId,
      dto.refreshTokenHash,
      dto.userAgent,
      dto.ipAddress,
      // Date 转成 MySQL DATETIME 格式字符串
      dto.expiresAt.toISOString().slice(0, 19).replace('T', ' '),
    ]);
  },

  /**
   * 根据 Refresh Token 哈希值查询会话
   *
   * 每次客户端携带 refresh_token 来刷新时，
   * 服务端先对 token 做 SHA-256 哈希，再用哈希值查这张表。
   * 这样数据库里永远不会出现明文 refresh token。
   *
   * 只返回：
   * - 还没过期（expires_at > NOW()）
   * - 还没被撤销（revoked_at IS NULL）
   *
   * @param hash - Refresh Token 的 SHA-256 哈希（十六进制字符串）
   * @returns 会话记录，找不到则返回 null
   */
  findByRefreshTokenHash: async (hash: string): Promise<UserSession | null> => {
    const sql = `
      SELECT
        id,
        session_id       AS sessionId,
        user_id          AS userId,
        refresh_token_hash AS refreshTokenHash,
        user_agent       AS userAgent,
        ip_address       AS ipAddress,
        expires_at       AS expiresAt,
        revoked_at       AS revokedAt,
        last_used_at     AS lastUsedAt,
        created_at       AS createdAt,
        updated_at       AS updatedAt
      FROM user_sessions
      WHERE refresh_token_hash = ?
        AND revoked_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `;
    const rows = await query<UserSession[]>(sql, [hash]);
    return rows[0] ?? null;
  },

  /**
   * 根据 sessionId 查询会话
   *
   * 用于在校验 Access Token 后，进一步确认对应的 session 是否仍然有效。
   * Access Token 的 payload 里携带了 sessionId，可以用这个方法做二次校验。
   *
   * 只返回：
   * - 还没过期
   * - 还没被撤销
   *
   * @param sessionId - 会话唯一标识
   * @returns 会话记录，找不到则返回 null
   */
  findBySessionId: async (sessionId: string): Promise<UserSession | null> => {
    const sql = `
      SELECT
        id,
        session_id       AS sessionId,
        user_id          AS userId,
        refresh_token_hash AS refreshTokenHash,
        user_agent       AS userAgent,
        ip_address       AS ipAddress,
        expires_at       AS expiresAt,
        revoked_at       AS revokedAt,
        last_used_at     AS lastUsedAt,
        created_at       AS createdAt,
        updated_at       AS updatedAt
      FROM user_sessions
      WHERE session_id = ?
        AND revoked_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `;
    const rows = await query<UserSession[]>(sql, [sessionId]);
    return rows[0] ?? null;
  },

  /**
   * 轮换 Refresh Token（Rotation）
   *
   * 每次客户端用 refresh token 来换新 access token 时，
   * 必须同时换掉 refresh token 本身（旧的作废，换新的），
   * 这样即使 refresh token 被窃取，攻击者最多只能用一次。
   *
   * 操作：
   * 1. 更新 refresh_token_hash 为新值
   * 2. 更新 expires_at 为新的过期时间
   * 3. 更新 last_used_at 为当前时间
   *
   * @param sessionId - 要更新的会话 ID
   * @param newRefreshTokenHash - 新 Refresh Token 的 SHA-256 哈希
   * @param newExpiresAt - 新的过期时间
   */
  rotateRefreshToken: async (
    sessionId: string,
    newRefreshTokenHash: string,
    newExpiresAt: Date
  ): Promise<void> => {
    const sql = `
      UPDATE user_sessions
      SET
        refresh_token_hash = ?,
        expires_at         = ?,
        last_used_at       = NOW()
      WHERE session_id = ?
    `;
    await query(sql, [
      newRefreshTokenHash,
      newExpiresAt.toISOString().slice(0, 19).replace('T', ' '),
      sessionId,
    ]);
  },

  /**
   * 撤销指定 sessionId 的会话
   *
   * 用户退出登录时调用，只把 revoked_at 设置为当前时间，
   * 不直接删除数据，方便后续做审计日志。
   *
   * 撤销后：
   * - findByRefreshTokenHash / findBySessionId 查不到这条记录
   * - 该会话下的 refresh token 和 access token 均视为失效
   *
   * @param sessionId - 要撤销的会话 ID
   */
  revokeBySessionId: async (sessionId: string): Promise<void> => {
    const sql = `
      UPDATE user_sessions
      SET revoked_at = NOW()
      WHERE session_id = ?
    `;
    await query(sql, [sessionId]);
  },

  /**
   * 撤销某个用户的所有会话
   *
   * 用于：
   * - 用户修改密码后，强制所有设备重新登录
   * - 管理员封禁用户
   * - 检测到异常登录后的紧急处置
   *
   * @param userId - 要踢下线的用户 ID
   */
  revokeAllByUserId: async (userId: number): Promise<void> => {
    const sql = `
      UPDATE user_sessions
      SET revoked_at = NOW()
      WHERE user_id = ?
        AND revoked_at IS NULL
    `;
    await query(sql, [userId]);
  },

  /**
   * 清理过期会话
   *
   * 定期执行（比如每天定时任务），删除已经过期的会话记录，
   * 避免 user_sessions 表无限增大。
   *
   * 只删除同时满足：
   * - expires_at 已经过期
   * - 或者已经被撤销超过 30 天
   */
  deleteExpiredSessions: async (): Promise<void> => {
    const sql = `
      DELETE FROM user_sessions
      WHERE expires_at < NOW()
        OR (revoked_at IS NOT NULL AND revoked_at < DATE_SUB(NOW(), INTERVAL 30 DAY))
    `;
    await query(sql);
  },
};

