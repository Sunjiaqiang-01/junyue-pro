"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { TherapistWithRelations } from "../types";
import { Loader2, CheckCircle, XCircle, Search, Eye, User } from "lucide-react";

interface PendingTherapistsTabProps {
  initialData: TherapistWithRelations[];
}

export function PendingTherapistsTab({ initialData }: PendingTherapistsTabProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<TherapistWithRelations[]>(initialData);
  const [loading, setLoading] = useState(false);

  // 审核对话框状态
  const [auditDialog, setAuditDialog] = useState<{
    open: boolean;
    therapist: TherapistWithRelations | null;
    action: "approve" | "reject" | null;
  }>({ open: false, therapist: null, action: null });

  const [rejectReason, setRejectReason] = useState("");

  // 列定义
  const columns: ColumnDef<TherapistWithRelations>[] = [
    {
      accessorKey: "nickname",
      header: "技师信息",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.photos.length > 0 ? (
            <img
              src={
                row.original.photos.find((p) => p.isPrimary)?.url ||
                row.original.photos[0]?.url ||
                "/placeholder-avatar.svg"
              }
              alt={row.original.nickname}
              className="w-14 h-14 rounded-full object-cover border-2 border-gray-600"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
              <User className="w-7 h-7 text-gray-400" />
            </div>
          )}
          <div>
            <div className="font-semibold text-base">{row.original.nickname}</div>
            <div className="text-xs text-muted-foreground">@{row.original.username}</div>
            <div className="text-xs text-muted-foreground">{row.original.phone}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "city",
      header: "城市",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.city}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.areas.slice(0, 2).join("、")}
            {row.original.areas.length > 2 && `等${row.original.areas.length}个区域`}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "info",
      header: "基本信息",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-sm">年龄：{row.original.age}岁</div>
          <div className="text-sm">身高：{row.original.height}cm</div>
          <div className="text-sm">体重：{row.original.weight}kg</div>
          {row.original.cardValue && (
            <div className="text-sm font-medium text-blue-600">牌值：{row.original.cardValue}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "profile",
      header: "资料",
      cell: ({ row }) => (
        <div className="space-y-1">
          {row.original.profile && (
            <>
              <div className="text-xs line-clamp-2 max-w-xs">
                {row.original.profile.introduction}
              </div>
              <div className="flex gap-1 flex-wrap mt-1">
                {row.original.profile.specialties.slice(0, 3).map((s, i) => (
                  <Badge key={i} className="bg-white/10 text-white border-white/20 text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      accessorKey: "media",
      header: "媒体",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge className="bg-white/10 text-white border-white/20 text-xs">
            {row.original._count?.photos || 0}张照片
          </Badge>
          <Badge className="bg-white/10 text-white border-white/20 text-xs">
            {row.original._count?.videos || 0}个视频
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "注册时间",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleString("zh-CN")}
        </div>
      ),
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const therapist = row.original;
        return (
          <div className="flex flex-col gap-1.5">
            <Button
              size="sm"
              onClick={() => router.push(`/admin/therapists/${therapist.id}/edit`)}
              className="border border-white/10 text-white hover:bg-white/10 hover:text-primary-cyan bg-transparent text-xs justify-start"
            >
              <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              查看详情
            </Button>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                onClick={() => {
                  setAuditDialog({ open: true, therapist, action: "approve" });
                  setRejectReason("");
                }}
                className="bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30 text-xs font-semibold flex-1"
              >
                <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                通过
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setAuditDialog({ open: true, therapist, action: "reject" });
                  setRejectReason("");
                }}
                className="bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 text-xs font-semibold flex-1"
              >
                <XCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                拒绝
              </Button>
            </div>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // 处理审核
  const handleAudit = async () => {
    if (!auditDialog.therapist || !auditDialog.action) return;

    if (auditDialog.action === "reject" && !rejectReason.trim()) {
      toast({
        title: "错误",
        description: "请输入拒绝原因",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const endpoint = auditDialog.action === "approve" ? "approve" : "reject";
      const response = await fetch(
        `/api/admin/therapists/${auditDialog.therapist.id}/${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body:
            auditDialog.action === "reject" ? JSON.stringify({ reason: rejectReason }) : undefined,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "审核失败");
      }

      toast({
        title: "成功",
        description: `已${auditDialog.action === "approve" ? "通过" : "拒绝"}审核`,
      });

      // 刷新数据
      router.refresh();
      setAuditDialog({ open: false, therapist: null, action: null });
    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* 统计信息 */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 md:p-4">
        <div className="flex items-center gap-2">
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs md:text-sm">
            待审核 {data.length}
          </Badge>
          <span className="text-xs md:text-sm text-yellow-400/80">请及时审核新注册的技师</span>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-secondary/60" />
        <Input
          placeholder="搜索昵称或用户名..."
          value={(table.getColumn("nickname")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("nickname")?.setFilterValue(event.target.value)}
          className="pl-9 md:pl-10 bg-white/5 border-white/10 text-white placeholder:text-secondary/60 text-sm"
        />
      </div>

      {/* 表格 */}
      <div className="rounded-md border border-white/10 overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-white/10 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-secondary/80 font-semibold text-xs md:text-sm"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-white/10 hover:bg-white/5">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-white text-xs md:text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="border-white/10">
                <TableCell colSpan={columns.length} className="h-24 text-center text-secondary/60">
                  🎉 暂无待审核的技师
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      {table.getRowModel().rows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs md:text-sm text-secondary/60">
            共 {table.getFilteredRowModel().rows.length} 条记录
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border border-white/10 text-white hover:bg-white/10 hover:text-primary-cyan bg-transparent text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </Button>
            <div className="text-xs md:text-sm text-white">
              第 {table.getState().pagination.pageIndex + 1} 页，共 {table.getPageCount()} 页
            </div>
            <Button
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border border-white/10 text-white hover:bg-white/10 hover:text-primary-cyan bg-transparent text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 审核对话框 */}
      <Dialog
        open={auditDialog.open}
        onOpenChange={(open) => !loading && setAuditDialog({ ...auditDialog, open })}
      >
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-pure-white">
              {auditDialog.action === "approve" ? "通过审核" : "拒绝审核"}
            </DialogTitle>
            <DialogDescription className="text-secondary/60">
              {auditDialog.action === "approve"
                ? `确认通过技师 "${auditDialog.therapist?.nickname}" 的注册审核吗？`
                : `请填写拒绝原因，技师将收到通知`}
            </DialogDescription>
          </DialogHeader>
          {auditDialog.action === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="reject-reason" className="text-white">
                拒绝原因 *
              </Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="例如：照片不清晰、资料不完整、信息造假等"
                rows={4}
                className="bg-white/5 border-white/10 text-white placeholder:text-secondary/60"
              />
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setAuditDialog({ open: false, therapist: null, action: null })}
              disabled={loading}
              className="bg-gray-700 text-white border border-gray-600 hover:bg-gray-600 hover:text-white"
            >
              取消
            </Button>
            <Button
              onClick={handleAudit}
              disabled={loading}
              className={
                auditDialog.action === "approve"
                  ? "bg-green-600 text-white hover:bg-green-700 border-green-600"
                  : "bg-red-600 text-white hover:bg-red-700 border-red-600"
              }
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              确认{auditDialog.action === "approve" ? "通过" : "拒绝"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
