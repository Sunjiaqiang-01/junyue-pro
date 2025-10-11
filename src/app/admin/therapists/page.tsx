'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Search, Filter, Eye, Star, Ban, UserCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

interface Therapist {
  id: string;
  nickname: string;
  age: number;
  height: number;
  weight: number;
  city: string;
  phone: string;
  status: string;
  isOnline: boolean;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: string;
  photos: Array<{ id: string; url: string }>;
  profile: {
    introduction: string;
    wechat: string | null;
    qq: string | null;
    phone: string | null;
  } | null;
}

export default function TherapistsManagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchTherapists();
    }
  }, [status, session, router]);

  useEffect(() => {
    filterTherapists();
  }, [searchQuery, statusFilter, therapists]);

  const fetchTherapists = async () => {
    try {
      const res = await fetch('/api/admin/therapists');
      const data = await res.json();
      
      if (data.success) {
        setTherapists(data.data);
        setFilteredTherapists(data.data);
      } else {
        toast.error('获取技师列表失败');
      }
    } catch (error) {
      console.error('获取技师列表失败:', error);
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const filterTherapists = () => {
    let filtered = [...therapists];

    // 搜索过滤
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.nickname.includes(searchQuery) || 
        t.phone.includes(searchQuery) ||
        t.city.includes(searchQuery)
      );
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    setFilteredTherapists(filtered);
  };

  const handleToggleFeatured = async (therapistId: string, isFeatured: boolean) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}/feature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success(isFeatured ? '已取消推荐' : '已设为推荐');
        fetchTherapists();
      } else {
        toast.error(data.error || '操作失败');
      }
    } catch (error) {
      console.error('操作失败:', error);
      toast.error('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBan = async (therapistId: string, status: string) => {
    const isBanned = status === 'BANNED';
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ban: !isBanned }),
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success(isBanned ? '已解封' : '已封禁');
        fetchTherapists();
        setSelectedTherapist(null);
      } else {
        toast.error(data.error || '操作失败');
      }
    } catch (error) {
      console.error('操作失败:', error);
      toast.error('网络错误');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-primary-gold mb-2">
                技师管理
              </h1>
              <p className="text-gray-400">
                共 {filteredTherapists.length} 位技师
              </p>
            </div>
          </div>
        </div>

        {/* 筛选栏 */}
        <div className="mb-6 space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="搜索技师姓名、手机号或城市..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/5 border-gray-800 text-white placeholder:text-gray-500"
            />
          </div>

          {/* 状态筛选 */}
          <div className="flex gap-3 flex-wrap">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              size="sm"
            >
              全部
            </Button>
            <Button
              variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('APPROVED')}
              size="sm"
              className={statusFilter === 'APPROVED' ? 'bg-green-600' : ''}
            >
              已通过
            </Button>
            <Button
              variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('PENDING')}
              size="sm"
              className={statusFilter === 'PENDING' ? 'bg-yellow-600' : ''}
            >
              待审核
            </Button>
            <Button
              variant={statusFilter === 'REJECTED' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('REJECTED')}
              size="sm"
              className={statusFilter === 'REJECTED' ? 'bg-red-600' : ''}
            >
              已拒绝
            </Button>
            <Button
              variant={statusFilter === 'BANNED' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('BANNED')}
              size="sm"
              className={statusFilter === 'BANNED' ? 'bg-gray-600' : ''}
            >
              已封禁
            </Button>
          </div>
        </div>

        {/* 技师列表 */}
        {filteredTherapists.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800">
            <p className="text-gray-400 text-lg">没有找到技师</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTherapists.map((therapist) => (
              <div
                key={therapist.id}
                className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-primary-gold transition-colors"
              >
                {/* 头像 */}
                {therapist.photos.length > 0 && (
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                    <Image
                      src={therapist.photos[0].url}
                      alt={therapist.nickname}
                      fill
                      className="object-cover"
                    />
                    {/* 状态标签 */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {therapist.isFeatured && (
                        <Badge className="bg-yellow-600">推荐</Badge>
                      )}
                      {therapist.isOnline && (
                        <Badge className="bg-blue-600">在线</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* 基本信息 */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-white">{therapist.nickname}</h3>
                  {getStatusBadge(therapist.status)}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-sm text-gray-300">
                  <div>年龄: {therapist.age}岁</div>
                  <div>身高: {therapist.height}cm</div>
                  <div>体重: {therapist.weight}kg</div>
                </div>

                <p className="text-gray-400 text-sm mb-2">城市: {therapist.city}</p>
                <p className="text-gray-400 text-sm mb-4">
                  手机: {therapist.phone}
                </p>

                {/* 操作按钮 */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedTherapist(therapist)}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={therapist.isFeatured ? 'default' : 'outline'}
                    onClick={() => handleToggleFeatured(therapist.id, therapist.isFeatured)}
                    disabled={submitting || therapist.status !== 'APPROVED'}
                    className={therapist.isFeatured ? 'bg-yellow-600' : ''}
                  >
                    <Star className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={therapist.status === 'BANNED' ? 'default' : 'destructive'}
                    onClick={() => handleToggleBan(therapist.id, therapist.status)}
                    disabled={submitting}
                  >
                    {therapist.status === 'BANNED' ? (
                      <UserCheck className="w-4 h-4" />
                    ) : (
                      <Ban className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 详情对话框 */}
        {selectedTherapist && (
          <Dialog open={!!selectedTherapist} onOpenChange={() => setSelectedTherapist(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-black border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-primary-gold">
                  技师详情 - {selectedTherapist.nickname}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* 基本信息 */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">基本信息</h3>
                  <div className="grid grid-cols-2 gap-4 text-gray-300">
                    <div>昵称: {selectedTherapist.nickname}</div>
                    <div>状态: {getStatusBadge(selectedTherapist.status)}</div>
                    <div>年龄: {selectedTherapist.age}岁</div>
                    <div>身高: {selectedTherapist.height}cm</div>
                    <div>体重: {selectedTherapist.weight}kg</div>
                    <div>城市: {selectedTherapist.city}</div>
                    <div className="col-span-2">
                      手机号: <span className="text-primary-gold">{selectedTherapist.phone}</span>
                    </div>
                  </div>
                </div>

                {/* 联系方式 */}
                {selectedTherapist.profile && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">联系方式（客服可见）</h3>
                    <div className="grid grid-cols-2 gap-4 p-4 bg-primary-gold/10 border border-primary-gold/30 rounded-lg">
                      {selectedTherapist.profile.wechat && (
                        <div className="text-gray-300">
                          微信: <span className="text-white">{selectedTherapist.profile.wechat}</span>
                        </div>
                      )}
                      {selectedTherapist.profile.qq && (
                        <div className="text-gray-300">
                          QQ: <span className="text-white">{selectedTherapist.profile.qq}</span>
                        </div>
                      )}
                      {selectedTherapist.profile.phone && (
                        <div className="text-gray-300">
                          电话: <span className="text-white">{selectedTherapist.profile.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 个人介绍 */}
                {selectedTherapist.profile?.introduction && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">个人介绍</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {selectedTherapist.profile.introduction}
                    </p>
                  </div>
                )}

                {/* 照片 */}
                {selectedTherapist.photos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">
                      照片 ({selectedTherapist.photos.length})
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedTherapist.photos.map((photo) => (
                        <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                          <Image
                            src={photo.url}
                            alt="技师照片"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleToggleFeatured(selectedTherapist.id, selectedTherapist.isFeatured)}
                    disabled={submitting || selectedTherapist.status !== 'APPROVED'}
                    className={`flex-1 ${selectedTherapist.isFeatured ? 'bg-gray-600' : 'bg-yellow-600'}`}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {selectedTherapist.isFeatured ? '取消推荐' : '设为推荐'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleToggleBan(selectedTherapist.id, selectedTherapist.status)}
                    disabled={submitting}
                    className="flex-1"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    {selectedTherapist.status === 'BANNED' ? '解除封禁' : '封禁技师'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

