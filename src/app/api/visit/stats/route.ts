import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 获取访问统计数据（最近7天）
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    // 获取最近7天的日期范围
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // 查询SiteVisit表获取访问记录
    const visits = await prisma.siteVisit.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
          lte: today,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // 按日期聚合统计
    const dateMap = new Map<string, number>();

    // 初始化7天的数据（确保每天都有数据，即使是0）
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
      dateMap.set(dateKey, 0);
    }

    // 统计每天的访问量
    visits.forEach((visit) => {
      const dateKey = new Date(visit.createdAt).toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
      });
      if (dateMap.has(dateKey)) {
        dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
      }
    });

    // 转换为数组格式
    const pageViewsTrend = Array.from(dateMap.entries()).map(([date, views]) => ({
      date,
      views,
    }));

    // 计算总浏览量和今日浏览量
    const totalViews = visits.length;
    const todayKey = today.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
    const todayViews = dateMap.get(todayKey) || 0;

    return NextResponse.json({
      success: true,
      data: {
        pageViewsTrend,
        totalViews,
        todayViews,
      },
    });
  } catch (error) {
    console.error("获取访问统计失败:", error);
    return NextResponse.json({ error: "获取访问统计失败" }, { status: 500 });
  }
}
