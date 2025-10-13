import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCode } from "@/lib/email";
import bcrypt from "bcryptjs";
import { checkVerifyAttempts, logSecurityAction } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const { username, email, code, newPassword } = await req.json();

    if (!username || !email || !code || !newPassword) {
      return NextResponse.json({ error: "请填写完整信息" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "密码至少需要6位" }, { status: 400 });
    }

    // 检查尝试次数限制（10分钟内最多5次）
    const attemptCheck = await checkVerifyAttempts(email, 5, 10);
    if (!attemptCheck.allowed) {
      return NextResponse.json({ error: "验证码错误次数过多，请10分钟后再试" }, { status: 429 });
    }

    // 验证验证码
    const isValid = await verifyCode(email, code);

    if (!isValid) {
      // 记录失败的验证尝试
      await logSecurityAction({
        email,
        action: "CODE_VERIFY",
        success: false,
      });

      return NextResponse.json(
        {
          error: "验证码错误或已过期",
          remainingAttempts: attemptCheck.remaining ? attemptCheck.remaining - 1 : 0,
        },
        { status: 400 }
      );
    }

    // 记录成功的验证
    await logSecurityAction({
      email,
      action: "CODE_VERIFY",
      success: true,
    });

    // 验证用户名和邮箱
    const therapist = await prisma.therapist.findFirst({
      where: { username, email },
    });

    if (!therapist) {
      return NextResponse.json({ error: "用户信息不匹配" }, { status: 400 });
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.therapist.update({
      where: { id: therapist.id },
      data: { password: hashedPassword },
    });

    // 记录密码重置成功
    await logSecurityAction({
      email,
      action: "PASSWORD_RESET",
      success: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("重置密码错误:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
