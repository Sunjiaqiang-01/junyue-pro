import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
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

    // 删除照片
    await prisma.therapistPhoto.delete({
      where: { id: photoId },
    });

    return NextResponse.json({
      success: true,
      message: "照片删除成功",
    });
  } catch (error) {
    console.error("管理员删除技师照片失败:", error);
    return NextResponse.json({ success: false, error: "删除照片失败" }, { status: 500 });
  }
}
