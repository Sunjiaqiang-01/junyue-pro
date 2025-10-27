"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";

interface DeactivationRequest {
  id: string;
  status: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export default function TherapistSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDeactivationDialog, setShowDeactivationDialog] = useState(false);
  const [deactivationRequest, setDeactivationRequest] = useState<DeactivationRequest | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/therapist?modal=login");
    } else if (status === "authenticated" && session?.user?.role === "therapist") {
      fetchDeactivationStatus();
    }
  }, [status, session, router]);

  const fetchDeactivationStatus = async () => {
    try {
      const res = await fetch("/api/therapist/deactivation");
      const data = await res.json();

      if (data.success && data.data) {
        setDeactivationRequest(data.data);
      }
    } catch (error) {
      console.error("获取注销状态失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivationRequest = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/therapist/deactivation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.success) {
        toast.success("注销申请提交成功，等待管理员审核");
        setShowDeactivationDialog(false);
        fetchDeactivationStatus();
      } else {
        toast.error(data.error || "提交失败");
      }
    } catch (error) {
      console.error("提交注销申请失败:", error);
      toast.error("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelDeactivation = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/therapist/deactivation/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.success) {
        toast.success("注销申请已撤销");
        fetchDeactivationStatus();
      } else {
        toast.error(data.error || "撤销失败");
      }
    } catch (error) {
      console.error("撤销注销申请失败:", error);
      toast.error("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "待审核";
      case "APPROVED":
        return "已通过";
      case "REJECTED":
        return "已拒绝";
      case "CANCELLED":
        return "已撤销";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-400";
      case "APPROVED":
        return "text-green-400";
      case "REJECTED":
        return "text-red-400";
      case "CANCELLED":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-pure-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-cyan" />
      </div>
    );
  }

  if (!session || session.user.role !== "therapist") {
    return null;
  }

  return (
    <div className="min-h-screen bg-pure-black p-4 md:p-8 pt-24 md:pt-28">
      <div className="max-w-4xl mx-auto">
        {/* 顶部标题栏 */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/therapist/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="border border-white/10 text-white hover:text-primary-cyan hover:border-primary-cyan/50 hover:bg-primary-cyan/10 bg-transparent font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-pure-white mb-2">账号设置</h1>
            <p className="text-secondary/60">管理您的账号设置</p>
          </div>
        </div>

        {/* 设置选项 */}
        <div className="space-y-6">
          {/* 账号注销 */}
          <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">账号注销</h2>

            {deactivationRequest ? (
              // 已有注销申请
              <div className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">注销申请状态</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="text-gray-300">
                      申请时间: {new Date(deactivationRequest.requestedAt).toLocaleString()}
                    </div>
                    <div className="text-gray-300">
                      当前状态:{" "}
                      <span className={getStatusColor(deactivationRequest.status)}>
                        {getStatusText(deactivationRequest.status)}
                      </span>
                    </div>
                    {deactivationRequest.reviewedAt && (
                      <div className="text-gray-300">
                        审核时间: {new Date(deactivationRequest.reviewedAt).toLocaleString()}
                      </div>
                    )}
                    {deactivationRequest.reviewNote && (
                      <div className="text-gray-300">
                        审核意见: {deactivationRequest.reviewNote}
                      </div>
                    )}
                  </div>
                </div>

                {deactivationRequest.status === "PENDING" && (
                  <Button
                    onClick={handleCancelDeactivation}
                    disabled={submitting}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-400"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        撤销中...
                      </>
                    ) : (
                      "撤销申请"
                    )}
                  </Button>
                )}
              </div>
            ) : (
              // 未有注销申请
              <div className="space-y-4">
                <p className="text-gray-400">
                  注销账号后，您的个人资料将被清空，且无法恢复。请谨慎操作。
                </p>
                <Button
                  onClick={() => setShowDeactivationDialog(true)}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  申请注销账号
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 注销确认对话框 */}
        <Dialog open={showDeactivationDialog} onOpenChange={setShowDeactivationDialog}>
          <DialogContent className="bg-gradient-to-br from-gray-900 to-black border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                确认注销账号
              </DialogTitle>
              <DialogDescription className="text-gray-400 space-y-3 pt-4">
                <p>⚠️ 注销后将无法恢复</p>
                <p>⚠️ 个人资料将被清空</p>
                <p className="text-white font-medium">确认要注销账号吗？</p>
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => setShowDeactivationDialog(false)}
                variant="outline"
                className="flex-1"
                disabled={submitting}
              >
                取消
              </Button>
              <Button
                onClick={handleDeactivationRequest}
                disabled={submitting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    提交中...
                  </>
                ) : (
                  "确认注销"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
