import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ProfileValidator } from "@/lib/profile-validator";
import { clearCache } from "@/lib/cache";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;

    // 获取技师信息，验证基本信息是否完善
    const therapist = await prisma.therapist.findUnique({
      where: { id },
      select: {
        age: true,
        height: true,
        weight: true,
        city: true,
      },
    });

    if (!therapist) {
      return NextResponse.json({ error: "技师不存在" }, { status: 404 });
    }

    // 验证基本信息是否完善
    if (!ProfileValidator.isBasicInfoComplete(therapist)) {
      return NextResponse.json(
        { error: "该技师的基本信息尚未完善，无法通过审核" },
        { status: 400 }
      );
    }

    // 更新技师状态为已通过，同时设置为在线
    await prisma.therapist.update({
      where: { id },
      data: {
        status: "APPROVED",
        isOnline: true, // 审核通过后自动在线
        auditedAt: new Date(),
        approvedAt: new Date(), // 🆕 记录审核通过时间，用于新人标签自动化
      },
    });

    // 创建通知
    await prisma.notification.create({
      data: {
        therapistId: id,
        type: "AUDIT",
        title: "审核通过",
        content: "恭喜！您的资料已通过审核，您的状态已自动设置为在线，现在可以正常展示在平台上了。",
      },
    });

    // 🆕 清除系统统计缓存
    clearCache("admin:system:stats");

    return NextResponse.json({
      success: true,
      message: "审核通过",
    });
  } catch (error) {
    console.error("审核通过失败:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
