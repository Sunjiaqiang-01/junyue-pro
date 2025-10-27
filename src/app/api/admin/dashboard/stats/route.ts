import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 时间范围
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 获取技师统计数据
    const [
      totalTherapists,
      approvedTherapists,
      pendingTherapists,
      rejectedTherapists,
      onlineTherapists,
      featuredTherapists,
      todayNewCount,
      weekNewCount,
      monthNewCount,
      totalAnnouncements,
      activeAnnouncements,
    ] = await Promise.all([
      // 技师总数
      prisma.therapist.count(),

      // 已审核通过的技师
      prisma.therapist.count({
        where: { status: "APPROVED" },
      }),

      // 待审核的技师
      prisma.therapist.count({
        where: { status: "PENDING" },
      }),

      // 已拒绝的技师
      prisma.therapist.count({
        where: { status: "REJECTED" },
      }),

      // 在线技师数
      prisma.therapist.count({
        where: {
          status: "APPROVED",
          isOnline: true,
        },
      }),

      // 推荐技师数
      prisma.therapist.count({
        where: {
          status: "APPROVED",
          isFeatured: true,
        },
      }),

      // 今日新增技师
      prisma.therapist.count({
        where: {
          createdAt: { gte: today },
        },
      }),

      // 本周新增技师
      prisma.therapist.count({
        where: {
          createdAt: { gte: weekAgo },
        },
      }),

      // 本月新增技师
      prisma.therapist.count({
        where: {
          createdAt: { gte: monthAgo },
        },
      }),

      // 公告总数
      prisma.announcement.count(),

      // 活跃公告数
      prisma.announcement.count({
        where: { isActive: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalTherapists,
        approvedTherapists,
        pendingTherapists,
        rejectedTherapists,
        onlineTherapists,
        featuredTherapists,
        todayNew: todayNewCount,
        weekNew: weekNewCount,
        monthNew: monthNewCount,
        totalAnnouncements,
        activeAnnouncements,
      },
    });
  } catch (error) {
    console.error("获取统计数据失败:", error);
    return NextResponse.json({ error: "获取统计数据失败" }, { status: 500 });
  }
}
