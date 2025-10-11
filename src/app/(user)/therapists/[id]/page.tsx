'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, MapPin, Clock } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CustomerServiceButton from '@/components/CustomerServiceButton';
import ResizableNavigation from '@/components/ResizableNavigation';
import { toast } from 'sonner';

interface TherapistDetail {
  id: string;
  nickname: string;
  age: number;
  height: number;
  weight: number;
  city: string;
  areas: string[];
  isOnline: boolean;
  isNew: boolean;
  isFeatured: boolean;
  createdAt: string;
  photos: Array<{
    id: string;
    url: string;
    order: number;
  }>;
  videos: Array<{
    id: string;
    url: string;
    coverUrl: string | null;
    duration: number | null;
  }>;
  profile: {
    introduction: string;
    specialties: string[];
    serviceType: string[];
    serviceAddress: string | null;
  } | null;
  schedules: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    isRecurring: boolean;
  }>;
}

export default function TherapistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [therapist, setTherapist] = useState<TherapistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    if (id) {
      fetchTherapistDetail();
    }
  }, [id]);

  const fetchTherapistDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/therapists/${id}`);
      const data = await response.json();

      if (data.success) {
        setTherapist(data.data);
      } else {
        toast.error('获取技师详情失败');
      }
    } catch (error) {
      console.error('获取技师详情失败:', error);
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
        <ResizableNavigation />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary-gold" />
        </div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
        <ResizableNavigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-4">技师不存在</p>
            <Button onClick={() => router.back()}>返回</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      {/* 导航栏 */}
      <ResizableNavigation />
      
      {/* 返回按钮 */}
      <div className="sticky top-20 z-10 bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white hover:text-primary-gold"
          >
            <ArrowLeft className="mr-2" />
            返回
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：照片和视频 */}
          <div className="space-y-4">
            {/* 主图 */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-gray-800">
              <Image
                src={therapist.photos[selectedPhoto]?.url || '/placeholder.jpg'}
                alt={therapist.nickname}
                fill
                className="object-cover"
              />
              
              {/* 状态标签 */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {therapist.isFeatured && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0">
                    推荐
                  </Badge>
                )}
                {therapist.isNew && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 border-0">
                    新人
                  </Badge>
                )}
                {therapist.isOnline && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 border-0">
                    在线
                  </Badge>
                )}
              </div>
            </div>

            {/* 缩略图 */}
            {therapist.photos.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {therapist.photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhoto(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedPhoto === index
                        ? 'border-primary-gold'
                        : 'border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <Image
                      src={photo.url}
                      alt={`照片 ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* 视频 */}
            {therapist.videos.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">个人视频</h3>
                {therapist.videos.map((video) => (
                  <div key={video.id} className="relative aspect-video rounded-lg overflow-hidden border border-gray-800">
                    <video
                      src={video.url}
                      poster={video.coverUrl || undefined}
                      controls
                      className="w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 右侧：信息 */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
              <h1 className="text-3xl font-bold text-white mb-4">
                {therapist.nickname}
              </h1>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <p className="text-gray-400 text-sm mb-1">年龄</p>
                  <p className="text-white text-xl font-bold">{therapist.age}岁</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <p className="text-gray-400 text-sm mb-1">身高</p>
                  <p className="text-white text-xl font-bold">{therapist.height}cm</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <p className="text-gray-400 text-sm mb-1">体重</p>
                  <p className="text-white text-xl font-bold">{therapist.weight}kg</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <MapPin className="mr-2 h-5 w-5 text-primary-gold" />
                  <span>{therapist.city}</span>
                  {therapist.areas.length > 0 && (
                    <>
                      <span className="mx-2">·</span>
                      <span>{therapist.areas.join('、')}</span>
                    </>
                  )}
                </div>

                {therapist.profile?.serviceAddress && (
                  <div className="flex items-start text-gray-300">
                    <MapPin className="mr-2 h-5 w-5 text-primary-gold flex-shrink-0 mt-0.5" />
                    <span>{therapist.profile.serviceAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 个人介绍 */}
            {therapist.profile?.introduction && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">个人介绍</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {therapist.profile.introduction}
                </p>
              </div>
            )}

            {/* 服务特色 */}
            {therapist.profile?.specialties && therapist.profile.specialties.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">服务特色</h2>
                <div className="flex flex-wrap gap-2">
                  {therapist.profile.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-primary-gold/20 to-yellow-600/20 border border-primary-gold/30 text-primary-gold font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 服务方式 */}
            {therapist.profile?.serviceType && therapist.profile.serviceType.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">服务方式</h2>
                <div className="space-y-2">
                  {therapist.profile.serviceType.map((type, index) => (
                    <div key={index} className="flex items-center text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-primary-gold mr-3" />
                      <span>
                        {type === 'VISIT_CLIENT' && '上门服务'}
                        {type === 'CLIENT_VISIT' && '客户到店'}
                        {type === 'NEGOTIATE' && '双方协商'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 可服务时间 */}
            {therapist.schedules.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-primary-gold" />
                  可服务时间
                </h2>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {therapist.schedules.slice(0, 10).map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                    >
                      <span className="text-gray-300">
                        {new Date(schedule.date).toLocaleDateString('zh-CN')}
                      </span>
                      <span className="text-white font-medium">
                        {schedule.startTime} - {schedule.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 联系客服预约按钮 */}
            <div className="sticky bottom-4">
              <CustomerServiceButton variant="inline" size="lg" />
              <p className="text-center text-gray-400 text-sm mt-3">
                💡 联系客服预约，享受专业服务
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 悬浮客服按钮 */}
      <CustomerServiceButton variant="floating" />
    </div>
  );
}
