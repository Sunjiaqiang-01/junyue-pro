import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AnnouncementsTab } from "./components/AnnouncementsTab";
import { GuideTab } from "./components/GuideTab";
import { ServicesTab } from "./components/ServicesTab";
import { Megaphone, BookOpen, Headphones } from "lucide-react";

async function getContentData() {
  const [announcements, guide, services] = await Promise.all([
    prisma.announcement.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.guideContent.findFirst(),
    prisma.customerService.findMany({
      orderBy: { order: "asc" },
    }),
  ]);

  return {
    announcements,
    guide,
    services,
  };
}

export default async function ContentManagementPage() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const data = await getContentData();

  const activeAnnouncementsCount = data.announcements.filter((a) => a.isActive).length;

  return (
    <div className="container mx-auto px-4 py-6 pt-24 md:pt-28 space-y-4 md:space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-pure-white mb-2">内容管理中心</h1>
        <p className="text-xs md:text-sm text-secondary/60">管理平台公告、使用指南和客服配置</p>
      </div>

      {/* Tab导航 */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
        <CardContent className="pt-4 md:pt-6">
          <Tabs defaultValue="announcements" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6 bg-white/5 border border-white/10">
              <TabsTrigger
                value="announcements"
                className="flex items-center gap-1 md:gap-2 text-xs md:text-sm data-[state=active]:bg-primary-cyan/20 data-[state=active]:text-primary-cyan"
              >
                <Megaphone className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">公告管理</span>
                <span className="sm:hidden">公告</span>
                <Badge className="bg-white/10 text-white border-white/20 text-[10px] md:text-xs">
                  {data.announcements.length}
                </Badge>
                {activeAnnouncementsCount > 0 && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 ml-1 text-[10px] md:text-xs hidden lg:inline-flex">
                    {activeAnnouncementsCount}条生效中
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="guide"
                className="flex items-center gap-1 md:gap-2 text-xs md:text-sm data-[state=active]:bg-primary-cyan/20 data-[state=active]:text-primary-cyan"
              >
                <BookOpen className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">平台指南</span>
                <span className="sm:hidden">指南</span>
                {data.guide && (
                  <Badge className="bg-white/10 text-white border-white/20 text-[10px] md:text-xs">
                    已配置
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="services"
                className="flex items-center gap-1 md:gap-2 text-xs md:text-sm data-[state=active]:bg-primary-cyan/20 data-[state=active]:text-primary-cyan"
              >
                <Headphones className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">客服配置</span>
                <span className="sm:hidden">客服</span>
                <Badge className="bg-white/10 text-white border-white/20 text-[10px] md:text-xs">
                  {data.services.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="announcements">
              <Suspense fallback={<TableSkeleton />}>
                <AnnouncementsTab initialData={data.announcements} />
              </Suspense>
            </TabsContent>

            <TabsContent value="guide">
              <Suspense fallback={<TableSkeleton />}>
                <GuideTab initialData={data.guide} />
              </Suspense>
            </TabsContent>

            <TabsContent value="services">
              <Suspense fallback={<TableSkeleton />}>
                <ServicesTab initialData={data.services} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
