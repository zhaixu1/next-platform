import { NextResponse } from "next/server";
import { userService } from "@/services/userService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, passwordhash } = body as {
      username?: string;
      email?: string;
      passwordhash?: string;
    };

    if (!username?.trim()) {
      return NextResponse.json({ error: "账号不能为空" }, { status: 400 });
    }

    if (!email?.trim()) {
      return NextResponse.json({ error: "邮箱不能为空" }, { status: 400 });
    }

    if (!passwordhash?.trim()) {
      return NextResponse.json({ error: "密码不能为空" }, { status: 400 });
    }

    if (passwordhash.length < 6) {
      return NextResponse.json({ error: "密码长度不能少于 6 位" }, { status: 400 });
    }

    const user = await userService.findUserForLogin(username, email, passwordhash);

    if (!user) {
      return NextResponse.json({ error: "用户名、邮箱或密码不正确" }, { status: 401 });
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


