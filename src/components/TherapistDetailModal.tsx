"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, Clock, X } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import TencentMap from "@/components/TencentMap";

interface TherapistDetail {
  id: string;
  nickname: string;
  age: number;
  height: number;
  weight: number;
  cardValue?: string; // 🆕 牌值
  city: string;
  areas: string[];
  location?: {
    // 🆕 位置信息
    name: string;
    street: string;
    latitude: number;
    longitude: number;
  };
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

interface TherapistDetailModalProps {
  therapistId: string | null;
  open: boolean;
  onClose: () => void;
}

export function TherapistDetailModal({ therapistId, open, onClose }: TherapistDetailModalProps) {
  const [therapist, setTherapist] = useState<TherapistDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && therapistId) {
      fetchTherapistDetail();
    }
  }, [open, therapistId]);

  const fetchTherapistDetail = async () => {
    if (!therapistId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/therapists/${therapistId}`);
      const data = await response.json();

      if (data.success) {
        setTherapist(data.data);
      } else {
        toast.error("获取技师详情失败");
      }
    } catch (error) {
      console.error("获取技师详情失败:", error);
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const handleContactService = () => {
    onClose();
    // 触发客服弹窗
    const event = new CustomEvent("openCustomerService");
    window.dispatchEvent(event);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-black border-primary-gold/30 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary-gold" />
          </div>
        ) : therapist ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary-gold flex items-center gap-3">
                {therapist.nickname}
                <div className="flex items-center gap-2">
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
                </div>
              </DialogTitle>
            </DialogHeader>

            {/* 双列布局：左侧照片，右侧信息 */}
            <div className="grid md:grid-cols-[400px_1fr] gap-6 py-4">
              {/* 左侧：照片轮播（固定位置） */}
              <div className="md:sticky md:top-0 md:self-start">
                {therapist.photos && therapist.photos.length > 0 && (
                  <div className="relative">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {therapist.photos.map((photo) => (
                          <CarouselItem key={photo.id}>
                            <div className="relative aspect-[9/16] rounded-2xl overflow-hidden">
                              <Image
                                src={photo.url}
                                alt={`${therapist.nickname}的照片`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </Carousel>
                  </div>
                )}
              </div>

              {/* 右侧：信息区域（可滚动） */}
              <div className="space-y-6">
                {/* 基本信息 - 添加牌值 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-gray-800">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">年龄</p>
                    <p className="text-white text-lg font-semibold">{therapist.age}岁</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">身高</p>
                    <p className="text-white text-lg font-semibold">{therapist.height}cm</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">体重</p>
                    <p className="text-white text-lg font-semibold">{therapist.weight}kg</p>
                  </div>
                  {therapist.cardValue && (
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-1">牌值</p>
                      <p className="text-primary-gold text-lg font-bold">{therapist.cardValue}</p>
                    </div>
                  )}
                </div>

                {/* 技师位置 - 腾讯地图 */}
                {therapist.location && <TencentMap location={therapist.location} />}

                {/* 个人简介 */}
                {therapist.profile?.introduction && (
                  <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-3">个人简介</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {therapist.profile.introduction}
                    </p>
                  </div>
                )}

                {/* 视频展示 */}
                {therapist.videos && therapist.videos.length > 0 && (
                  <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-3">视频介绍</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {therapist.videos.map((video) => (
                        <div
                          key={video.id}
                          className="relative aspect-video rounded-lg overflow-hidden"
                        >
                          <video
                            src={video.url}
                            poster={video.coverUrl || undefined}
                            controls
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 预约提示 */}
                <div className="p-4 rounded-xl bg-primary-gold/10 border border-primary-gold/30">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    💡 如需预约{therapist.nickname}
                    的服务，请点击下方按钮联系客服，告知技师姓名或编号，客服将为您安排预约。
                  </p>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleContactService}
                    className="flex-1 bg-gradient-to-r from-primary-gold to-yellow-600 hover:from-yellow-600 hover:to-primary-gold text-white font-bold shadow-lg shadow-primary-gold/30 hover:shadow-primary-gold/50"
                  >
                    联系客服预约
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-white/5"
                  >
                    关闭
                  </Button>
                </div>
              </div>
              {/* 关闭右侧信息区域 */}
            </div>
            {/* 关闭双列布局 */}
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400">未找到技师信息</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default TherapistDetailModal;
