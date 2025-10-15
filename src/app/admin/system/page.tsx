"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, Server, Database, HardDrive, Cpu, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

interface SystemStats {
  server: {
    platform: string;
    nodeVersion: string;
    uptime: number;
    memory: {
      total: number;
      used: number;
      free: number;
      percentage: number;
    };
    cpu: {
      model: string;
      cores: number;
      usage: number;
    };
  };
  database: {
    therapists: number;
    pendingTherapists: number;
    approvedTherapists: number;
    onlineTherapists: number;
    todayTherapists: number;
    admins: number;
    customerServices: number;
    cities: number;
    registrationCodes: number;
    announcements: number;
    notifications: number;
  };
}

export default function SystemMonitorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated" && session?.user?.role === "admin") {
      fetchStats();
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/system/stats");
      const data = await res.json();

      if (data.success) {
        setStats(data.data);
      } else {
        toast.error("获取系统状态失败");
      }
    } catch (error) {
      console.error("获取系统状态失败:", error);
      toast.error("网络错误");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}天 ${hours}小时 ${minutes}分钟`;
  };

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2) + " GB";
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-gold" />
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-primary-gold mb-2">系统监控</h1>
              <p className="text-gray-400">实时查看服务器状态和数据统计</p>
            </div>
          </div>
          <Button
            onClick={fetchStats}
            disabled={refreshing}
            className="bg-primary-gold text-black hover:bg-yellow-600"
          >
            {refreshing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                刷新中...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 mr-2" />
                刷新数据
              </>
            )}
          </Button>
        </div>

        {stats && (
          <div className="space-y-6">
            {/* 服务器状态 */}
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Server className="w-6 h-6 text-primary-gold" />
                <h2 className="text-2xl font-bold text-white">服务器状态</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 系统信息 */}
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Server className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-semibold">系统信息</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300">平台: {stats.server.platform}</p>
                    <p className="text-gray-300">Node: {stats.server.nodeVersion}</p>
                    <p className="text-gray-300">运行时长: {formatUptime(stats.server.uptime)}</p>
                  </div>
                </div>

                {/* CPU */}
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Cpu className="w-5 h-5 text-green-400" />
                    <h3 className="text-white font-semibold">CPU</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300">型号: {stats.server.cpu.model}</p>
                    <p className="text-gray-300">核心数: {stats.server.cpu.cores}</p>
                    <p className="text-gray-300">使用率: {stats.server.cpu.usage.toFixed(2)}%</p>
                  </div>
                </div>

                {/* 内存 */}
                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-semibold">内存</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300">总量: {formatBytes(stats.server.memory.total)}</p>
                    <p className="text-gray-300">已用: {formatBytes(stats.server.memory.used)}</p>
                    <p className="text-gray-300">
                      使用率: {stats.server.memory.percentage.toFixed(2)}%
                    </p>
                  </div>
                  <div className="mt-3 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full transition-all duration-300"
                      style={{ width: `${stats.server.memory.percentage}%` }}
                    />
                  </div>
                </div>

                {/* 磁盘空间占位 */}
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <HardDrive className="w-5 h-5 text-orange-400" />
                    <h3 className="text-white font-semibold">磁盘</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-400">暂不支持</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 数据库统计 */}
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-primary-gold" />
                <h2 className="text-2xl font-bold text-white">数据库统计</h2>
              </div>

              {/* 技师数据 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-3">技师数据</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="bg-gradient-to-br from-primary-gold/20 to-yellow-600/20 border border-primary-gold/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-primary-gold mb-2">
                      {stats.database.therapists}
                    </p>
                    <p className="text-gray-300 text-sm">技师总数</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-orange-400 mb-2">
                      {stats.database.pendingTherapists}
                    </p>
                    <p className="text-gray-300 text-sm">待审核</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-green-400 mb-2">
                      {stats.database.approvedTherapists}
                    </p>
                    <p className="text-gray-300 text-sm">已通过</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-blue-400 mb-2">
                      {stats.database.onlineTherapists}
                    </p>
                    <p className="text-gray-300 text-sm">在线技师</p>
                  </div>

                  <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-pink-400 mb-2">
                      {stats.database.todayTherapists}
                    </p>
                    <p className="text-gray-300 text-sm">今日新增</p>
                  </div>
                </div>
              </div>

              {/* 系统数据 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-3">系统数据</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-purple-400 mb-2">
                      {stats.database.admins}
                    </p>
                    <p className="text-gray-300 text-sm">管理员总数</p>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-cyan-400 mb-2">
                      {stats.database.customerServices}
                    </p>
                    <p className="text-gray-300 text-sm">客服配置数</p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-indigo-400 mb-2">
                      {stats.database.cities}
                    </p>
                    <p className="text-gray-300 text-sm">城市总数</p>
                  </div>
                </div>
              </div>

              {/* 内容数据 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-3">内容数据</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-red-400 mb-2">
                      {stats.database.registrationCodes}
                    </p>
                    <p className="text-gray-300 text-sm">注册码总数</p>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-yellow-400 mb-2">
                      {stats.database.announcements}
                    </p>
                    <p className="text-gray-300 text-sm">公告总数</p>
                  </div>

                  <div className="bg-gradient-to-br from-teal-500/20 to-teal-600/20 border border-teal-500/30 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-teal-400 mb-2">
                      {stats.database.notifications}
                    </p>
                    <p className="text-gray-300 text-sm">通知总数</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">快捷操作</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/users">
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-white/5"
                  >
                    管理用户
                  </Button>
                </Link>
                <Link href="/admin/therapists">
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-white/5"
                  >
                    管理技师
                  </Button>
                </Link>
                <Link href="/admin/announcements">
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-white/5"
                  >
                    管理公告
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
