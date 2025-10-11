'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, User, Edit, LogOut, CheckCircle, XCircle, Clock, Image as ImageIcon, Bell, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';

interface TherapistData {
  id: string;
  nickname: string;
  age: number;
  height: number;
  weight: number;
  city: string;
  areas: string[];
  status: string;
  isOnline: boolean;
  isFeatured: boolean;
  isNew: boolean;
  photos: Array<{ id: string; url: string }>;
  profile: {
    introduction: string;
    wechat: string | null;
    qq: string | null;
    phone: string | null;
  } | null;
}

export default function TherapistDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [therapist, setTherapist] = useState<TherapistData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/therapist/login');
    } else if (status === 'authenticated' && session?.user?.role === 'therapist') {
      fetchTherapistData();
      fetchUnreadCount();
    }
  }, [status, session, router]);

  const fetchTherapistData = async () => {
    try {
      const res = await fetch('/api/therapist/profile');
      const data = await res.json();
      
      if (data.success) {
        setTherapist(data.data);
      } else {
        toast.error('获取资料失败');
      }
    } catch (error) {
      console.error('获取资料失败:', error);
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/therapist/notifications/unread-count');
      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('获取未读数失败:', error);
    }
  };

  const handleToggleOnline = async () => {
    if (!therapist) return;
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/therapist/toggle-online', {
        method: 'POST',
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success(therapist.isOnline ? '已设为离线' : '已设为在线');
        fetchTherapistData();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('切换状态失败:', error);
      toast.error('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/therapist/login');
  };

  const handleResubmit = async () => {
    if (!confirm('确认重新提交审核吗？')) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/therapist/resubmit', {
        method: 'POST',
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchTherapistData(); // 刷新数据
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('提交失败:', error);
      toast.error('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-gold" />
      </div>
    );
  }

  if (!session || session.user.role !== 'therapist' || !therapist) {
    return null;
  }

  const getStatusBadge = () => {
    switch (therapist.status) {
      case 'APPROVED':
        return <Badge className="bg-green-600">已通过</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-600">待审核</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-600">已拒绝</Badge>;
      case 'BANNED':
        return <Badge className="bg-gray-600">已封禁</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary-gold mb-2">
          技师工作台
        </h1>
            <p className="text-gray-400">
              欢迎回来，{therapist.nickname}！
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

        {/* 审核状态提示 */}
        {therapist.status !== 'APPROVED' && (
          <div className="mb-6 p-6 bg-yellow-600/10 border border-yellow-600/30 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-bold text-yellow-500">审核状态</h3>
              </div>
              {therapist.status === 'REJECTED' && (
                <Button
                  onClick={handleResubmit}
                  disabled={submitting}
                  className="bg-primary-gold hover:bg-yellow-600"
                >
                  {submitting ? '提交中...' : '重新提交审核'}
                </Button>
              )}
            </div>
            <p className="text-gray-300">
              {therapist.status === 'PENDING' && '您的资料正在审核中，预计48小时内完成审核。'}
              {therapist.status === 'REJECTED' && '您的资料审核未通过，请修改资料后点击"重新提交审核"按钮。'}
              {therapist.status === 'BANNED' && '您的账号已被封禁，如有疑问请联系客服。'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：个人资料卡片 */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">个人资料</h2>
                {getStatusBadge()}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <User className="w-5 h-5 text-primary-gold" />
                  <div>
                    <p className="text-gray-400 text-sm">昵称</p>
                    <p className="text-white font-medium">{therapist.nickname}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white/5 rounded-lg text-center">
                    <p className="text-gray-400 text-xs mb-1">年龄</p>
                    <p className="text-white font-bold">{therapist.age}岁</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg text-center">
                    <p className="text-gray-400 text-xs mb-1">身高</p>
                    <p className="text-white font-bold">{therapist.height}cm</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg text-center">
                    <p className="text-gray-400 text-xs mb-1">体重</p>
                    <p className="text-white font-bold">{therapist.weight}kg</p>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">所在城市</p>
                  <p className="text-white font-medium">{therapist.city}</p>
                </div>

                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">照片数量</p>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary-gold" />
                    <p className="text-white font-medium">{therapist.photos.length} 张</p>
                  </div>
                </div>

                <Link href="/therapist/profile/edit">
                  <Button className="w-full bg-gradient-to-r from-primary-gold to-yellow-600">
                    <Edit className="w-4 h-4 mr-2" />
                    编辑资料
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* 右侧：功能区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 资料完整度 */}
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">资料完整度</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">基本信息</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">个人介绍</span>
                  {therapist.profile?.introduction ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">联系方式</span>
                  {therapist.profile?.wechat || therapist.profile?.qq || therapist.profile?.phone ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">照片（至少3张）</span>
                  {therapist.photos.length >= 3 ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>

            {/* 快速操作 */}
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">快速操作</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <Link href="/therapist/profile/edit">
                  <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                    <Edit className="w-6 h-6 text-primary-gold" />
                    <span>编辑资料</span>
                  </Button>
                </Link>
                
                <Link href="/therapist/notifications">
                  <Button variant="outline" className="w-full h-24 flex flex-col gap-2 relative">
                    <Bell className="w-6 h-6 text-blue-500" />
                    <span>通知中心</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>

                <Button 
                  variant="outline" 
                  className="w-full h-24 flex flex-col gap-2"
                  onClick={handleToggleOnline}
                  disabled={submitting || therapist.status !== 'APPROVED'}
                >
                  <Power className={`w-6 h-6 ${therapist.isOnline ? 'text-green-500' : 'text-gray-500'}`} />
                  <span>{therapist.isOnline ? '在线' : '离线'}</span>
                  {therapist.status === 'APPROVED' && (
                    <span className="text-xs text-gray-400">点击切换</span>
                  )}
                </Button>
                
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2" disabled>
                  <Clock className="w-6 h-6 text-gray-500" />
                  <span className="text-gray-500">时间管理</span>
                  <span className="text-xs text-gray-600">即将开放</span>
                </Button>
              </div>
            </div>

            {/* 使用提示 */}
            <div className="bg-primary-gold/10 border border-primary-gold/30 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-primary-gold mb-3">💡 温馨提示</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• 完善个人资料可以提高客户的预约意向</li>
                <li>• 至少上传3张清晰照片，展示您的形象和服务环境</li>
                <li>• 填写真实的联系方式，方便客服安排服务</li>
                <li>• 资料提交后，平台将在48小时内完成审核</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

