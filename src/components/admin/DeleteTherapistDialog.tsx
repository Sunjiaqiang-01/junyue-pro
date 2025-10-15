"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteTherapistDialogProps {
  open: boolean;
  onClose: () => void;
  therapistId: string;
  therapistName: string;
  onSuccess: () => void;
}

export function DeleteTherapistDialog({
  open,
  onClose,
  therapistId,
  therapistName,
  onSuccess,
}: DeleteTherapistDialogProps) {
  const [confirmName, setConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmName !== therapistName) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        onSuccess();
        onClose();
        setConfirmName("");
      } else {
        alert(data.error || "删除失败");
      }
    } catch (error) {
      console.error("删除技师失败:", error);
      alert("网络错误");
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    if (!deleting) {
      setConfirmName("");
      onClose();
    }
  };

  const isConfirmed = confirmName === therapistName;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 to-black border-red-500/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="w-5 h-5" />
            永久删除技师
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            此操作不可撤销！将永久删除以下所有数据：
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 警告信息 */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm font-semibold mb-2">⚠️ 将删除的数据：</p>
            <ul className="text-red-300 text-sm space-y-1 ml-4 list-disc">
              <li>技师账户：{therapistName}</li>
              <li>所有照片和视频</li>
              <li>个人资料和介绍</li>
              <li>所有排班记录</li>
              <li>相关通知消息</li>
              <li>注销申请记录</li>
            </ul>
          </div>

          {/* 确认输入 */}
          <div className="space-y-2">
            <Label htmlFor="confirm-name" className="text-white">
              请输入技师名字 <span className="text-red-500 font-bold">{therapistName}</span>{" "}
              以确认删除
            </Label>
            <Input
              id="confirm-name"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={`输入 ${therapistName} 确认删除`}
              className="bg-white/5 border-gray-700 text-white placeholder:text-gray-500"
              disabled={deleting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={deleting}
            className="border-gray-700 text-gray-300 hover:bg-white/5"
          >
            取消
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                删除中...
              </>
            ) : (
              "确认删除"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
