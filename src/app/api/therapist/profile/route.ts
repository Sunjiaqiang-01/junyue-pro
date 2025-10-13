import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// GET - 获取技师资料
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "therapist") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const therapist = await prisma.therapist.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        photos: {
          orderBy: { order: "asc" },
        },
        videos: true,
      },
    });

    if (!therapist) {
      return NextResponse.json({ error: "技师不存在" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: therapist,
    });
  } catch (error) {
    console.error("获取技师资料失败:", error);
    return NextResponse.json({ error: "获取资料失败" }, { status: 500 });
  }
}

// PUT - 更新技师资料
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "therapist") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await req.json();
    const {
      nickname,
      age,
      height,
      weight,
      cardValue,
      city,
      phone,
      location,
      introduction,
      serviceAddress,
    } = body;

    // 更新技师基本信息
    await prisma.therapist.update({
      where: { id: session.user.id },
      data: {
        nickname,
        age: age ? parseInt(age) : undefined,
        height: height ? parseInt(height) : undefined,
        weight: weight ? parseInt(weight) : undefined,
        cardValue,
        city,
        phone,
        location,
      },
    });

    // 更新或创建技师资料
    await prisma.therapistProfile.upsert({
      where: { therapistId: session.user.id },
      update: {
        introduction,
        serviceAddress,
      },
      create: {
        therapistId: session.user.id,
        introduction: introduction || "",
        specialties: [],
        serviceType: [],
        serviceAddress,
      },
    });

    return NextResponse.json({
      success: true,
      message: "资料更新成功",
    });
  } catch (error) {
    console.error("更新技师资料失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
