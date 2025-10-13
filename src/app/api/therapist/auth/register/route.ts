import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";
import { validateRegistrationCode, useRegistrationCode } from "@/lib/registration-code";

export async function POST(req: NextRequest) {
  try {
    const { username, password, email, registrationCode } = await req.json();

    // 验证必填字段
    if (!username || !password || !email || !registrationCode) {
      return NextResponse.json({ error: "请填写完整信息" }, { status: 400 });
    }

    // 验证用户名长度
    if (username.length < 3) {
      return NextResponse.json({ error: "用户名至少需要3位" }, { status: 400 });
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少需要6位" }, { status: 400 });
    }

    // 验证邮箱格式
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
    }

    // 检查用户名是否已注册
    const existingUsername = await prisma.therapist.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json({ error: "该用户名已被注册" }, { status: 400 });
    }

    // 检查邮箱是否已注册
    const existingEmail = await prisma.therapist.findFirst({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 400 });
    }

    // 验证注册验证码
    const codeValidation = await validateRegistrationCode(registrationCode);

    if (!codeValidation.valid) {
      return NextResponse.json({ error: codeValidation.error || "验证码无效" }, { status: 400 });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建技师账号
    const therapist = await prisma.therapist.create({
      data: {
        username,
        password: hashedPassword,
        email,
        nickname: username, // 默认昵称使用用户名
        age: 0, // 0表示未填写，后续需完善
        height: 0, // 0表示未填写，后续需完善
        weight: 0, // 0表示未填写，后续需完善
        city: "", // 空字符串表示未填写，后续需完善
        areas: [],
        registrationCodeId: codeValidation.codeId, // 关联注册验证码
        status: "PENDING", // 默认待审核
      },
    });

    // 标记验证码已使用
    await useRegistrationCode(codeValidation.codeId!);

    // 创建技师资料
    await prisma.therapistProfile.create({
      data: {
        therapistId: therapist.id,
        introduction: "",
        specialties: [],
        serviceType: [],
      },
    });

    // 发送欢迎邮件（异步，不阻塞响应）
    sendWelcomeEmail(email, therapist.username, registrationCode).catch((error) => {
      console.error("发送欢迎邮件失败:", error);
      // 不影响注册流程，只记录错误
    });

    return NextResponse.json({
      success: true,
      message: "注册成功！欢迎邮件已发送到您的邮箱",
      data: {
        id: therapist.id,
        username: therapist.username,
        email: therapist.email,
        nickname: therapist.nickname,
      },
    });
  } catch (error) {
    console.error("技师注册错误:", error);
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
