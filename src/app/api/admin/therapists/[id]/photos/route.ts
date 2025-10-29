import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "无权限" }, { status: 403 });
    }

    const { id: therapistId } = await params;
    const data = await request.json();

    // 获取当前照片数量来设置order
    const existingPhotos = await prisma.therapistPhoto.findMany({
      where: { therapistId },
      orderBy: { order: "desc" },
      take: 1,
    });

    const nextOrder = existingPhotos.length > 0 ? existingPhotos[0].order + 1 : 1;

    // 创建照片记录
    const photo = await prisma.therapistPhoto.create({
      data: {
        therapistId,
        url: data.url,
        videoUrl: data.videoUrl || null,
        coverUrl: data.coverUrl || null,
        duration: data.duration || null,
        order: nextOrder,
        isPrimary: false,
        isVideo: data.fileType === "video",
      },
    });

    return NextResponse.json({
      success: true,
      data: photo,
    });
  } catch (error) {
    console.error("管理员添加技师照片失败:", error);
    return NextResponse.json({ success: false, error: "添加照片失败" }, { status: 500 });
  }
}
