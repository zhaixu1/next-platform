import { NextResponse } from 'next/server';
import { query, OkPacket } from '@/lib/mysql';

// 定义用户类型
interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export async function GET() {
  try {
    // 1. 建表 (如果不存在)
    // await query(`
    //   CREATE TABLE IF NOT EXISTS users (
    //     id INT AUTO_INCREMENT PRIMARY KEY,
    //     username VARCHAR(255) NOT NULL,
    //     email VARCHAR(255) NOT NULL,
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //   )
    // `);

    // 3. 查询数据
    // 注意：这里 query<User[]> 告诉 TS 返回的是用户数组
    const users = await query<User[]>('SELECT * FROM users ORDER BY id DESC LIMIT 5');

    return NextResponse.json({
      message: '封装后的数据库操作成功！',
    //   newUserId: insertResult.insertId,
      data: users
    });

  } catch (error) {
    return NextResponse.json(
      { error: '操作失败', details: (error as Error).message },
      { status: 500 }
    );
  }
}
