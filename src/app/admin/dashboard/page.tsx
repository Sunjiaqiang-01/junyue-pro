import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Skeleton } from "@/components/ui/skeleton";
import PageVisitTracker from "@/components/PageVisitTracker";
import AdminStatsCards from "@/components/admin/AdminStatsCards";
import SystemMonitor from "@/components/admin/SystemMonitor";
import { PageViewsTrendChart } from "./components/PageViewsTrendChart";
import { TherapistViewsRankingChart } from "./components/TherapistViewsRankingChart";
import { TherapistCityDistributionChart } from "./components/TherapistCityDistributionChart";

async function getDashboardData() {
  // 获取基本统计
  const [
    totalTherapists,
    approvedTherapists,
    pendingTherapists,
    onlineTherapists,
    todayNewTherapists,
    topViewedTherapists,
  ] = await Promise.all([
    prisma.therapist.count(),
    prisma.therapist.count({ where: { status: "APPROVED" } }),
    prisma.therapist.count({ where: { status: "PENDING" } }),
    prisma.therapist.count({ where: { isOnline: true } }),
    prisma.therapist.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    // 获取浏览量TOP 10技师
    prisma.therapist.findMany({
      select: {
        nickname: true,
        viewCount: true,
      },
      where: {
        status: "APPROVED",
      },
      orderBy: {
        viewCount: "desc",
      },
      take: 10,
    }),
  ]);

  // 获取周环比趋势数据
  let trends = null;
  try {
    const trendsRes = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/admin/dashboard/stats-trend`,
      {
        cache: "no-store",
      }
    );

    if (trendsRes.ok) {
      const trendsData = await trendsRes.json();
      if (trendsData.success && trendsData.data) {
        trends = trendsData.data;
      }
    }
  } catch (error) {
    console.error("获取趋势数据失败:", error);
  }

  // 获取城市分布
  const cityDistribution = await prisma.therapist.groupBy({
    by: ["city"],
    _count: {
      city: true,
    },
    where: {
      status: "APPROVED",
    },
    orderBy: {
      _count: {
        city: "desc",
      },
    },
  });

  // 获取真实的7天浏览量趋势数据
  let pageViewsTrend: Array<{ date: string; views: number }> = [];
  let totalViews = 0;
  let todayViews = 0;

  try {
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
    pageViewsTrend = Array.from(dateMap.entries()).map(([date, views]) => ({
      date,
      views,
    }));

    // 计算总浏览量和今日浏览量
    totalViews = visits.length;
    const todayKey = today.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
    todayViews = dateMap.get(todayKey) || 0;
  } catch (error) {
    console.error("获取访问统计失败，使用默认值:", error);
    // 如果查询失败，使用空数据
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
    });
    pageViewsTrend = last7Days.map((date) => ({ date, views: 0 }));
  }

  // 格式化排行榜数据
  const therapistRankings = topViewedTherapists.map((t, index) => ({
    nickname: t.nickname,
    viewCount: t.viewCount,
    rank: index + 1,
  }));

  // 格式化城市分布数据（修复：使用approvedTherapists作为分母）
  const cityDistData = cityDistribution.map((item) => ({
    city: item.city,
    count: item._count.city,
    percentage: approvedTherapists > 0 ? (item._count.city / approvedTherapists) * 100 : 0,
  }));

  return {
    stats: {
      totalTherapists,
      approvedTherapists,
      pendingTherapists,
      onlineTherapists,
      todayNew: todayNewTherapists,
    },
    trends,
    pageViewsTrend,
    totalViews,
    todayViews,
    therapistRankings,
    cityDistribution: cityDistData,
  };
}

export default async function AdminDashboard() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const data = await getDashboardData();

  return (
    <div className="container mx-auto px-4 py-6 pt-24 md:pt-28 space-y-4 md:space-y-6">
      {/* 页面访问追踪 */}
      <PageVisitTracker page="/admin/dashboard" />

      {/* 欢迎区域 */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-pure-white mb-2">
          欢迎回来，{session.user.name || "管理员"}！
        </h1>
        <p className="text-xs md:text-sm text-secondary/60">
          今天是{" "}
          {new Date().toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>
      </div>

      {/* 统计卡片 */}
      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <AdminStatsCards stats={data.stats} trends={data.trends} />
      </Suspense>

      {/* 系统监控 */}
      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <SystemMonitor />
      </Suspense>

      {/* 数据可视化区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* 浏览量趋势图 */}
        <div className="lg:col-span-2">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <PageViewsTrendChart
              data={data.pageViewsTrend}
              totalViews={data.totalViews}
              todayViews={data.todayViews}
            />
          </Suspense>
        </div>

        {/* 技师浏览量排行榜 */}
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <TherapistViewsRankingChart data={data.therapistRankings} />
        </Suspense>

        {/* 技师城市分布 */}
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <TherapistCityDistributionChart
            data={data.cityDistribution}
            totalTherapists={data.stats.totalTherapists}
          />
        </Suspense>
      </div>
    </div>
  );
}
