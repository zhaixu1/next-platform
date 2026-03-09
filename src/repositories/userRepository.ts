import { query, OkPacket } from '@/lib/mysql';
import { User, CreateUserDTO } from '@/types/user';

// Repository 层：只负责执行 SQL，不包含业务逻辑
export const userRepository = {
  // 1. 初始化表结构 (仅用于演示，生产环境通常用 Migration 工具)
  initTable: async () => {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        passwordhash VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await query(sql);

    // 兼容旧表结构：如果之前没有 passwordhash 字段，则补充该字段
    try {
      await query("ALTER TABLE users ADD COLUMN passwordhash VARCHAR(255) NULL");
    } catch {
      // 字段已存在时忽略错误
    }
  },

  // 2. 查询所有用户
  findAll: async () => {
    const sql = 'SELECT * FROM users ORDER BY id DESC LIMIT 10';
    return await query<User[]>(sql);
  },

  // 3. 根据 ID 查询用户
  findById: async (id: number) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const rows = await query<User[]>(sql, [id]);
    return rows[0] || null;
  },

  // 4. 根据登录信息查询用户
  findByCredentials: async (username: string, email: string, passwordhash: string) => {
    const sql = `
      SELECT * FROM users
      WHERE username = ? AND email = ? AND passwordhash = ?
      LIMIT 1
    `;
    const rows = await query<User[]>(sql, [username, email, passwordhash]);
    return rows[0] || null;
  },

  // 5. 创建用户
  create: async (user: CreateUserDTO) => {
    const sql = 'INSERT INTO users (username, email, passwordhash) VALUES (?, ?, ?)';
    return await query<OkPacket>(sql, [user.username, user.email, user.passwordhash]);
  }
};

