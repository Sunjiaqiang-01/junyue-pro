"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { DeactivationRequestWithRelations } from "../types";
import { Loader2, CheckCircle, XCircle, Clock, Search, AlertCircle } from "lucide-react";

interface DeactivationRequestsTabProps {
  initialData: DeactivationRequestWithRelations[];
}

export function DeactivationRequestsTab({ initialData }: DeactivationRequestsTabProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<DeactivationRequestWithRelations[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // 审核对话框状态
  const [auditDialog, setAuditDialog] = useState<{
    open: boolean;
    request: DeactivationRequestWithRelations | null;
    action: "approve" | "reject" | null;
  }>({ open: false, request: null, action: null });

  const [reviewNote, setReviewNote] = useState("");

  // 状态映射
  const statusMap = {
    PENDING: { label: "待处理", color: "bg-yellow-500", icon: Clock },
    APPROVED: { label: "已同意", color: "bg-green-500", icon: CheckCircle },
    REJECTED: { label: "已拒绝", color: "bg-red-500", icon: XCircle },
    CANCELLED: { label: "已取消", color: "bg-gray-500", icon: XCircle },
  };

  // 列定义
  const columns: ColumnDef<DeactivationRequestWithRelations>[] = [
    {
      accessorKey: "therapist",
      header: "技师信息",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold">{row.original.therapist.nickname}</div>
          <div className="text-xs text-muted-foreground">@{row.original.therapist.username}</div>
          <div className="text-xs text-muted-foreground">{row.original.therapist.phone}</div>
        </div>
      ),
    },
    {
      accessorKey: "city",
      header: "城市",
      cell: ({ row }) => row.original.therapist.city,
    },
    {
      accessorKey: "reviewNote",
      header: "审核备注",
      cell: ({ row }) => (
        <div className="max-w-md">
          <p className="text-sm line-clamp-3">{row.original.reviewNote || "-"}</p>
        </div>
      ),
    },
    {
      accessorKey: "requestedAt",
      header: "申请时间",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.original.requestedAt).toLocaleString("zh-CN")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const status = row.original.status;
        const StatusIcon = statusMap[status].icon;
        return (
          <Badge className={`${statusMap[status].color} text-white flex items-center gap-1 w-fit`}>
            <StatusIcon className="w-3 h-3" />
            {statusMap[status].label}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value === "all" || row.getValue(id) === value;
      },
    },
    {
      accessorKey: "reviewedAt",
      header: "处理时间",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.reviewedAt
            ? new Date(row.original.reviewedAt).toLocaleString("zh-CN")
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "reviewNote",
      header: "管理员备注",
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="text-xs line-clamp-2">{row.original.reviewNote || "-"}</p>
        </div>
      ),
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const request = row.original;
        if (request.status !== "PENDING") {
          return <span className="text-xs md:text-sm text-secondary/60">已处理</span>;
        }
        return (
          <div className="flex gap-1.5 md:gap-2">
            <Button
              size="sm"
              onClick={() => {
                setAuditDialog({ open: true, request, action: "approve" });
                setReviewNote("");
              }}
              className="bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30 text-xs font-semibold"
            >
              <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              同意
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setAuditDialog({ open: true, request, action: "reject" });
                setReviewNote("");
              }}
              className="bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 text-xs font-semibold"
            >
              <XCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              拒绝
            </Button>
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
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // 处理审核
  const handleAudit = async () => {
    if (!auditDialog.request || !auditDialog.action) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/deactivation-requests/${auditDialog.request.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approved: auditDialog.action === "approve",
          reviewNote: reviewNote.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "处理失败");
      }

      toast({
        title: "成功",
        description: `已${auditDialog.action === "approve" ? "同意" : "拒绝"}注销申请`,
      });

      // 刷新数据
      router.refresh();
      setAuditDialog({ open: false, request: null, action: null });
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

  const pendingCount = data.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-3 md:space-y-4">
      {/* 统计信息 */}
      {pendingCount > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs md:text-sm">
              待处理 {pendingCount}
            </Badge>
            <span className="text-xs md:text-sm text-orange-400/80">
              有技师申请注销账号，请及时处理
            </span>
          </div>
        </div>
      )}

      {/* 筛选栏 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-secondary/60" />
          <Input
            placeholder="搜索技师昵称或用户名..."
            value={(table.getColumn("therapist")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("therapist")?.setFilterValue(event.target.value)}
            className="pl-9 md:pl-10 bg-white/5 border-white/10 text-white placeholder:text-secondary/60 text-sm"
          />
        </div>
        <Select
          value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
          onValueChange={(value) =>
            table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-full sm:w-[150px] bg-white/5 border-white/10 text-white text-sm">
            <SelectValue placeholder="筛选状态" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-white/10">
            <SelectItem value="all" className="text-white hover:bg-white/10">
              全部状态
            </SelectItem>
            <SelectItem value="PENDING" className="text-white hover:bg-white/10">
              待处理
            </SelectItem>
            <SelectItem value="APPROVED" className="text-white hover:bg-white/10">
              已同意
            </SelectItem>
            <SelectItem value="REJECTED" className="text-white hover:bg-white/10">
              已拒绝
            </SelectItem>
          </SelectContent>
        </Select>
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
                  暂无注销申请
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
              {auditDialog.action === "approve" ? "同意注销申请" : "拒绝注销申请"}
            </DialogTitle>
            <DialogDescription className="text-secondary/60">
              {auditDialog.action === "approve" ? (
                <>
                  <span className="text-red-400 font-semibold">注意：</span>{" "}
                  同意后技师账号将被永久注销，该操作不可撤销！
                </>
              ) : (
                "拒绝后技师可以继续使用账号"
              )}
            </DialogDescription>
          </DialogHeader>
          {auditDialog.request && (
            <div className="space-y-4 py-2">
              <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                <div className="text-sm font-medium mb-2 text-white">申请信息：</div>
                <div className="text-sm space-y-1 text-secondary/80">
                  <div>
                    技师：{auditDialog.request.therapist.nickname} (@
                    {auditDialog.request.therapist.username})
                  </div>
                  <div>
                    申请时间：{new Date(auditDialog.request.requestedAt).toLocaleString("zh-CN")}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-note" className="text-white">
                  管理员备注（可选）
                </Label>
                <Textarea
                  id="admin-note"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={
                    auditDialog.action === "approve" ? "备注同意原因..." : "备注拒绝原因..."
                  }
                  rows={3}
                  className="bg-white/5 border-white/10 text-white placeholder:text-secondary/60"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAuditDialog({ open: false, request: null, action: null })}
              disabled={loading}
              className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 hover:text-white"
            >
              取消
            </Button>
            <Button
              onClick={handleAudit}
              disabled={loading}
              className={
                auditDialog.action === "approve"
                  ? "bg-red-600/20 text-red-400 border-red-600/30 hover:bg-red-600/30 font-semibold"
                  : "bg-green-600/20 text-green-400 border-green-600/30 hover:bg-green-600/30 font-semibold"
              }
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              确认{auditDialog.action === "approve" ? "同意注销" : "拒绝"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
