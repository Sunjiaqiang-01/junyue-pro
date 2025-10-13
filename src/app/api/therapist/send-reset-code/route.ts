import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVerificationCode, saveVerificationCode, sendVerificationCode } from "@/lib/email";
import { checkEmailRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const { username, email } = await req.json();

    if (!username || !email) {
      return NextResponse.json({ error: "请提供用户名和邮箱" }, { status: 400 });
    }

    // 验证用户名和邮箱是否匹配
    const therapist = await prisma.therapist.findFirst({
      where: {
        username,
        email,
      },
    });

    if (!therapist) {
      return NextResponse.json({ error: "用户名或邮箱不匹配" }, { status: 400 });
    }

    // 检查发送频率限制（1分钟内只能发送一次）
    const rateLimit = await checkEmailRateLimit(email, 1);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `请${rateLimit.remainingSeconds}秒后再试`,
          remainingSeconds: rateLimit.remainingSeconds,
        },
        { status: 429 }
      );
    }

    // 生成6位验证码
    const code = generateVerificationCode();

    // 存储验证码（5分钟有效）
    saveVerificationCode(email, code);

    // 发送邮件
    const emailResult = await sendVerificationCode(email, code);

    if (!emailResult.success) {
      return NextResponse.json({ error: emailResult.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "验证码已发送到您的邮箱，请查收（含垃圾箱）",
    });
  } catch (error) {
    console.error("发送验证码错误:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
