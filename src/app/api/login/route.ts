import { NextResponse } from "next/server";
import { userService } from "@/services/userService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body as {
      username?: string;
      password?: string;
    };

    if (!username?.trim()) {
      return NextResponse.json({ error: "账号不能为空" }, { status: 400 });
    }

    if (!password?.trim()) {
      return NextResponse.json({ error: "密码不能为空" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "密码长度不能少于 6 位" }, { status: 400 });
    }

    const user = await userService.login(username, password);
    console.log(user,'userService中的 user111');
    if (!user) {
      return NextResponse.json({ error: "用户名或密码不正确" }, { status: 401 });
    }

    return NextResponse.json({
      message: "登录成功",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "登录失败",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}


