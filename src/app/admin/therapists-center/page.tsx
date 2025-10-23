import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
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
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  return {
    allTherapists,
    pendingTherapists,
    deactivationRequests,
  };
}

export default async function TherapistsCenterPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const data = await getTherapistsData();

  const pendingCount = data.pendingTherapists.length;
  const deactivationPendingCount = data.deactivationRequests.filter(
    (r) => r.status === "PENDING"
  ).length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold mb-2">技师管理中心</h1>
        <p className="text-muted-foreground">统一管理所有技师、审核新注册、处理注销申请</p>
      </div>

      {/* Tab导航 */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                全部技师
                <Badge variant="secondary">{data.allTherapists.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                待审核
                {pendingCount > 0 && (
                  <Badge className="bg-yellow-500 text-white">{pendingCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="deactivation" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                注销申请
                {deactivationPendingCount > 0 && (
                  <Badge className="bg-orange-500 text-white">{deactivationPendingCount}</Badge>
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
