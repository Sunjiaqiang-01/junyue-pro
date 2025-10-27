import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AllTherapistsTab } from "./components/AllTherapistsTab";
import { PendingTherapistsTab } from "./components/PendingTherapistsTab";
import { DeactivationRequestsTab } from "./components/DeactivationRequestsTab";
import { Users, Clock, AlertCircle } from "lucide-react";

async function getTherapistsData() {
  const [allTherapists, pendingTherapists, deactivationRequests] = await Promise.all([
    // 全部技师
    prisma.therapist.findMany({
      include: {
        profile: {
          select: {
            id: true,
            introduction: true,
            specialties: true,
            serviceType: true,
          },
        },
        photos: {
          select: {
            id: true,
            isPrimary: true,
            url: true,
            mediumUrl: true,
          },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
        _count: {
          select: {
            photos: true,
            videos: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    // 待审核技师
    prisma.therapist.findMany({
      where: { status: "PENDING" },
      include: {
        profile: {
          select: {
            id: true,
            introduction: true,
            specialties: true,
            serviceType: true,
          },
        },
        photos: {
          select: {
            id: true,
            isPrimary: true,
            url: true,
            mediumUrl: true,
          },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        },
        _count: {
          select: {
            photos: true,
            videos: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    // 注销申请
    prisma.therapistDeactivationRequest.findMany({
      include: {
        therapist: {
          select: {
            id: true,
            username: true,
            nickname: true,
            phone: true,
            city: true,
          },
        },
      },
      orderBy: { requestedAt: "desc" },
    }),
  ]);

  return {
    allTherapists,
    pendingTherapists,
    deactivationRequests,
  };
}

export default async function TherapistsCenterPage() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const data = await getTherapistsData();

  const pendingCount = data.pendingTherapists.length;
  const deactivationPendingCount = data.deactivationRequests.filter(
    (r) => r.status === "PENDING"
  ).length;

  return (
    <div className="container mx-auto px-4 py-6 pt-24 md:pt-28 space-y-4 md:space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-pure-white mb-2">技师管理中心</h1>
        <p className="text-xs md:text-sm text-secondary/60">
          统一管理所有技师、审核新注册、处理注销申请
        </p>
      </div>

      {/* Tab导航 */}
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
        <CardContent className="pt-4 md:pt-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6 bg-white/5 border border-white/10">
              <TabsTrigger
                value="all"
                className="flex items-center gap-1 md:gap-2 text-xs md:text-sm data-[state=active]:bg-primary-cyan/20 data-[state=active]:text-primary-cyan"
              >
                <Users className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">全部技师</span>
                <span className="sm:hidden">全部</span>
                <Badge
                  variant="secondary"
                  className="text-[10px] md:text-xs bg-white/10 text-white border-white/20"
                >
                  {data.allTherapists.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="flex items-center gap-1 md:gap-2 text-xs md:text-sm data-[state=active]:bg-primary-cyan/20 data-[state=active]:text-primary-cyan"
              >
                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">待审核</span>
                <span className="sm:hidden">待审</span>
                {pendingCount > 0 && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] md:text-xs">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="deactivation"
                className="flex items-center gap-1 md:gap-2 text-xs md:text-sm data-[state=active]:bg-primary-cyan/20 data-[state=active]:text-primary-cyan"
              >
                <AlertCircle className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">注销申请</span>
                <span className="sm:hidden">注销</span>
                {deactivationPendingCount > 0 && (
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px] md:text-xs">
                    {deactivationPendingCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Suspense fallback={<TableSkeleton />}>
                <AllTherapistsTab initialData={data.allTherapists} />
              </Suspense>
            </TabsContent>

            <TabsContent value="pending">
              <Suspense fallback={<TableSkeleton />}>
                <PendingTherapistsTab initialData={data.pendingTherapists} />
              </Suspense>
            </TabsContent>

            <TabsContent value="deactivation">
              <Suspense fallback={<TableSkeleton />}>
                <DeactivationRequestsTab initialData={data.deactivationRequests} />
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
