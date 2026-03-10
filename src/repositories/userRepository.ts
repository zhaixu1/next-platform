import { query, OkPacket } from '@/lib/mysql';
import { User, CreateUserDTO } from '@/types/user';

type ColumnExistsRow = {
  Field: string;
};

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
    const columns = await query<ColumnExistsRow[]>("SHOW COLUMNS FROM users LIKE 'passwordhash'");
    if (columns.length === 0) {
      await query("ALTER TABLE users ADD COLUMN passwordhash VARCHAR(255) NULL");
    }
  },

  // 2. 查询所有用户
  findAll: async () => {
    const sql = `
      SELECT id, username, email, passwordhash AS passwordHash, created_at
      FROM users
      ORDER BY id DESC
      LIMIT 10
    `;
    return await query<User[]>(sql);
  },

  // 3. 根据 ID 查询用户
  findById: async (id: number) => {
    const sql = `
      SELECT id, username, email, passwordhash AS passwordHash, created_at
      FROM users
      WHERE id = ?
    `;
    const rows = await query<User[]>(sql, [id]);
    return rows[0] || null;
  },

  // 4. 根据用户名查询用户
  findByUsername: async (username: string) => {
    const sql = `
      SELECT id, username, email, password_hash, created_at
      FROM users
      WHERE username = ?
      LIMIT 1
    `;
    const rows = await query<User[]>(sql, [username]);
    return rows[0] || null;
  },

  // 5. 创建用户
  create: async (user: CreateUserDTO) => {
    console.log(user,'repositories中的 user');
    const sql = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
    return await query<OkPacket>(sql, [user.username, user.email, user.password_hash]);
  }
};

