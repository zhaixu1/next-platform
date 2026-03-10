import { NextResponse } from 'next/server';
import { userService } from '@/services/userService';

// GET: 获取用户列表
export async function GET() {
  try {
    const users = await userService.getUsers();
    return NextResponse.json({
      message: '获取成功',
      data: users
    });
  } catch (error) {
    return NextResponse.json(
      { error: '获取失败', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST: 创建新用户
export async function POST(request: Request) {
  try {
    // 1. 从请求体中解析数据
    const body = await request.json();
    const { username, email, password } = body;

    // 2. 调用 Service 创建用户
    const newUserId = await userService.createUser(username, email, password);

    // 3. 返回成功响应
    return NextResponse.json({
      message: '用户创建成功',
      newUserId
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: '创建失败', details: (error as Error).message },
      { status: 400 }
    );
  }
}
