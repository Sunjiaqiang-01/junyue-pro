import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const therapists = await prisma.therapist.findMany({
      where: {
        status: "PENDING",
      },
      include: {
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
        photos: {
          orderBy: { order: "asc" },
        },
        videos: true,
        schedules: {
          orderBy: { date: "asc" },
          take: 5,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: therapists,
    });
  } catch (error) {
    console.error("获取待审核列表失败:", error);
    return NextResponse.json({ error: "获取待审核列表失败" }, { status: 500 });
  }
}
