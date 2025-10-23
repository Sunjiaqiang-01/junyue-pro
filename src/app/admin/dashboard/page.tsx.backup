"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Users, UserCheck, Clock, Megaphone, BookOpen, Key, Activity } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import AdminStatsCards from "@/components/admin/AdminStatsCards";

interface DashboardStats {
  totalTherapists: number;
  approvedTherapists: number;
  pendingTherapists: number;
  onlineTherapists: number;
  todayNew: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated" && session?.user?.role === "admin") {
      fetchStats();
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/dashboard/stats");
      const data = await res.json();

      if (data.success) {
        setStats(data.data);
      } else {
        toast.error("获取统计数据失败");
      }
    } catch (error) {
      console.error("获取统计数据失败:", error);
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-gold" />
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 欢迎区域 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-gold mb-2">
            欢迎回来，{session.user.name || "管理员"}！
          </h1>
          <p className="text-gray-400">
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
        <div className="mb-8">
          <AdminStatsCards stats={stats} />
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/system">
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-primary-gold transition-colors cursor-pointer">
              <Activity className="w-12 h-12 text-primary-gold mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">系统监控</h3>
              <p className="text-gray-400">查看服务器状态和数据统计</p>
            </div>
          </Link>

          <Link href="/admin/therapists/pending">
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-primary-gold transition-colors cursor-pointer">
              <Clock className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">技师审核</h3>
              <p className="text-gray-400">审核待审核的技师资料</p>
              {stats && stats.pendingTherapists > 0 && (
                <div className="mt-4">
                  <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm">
                    {stats.pendingTherapists} 个待审核
                  </span>
                </div>
              )}
            </div>
          </Link>

          <Link href="/admin/therapists">
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-primary-gold transition-colors cursor-pointer">
              <Users className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">技师管理</h3>
              <p className="text-gray-400">管理所有技师信息</p>
            </div>
          </Link>

          <Link href="/admin/customer-services">
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-primary-gold transition-colors cursor-pointer">
              <UserCheck className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">客服配置</h3>
              <p className="text-gray-400">管理客服信息和二维码</p>
            </div>
          </Link>

          <Link href="/admin/announcements">
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-primary-gold transition-colors cursor-pointer">
              <Megaphone className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">公告管理</h3>
              <p className="text-gray-400">发布和管理平台公告</p>
            </div>
          </Link>

          <Link href="/admin/guide">
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-primary-gold transition-colors cursor-pointer">
              <BookOpen className="w-12 h-12 text-cyan-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">指南管理</h3>
              <p className="text-gray-400">管理平台使用指南</p>
            </div>
          </Link>

          <Link href="/admin/registration-codes">
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-primary-gold transition-colors cursor-pointer">
              <Key className="w-12 h-12 text-pink-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">注册码管理</h3>
              <p className="text-gray-400">生成和管理技师注册码</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
