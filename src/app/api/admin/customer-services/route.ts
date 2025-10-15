import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET - 获取客服配置
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const service = await prisma.customerService.findFirst({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("获取客服配置失败:", error);
    return NextResponse.json({ error: "获取客服配置失败" }, { status: 500 });
  }
}

// PUT - 更新客服配置
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { wechatQrCode, wechatId, phone, workingHours } = await req.json();

    if (!wechatQrCode || !workingHours) {
      return NextResponse.json({ error: "微信二维码和工作时间不能为空" }, { status: 400 });
    }

    // 查找现有配置
    const existing = await prisma.customerService.findFirst({
      where: { isActive: true },
    });

    if (existing) {
      // 更新现有配置
      await prisma.customerService.update({
        where: { id: existing.id },
        data: {
          wechatQrCode,
          wechatId,
          phone,
          workingHours,
        },
      });
    } else {
      // 创建新配置
      await prisma.customerService.create({
        data: {
          wechatQrCode,
          wechatId,
          phone,
          workingHours,
          isActive: true,
          order: 1,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "保存成功",
    });
  } catch (error) {
    console.error("保存客服配置失败:", error);
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}
