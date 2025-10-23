import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Skeleton } from "@/components/ui/skeleton";
import AdminStatsCards from "@/components/admin/AdminStatsCards";
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

  // 模拟7天浏览量趋势（这里使用模拟数据，实际应该从数据库获取）
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  });

  // 模拟浏览量数据（实际应从visit tracking系统获取）
  const pageViewsTrend = last7Days.map((date, index) => ({
    date,
    views: Math.floor(Math.random() * 500) + 200 + index * 50,
  }));

  const totalViews = pageViewsTrend.reduce((sum, item) => sum + item.views, 0);
  const todayViews = pageViewsTrend[pageViewsTrend.length - 1].views;

  // 格式化排行榜数据
  const therapistRankings = topViewedTherapists.map((t, index) => ({
    nickname: t.nickname,
    viewCount: t.viewCount,
    rank: index + 1,
  }));

  // 格式化城市分布数据
  const cityDistData = cityDistribution.map((item) => ({
    city: item.city,
    count: item._count.city,
    percentage: (item._count.city / totalTherapists) * 100,
  }));

  return {
    stats: {
      totalTherapists,
      approvedTherapists,
      pendingTherapists,
      onlineTherapists,
      todayNew: todayNewTherapists,
    },
    pageViewsTrend,
    totalViews,
    todayViews,
    therapistRankings,
    cityDistribution: cityDistData,
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const data = await getDashboardData();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 欢迎区域 */}
      <div>
        <h1 className="text-3xl font-bold mb-2">欢迎回来，{session.user.name || "管理员"}！</h1>
        <p className="text-muted-foreground">
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
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <AdminStatsCards stats={data.stats} />
      </Suspense>

      {/* 数据可视化区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
