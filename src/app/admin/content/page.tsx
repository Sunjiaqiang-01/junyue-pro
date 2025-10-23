import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
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
    prisma.guide.findFirst(),
    prisma.customerService.findMany({
      include: {
        cities: {
          select: {
            city: true,
          },
        },
      },
      orderBy: { priority: "asc" },
    }),
  ]);

  return {
    announcements,
    guide,
    services,
  };
}

export default async function ContentManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const data = await getContentData();

  const activeAnnouncementsCount = data.announcements.filter((a) => a.isActive).length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold mb-2">内容管理中心</h1>
        <p className="text-muted-foreground">管理平台公告、使用指南和客服配置</p>
      </div>

      {/* Tab导航 */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="announcements" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="announcements" className="flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                公告管理
                <Badge variant="secondary">{data.announcements.length}</Badge>
                {activeAnnouncementsCount > 0 && (
                  <Badge className="bg-green-500 text-white ml-1">
                    {activeAnnouncementsCount}条生效中
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="guide" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                平台指南
                {data.guide && <Badge variant="secondary">已配置</Badge>}
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Headphones className="w-4 h-4" />
                客服配置
                <Badge variant="secondary">{data.services.length}</Badge>
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
