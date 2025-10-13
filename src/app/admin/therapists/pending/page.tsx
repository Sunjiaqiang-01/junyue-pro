"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Check, X, Eye, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { ProfileValidator } from "@/lib/profile-validator";

interface Location {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface TherapistPending {
  id: string;
  nickname: string;
  age: number;
  height: number;
  weight: number;
  cardValue: string | null;
  city: string;
  phone: string | null;
  location: Location | null;
  areas: string[];
  createdAt: string;
  photos: Array<{ id: string; url: string }>;
  videos: Array<{ id: string; url: string }>;
  profile: {
    introduction: string;
  } | null;
}

export default function TherapistsPendingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [therapists, setTherapists] = useState<TherapistPending[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistPending | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated" && session?.user?.role === "admin") {
      fetchPendingTherapists();
    }
  }, [status, session, router]);

  const fetchPendingTherapists = async () => {
    try {
      const res = await fetch("/api/admin/therapists/pending");
      const data = await res.json();

      if (data.success) {
        setTherapists(data.data);
      } else {
        toast.error("获取待审核列表失败");
      }
    } catch (error) {
      console.error("获取待审核列表失败:", error);
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (therapistId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}/approve`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        toast.success("审核通过");
        fetchPendingTherapists();
        setSelectedTherapist(null);
      } else {
        toast.error(data.error || "操作失败");
      }
    } catch (error) {
      console.error("审核通过失败:", error);
      toast.error("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTherapist || !rejectReason.trim()) {
      toast.error("请输入拒绝原因");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/therapists/${selectedTherapist.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("已拒绝");
        setShowRejectDialog(false);
        setRejectReason("");
        fetchPendingTherapists();
        setSelectedTherapist(null);
      } else {
        toast.error(data.error || "操作失败");
      }
    } catch (error) {
      console.error("拒绝审核失败:", error);
      toast.error("网络错误");
    } finally {
      setSubmitting(false);
    }
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
              <h1 className="text-4xl font-bold text-primary-gold mb-2">技师审核</h1>
              <p className="text-gray-400">共 {therapists.length} 位技师待审核</p>
            </div>
          </div>
        </div>

        {/* 待审核列表 */}
        {therapists.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800">
            <p className="text-gray-400 text-lg">暂无待审核技师</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {therapists.map((therapist) => (
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
                  </div>
                )}

                {/* 基本信息 */}
                <h3 className="text-xl font-bold text-white mb-2">{therapist.nickname}</h3>
                <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                  <div
                    className={
                      ProfileValidator.isFieldFilled("age", therapist.age)
                        ? "text-gray-300"
                        : "text-red-400"
                    }
                  >
                    年龄: {ProfileValidator.getDisplayValue("age", therapist.age)}
                  </div>
                  <div
                    className={
                      ProfileValidator.isFieldFilled("height", therapist.height)
                        ? "text-gray-300"
                        : "text-red-400"
                    }
                  >
                    身高: {ProfileValidator.getDisplayValue("height", therapist.height)}
                  </div>
                  <div
                    className={
                      ProfileValidator.isFieldFilled("weight", therapist.weight)
                        ? "text-gray-300"
                        : "text-red-400"
                    }
                  >
                    体重: {ProfileValidator.getDisplayValue("weight", therapist.weight)}
                  </div>
                </div>
                <p
                  className={`text-sm mb-2 ${ProfileValidator.isFieldFilled("city", therapist.city) ? "text-gray-400" : "text-red-400"}`}
                >
                  城市: {ProfileValidator.getDisplayValue("city", therapist.city)}
                </p>
                {!ProfileValidator.isBasicInfoComplete(therapist) && (
                  <div className="flex items-center gap-2 mb-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>基本信息未完善</span>
                  </div>
                )}
                <p className="text-gray-400 text-sm mb-4">
                  注册时间: {new Date(therapist.createdAt).toLocaleDateString("zh-CN")}
                </p>

                {/* 操作按钮 */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedTherapist(therapist)}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    查看
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(therapist.id)}
                    disabled={submitting || !ProfileValidator.isBasicInfoComplete(therapist)}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      !ProfileValidator.isBasicInfoComplete(therapist)
                        ? "基本信息未完善，无法通过审核"
                        : ""
                    }
                  >
                    <Check className="w-4 h-4 mr-1" />
                    通过
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedTherapist(therapist);
                      setShowRejectDialog(true);
                    }}
                    disabled={submitting}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-1" />
                    拒绝
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 详情对话框 */}
        {selectedTherapist && !showRejectDialog && (
          <Dialog open={!!selectedTherapist} onOpenChange={() => setSelectedTherapist(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-black border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-primary-gold">
                  技师详情 - {selectedTherapist.nickname}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* 资料完整度警告 */}
                {!ProfileValidator.isBasicInfoComplete(selectedTherapist) && (
                  <div className="p-4 bg-red-600/10 border border-red-600/30 rounded-lg">
                    <div className="flex items-center gap-2 text-red-400 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <h3 className="font-bold">⚠️ 基本信息未完善</h3>
                    </div>
                    <p className="text-gray-300 text-sm">
                      该技师的基本信息尚未填写完整，无法通过审核。请联系技师完善资料后再审核。
                    </p>
                  </div>
                )}

                {/* 基本信息 */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">基本信息</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={
                        ProfileValidator.isFieldFilled("age", selectedTherapist.age)
                          ? "text-gray-300"
                          : "text-red-400"
                      }
                    >
                      年龄: {ProfileValidator.getDisplayValue("age", selectedTherapist.age)}
                    </div>
                    <div
                      className={
                        ProfileValidator.isFieldFilled("height", selectedTherapist.height)
                          ? "text-gray-300"
                          : "text-red-400"
                      }
                    >
                      身高: {ProfileValidator.getDisplayValue("height", selectedTherapist.height)}
                    </div>
                    <div
                      className={
                        ProfileValidator.isFieldFilled("weight", selectedTherapist.weight)
                          ? "text-gray-300"
                          : "text-red-400"
                      }
                    >
                      体重: {ProfileValidator.getDisplayValue("weight", selectedTherapist.weight)}
                    </div>
                    <div
                      className={
                        ProfileValidator.isFieldFilled("city", selectedTherapist.city)
                          ? "text-gray-300"
                          : "text-red-400"
                      }
                    >
                      城市: {ProfileValidator.getDisplayValue("city", selectedTherapist.city)}
                    </div>
                    {selectedTherapist.cardValue && (
                      <div className="text-gray-300">
                        牌值:{" "}
                        <span className="text-primary-gold">{selectedTherapist.cardValue}</span>
                      </div>
                    )}
                    {selectedTherapist.phone && (
                      <div className="text-gray-300">
                        手机号: <span className="text-primary-gold">{selectedTherapist.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 服务位置 */}
                {selectedTherapist.location && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">服务位置</h3>
                    <div className="p-4 bg-white/5 rounded-lg">
                      <p className="text-white font-semibold mb-1">
                        {selectedTherapist.location.name}
                      </p>
                      <p className="text-gray-400 text-sm">{selectedTherapist.location.address}</p>
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
                        <div
                          key={photo.id}
                          className="relative aspect-square rounded-lg overflow-hidden"
                        >
                          <Image src={photo.url} alt="技师照片" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleApprove(selectedTherapist.id)}
                    disabled={
                      submitting || !ProfileValidator.isBasicInfoComplete(selectedTherapist)
                    }
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      !ProfileValidator.isBasicInfoComplete(selectedTherapist)
                        ? "基本信息未完善，无法通过审核"
                        : ""
                    }
                  >
                    <Check className="w-4 h-4 mr-2" />
                    审核通过
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={submitting}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    拒绝审核
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* 拒绝原因对话框 */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="bg-gradient-to-br from-gray-900 to-black border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-red-500">拒绝审核</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-gray-300">请填写拒绝原因，技师将收到通知</p>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="例如：照片不清晰、资料不完整等..."
                rows={4}
                className="bg-white/5 border-gray-700 text-white"
              />
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectReason("");
                  }}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={submitting || !rejectReason.trim()}
                  className="flex-1"
                >
                  {submitting ? "提交中..." : "确认拒绝"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
