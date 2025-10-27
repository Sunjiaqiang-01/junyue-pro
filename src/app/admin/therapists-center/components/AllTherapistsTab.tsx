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
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { TherapistWithRelations } from "../types";
import {
  Loader2,
  Eye,
  EyeOff,
  Star,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  User,
  Trash2,
} from "lucide-react";

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

  // 在线状态切换确认对话框
  const [onlineConfirm, setOnlineConfirm] = useState<{
    open: boolean;
    therapist: TherapistWithRelations | null;
    targetStatus: boolean;
  }>({ open: false, therapist: null, targetStatus: false });

  // 操作对话框状态
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: "feature" | "delete" | null;
    therapist: TherapistWithRelations | null;
  }>({ open: false, type: null, therapist: null });

  // 状态映射
  const statusMap = {
    PENDING: { label: "待审核", color: "bg-yellow-500", icon: Clock },
    APPROVED: { label: "已通过", color: "bg-green-500", icon: CheckCircle },
    REJECTED: { label: "已拒绝", color: "bg-red-500", icon: XCircle },
  };

  // 列定义
  const columns: ColumnDef<TherapistWithRelations>[] = [
    {
      accessorKey: "nickname",
      header: "昵称",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
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
      cell: ({ row }) => {
        const therapist = row.original;
        const canToggle = therapist.status === "APPROVED";

        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={therapist.isOnline}
              disabled={!canToggle}
              onCheckedChange={(checked) => {
                if (canToggle) {
                  setOnlineConfirm({
                    open: true,
                    therapist,
                    targetStatus: checked,
                  });
                }
              }}
              className="data-[state=checked]:bg-green-500"
            />
            <span className={`text-xs ${therapist.isOnline ? "text-green-400" : "text-gray-500"}`}>
              {therapist.isOnline ? "在线" : "离线"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "isNew",
      header: "新人",
      cell: ({ row }) =>
        row.original.isNew && (
          <Badge className="bg-primary-cyan/20 text-primary-cyan border-primary-cyan/30">
            新人
          </Badge>
        ),
    },
    {
      accessorKey: "isFeatured",
      header: "推荐",
      cell: ({ row }) =>
        row.original.isFeatured && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />,
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const therapist = row.original;
        return (
          <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
            <Button
              size="sm"
              onClick={() => router.push(`/admin/therapists/${therapist.id}/edit`)}
              className="border border-white/10 text-white hover:bg-white/10 hover:text-primary-cyan bg-transparent text-xs"
            >
              <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              查看
            </Button>
            <Button
              size="sm"
              onClick={() => setActionDialog({ open: true, type: "feature", therapist })}
              className={
                therapist.isFeatured
                  ? "border border-white/10 text-white hover:bg-white/10 hover:text-primary-cyan bg-transparent text-xs"
                  : "bg-primary-cyan text-pure-black hover:bg-primary-cyan/90 text-xs font-semibold border-0"
              }
            >
              {therapist.isFeatured ? "取消推荐" : "设为推荐"}
            </Button>
            <Button
              size="sm"
              onClick={() => setActionDialog({ open: true, type: "delete", therapist })}
              className="bg-red-600 text-white border border-red-700 hover:bg-red-700 text-xs"
            >
              <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              删除
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

  // 处理在线状态切换
  const handleToggleOnline = async () => {
    if (!onlineConfirm.therapist) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/therapists/${onlineConfirm.therapist.id}/online`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: onlineConfirm.targetStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "操作失败");
      }

      toast({
        title: "成功",
        description: `已将技师${onlineConfirm.therapist.nickname}设置为${onlineConfirm.targetStatus ? "在线" : "离线"}`,
      });

      // 立即更新state
      setData((prevData) =>
        prevData.map((t) =>
          t.id === onlineConfirm.therapist!.id ? { ...t, isOnline: onlineConfirm.targetStatus } : t
        )
      );

      setOnlineConfirm({ open: false, therapist: null, targetStatus: false });
    } catch (error: any) {
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理操作
  const handleAction = async () => {
    if (!actionDialog.therapist) return;

    setLoading(true);
    try {
      let endpoint = "";
      let method = "POST";
      let body: any = {};

      switch (actionDialog.type) {
        case "feature":
          endpoint = `/api/admin/therapists/${actionDialog.therapist.id}/feature`;
          body = { isFeatured: !actionDialog.therapist.isFeatured };
          break;
        case "delete":
          endpoint = `/api/admin/therapists/${actionDialog.therapist.id}`;
          method = "DELETE";
          break;
      }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "DELETE" ? undefined : JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "操作失败");
      }

      toast({
        title: "成功",
        description: actionDialog.type === "delete" ? "技师已永久删除" : "操作已完成",
      });

      // 根据操作类型立即更新state
      if (actionDialog.type === "delete") {
        // 删除：从列表中移除
        setData((prevData) => prevData.filter((t) => t.id !== actionDialog.therapist!.id));
      } else if (actionDialog.type === "feature") {
        // 推荐：切换isFeatured状态
        setData((prevData) =>
          prevData.map((t) =>
            t.id === actionDialog.therapist!.id ? { ...t, isFeatured: !t.isFeatured } : t
          )
        );
      }

      // 刷新数据（双保险）
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
    <div className="space-y-3 md:space-y-4">
      {/* 筛选栏 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-secondary/60" />
          <Input
            placeholder="搜索昵称或用户名..."
            value={(table.getColumn("nickname")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("nickname")?.setFilterValue(event.target.value)}
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
              待审核
            </SelectItem>
            <SelectItem value="APPROVED" className="text-white hover:bg-white/10">
              已通过
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
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
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

      {/* 操作对话框 */}
      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) => !loading && setActionDialog({ ...actionDialog, open })}
      >
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-pure-white">
              {actionDialog.type === "feature" &&
                (actionDialog.therapist?.isFeatured ? "取消推荐" : "设为推荐")}
              {actionDialog.type === "delete" && "删除技师"}
            </DialogTitle>
            <DialogDescription className="text-secondary/60">
              {actionDialog.type === "feature" &&
                `确认要${actionDialog.therapist?.isFeatured ? "取消推荐" : "设为推荐"}吗？`}
              {actionDialog.type === "delete" && ""}
            </DialogDescription>
          </DialogHeader>
          {actionDialog.type === "delete" && (
            <div className="space-y-3 bg-red-900/20 border border-red-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400 font-semibold">
                <Trash2 className="w-5 h-5" />
                <span>⚠️ 危险操作警告</span>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-white">
                  即将删除技师：
                  <span className="font-semibold">{actionDialog.therapist?.nickname}</span>
                  <span className="text-secondary/80"> (@{actionDialog.therapist?.username})</span>
                </p>
                <div className="text-secondary/80">
                  <p className="font-medium text-white mb-1">此操作将永久删除以下数据：</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li>技师基本信息和账户</li>
                    <li>所有照片和视频文件</li>
                    <li>个人资料和服务排班</li>
                    <li>相关通知和注销申请</li>
                  </ul>
                </div>
                <p className="text-red-400 font-semibold mt-2">⚠️ 此操作不可恢复！请谨慎操作！</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setActionDialog({ open: false, type: null, therapist: null })}
              disabled={loading}
              className="bg-gray-700 text-white border border-gray-600 hover:bg-gray-600 hover:text-white"
            >
              取消
            </Button>
            <Button
              onClick={handleAction}
              disabled={loading}
              className={
                actionDialog.type === "delete"
                  ? "bg-red-600 text-white hover:bg-red-700 border-red-600"
                  : "bg-primary-cyan text-pure-black hover:bg-primary-cyan/90 font-semibold"
              }
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {actionDialog.type === "delete" ? "确认删除" : "确认"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 在线状态切换确认对话框 */}
      <AlertDialog
        open={onlineConfirm.open}
        onOpenChange={(open) => !loading && setOnlineConfirm({ ...onlineConfirm, open })}
      >
        <AlertDialogContent className="bg-gray-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-white">
              {onlineConfirm.targetStatus ? "确认设置为在线？" : "确认设置为离线？"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              {onlineConfirm.targetStatus
                ? `设置技师 "${onlineConfirm.therapist?.nickname}" 为在线后，用户将可以在平台上看到该技师的信息。`
                : `设置技师 "${onlineConfirm.therapist?.nickname}" 为离线后，用户将无法在平台上看到该技师的信息。`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 hover:text-white">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleOnline}
              disabled={loading}
              className="bg-primary-cyan text-pure-black hover:bg-primary-cyan/90 font-semibold"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              确认{onlineConfirm.targetStatus ? "上线" : "离线"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
