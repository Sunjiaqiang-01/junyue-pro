import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "无权限" }, { status: 403 });
    }

    const { id: therapistId, photoId } = await params;

    // 验证照片是否属于该技师
    const photo = await prisma.therapistPhoto.findFirst({
      where: {
        id: photoId,
        therapistId,
      },
    });

    if (!photo) {
      return NextResponse.json({ success: false, error: "照片不存在" }, { status: 404 });
    }

    // 使用事务确保数据一致性
    await prisma.$transaction(async (tx) => {
      // 1. 将该技师的所有照片设为非主图
      await tx.therapistPhoto.updateMany({
        where: { therapistId },
        data: { isPrimary: false },
      });

      // 2. 将指定照片设为主图
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
    console.error("管理员设置技师主图失败:", error);
    return NextResponse.json({ success: false, error: "设置主图失败" }, { status: 500 });
  }
}
