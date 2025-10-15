"use client";

import { useEffect, useState } from "react";
import { Loader2, Star, Ban, UserCheck, Edit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
  cardValue?: string;
  city: string;
  areas: string[];
  location?: {
    name: string;
    street: string;
    latitude: number;
    longitude: number;
  };
  isNew: boolean;
  isFeatured: boolean;
  status: string;
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
    specialties: string[];
    serviceType: string[];
  } | null;
  schedules: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    isRecurring: boolean;
  }>;
}

interface AdminTherapistDetailModalProps {
  therapistId: string | null;
  open: boolean;
  onClose: () => void;
  onToggleFeatured?: (id: string, isFeatured: boolean) => void;
  onToggleBan?: (id: string, status: string) => void;
}

export function AdminTherapistDetailModal({
  therapistId,
  open,
  onClose,
  onToggleFeatured,
  onToggleBan,
}: AdminTherapistDetailModalProps) {
  const [therapist, setTherapist] = useState<TherapistDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && therapistId) {
      fetchTherapistDetail();
    }
  }, [open, therapistId]);

  const fetchTherapistDetail = async () => {
    if (!therapistId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/therapists/${therapistId}`);
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

  const handleToggleFeatured = async () => {
    if (!therapist || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/therapists/${therapist.id}/feature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !therapist.isFeatured }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(therapist.isFeatured ? "已取消推荐" : "已设为推荐");
        // 刷新数据
        fetchTherapistDetail();
        // 通知父组件
        if (onToggleFeatured) {
          onToggleFeatured(therapist.id, therapist.isFeatured);
        }
      } else {
        toast.error(data.error || "操作失败");
      }
    } catch (error) {
      console.error("操作失败:", error);
      toast.error("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBan = async () => {
    if (!therapist || submitting) return;

    const isBanned = therapist.status === "BANNED";
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/therapists/${therapist.id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ban: !isBanned }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(isBanned ? "已解封" : "已封禁");
        // 通知父组件并关闭弹窗
        if (onToggleBan) {
          onToggleBan(therapist.id, therapist.status);
        }
        onClose();
      } else {
        toast.error(data.error || "操作失败");
      }
    } catch (error) {
      console.error("操作失败:", error);
      toast.error("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-600">已通过</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-600">待审核</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-600">已拒绝</Badge>;
      case "BANNED":
        return <Badge className="bg-gray-600">已封禁</Badge>;
      default:
        return null;
    }
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
              <DialogTitle className="text-2xl font-bold text-primary-gold flex items-center justify-between">
                <div className="flex items-center gap-3">
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
                    {getStatusBadge(therapist.status)}
                  </div>
                </div>
                {/* 管理员快捷操作 */}
                <div className="flex items-center gap-2">
                  <Link href={`/admin/therapists/${therapist.id}/edit`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      编辑
                    </Button>
                  </Link>
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

                {/* 服务区域 */}
                {therapist.areas && therapist.areas.length > 0 && (
                  <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-3">服务区域</h3>
                    <div className="flex flex-wrap gap-2">
                      {therapist.areas.map((area, index) => (
                        <Badge key={index} className="bg-blue-600">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 专长技能 */}
                {therapist.profile?.specialties && therapist.profile.specialties.length > 0 && (
                  <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-3">专长技能</h3>
                    <div className="flex flex-wrap gap-2">
                      {therapist.profile.specialties.map((specialty, index) => (
                        <Badge key={index} className="bg-purple-600">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 服务类型 */}
                {therapist.profile?.serviceType && therapist.profile.serviceType.length > 0 && (
                  <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-3">服务类型</h3>
                    <div className="flex flex-wrap gap-2">
                      {therapist.profile.serviceType.map((type, index) => (
                        <Badge key={index} className="bg-green-600">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 技师位置 - 腾讯地图 */}
                {therapist.location && (
                  <div className="rounded-xl overflow-hidden">
                    <TencentMap location={therapist.location} />
                  </div>
                )}

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

                {/* 管理员操作区 */}
                <div className="p-4 rounded-xl bg-primary-gold/10 border border-primary-gold/30">
                  <h3 className="text-lg font-semibold text-white mb-3">管理员操作</h3>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleToggleFeatured}
                      disabled={submitting || therapist.status !== "APPROVED"}
                      className={`flex-1 ${
                        therapist.isFeatured
                          ? "bg-gray-600 hover:bg-gray-700"
                          : "bg-yellow-600 hover:bg-yellow-700"
                      }`}
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Star className="w-4 h-4 mr-2" />
                      )}
                      {therapist.isFeatured ? "取消推荐" : "设为推荐"}
                    </Button>
                    <Button
                      onClick={handleToggleBan}
                      disabled={submitting}
                      variant="destructive"
                      className="flex-1"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : therapist.status === "BANNED" ? (
                        <UserCheck className="w-4 h-4 mr-2" />
                      ) : (
                        <Ban className="w-4 h-4 mr-2" />
                      )}
                      {therapist.status === "BANNED" ? "解除封禁" : "封禁技师"}
                    </Button>
                  </div>
                </div>

                {/* 关闭按钮 */}
                <div className="flex gap-3">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-white/5"
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

export default AdminTherapistDetailModal;
