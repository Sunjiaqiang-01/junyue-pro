import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

/**
 * PATCH - 设置主图
 * 将指定照片设为主图，同时取消该技师的其他照片的主图状态
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "therapist") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id: photoId } = await params;

    // 验证照片是否属于当前技师
    const photo = await prisma.therapistPhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      return NextResponse.json({ error: "照片不存在" }, { status: 404 });
    }

    if (photo.therapistId !== session.user.id) {
      return NextResponse.json({ error: "无权操作此照片" }, { status: 403 });
    }

    // 使用事务确保原子性
    await prisma.$transaction(async (tx) => {
      // 1. 取消该技师的所有照片的主图状态
      await tx.therapistPhoto.updateMany({
        where: { therapistId: session.user.id },
        data: { isPrimary: false },
      });

      // 2. 设置新的主图
      await tx.therapistPhoto.update({
        where: { id: photoId },
        data: { isPrimary: true },
      });
    });

    return NextResponse.json({
      success: true,
      message: "主图设置成功",
    });
  } catch (error) {
    console.error("设置主图失败:", error);
    return NextResponse.json({ error: "设置主图失败" }, { status: 500 });
  }
}
