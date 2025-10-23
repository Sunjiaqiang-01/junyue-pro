"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Plus, Edit, Trash2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function AnnouncementsManagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "NOTICE",
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated" && session?.user?.role === "admin") {
      fetchAnnouncements();
    }
  }, [status, session, router]);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();

      if (data.success) {
        setAnnouncements(data.data);
      } else {
        toast.error("获取公告列表失败");
      }
    } catch (error) {
      console.error("获取公告列表失败:", error);
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (announcement?: Announcement) => {
    if (announcement) {
      setEditingId(announcement.id);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        isActive: announcement.isActive,
        sortOrder: announcement.sortOrder,
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        content: "",
        type: "NOTICE",
        isActive: true,
        sortOrder: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData({
      title: "",
      content: "",
      type: "NOTICE",
      isActive: true,
      sortOrder: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      toast.error("请填写完整信息");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId ? `/api/admin/announcements/${editingId}` : "/api/admin/announcements";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingId ? "更新成功" : "创建成功");
        handleCloseDialog();
        fetchAnnouncements();
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

  const handleDelete = async (id: string) => {
    if (!confirm("确认删除该公告吗？")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        toast.success("删除成功");
        fetchAnnouncements();
      } else {
        toast.error(data.error || "删除失败");
      }
    } catch (error) {
      console.error("删除失败:", error);
      toast.error("网络错误");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/announcements/${id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(isActive ? "已隐藏" : "已显示");
        fetchAnnouncements();
      } else {
        toast.error(data.error || "操作失败");
      }
    } catch (error) {
      console.error("操作失败:", error);
      toast.error("网络错误");
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "NOTICE":
        return <Badge className="bg-blue-600">公告</Badge>;
      case "EVENT":
        return <Badge className="bg-purple-600">活动</Badge>;
      case "MAINTENANCE":
        return <Badge className="bg-orange-600">维护</Badge>;
      default:
        return null;
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
              <h1 className="text-4xl font-bold text-primary-gold mb-2">公告管理</h1>
              <p className="text-gray-400">共 {announcements.length} 条公告</p>
            </div>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-gradient-to-r from-primary-gold to-yellow-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            新建公告
          </Button>
        </div>

        {/* 公告列表 */}
        {announcements.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800">
            <p className="text-gray-400 text-lg mb-4">还没有公告</p>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-primary-gold to-yellow-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建第一条公告
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-primary-gold transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getTypeBadge(announcement.type)}
                    <h3 className="text-xl font-bold text-white">{announcement.title}</h3>
                    {!announcement.isActive && (
                      <Badge variant="outline" className="text-gray-400">
                        已隐藏
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(announcement.id, announcement.isActive)}
                    >
                      {announcement.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(announcement)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-gray-300 whitespace-pre-wrap mb-3">{announcement.content}</p>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>排序: {announcement.sortOrder}</span>
                  <span>创建时间: {new Date(announcement.createdAt).toLocaleString("zh-CN")}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 编辑/新建对话框 */}
        <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-900 to-black border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary-gold">
                {editingId ? "编辑公告" : "新建公告"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">标题</label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="请输入公告标题"
                  className="bg-white/5 border-gray-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">内容</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="请输入公告内容"
                  rows={6}
                  className="bg-white/5 border-gray-700 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">类型</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2 bg-white/5 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="NOTICE">公告</option>
                    <option value="EVENT">活动</option>
                    <option value="MAINTENANCE">维护</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">排序</label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, sortOrder: parseInt(e.target.value) })
                    }
                    className="bg-white/5 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">状态</label>
                  <select
                    value={formData.isActive ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.value === "true" })
                    }
                    className="w-full p-2 bg-white/5 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="true">显示</option>
                    <option value="false">隐藏</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="flex-1"
                  disabled={submitting}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary-gold to-yellow-600"
                  disabled={submitting}
                >
                  {submitting ? "提交中..." : editingId ? "更新" : "创建"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
