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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { TherapistWithRelations } from "../types";
import { Loader2, Eye, EyeOff, Star, Ban, CheckCircle, XCircle, Clock, Search } from "lucide-react";

interface AllTherapistsTabProps {
  initialData: TherapistWithRelations[];
}

export function AllTherapistsTab({ initialData }: AllTherapistsTabProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState<TherapistWithRelations[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // 操作对话框状态
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: "feature" | "new" | "ban" | null;
    therapist: TherapistWithRelations | null;
  }>({ open: false, type: null, therapist: null });

  const [banReason, setBanReason] = useState("");

  // 状态映射
  const statusMap = {
    PENDING: { label: "待审核", color: "bg-yellow-500", icon: Clock },
    APPROVED: { label: "已通过", color: "bg-green-500", icon: CheckCircle },
    REJECTED: { label: "已拒绝", color: "bg-red-500", icon: XCircle },
    BANNED: { label: "已封禁", color: "bg-gray-500", icon: Ban },
  };

  // 列定义
  const columns: ColumnDef<TherapistWithRelations>[] = [
    {
      accessorKey: "nickname",
      header: "昵称",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.photos.length > 0 && (
            <img
              src={
                row.original.photos.find((p) => p.isPrimary)?.mediumUrl ||
                row.original.photos[0]?.mediumUrl
              }
              alt={row.original.nickname}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <div className="font-medium">{row.original.nickname}</div>
            <div className="text-xs text-muted-foreground">@{row.original.username}</div>
          </div>
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
      accessorKey: "city",
      header: "城市",
    },
    {
      accessorKey: "age",
      header: "年龄",
      cell: ({ row }) => `${row.original.age}岁`,
    },
    {
      accessorKey: "cardValue",
      header: "牌值",
      cell: ({ row }) => row.original.cardValue || "-",
    },
    {
      accessorKey: "viewCount",
      header: "浏览量",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4 text-blue-500" />
          {row.original.viewCount.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "isOnline",
      header: "在线",
      cell: ({ row }) => (
        <Badge variant={row.original.isOnline ? "default" : "outline"}>
          {row.original.isOnline ? "在线" : "离线"}
        </Badge>
      ),
    },
    {
      accessorKey: "isNew",
      header: "新人",
      cell: ({ row }) => row.original.isNew && <Badge variant="secondary">新人</Badge>,
    },
    {
      accessorKey: "isFeatured",
      header: "精选",
      cell: ({ row }) =>
        row.original.isFeatured && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />,
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const therapist = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push(`/admin/therapists/${therapist.id}/edit`)}
            >
              查看
            </Button>
            <Button
              size="sm"
              variant={therapist.isFeatured ? "outline" : "default"}
              onClick={() => setActionDialog({ open: true, type: "feature", therapist })}
            >
              {therapist.isFeatured ? "取消精选" : "设为精选"}
            </Button>
            <Button
              size="sm"
              variant={therapist.isNew ? "outline" : "default"}
              onClick={() => setActionDialog({ open: true, type: "new", therapist })}
            >
              {therapist.isNew ? "取消新人" : "设为新人"}
            </Button>
            {therapist.status !== "BANNED" && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setActionDialog({ open: true, type: "ban", therapist });
                  setBanReason("");
                }}
              >
                <Ban className="w-4 h-4 mr-1" />
                封禁
              </Button>
            )}
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

  // 处理操作
  const handleAction = async () => {
    if (!actionDialog.therapist) return;

    setLoading(true);
    try {
      let endpoint = "";
      let body: any = {};

      switch (actionDialog.type) {
        case "feature":
          endpoint = `/api/admin/therapists/${actionDialog.therapist.id}/feature`;
          body = { isFeatured: !actionDialog.therapist.isFeatured };
          break;
        case "new":
          endpoint = `/api/admin/therapists/${actionDialog.therapist.id}/new`;
          body = { isNew: !actionDialog.therapist.isNew };
          break;
        case "ban":
          if (!banReason.trim()) {
            toast({
              title: "错误",
              description: "请输入封禁原因",
              variant: "destructive",
            });
            return;
          }
          endpoint = `/api/admin/therapists/${actionDialog.therapist.id}/ban`;
          body = { reason: banReason };
          break;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "操作失败");
      }

      toast({
        title: "成功",
        description: "操作已完成",
      });

      // 刷新数据
      router.refresh();
      setActionDialog({ open: false, type: null, therapist: null });
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
    <div className="space-y-4">
      {/* 筛选栏 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索昵称或用户名..."
            value={(table.getColumn("nickname")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("nickname")?.setFilterValue(event.target.value)}
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
            <SelectItem value="PENDING">待审核</SelectItem>
            <SelectItem value="APPROVED">已通过</SelectItem>
            <SelectItem value="REJECTED">已拒绝</SelectItem>
            <SelectItem value="BANNED">已封禁</SelectItem>
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
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
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

      {/* 操作对话框 */}
      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) => !loading && setActionDialog({ ...actionDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === "feature" &&
                (actionDialog.therapist?.isFeatured ? "取消精选" : "设为精选")}
              {actionDialog.type === "new" &&
                (actionDialog.therapist?.isNew ? "取消新人标签" : "设为新人")}
              {actionDialog.type === "ban" && "封禁技师"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === "ban"
                ? "封禁后该技师将无法登录系统"
                : `确认要${actionDialog.type === "feature" ? (actionDialog.therapist?.isFeatured ? "取消精选" : "设为精选") : actionDialog.therapist?.isNew ? "取消新人标签" : "设为新人"}吗？`}
            </DialogDescription>
          </DialogHeader>
          {actionDialog.type === "ban" && (
            <div className="space-y-2">
              <Label htmlFor="ban-reason">封禁原因</Label>
              <Textarea
                id="ban-reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="请输入封禁原因..."
                rows={4}
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, type: null, therapist: null })}
              disabled={loading}
            >
              取消
            </Button>
            <Button onClick={handleAction} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
