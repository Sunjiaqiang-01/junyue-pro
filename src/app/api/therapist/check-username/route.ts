import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { maskEmail } from "@/lib/email";
import { logSecurityAction } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "请提供用户名" }, { status: 400 });
    }

    // 添加随机延迟（200-500ms），防止时间攻击
    const delay = Math.floor(Math.random() * 300) + 200;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const therapist = await prisma.therapist.findUnique({
      where: { username },
      select: { email: true },
    });

    // 记录用户名检查（用于检测异常行为）
    await logSecurityAction({
      email: username, // 这里用username代替email
      action: "USERNAME_CHECK",
      success: !!therapist,
    });

    if (!therapist || !therapist.email) {
      return NextResponse.json({ exists: false });
    }

    // 隐藏部分邮箱信息
    const emailHint = maskEmail(therapist.email);

    return NextResponse.json({
      exists: true,
      emailHint,
    });
  } catch (error) {
    console.error("检查用户名错误:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
