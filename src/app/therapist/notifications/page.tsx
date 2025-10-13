"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Bell, CheckCircle, XCircle, AlertCircle, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/therapist?modal=login");
    } else if (status === "authenticated" && session?.user?.role === "therapist") {
      fetchNotifications();
    }
  }, [status, session, router]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/therapist/notifications");
      const data = await res.json();

      if (data.success) {
        setNotifications(data.data);
      } else {
        toast.error("获取通知失败");
      }
    } catch (error) {
      console.error("获取通知失败:", error);
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/therapist/notifications/${id}/read`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        fetchNotifications();
      } else {
        toast.error(data.error || "操作失败");
      }
    } catch (error) {
      console.error("操作失败:", error);
      toast.error("网络错误");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/therapist/notifications/read-all", {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        toast.success("已全部标记为已读");
        fetchNotifications();
      } else {
        toast.error(data.error || "操作失败");
      }
    } catch (error) {
      console.error("操作失败:", error);
      toast.error("网络错误");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "APPROVED":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "REJECTED":
        return <XCircle className="w-6 h-6 text-red-500" />;
      case "BAN":
        return <AlertCircle className="w-6 h-6 text-orange-500" />;
      case "UNBAN":
        return <CheckCircle className="w-6 h-6 text-blue-500" />;
      default:
        return <Info className="w-6 h-6 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "APPROVED":
        return <Badge className="bg-green-600">审核通过</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-600">审核拒绝</Badge>;
      case "BAN":
        return <Badge className="bg-orange-600">账号封禁</Badge>;
      case "UNBAN":
        return <Badge className="bg-blue-600">账号解封</Badge>;
      default:
        return <Badge className="bg-gray-600">系统通知</Badge>;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-gold" />
      </div>
    );
  }

  if (!session || session.user.role !== "therapist") {
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/therapist/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-primary-gold mb-2">通知中心</h1>
              <p className="text-gray-400">
                共 {notifications.length} 条通知，{unreadCount} 条未读
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              全部标记为已读
            </Button>
          )}
        </div>

        {/* 通知列表 */}
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800">
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">暂无通知</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white/5 backdrop-blur-sm border rounded-2xl p-6 transition-colors ${
                  notification.isRead
                    ? "border-gray-800"
                    : "border-primary-gold/50 bg-primary-gold/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* 图标 */}
                  <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-white">{notification.title}</h3>
                        {getTypeBadge(notification.type)}
                        {!notification.isRead && (
                          <Badge
                            variant="outline"
                            className="bg-primary-gold/20 text-primary-gold border-primary-gold/30"
                          >
                            未读
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-300 mb-3 whitespace-pre-wrap">{notification.content}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {new Date(notification.createdAt).toLocaleString("zh-CN")}
                      </span>

                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          标记为已读
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
