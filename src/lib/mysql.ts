import pool from './db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// 封装通用的查询函数
export async function query<T>(sql: string, params?: (string | number | boolean | null)[]): Promise<T> {
  try {
    // 1. 从连接池获取连接
    const [results] = await pool.execute(sql, params);
    
    // 2. 返回查询结果
    return results as T;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to execute query');
  }
}

// 专门用于 SELECT 查询的辅助类型
// 使用示例: const users = await query<User[]>('SELECT * FROM users');
export type QueryResult<T> = T & RowDataPacket[];

// 专门用于 INSERT/UPDATE/DELETE 的辅助类型
// 使用示例: const result = await query<OkPacket>('INSERT INTO ...');
export type OkPacket = ResultSetHeader;

