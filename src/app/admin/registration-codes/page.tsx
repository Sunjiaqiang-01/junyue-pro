"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Copy,
  Eye,
  Ban,
  CheckCircle,
  Trash2,
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ListFilter,
  CircleX,
  Filter,
  Download,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface RegistrationCode {
  id: string;
  code: string;
  type: string;
  maxUses: number;
  currentUses: number;
  remainingUses: number;
  isActive: boolean;
  expiresAt: Date | null;
  isExpired: boolean;
  note: string | null;
  createdAt: Date;
  therapistsCount: number;
}

interface TherapistUsage {
  id: string;
  nickname: string;
  phone: string;
  createdAt: Date;
}

export default function RegistrationCodesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [codes, setCodes] = useState<RegistrationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedCode, setSelectedCode] = useState<RegistrationCode | null>(null);
  const [therapistUsages, setTherapistUsages] = useState<TherapistUsage[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<string | null>(null);

  // Generate Form State
  const [generateForm, setGenerateForm] = useState({
    quantity: 1,
    type: "ONETIME",
    maxUses: 1,
    validityDays: 0, // 0 = 永久
    note: "",
  });

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });

  // 检查登录状态
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  // 获取注册码列表
  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const res = await fetch("/api/admin/registration-codes/list");
      const data = await res.json();

      if (data.success && data.data && Array.isArray(data.data.codes)) {
        setCodes(data.data.codes);
      } else {
        setCodes([]);
        toast.error("获取注册码列表失败");
      }
    } catch (error) {
      console.error("获取注册码列表失败:", error);
      setCodes([]);
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  // 生成注册码
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/registration-codes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: generateForm.quantity,
          codeType: generateForm.type,
          maxUses: generateForm.type === "LIMITED" ? generateForm.maxUses : undefined,
          expiresInDays: generateForm.validityDays > 0 ? generateForm.validityDays : undefined,
          note: generateForm.note || undefined,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`成功生成 ${generateForm.quantity} 个注册码`);
        setShowGenerateDialog(false);
        setGenerateForm({
          quantity: 1,
          type: "ONETIME",
          maxUses: 1,
          validityDays: 0,
          note: "",
        });
        fetchCodes();
      } else {
        toast.error(data.error || "生成注册码失败");
      }
    } catch (error) {
      console.error("生成注册码失败:", error);
      toast.error("网络错误");
    } finally {
      setGenerating(false);
    }
  };

  // 查看使用详情
  const handleViewDetails = async (code: RegistrationCode) => {
    setSelectedCode(code);
    setShowDetailsDialog(true);

    try {
      const res = await fetch(`/api/admin/registration-codes/${code.id}/therapists`);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setTherapistUsages(data.data);
      } else {
        setTherapistUsages([]);
      }
    } catch (error) {
      console.error("获取使用详情失败:", error);
      setTherapistUsages([]);
    }
  };

  // 启用/禁用注册码
  const handleToggleActive = async (code: RegistrationCode) => {
    try {
      const res = await fetch(`/api/admin/registration-codes/${code.id}/toggle`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (data.success) {
        toast.success(code.isActive ? "已禁用注册码" : "已启用注册码");
        fetchCodes();
      } else {
        toast.error(data.error || "操作失败");
      }
    } catch (error) {
      console.error("切换状态失败:", error);
      toast.error("网络错误");
    }
  };

  // 删除注册码
  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/registration-codes/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("删除成功");
        setDeleteDialogOpen(false);
        setCodeToDelete(null);
        fetchCodes();
      } else {
        toast.error(data.error || "删除失败");
      }
    } catch (error) {
      console.error("删除失败:", error);
      toast.error("网络错误");
    } finally {
      setDeleting(false);
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) {
      toast.error("请选择要删除的注册码");
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/admin/registration-codes/batch", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`成功删除 ${selectedIds.length} 个注册码`);
        setRowSelection({});
        fetchCodes();
      } else {
        toast.error(data.error || "批量删除失败");
      }
    } catch (error) {
      console.error("批量删除失败:", error);
      toast.error("网络错误");
    } finally {
      setDeleting(false);
    }
  };

  // 批量启用/禁用
  const handleBatchToggle = async (active: boolean) => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) {
      toast.error("请选择要操作的注册码");
      return;
    }

    try {
      const res = await fetch("/api/admin/registration-codes/batch/toggle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, isActive: active }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`成功${active ? "启用" : "禁用"} ${selectedIds.length} 个注册码`);
        setRowSelection({});
        fetchCodes();
      } else {
        toast.error(data.error || "批量操作失败");
      }
    } catch (error) {
      console.error("批量操作失败:", error);
      toast.error("网络错误");
    }
  };

  // 复制注册码
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("已复制到剪贴板");
  };

  // 导出CSV
  const handleExport = () => {
    const selectedIds = Object.keys(rowSelection);
    const exportData =
      selectedIds.length > 0 ? codes.filter((code) => selectedIds.includes(code.id)) : codes;

    const csvContent = [
      [
        "注册码",
        "类型",
        "最大使用次数",
        "已使用次数",
        "剩余次数",
        "状态",
        "过期时间",
        "备注",
        "创建时间",
      ].join(","),
      ...exportData.map((code) =>
        [
          code.code,
          code.type === "ONETIME" ? "一次性" : code.type === "LIMITED" ? "限次数" : "无限次",
          code.maxUses,
          code.currentUses,
          code.remainingUses,
          code.isActive ? "可用" : "已禁用",
          code.expiresAt ? new Date(code.expiresAt).toLocaleString("zh-CN") : "永久",
          code.note || "",
          new Date(code.createdAt).toLocaleString("zh-CN"),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `registration-codes-${new Date().getTime()}.csv`;
    link.click();
    toast.success("导出成功");
  };

  // 定义表格列
  const columns: ColumnDef<RegistrationCode>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="选择全部"
          className="border-gray-600 data-[state=checked]:bg-gray-700 data-[state=checked]:border-gray-600 data-[state=checked]:text-white"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="选择行"
          className="border-gray-600 data-[state=checked]:bg-gray-700 data-[state=checked]:border-gray-600 data-[state=checked]:text-white"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "code",
      header: "注册码",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <code className="text-primary-cyan font-mono text-sm font-medium bg-white/5 px-3 py-1 rounded">
            {row.getValue("code")}
          </code>
          <button
            onClick={() => handleCopy(row.getValue("code"))}
            className="text-gray-300 hover:text-primary-cyan transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "类型",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        const typeMap: Record<string, { label: string; color: string }> = {
          ONETIME: { label: "一次性", color: "bg-blue-600/20 text-blue-400 border-blue-600/30" },
          LIMITED: {
            label: "限次数",
            color: "bg-orange-600/20 text-orange-400 border-orange-600/30",
          },
          UNLIMITED: {
            label: "无限次",
            color: "bg-green-600/20 text-green-400 border-green-600/30",
          },
        };
        const config = typeMap[type] || typeMap.ONETIME;
        return <Badge className={config.color}>{config.label}</Badge>;
      },
    },
    {
      accessorKey: "usage",
      header: "使用情况",
      cell: ({ row }) => (
        <div className="text-sm">
          <span className="text-white font-medium">{row.original.currentUses}</span>
          <span className="text-gray-400"> / </span>
          <span className="text-white font-medium">
            {row.original.maxUses === -1 ? "∞" : row.original.maxUses}
          </span>
          <span className="text-gray-400 ml-2">
            (剩余 {row.original.remainingUses === -1 ? "∞" : row.original.remainingUses})
          </span>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "状态",
      cell: ({ row }) => {
        const code = row.original;
        if (code.isExpired) {
          return <Badge className="bg-gray-600/20 text-gray-400 border-gray-600/30">已过期</Badge>;
        }
        if (code.remainingUses === 0) {
          return <Badge className="bg-red-600/20 text-red-400 border-red-600/30">已用完</Badge>;
        }
        if (!code.isActive) {
          return <Badge className="bg-red-600/20 text-red-400 border-red-600/30">已禁用</Badge>;
        }
        return <Badge className="bg-green-600/20 text-green-400 border-green-600/30">可用</Badge>;
      },
    },
    {
      accessorKey: "expiresAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 hover:bg-transparent"
          >
            有效期
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        );
      },
      cell: ({ row }) => {
        const expiresAt = row.getValue("expiresAt");
        return expiresAt ? (
          <span className="text-gray-100">
            {new Date(expiresAt as Date).toLocaleDateString("zh-CN")}
          </span>
        ) : (
          <span className="text-gray-400">永久</span>
        );
      },
    },
    {
      accessorKey: "note",
      header: "备注",
      cell: ({ row }) => {
        const note = row.getValue("note") as string | null;
        return note ? (
          <span className="text-gray-100 text-sm">{note}</span>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 hover:bg-transparent"
          >
            创建时间
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span className="text-gray-100">
            {new Date(row.getValue("createdAt")).toLocaleString("zh-CN")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const code = row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewDetails(code)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
              title="查看详情"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleToggleActive(code)}
              className={`${
                code.isActive
                  ? "text-primary-cyan hover:text-primary-cyan/80"
                  : "text-green-400 hover:text-green-300"
              } transition-colors`}
              title={code.isActive ? "禁用" : "启用"}
            >
              {code.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setCodeToDelete(code.id);
                setDeleteDialogOpen(true);
              }}
              className="text-red-400 hover:text-red-300 transition-colors"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: codes,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => row.id, // 使用ID作为行标识符
  });

  const selectedRowCount = Object.keys(rowSelection).length;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-pure-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pure-black p-6 pt-24 md:pt-28">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-pure-white">注册码管理</h1>
            <p className="text-secondary/60 mt-2">管理技师注册码，生成、查看、启用/禁用</p>
          </div>
          <Button
            onClick={() => setShowGenerateDialog(true)}
            className="bg-primary-cyan text-pure-black hover:bg-primary-cyan/90 font-semibold shadow-lg shadow-primary-cyan/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            生成注册码
          </Button>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-4 flex-1">
              <Input
                placeholder="搜索注册码或备注..."
                value={(table.getColumn("code")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("code")?.setFilterValue(event.target.value)}
                className="max-w-sm bg-white/5 border-gray-700 text-white"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="border border-white/10 text-white hover:bg-white/10 hover:text-primary-cyan bg-transparent"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    筛选状态
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 bg-gray-900 border-white/10">
                  <div className="space-y-2">
                    <Label className="text-pure-white font-semibold text-sm">状态筛选</Label>
                    <Select
                      value={(table.getColumn("isActive")?.getFilterValue() as string) ?? "all"}
                      onValueChange={(value) =>
                        table
                          .getColumn("isActive")
                          ?.setFilterValue(value === "all" ? undefined : value === "true")
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/10">
                        <SelectItem
                          value="all"
                          className="text-white font-medium hover:bg-white/10 hover:text-primary-cyan cursor-pointer"
                        >
                          全部
                        </SelectItem>
                        <SelectItem
                          value="true"
                          className="text-white font-medium hover:bg-white/10 hover:text-primary-cyan cursor-pointer"
                        >
                          可用
                        </SelectItem>
                        <SelectItem
                          value="false"
                          className="text-white font-medium hover:bg-white/10 hover:text-primary-cyan cursor-pointer"
                        >
                          已禁用
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {selectedRowCount > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchToggle(true)}
                  className="border-green-600/30 text-green-400 hover:bg-green-600/10"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  批量启用 ({selectedRowCount})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchToggle(false)}
                  className="border-red-600/30 text-red-400 hover:bg-red-600/10"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  批量禁用 ({selectedRowCount})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBatchDelete}
                  disabled={deleting}
                  className="border-red-600/30 text-red-400 hover:bg-red-600/10"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  批量删除 ({selectedRowCount})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="border-blue-600/30 text-blue-400 hover:bg-blue-600/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  导出选中
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/5 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-gray-800 hover:bg-white/5">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-gray-100 font-semibold">
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
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={`border-gray-800 transition-colors ${
                        row.getIsSelected()
                          ? "bg-blue-500/20 hover:bg-blue-500/30 border-l-4 border-l-blue-400"
                          : "hover:bg-white/5 border-l-4 border-l-transparent"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-gray-100">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-gray-400">
                      暂无注册码
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-800 px-6 py-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-400">
                共 {table.getFilteredRowModel().rows.length} 个注册码
                {selectedRowCount > 0 && `, 已选择 ${selectedRowCount} 个`}
              </p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="w-[120px] bg-gray-700 border-gray-600 text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {[10, 20, 50, 100].map((pageSize) => (
                    <SelectItem
                      key={pageSize}
                      value={`${pageSize}`}
                      className="text-white font-medium hover:bg-gray-700 cursor-pointer"
                    >
                      {pageSize} 条/页
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="border-gray-700"
                  >
                    <ChevronFirst className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="border-gray-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm text-gray-400 px-4">
                    第 {table.getState().pagination.pageIndex + 1} 页，共 {table.getPageCount()} 页
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="border-gray-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="border-gray-700"
                  >
                    <ChevronLast className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>

      {/* Generate Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>生成注册码</DialogTitle>
            <DialogDescription className="text-gray-400">设置注册码的类型和参数</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">生成数量</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="1000"
                value={generateForm.quantity}
                onChange={(e) =>
                  setGenerateForm({ ...generateForm, quantity: parseInt(e.target.value) || 1 })
                }
                className="bg-white/5 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">注册码类型</Label>
              <Select
                value={generateForm.type}
                onValueChange={(value) => setGenerateForm({ ...generateForm, type: value })}
              >
                <SelectTrigger className="bg-white/5 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem
                    value="ONETIME"
                    className="text-white font-medium hover:bg-gray-700 cursor-pointer"
                  >
                    一次性（只能使用1次）
                  </SelectItem>
                  <SelectItem
                    value="LIMITED"
                    className="text-white font-medium hover:bg-gray-700 cursor-pointer"
                  >
                    限次数（自定义次数）
                  </SelectItem>
                  <SelectItem
                    value="UNLIMITED"
                    className="text-white font-medium hover:bg-gray-700 cursor-pointer"
                  >
                    无限次（不限使用次数）
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {generateForm.type === "LIMITED" && (
              <div className="space-y-2">
                <Label htmlFor="maxUses">最大使用次数</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  max="999"
                  value={generateForm.maxUses}
                  onChange={(e) =>
                    setGenerateForm({ ...generateForm, maxUses: parseInt(e.target.value) || 1 })
                  }
                  className="bg-white/5 border-gray-700 text-white"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="validityDays">有效期（天）</Label>
              <Input
                id="validityDays"
                type="number"
                min="0"
                placeholder="0 = 永久有效"
                value={generateForm.validityDays}
                onChange={(e) =>
                  setGenerateForm({ ...generateForm, validityDays: parseInt(e.target.value) || 0 })
                }
                className="bg-white/5 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-500">0表示永久有效，大于0则为天数</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">备注（可选）</Label>
              <Textarea
                id="note"
                placeholder="如：2025年春节招募批次"
                value={generateForm.note}
                onChange={(e) => setGenerateForm({ ...generateForm, note: e.target.value })}
                className="bg-white/5 border-gray-700 text-white resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGenerateDialog(false)}
              className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 hover:text-white font-medium"
            >
              取消
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-primary-cyan text-pure-black font-semibold hover:bg-primary-cyan/90 shadow-lg shadow-primary-cyan/30"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                "确认生成"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>注册码使用详情</DialogTitle>
            <DialogDescription className="text-gray-400">
              查看使用该注册码的技师列表
            </DialogDescription>
          </DialogHeader>

          {selectedCode && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">注册码:</span>
                  <code className="text-primary-cyan font-mono">{selectedCode.code}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">类型:</span>
                  <span className="text-white">
                    {selectedCode.type === "ONETIME"
                      ? "一次性"
                      : selectedCode.type === "LIMITED"
                        ? "限次数"
                        : "无限次"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">使用情况:</span>
                  <span className="text-white">
                    {selectedCode.currentUses} /{" "}
                    {selectedCode.maxUses === -1 ? "∞" : selectedCode.maxUses}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">有效期:</span>
                  <span className="text-white">
                    {selectedCode.expiresAt
                      ? new Date(selectedCode.expiresAt).toLocaleDateString("zh-CN")
                      : "永久"}
                  </span>
                </div>
                {selectedCode.note && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">备注:</span>
                    <span className="text-white">{selectedCode.note}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>使用该码的技师 ({therapistUsages.length})</Label>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {therapistUsages.length > 0 ? (
                    therapistUsages.map((therapist) => (
                      <div
                        key={therapist.id}
                        className="bg-white/5 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-white font-medium">{therapist.nickname}</p>
                          <p className="text-gray-400 text-sm">{therapist.phone}</p>
                        </div>
                        <p className="text-gray-500 text-sm">
                          {new Date(therapist.createdAt).toLocaleDateString("zh-CN")}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">暂无使用记录</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
              className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 hover:text-white"
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              此操作不可撤销。确定要删除这个注册码吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600 hover:text-white">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => codeToDelete && handleDelete(codeToDelete)}
              disabled={deleting}
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
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
