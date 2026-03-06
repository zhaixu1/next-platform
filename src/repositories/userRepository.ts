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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await query(sql);
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

  // 4. 创建用户
  create: async (user: CreateUserDTO) => {
    const sql = 'INSERT INTO users (username, email) VALUES (?, ?)';
    return await query<OkPacket>(sql, [user.username, user.email]);
  }
};

