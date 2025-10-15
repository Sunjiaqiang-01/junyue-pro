"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, Check, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

interface DeactivationRequest {
  id: string;
  status: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
  therapist: {
    id: string;
    nickname: string;
    phone: string;
    city: string;
    createdAt: string;
  };
}

export default function DeactivationManagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<DeactivationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<DeactivationRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("PENDING");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated" && session?.user?.role === "admin") {
      fetchRequests();
    }
  }, [status, session, router, statusFilter]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/admin/deactivation?status=${statusFilter}`);
      const data = await res.json();

      if (data.success) {
        setRequests(data.data);
      } else {
        toast.error("获取注销申请列表失败");
      }
    } catch (error) {
      console.error("获取注销申请列表失败:", error);
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedRequest || !reviewAction) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/deactivation/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: reviewAction,
          reviewNote: reviewNote.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(reviewAction === "approve" ? "注销申请已通过" : "注销申请已驳回");
        setSelectedRequest(null);
        setReviewAction(null);
        setReviewNote("");
        fetchRequests();
      } else {
        toast.error(data.error || "操作失败");
      }
    } catch (error) {
      console.error("审核失败:", error);
      toast.error("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-600">待审核</Badge>;
      case "APPROVED":
        return <Badge className="bg-green-600">已通过</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-600">已驳回</Badge>;
      case "CANCELLED":
        return <Badge className="bg-gray-600">已撤销</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN");
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
              <h1 className="text-4xl font-bold text-primary-gold mb-2">技师注销申请</h1>
              <p className="text-gray-400">共 {requests.length} 个申请</p>
            </div>
          </div>
        </div>

        {/* 状态筛选 */}
        <div className="mb-6">
          <div className="flex gap-3 flex-wrap">
            <Button
              variant={statusFilter === "PENDING" ? "default" : "outline"}
              onClick={() => setStatusFilter("PENDING")}
              size="sm"
              className={statusFilter === "PENDING" ? "bg-yellow-600" : ""}
            >
              待审核
            </Button>
            <Button
              variant={statusFilter === "APPROVED" ? "default" : "outline"}
              onClick={() => setStatusFilter("APPROVED")}
              size="sm"
              className={statusFilter === "APPROVED" ? "bg-green-600" : ""}
            >
              已通过
            </Button>
            <Button
              variant={statusFilter === "REJECTED" ? "default" : "outline"}
              onClick={() => setStatusFilter("REJECTED")}
              size="sm"
              className={statusFilter === "REJECTED" ? "bg-red-600" : ""}
            >
              已驳回
            </Button>
            <Button
              variant={statusFilter === "CANCELLED" ? "default" : "outline"}
              onClick={() => setStatusFilter("CANCELLED")}
              size="sm"
              className={statusFilter === "CANCELLED" ? "bg-gray-600" : ""}
            >
              已撤销
            </Button>
          </div>
        </div>

        {/* 申请列表 */}
        {requests.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800">
            <p className="text-gray-400 text-lg">没有找到注销申请</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-primary-gold transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-bold text-white">{request.therapist.nickname}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>申请时间: {formatDate(request.requestedAt)}</div>
                      {request.reviewedAt && <div>审核时间: {formatDate(request.reviewedAt)}</div>}
                      {request.reviewNote && <div>审核意见: {request.reviewNote}</div>}
                    </div>
                  </div>

                  {request.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setReviewAction("approve");
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedRequest(request);
                          setReviewAction("reject");
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 审核对话框 */}
        <Dialog
          open={!!selectedRequest && !!reviewAction}
          onOpenChange={() => {
            setSelectedRequest(null);
            setReviewAction(null);
            setReviewNote("");
          }}
        >
          <DialogContent className="bg-gradient-to-br from-gray-900 to-black border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary-gold flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                {reviewAction === "approve" ? "通过注销申请" : "驳回注销申请"}
              </DialogTitle>
              <DialogDescription className="text-gray-400 pt-2">
                {selectedRequest && (
                  <div className="space-y-2">
                    <div>技师: {selectedRequest.therapist.nickname}</div>
                    <div>申请时间: {formatDate(selectedRequest.requestedAt)}</div>
                    {reviewAction === "approve" && (
                      <div className="text-red-400 font-medium">
                        ⚠️ 通过后技师账号将被注销，无法恢复
                      </div>
                    )}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="reviewNote" className="text-white">
                  审核意见 {reviewAction === "reject" ? "(必填)" : "(可选)"}
                </Label>
                <Textarea
                  id="reviewNote"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={
                    reviewAction === "approve" ? "请输入审核意见..." : "请说明驳回原因..."
                  }
                  className="bg-white/5 border-gray-700 text-white placeholder:text-gray-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setSelectedRequest(null);
                    setReviewAction(null);
                    setReviewNote("");
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={submitting}
                >
                  取消
                </Button>
                <Button
                  onClick={handleReview}
                  disabled={submitting || (reviewAction === "reject" && !reviewNote.trim())}
                  className={`flex-1 ${
                    reviewAction === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      处理中...
                    </>
                  ) : reviewAction === "approve" ? (
                    "确认通过"
                  ) : (
                    "确认驳回"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
