'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Users, UserCheck, Clock, TrendingUp, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

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
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchStats();
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard/stats');
      const data = await res.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        toast.error('获取统计数据失败');
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-gold" />
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary-gold mb-2">
              管理中心
            </h1>
            <p className="text-gray-400">
              欢迎，{session.user.name || '管理员'}！
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{stats?.totalTherapists || 0}</span>
            </div>
            <p className="text-gray-300 font-medium">技师总数</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <UserCheck className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{stats?.approvedTherapists || 0}</span>
            </div>
            <p className="text-gray-300 font-medium">已审核通过</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-yellow-400" />
              <span className="text-3xl font-bold text-white">{stats?.pendingTherapists || 0}</span>
            </div>
            <p className="text-gray-300 font-medium">待审核</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">{stats?.todayNew || 0}</span>
            </div>
            <p className="text-gray-300 font-medium">今日新增</p>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </div>
    </div>
  );
}

