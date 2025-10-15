import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const therapist = await prisma.therapist.findUnique({
      where: {
        id,
        status: "APPROVED", // 只显示审核通过的技师
      },
      select: {
        id: true,
        nickname: true,
        age: true,
        height: true,
        weight: true,
        cardValue: true, // 🆕 牌值
        city: true,
        areas: true,
        location: true, // 🆕 位置信息
        isOnline: true,
        isNew: true,
        isFeatured: true,
        createdAt: true,
        photos: {
          orderBy: [
            { isPrimary: "desc" }, // 主图排第一
            { order: "asc" },
          ],
          select: {
            id: true,
            url: true,
            order: true,
            isPrimary: true,
          },
        },
        videos: {
          select: {
            id: true,
            url: true,
            coverUrl: true,
            duration: true,
          },
        },
        profile: {
          select: {
            introduction: true,
            specialties: true,
            serviceType: true,
            serviceAddress: true,
            // 不返回联系方式（wechat, qq, phone）
          },
        },
        schedules: {
          where: {
            date: {
              gte: new Date(),
            },
            isAvailable: true,
          },
          orderBy: {
            date: "asc",
          },
          take: 30,
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            isRecurring: true,
          },
        },
      },
    });

    if (!therapist) {
      return NextResponse.json(
        { success: false, error: "技师不存在或未通过审核" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: therapist,
    });
  } catch (error) {
    console.error("获取技师详情失败:", error);
    return NextResponse.json({ success: false, error: "获取技师详情失败" }, { status: 500 });
  }
}
