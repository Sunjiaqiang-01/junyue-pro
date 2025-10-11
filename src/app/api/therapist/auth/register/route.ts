import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { phone, password, invitedBy } = await req.json();

    // 验证必填字段
    if (!phone || !password) {
      return NextResponse.json(
        { error: '手机号和密码不能为空' },
        { status: 400 }
      );
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码至少需要6位' },
        { status: 400 }
      );
    }

    // 检查手机号是否已注册
    const existingTherapist = await prisma.therapist.findUnique({
      where: { phone },
    });

    if (existingTherapist) {
      return NextResponse.json(
        { error: '该手机号已被注册' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 生成唯一邀请码
    const inviteCode = `TECH${Date.now().toString().slice(-8)}`;

    // 创建技师账号
    const therapist = await prisma.therapist.create({
      data: {
        phone,
        password: hashedPassword,
        nickname: `技师${phone.slice(-4)}`, // 默认昵称
        age: 25, // 默认年龄，后续可修改
        height: 165, // 默认身高，后续可修改
        weight: 50, // 默认体重，后续可修改
        city: '广州', // 默认城市，后续可修改
        areas: [],
        inviteCode,
        invitedBy: invitedBy || null,
        status: 'PENDING', // 默认待审核
      },
    });

    // 创建技师资料
    await prisma.therapistProfile.create({
      data: {
        therapistId: therapist.id,
        introduction: '',
        specialties: [],
        serviceType: [],
      },
    });

    return NextResponse.json({
      success: true,
      message: '注册成功',
      data: {
        id: therapist.id,
        phone: therapist.phone,
        nickname: therapist.nickname,
      },
    });
  } catch (error) {
    console.error('技师注册错误:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}

