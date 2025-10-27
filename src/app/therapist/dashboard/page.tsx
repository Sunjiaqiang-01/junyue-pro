"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Loader2,
  User,
  Edit,
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
  Bell,
  Power,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Link from "next/link";
import { ProfileValidator } from "@/lib/profile-validator";

interface Location {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface TherapistData {
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
  status: string;
  isOnline: boolean;
  isFeatured: boolean;
  isNew: boolean;
  photos: Array<{ id: string; url: string }>;
  profile: {
    introduction: string;
  } | null;
}

export default function TherapistDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [therapist, setTherapist] = useState<TherapistData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showOnlineConfirm, setShowOnlineConfirm] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/therapist?modal=login");
    } else if (status === "authenticated" && session?.user?.role === "therapist") {
      fetchTherapistData();
      fetchUnreadCount();
    }
  }, [status, session, router]);

  const fetchTherapistData = async () => {
    try {
      const res = await fetch("/api/therapist/profile");
      const data = await res.json();

      if (data.success) {
        setTherapist(data.data);
      } else {
        toast.error("获取资料失败");
      }
    } catch (error) {
      console.error("获取资料失败:", error);
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/therapist/notifications/unread-count");
      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("获取未读数失败:", error);
    }
  };

  const handleToggleOnlineClick = () => {
    if (!therapist || therapist.status !== "APPROVED") return;
    setShowOnlineConfirm(true);
  };

  const handleToggleOnline = async () => {
    if (!therapist) return;

    setShowOnlineConfirm(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/therapist/toggle-online", {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        toast.success(therapist.isOnline ? "已设为离线" : "已设为在线");
        fetchTherapistData();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("切换状态失败:", error);
      toast.error("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/therapist");
  };

  const handleResubmit = async () => {
    if (!confirm("确认重新提交审核吗？")) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/therapist/resubmit", {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        fetchTherapistData(); // 刷新数据
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("提交失败:", error);
      toast.error("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-pure-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-cyan" />
      </div>
    );
  }

  if (!session || session.user.role !== "therapist" || !therapist) {
    return null;
  }

  const getStatusBadge = () => {
    switch (therapist.status) {
      case "APPROVED":
        return <Badge className="bg-green-600">已通过</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-600">待审核</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-600">已拒绝</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-pure-black p-4 md:p-8 pt-24 md:pt-28">
      <div className="max-w-7xl mx-auto">
        {/* 顶部标题栏 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-pure-white mb-2">技师工作台</h1>
          <p className="text-secondary/60">欢迎回来，{therapist.nickname}！</p>
        </div>

        {/* 基本信息未完善提示 */}
        {!ProfileValidator.isBasicInfoComplete(therapist) && (
          <div className="mb-6 p-6 bg-red-600/10 border border-red-600/30 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-bold text-red-500">⚠️ 基本信息未完善</h3>
            </div>
            <p className="text-gray-300 mb-3">
              您的基本信息（年龄、身高、体重、城市）尚未填写，无法提交审核。请先完善资料。
            </p>
            <Link href="/therapist/profile/edit">
              <Button className="bg-primary-cyan text-pure-black hover:bg-primary-cyan/90 font-medium">
                <Edit className="w-4 h-4 mr-2" />
                立即完善资料
              </Button>
            </Link>
          </div>
        )}

        {/* 审核状态提示 */}
        {therapist.status !== "APPROVED" && ProfileValidator.isBasicInfoComplete(therapist) && (
          <div className="mb-6 p-6 bg-yellow-600/10 border border-yellow-600/30 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-bold text-yellow-500">审核状态</h3>
              </div>
              {therapist.status === "REJECTED" && (
                <Button
                  onClick={handleResubmit}
                  disabled={submitting}
                  className="bg-primary-cyan text-pure-black hover:bg-primary-cyan/90 font-medium"
                >
                  {submitting ? "提交中..." : "重新提交审核"}
                </Button>
              )}
            </div>
            <p className="text-gray-300">
              {therapist.status === "PENDING" && "您的资料正在审核中，预计48小时内完成审核。"}
              {therapist.status === "REJECTED" &&
                '您的资料审核未通过，请修改资料后点击"重新提交审核"按钮。'}
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
                  <User className="w-5 h-5 text-primary-cyan" />
                  <div>
                    <p className="text-gray-400 text-sm">昵称</p>
                    <p className="text-white font-medium">{therapist.nickname}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white/5 rounded-lg text-center">
                    <p className="text-gray-400 text-xs mb-1">年龄</p>
                    <p
                      className={`font-bold ${ProfileValidator.isFieldFilled("age", therapist.age) ? "text-white" : "text-gray-500"}`}
                    >
                      {ProfileValidator.getDisplayValue("age", therapist.age)}
                    </p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg text-center">
                    <p className="text-gray-400 text-xs mb-1">身高</p>
                    <p
                      className={`font-bold ${ProfileValidator.isFieldFilled("height", therapist.height) ? "text-white" : "text-gray-500"}`}
                    >
                      {ProfileValidator.getDisplayValue("height", therapist.height)}
                    </p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg text-center">
                    <p className="text-gray-400 text-xs mb-1">体重</p>
                    <p
                      className={`font-bold ${ProfileValidator.isFieldFilled("weight", therapist.weight) ? "text-white" : "text-gray-500"}`}
                    >
                      {ProfileValidator.getDisplayValue("weight", therapist.weight)}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">所在城市</p>
                  <p
                    className={`font-medium ${ProfileValidator.isFieldFilled("city", therapist.city) ? "text-white" : "text-gray-500"}`}
                  >
                    {ProfileValidator.getDisplayValue("city", therapist.city)}
                  </p>
                </div>

                {therapist.cardValue && (
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">牌值</p>
                    <p className="text-white font-medium">{therapist.cardValue}</p>
                  </div>
                )}

                {therapist.phone && (
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">手机号</p>
                    <p className="text-white font-medium">{therapist.phone}</p>
                  </div>
                )}

                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">照片数量</p>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary-cyan" />
                    <p className="text-white font-medium">{therapist.photos.length} 张</p>
                  </div>
                </div>

                <Link href="/therapist/profile/edit">
                  <Button className="w-full bg-primary-cyan text-pure-black hover:bg-primary-cyan/90 font-medium">
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

              {(() => {
                const completeness = ProfileValidator.checkProfileCompleteness(therapist);
                return (
                  <>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">完成度</span>
                        <span className="text-primary-cyan font-bold">
                          {completeness.completionRate}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-cyan transition-all duration-500"
                          style={{ width: `${completeness.completionRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">基本信息</span>
                        {completeness.basicInfo ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">个人介绍</span>
                        {completeness.introduction ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">联系方式</span>
                        {completeness.contact ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">照片（至少3张）</span>
                        {completeness.photos ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* 快速操作 */}
            <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">快速操作</h2>

              <div className="grid grid-cols-2 gap-4">
                <Link href="/therapist/profile/edit">
                  <Button
                    variant="ghost"
                    className="w-full h-24 flex flex-col gap-2 bg-white/5 border border-white/10 hover:bg-primary-cyan/10 hover:border-primary-cyan/50 text-white"
                  >
                    <Edit className="w-6 h-6 text-primary-cyan" />
                    <span className="font-semibold">编辑资料</span>
                  </Button>
                </Link>

                <Link href="/therapist/notifications">
                  <Button
                    variant="ghost"
                    className="w-full h-24 flex flex-col gap-2 relative bg-white/5 border border-white/10 hover:bg-primary-cyan/10 hover:border-primary-cyan/50 text-white"
                  >
                    <Bell className="w-6 h-6 text-primary-cyan" />
                    <span className="font-semibold">通知中心</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>

                <Card className="bg-white/5 border-white/10 hover:bg-white/[0.07] transition-colors">
                  <CardContent className="p-3 sm:p-4">
                    {/* 第一行：图标+标题+开关 */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Power
                          className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                            therapist.isOnline ? "text-green-500" : "text-gray-400"
                          }`}
                        />
                        <h3 className="font-semibold text-white text-sm sm:text-base">
                          {therapist.isOnline ? "在线接单" : "当前离线"}
                        </h3>
                      </div>
                      <Switch
                        checked={therapist.isOnline}
                        onCheckedChange={handleToggleOnlineClick}
                        disabled={submitting || therapist.status !== "APPROVED"}
                        className="data-[state=checked]:bg-green-500 scale-90 sm:scale-100"
                      />
                    </div>

                    {/* 第二行：简短说明 */}
                    <p className="text-xs sm:text-sm text-secondary/70 pl-6 sm:pl-7">
                      {therapist.isOnline ? "✅ 用户可见，可接预约" : "⚠️ 用户不可见"}
                    </p>

                    {/* 未审核提示 */}
                    {therapist.status !== "APPROVED" && (
                      <p className="text-xs text-yellow-500 mt-2 pl-6 sm:pl-7">审核后可上线</p>
                    )}
                  </CardContent>
                </Card>

                <Button
                  variant="ghost"
                  className="w-full h-24 flex flex-col gap-2 bg-white/5 border border-white/10 opacity-50 cursor-not-allowed text-white"
                  disabled
                >
                  <Clock className="w-6 h-6 text-secondary/60" />
                  <span className="font-semibold text-secondary/60">时间管理</span>
                  <span className="text-xs text-secondary/40">即将开放</span>
                </Button>
              </div>
            </div>

            {/* 使用提示 */}
            <div className="bg-transparent border border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-primary-cyan mb-3">💡 温馨提示</h3>
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

      {/* 在线/离线确认对话框 */}
      <AlertDialog open={showOnlineConfirm} onOpenChange={setShowOnlineConfirm}>
        <AlertDialogContent className="bg-gray-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-white">
              {therapist?.isOnline ? "确认离线？" : "确认上线？"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              {therapist?.isOnline
                ? "离线后，用户将无法在平台上看到您的信息，无法预约您的服务。"
                : "上线后，您的资料将展示在平台上，用户可以通过客服预约您的服务。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 hover:text-white">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleOnline}
              className="bg-primary-cyan text-pure-black hover:bg-primary-cyan/90 font-semibold"
            >
              确认{therapist?.isOnline ? "离线" : "上线"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
