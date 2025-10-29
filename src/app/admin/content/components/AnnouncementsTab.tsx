"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date | string;
}

interface AnnouncementsTabProps {
  initialData: Announcement[];
}

export function AnnouncementsTab({ initialData }: AnnouncementsTabProps) {
  const router = useRouter();
  const { toast } = useToast();
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
      toast({
        title: "错误",
        description: "请填写完整信息",
        variant: "destructive",
      });
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

      if (res.ok) {
        toast({
          title: "成功",
          description: editingId ? "更新成功" : "创建成功",
        });
        handleCloseDialog();
        router.refresh();
      } else {
        toast({
          title: "错误",
          description: data.error || "操作失败",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "错误",
        description: "网络错误",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确认删除此公告吗？")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "成功",
          description: "删除成功",
        });
        router.refresh();
      } else {
        toast({
          title: "错误",
          description: data.error || "删除失败",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "错误",
        description: "网络错误",
        variant: "destructive",
      });
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

      if (res.ok) {
        toast({
          title: "成功",
          description: isActive ? "已禁用" : "已启用",
        });
        router.refresh();
      } else {
        toast({
          title: "错误",
          description: data.error || "操作失败",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "错误",
        description: "网络错误",
        variant: "destructive",
      });
    }
  };

  const typeLabels: Record<string, string> = {
    NOTICE: "通知",
    PROMOTION: "促销",
    WARNING: "警告",
    INFO: "信息",
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-pure-white">公告管理</h2>
          <p className="text-xs md:text-sm text-secondary/60 mt-1">管理平台公告和通知信息</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-primary-cyan text-pure-black hover:bg-primary-cyan/90 font-semibold shadow-lg shadow-primary-cyan/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          新建公告
        </Button>
      </div>

      <div className="rounded-md border border-white/10 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-secondary/80 font-semibold text-xs md:text-sm">
                标题
              </TableHead>
              <TableHead className="text-secondary/80 font-semibold text-xs md:text-sm">
                类型
              </TableHead>
              <TableHead className="text-secondary/80 font-semibold text-xs md:text-sm">
                排序
              </TableHead>
              <TableHead className="text-secondary/80 font-semibold text-xs md:text-sm">
                状态
              </TableHead>
              <TableHead className="text-secondary/80 font-semibold text-xs md:text-sm">
                创建时间
              </TableHead>
              <TableHead className="text-secondary/80 font-semibold text-xs md:text-sm text-right">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length > 0 ? (
              initialData.map((announcement) => (
                <TableRow key={announcement.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white text-xs md:text-sm">
                    {announcement.title}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-white/10 text-white border-white/20 text-xs">
                      {typeLabels[announcement.type] || announcement.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white text-xs md:text-sm">
                    {announcement.sortOrder}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        announcement.isActive
                          ? "bg-primary-cyan/20 text-primary-cyan border-primary-cyan/30 text-xs"
                          : "bg-white/10 text-secondary/60 border-white/20 text-xs"
                      }
                    >
                      {announcement.isActive ? "生效中" : "已禁用"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs md:text-sm text-secondary/60">
                    {new Date(announcement.createdAt).toLocaleString("zh-CN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => handleToggleActive(announcement.id, announcement.isActive)}
                        className="border border-white/10 text-white hover:bg-white/10 hover:text-primary-cyan bg-transparent text-xs"
                      >
                        {announcement.isActive ? (
                          <EyeOff className="w-3 h-3 md:w-4 md:h-4" />
                        ) : (
                          <Eye className="w-3 h-3 md:w-4 md:h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleOpenDialog(announcement)}
                        className="border border-white/10 text-white hover:bg-white/10 hover:text-primary-cyan bg-transparent text-xs"
                      >
                        <Edit className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDelete(announcement.id)}
                        className="bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 text-xs"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-white/10">
                <TableCell colSpan={6} className="h-24 text-center text-secondary/60">
                  暂无公告
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => !submitting && (open ? setDialogOpen(true) : handleCloseDialog())}
      >
        <DialogContent className="sm:max-w-[600px] bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-pure-white text-xl">
              {editingId ? "编辑公告" : "新建公告"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                标题 *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="请输入公告标题"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-secondary/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-white">
                内容 *
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="请输入公告内容"
                rows={5}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-secondary/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-white">
                  类型
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    <SelectItem value="NOTICE" className="text-white hover:bg-white/10">
                      通知
                    </SelectItem>
                    <SelectItem value="PROMOTION" className="text-white hover:bg-white/10">
                      促销
                    </SelectItem>
                    <SelectItem value="WARNING" className="text-white hover:bg-white/10">
                      警告
                    </SelectItem>
                    <SelectItem value="INFO" className="text-white hover:bg-white/10">
                      信息
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder" className="text-white">
                  排序
                </Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                  }
                  placeholder="数字越小越靠前"
                  className="bg-white/5 border-white/10 text-white placeholder:text-secondary/60"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary-cyan focus:ring-primary-cyan focus:ring-offset-0"
              />
              <Label htmlFor="isActive" className="cursor-pointer text-white">
                立即生效
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                onClick={handleCloseDialog}
                disabled={submitting}
                className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 hover:text-white"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-primary-cyan text-pure-black hover:bg-primary-cyan/90 font-semibold shadow-lg shadow-primary-cyan/30"
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingId ? "更新" : "创建"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
