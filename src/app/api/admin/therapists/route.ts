import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 获取所有技师列表（管理员）
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "无权限" }, { status: 403 });
    }

    const therapists = await prisma.therapist.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        photos: {
          orderBy: [
            { isPrimary: "desc" }, // 主图排第一
            { order: "asc" },
          ],
        },
        profile: {
          select: {
            introduction: true,
            specialties: true,
            serviceType: true,
            serviceAddress: true,
            serviceLat: true,
            serviceLng: true,
            serviceRadius: true,
          },
        },
        videos: true,
        schedules: {
          orderBy: { date: "asc" },
          take: 5, // 只取最近5个排班
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: therapists,
    });
  } catch (error) {
    console.error("获取技师列表失败:", error);
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 });
  }
}
