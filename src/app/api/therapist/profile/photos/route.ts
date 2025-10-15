import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// POST - 上传照片/视频
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "therapist") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await req.json();
    const { url, thumbnailUrl, mediumUrl, largeUrl, videoUrl, coverUrl, duration, fileType } = body;

    if (!url) {
      return NextResponse.json({ error: "URL不能为空" }, { status: 400 });
    }

    // 检查照片数量限制
    const photoCount = await prisma.therapistPhoto.count({
      where: { therapistId: session.user.id },
    });

    const MAX_PHOTOS = 30; // 最大30张

    if (photoCount >= MAX_PHOTOS) {
      return NextResponse.json(
        { success: false, error: `最多只能上传${MAX_PHOTOS}张照片/视频` },
        { status: 400 }
      );
    }

    const isVideo = fileType === "video";

    // 使用事务确保order的原子性
    const photo = await prisma.$transaction(async (tx) => {
      // 在事务中获取最大order
      const maxOrderPhoto = await tx.therapistPhoto.findFirst({
        where: { therapistId: session.user.id },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const newOrder = maxOrderPhoto ? maxOrderPhoto.order + 1 : 1;

      // 在同一事务中创建
      return await tx.therapistPhoto.create({
        data: {
          therapistId: session.user.id,
          url,
          // 视频字段
          isVideo,
          videoUrl: isVideo ? videoUrl : null,
          coverUrl: isVideo ? coverUrl : null,
          duration: isVideo ? duration : null,
          order: newOrder,
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: photo,
    });
  } catch (error) {
    console.error("上传失败:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
