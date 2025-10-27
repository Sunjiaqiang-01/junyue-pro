import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 获取统计数据的周环比
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 时间范围设定
    const now = new Date();

    // 本周：从今天0点往前推7天
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    thisWeekStart.setHours(0, 0, 0, 0);

    // 上周：再往前推7天
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const lastWeekEnd = new Date(thisWeekStart);

    // 并发查询本周和上周的数据
    const [
      thisWeekTotal,
      lastWeekTotal,
      thisWeekApproved,
      lastWeekApproved,
      thisWeekPending,
      lastWeekPending,
      thisWeekOnline,
      lastWeekOnline,
    ] = await Promise.all([
      // 本周技师总数（新增）
      prisma.therapist.count({
        where: {
          createdAt: { gte: thisWeekStart },
        },
      }),
      // 上周技师总数（新增）
      prisma.therapist.count({
        where: {
          createdAt: {
            gte: lastWeekStart,
            lt: lastWeekEnd,
          },
        },
      }),
      // 本周已审核通过（新增）
      prisma.therapist.count({
        where: {
          status: "APPROVED",
          auditedAt: { gte: thisWeekStart },
        },
      }),
      // 上周已审核通过（新增）
      prisma.therapist.count({
        where: {
          status: "APPROVED",
          auditedAt: {
            gte: lastWeekStart,
            lt: lastWeekEnd,
          },
        },
      }),
      // 本周待审核（当前状态）
      prisma.therapist.count({
        where: { status: "PENDING" },
      }),
      // 上周待审核（历史快照，使用createdAt近似）
      prisma.therapist.count({
        where: {
          status: "PENDING",
          createdAt: { lt: lastWeekEnd },
        },
      }),
      // 本周在线（当前状态）
      prisma.therapist.count({
        where: { isOnline: true },
      }),
      // 上周在线（历史快照，使用lastOnlineAt近似）
      prisma.therapist.count({
        where: {
          isOnline: true,
          lastOnlineAt: {
            gte: lastWeekStart,
            lt: lastWeekEnd,
          },
        },
      }),
    ]);

    // 计算增长率（避免除以0）
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return ((current - previous) / previous) * 100;
    };

    const trends = {
      totalTherapists: {
        current: thisWeekTotal,
        previous: lastWeekTotal,
        growth: calculateGrowth(thisWeekTotal, lastWeekTotal),
      },
      approvedTherapists: {
        current: thisWeekApproved,
        previous: lastWeekApproved,
        growth: calculateGrowth(thisWeekApproved, lastWeekApproved),
      },
      pendingTherapists: {
        current: thisWeekPending,
        previous: lastWeekPending,
        growth: calculateGrowth(thisWeekPending, lastWeekPending),
      },
      onlineTherapists: {
        current: thisWeekOnline,
        previous: lastWeekOnline,
        growth: calculateGrowth(thisWeekOnline, lastWeekOnline),
      },
    };

    return NextResponse.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    console.error("获取统计趋势失败:", error);
    return NextResponse.json({ error: "获取统计趋势失败" }, { status: 500 });
  }
}
