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

  const [adminNote, setAdminNote] = useState("");

  // 状态映射
  const statusMap = {
    PENDING: { label: "待处理", color: "bg-yellow-500", icon: Clock },
    APPROVED: { label: "已同意", color: "bg-green-500", icon: CheckCircle },
    REJECTED: { label: "已拒绝", color: "bg-red-500", icon: XCircle },
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
      accessorKey: "reason",
      header: "注销原因",
      cell: ({ row }) => (
        <div className="max-w-md">
          <p className="text-sm line-clamp-3">{row.original.reason}</p>
        </div>
      ),
    },
    {
      accessorKey: "submittedAt",
      header: "申请时间",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.original.submittedAt).toLocaleString("zh-CN")}
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
      accessorKey: "processedAt",
      header: "处理时间",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.processedAt
            ? new Date(row.original.processedAt).toLocaleString("zh-CN")
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "adminNote",
      header: "管理员备注",
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="text-xs line-clamp-2">{row.original.adminNote || "-"}</p>
        </div>
      ),
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const request = row.original;
        if (request.status !== "PENDING") {
          return <span className="text-sm text-muted-foreground">已处理</span>;
        }
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setAuditDialog({ open: true, request, action: "approve" });
                setAdminNote("");
              }}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              同意
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                setAuditDialog({ open: true, request, action: "reject" });
                setAdminNote("");
              }}
            >
              <XCircle className="w-4 h-4 mr-1" />
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
          adminNote: adminNote.trim() || undefined,
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
    <div className="space-y-4">
      {/* 统计信息 */}
      {pendingCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <Badge className="bg-orange-500 text-white">待处理 {pendingCount}</Badge>
            <span className="text-sm text-orange-700">有技师申请注销账号，请及时处理</span>
          </div>
        </div>
      )}

      {/* 筛选栏 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索技师昵称或用户名..."
            value={(table.getColumn("therapist")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("therapist")?.setFilterValue(event.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
          onValueChange={(value) =>
            table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="筛选状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="PENDING">待处理</SelectItem>
            <SelectItem value="APPROVED">已同意</SelectItem>
            <SelectItem value="REJECTED">已拒绝</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 表格 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  暂无注销申请
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      {table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            共 {table.getFilteredRowModel().rows.length} 条记录
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              上一页
            </Button>
            <div className="text-sm">
              第 {table.getState().pagination.pageIndex + 1} 页，共 {table.getPageCount()} 页
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {auditDialog.action === "approve" ? "同意注销申请" : "拒绝注销申请"}
            </DialogTitle>
            <DialogDescription>
              {auditDialog.action === "approve" ? (
                <>
                  <span className="text-red-600 font-semibold">注意：</span>{" "}
                  同意后技师账号将被永久注销，该操作不可撤销！
                </>
              ) : (
                "拒绝后技师可以继续使用账号"
              )}
            </DialogDescription>
          </DialogHeader>
          {auditDialog.request && (
            <div className="space-y-4 py-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium mb-2">申请信息：</div>
                <div className="text-sm space-y-1">
                  <div>
                    技师：{auditDialog.request.therapist.nickname} (@
                    {auditDialog.request.therapist.username})
                  </div>
                  <div>原因：{auditDialog.request.reason}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-note">管理员备注（可选）</Label>
                <Textarea
                  id="admin-note"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={
                    auditDialog.action === "approve" ? "备注同意原因..." : "备注拒绝原因..."
                  }
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAuditDialog({ open: false, request: null, action: null })}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              onClick={handleAudit}
              disabled={loading}
              className={
                auditDialog.action === "approve"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
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
