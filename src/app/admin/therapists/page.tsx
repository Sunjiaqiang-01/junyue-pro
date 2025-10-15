"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  ArrowLeft,
  Eye,
  Star,
  Ban,
  UserCheck,
  Edit,
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
  CircleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useId, useRef } from "react";

interface Therapist {
  id: string;
  nickname: string;
  age: number;
  height: number;
  weight: number;
  cardValue?: string;
  city: string;
  areas: string[];
  phone: string;
  email?: string;
  status: string;
  isOnline: boolean;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: string;
  photos: Array<{
    id: string;
    url: string;
    order: number;
    isPrimary: boolean;
  }>;
  profile: {
    introduction: string;
    specialties: string[];
    serviceType: string[];
  } | null;
}

// 自定义多列搜索过滤函数
const multiColumnFilterFn: FilterFn<Therapist> = (row, columnId, filterValue) => {
  const searchableRowContent =
    `${row.original.nickname} ${row.original.phone} ${row.original.city}`.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

// 状态过滤函数
const statusFilterFn: FilterFn<Therapist> = (row, columnId, filterValue: string[]) => {
  if (!filterValue?.length) return true;
  const status = row.getValue(columnId) as string;
  return filterValue.includes(status);
};

export default function TherapistsManagePage() {
  const id = useId();
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "nickname",
      desc: false,
    },
  ]);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/admin/login");
    } else if (sessionStatus === "authenticated" && session?.user?.role === "admin") {
      fetchTherapists();
    }
  }, [sessionStatus, session, router]);

  const fetchTherapists = async () => {
    try {
      const res = await fetch("/api/admin/therapists");
      const data = await res.json();

      if (data.success) {
        setTherapists(data.data);
      } else {
        toast.error("获取技师列表失败");
      }
    } catch (error) {
      console.error("获取技师列表失败:", error);
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (therapistId: string, isFeatured: boolean) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}/feature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(isFeatured ? "已取消推荐" : "已设为推荐");
        fetchTherapists();
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

  const handleToggleBan = async (therapistId: string, status: string) => {
    const isBanned = status === "BANNED";
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ban: !isBanned }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(isBanned ? "已解封" : "已封禁");
        fetchTherapists();
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

  const handleDeleteTherapist = async (therapistId: string, therapistName: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`技师 ${therapistName} 已永久删除`);
        fetchTherapists();
        table.resetRowSelection();
      } else {
        toast.error(data.error || "删除失败");
      }
    } catch (error) {
      console.error("删除失败:", error);
      toast.error("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSelectedRows = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    setSubmitting(true);

    try {
      const deletePromises = selectedRows.map((row) =>
        fetch(`/api/admin/therapists/${row.original.id}`, {
          method: "DELETE",
        })
      );

      const results = await Promise.all(deletePromises);
      const successCount = results.filter((r) => r.ok).length;

      if (successCount > 0) {
        toast.success(`成功删除 ${successCount} 位技师`);
        fetchTherapists();
        table.resetRowSelection();
      }
    } catch (error) {
      console.error("批量删除失败:", error);
      toast.error("批量删除失败");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-600">已通过</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-600">待审核</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-600">已拒绝</Badge>;
      case "BANNED":
        return <Badge className="bg-gray-600">已封禁</Badge>;
      default:
        return null;
    }
  };

  // 定义表格列
  const columns: ColumnDef<Therapist>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      size: 28,
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: "头像",
      accessorKey: "photos",
      cell: ({ row }) => {
        const photos = row.original.photos;
        return photos.length > 0 ? (
          <div className="relative w-12 h-12 rounded-lg overflow-hidden">
            <Image src={photos[0].url} alt={row.original.nickname} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500 text-xs">
            无图片
          </div>
        );
      },
      size: 80,
      enableSorting: false,
    },
    {
      header: "昵称",
      accessorKey: "nickname",
      cell: ({ row }) => <div className="font-medium text-white">{row.getValue("nickname")}</div>,
      size: 120,
      filterFn: multiColumnFilterFn,
      enableHiding: false,
    },
    {
      header: "年龄/身高/体重",
      accessorKey: "age",
      cell: ({ row }) => (
        <div className="text-gray-300 text-sm">
          {row.original.age}岁 / {row.original.height}cm / {row.original.weight}kg
        </div>
      ),
      size: 150,
      enableSorting: false,
    },
    {
      header: "城市",
      accessorKey: "city",
      cell: ({ row }) => <div className="text-gray-300">{row.getValue("city")}</div>,
      size: 100,
    },
    {
      header: "手机号",
      accessorKey: "phone",
      cell: ({ row }) => (
        <div className="text-gray-300 font-mono text-sm">{row.getValue("phone")}</div>
      ),
      size: 130,
    },
    {
      header: "状态",
      accessorKey: "status",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
      size: 100,
      filterFn: statusFilterFn,
    },
    {
      header: "标签",
      accessorKey: "isFeatured",
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.isFeatured && <Badge className="bg-yellow-600 text-xs">推荐</Badge>}
          {row.original.isOnline && <Badge className="bg-blue-600 text-xs">在线</Badge>}
          {row.original.isNew && <Badge className="bg-purple-600 text-xs">新人</Badge>}
        </div>
      ),
      size: 120,
      enableSorting: false,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">操作</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/admin/therapists/${row.original.id}/edit`)}
            className="h-8 w-8 p-0 hover:bg-primary-gold/20"
            title="查看/编辑"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleToggleFeatured(row.original.id, row.original.isFeatured)}
            disabled={submitting || row.original.status !== "APPROVED"}
            className={cn(
              "h-8 w-8 p-0",
              row.original.isFeatured ? "text-yellow-500" : "text-gray-400"
            )}
            title={row.original.isFeatured ? "取消推荐" : "设为推荐"}
          >
            <Star className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleToggleBan(row.original.id, row.original.status)}
            disabled={submitting}
            className={cn(
              "h-8 w-8 p-0",
              row.original.status === "BANNED" ? "text-green-500" : "text-red-500"
            )}
            title={row.original.status === "BANNED" ? "解除封禁" : "封禁技师"}
          >
            {row.original.status === "BANNED" ? (
              <UserCheck className="w-4 h-4" />
            ) : (
              <Ban className="w-4 h-4" />
            )}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                disabled={submitting}
                className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/20"
                title="永久删除"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-900 border-gray-700">
              <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
                  aria-hidden="true"
                >
                  <CircleAlert className="opacity-80 text-red-500" size={16} strokeWidth={2} />
                </div>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">确认删除技师？</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    此操作不可撤销。将永久删除技师{" "}
                    <span className="text-white font-semibold">{row.original.nickname}</span>{" "}
                    的所有数据。
                  </AlertDialogDescription>
                </AlertDialogHeader>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-800 text-white border-gray-700">
                  取消
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteTherapist(row.original.id, row.original.nickname)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
      size: 180,
      enableHiding: false,
    },
  ];

  const table = useReactTable({
    data: therapists,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      pagination,
      columnFilters,
    },
  });

  // 获取唯一状态值
  const uniqueStatusValues = useMemo(() => {
    const statusColumn = table.getColumn("status");
    if (!statusColumn) return [];
    const values = Array.from(statusColumn.getFacetedUniqueValues().keys());
    return values.sort();
  }, [table.getColumn("status")?.getFacetedUniqueValues()]);

  // 获取每个状态的数量
  const statusCounts = useMemo(() => {
    const statusColumn = table.getColumn("status");
    if (!statusColumn) return new Map();
    return statusColumn.getFacetedUniqueValues();
  }, [table.getColumn("status")?.getFacetedUniqueValues()]);

  const selectedStatuses = useMemo(() => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[];
    return filterValue ?? [];
  }, [table.getColumn("status")?.getFilterValue()]);

  const handleStatusChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("status")?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table.getColumn("status")?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  const statusLabels: Record<string, string> = {
    APPROVED: "已通过",
    PENDING: "待审核",
    REJECTED: "已拒绝",
    BANNED: "已封禁",
  };

  if (sessionStatus === "loading" || loading) {
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
      <div className="max-w-[1400px] mx-auto space-y-4">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-primary-gold mb-2">技师管理</h1>
              <p className="text-gray-400">共 {table.getFilteredRowModel().rows.length} 位技师</p>
            </div>
          </div>
        </div>

        {/* 筛选栏 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* 搜索框 */}
            <div className="relative">
              <Input
                id={`${id}-input`}
                ref={inputRef}
                className={cn(
                  "peer min-w-60 ps-9 bg-white/5 border-gray-800 text-white placeholder:text-gray-500",
                  Boolean(table.getColumn("nickname")?.getFilterValue()) && "pe-9"
                )}
                value={(table.getColumn("nickname")?.getFilterValue() ?? "") as string}
                onChange={(e) => table.getColumn("nickname")?.setFilterValue(e.target.value)}
                placeholder="搜索昵称、手机号或城市..."
                type="text"
                aria-label="Filter by name, phone or city"
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <ListFilter size={16} strokeWidth={2} aria-hidden="true" />
              </div>
              {Boolean(table.getColumn("nickname")?.getFilterValue()) && (
                <button
                  className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Clear filter"
                  onClick={() => {
                    table.getColumn("nickname")?.setFilterValue("");
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }}
                >
                  <CircleX size={16} strokeWidth={2} aria-hidden="true" />
                </button>
              )}
            </div>
            {/* 状态筛选 */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-gray-700 text-gray-300">
                  <Filter
                    className="-ms-1 me-2 opacity-60"
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  状态
                  {selectedStatuses.length > 0 && (
                    <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                      {selectedStatuses.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-36 p-3 bg-gray-900 border-gray-700" align="start">
                <div className="space-y-3">
                  <div className="text-xs font-medium text-muted-foreground">筛选条件</div>
                  <div className="space-y-3">
                    {uniqueStatusValues.map((value, i) => (
                      <div key={value} className="flex items-center gap-2">
                        <Checkbox
                          id={`${id}-${i}`}
                          checked={selectedStatuses.includes(value)}
                          onCheckedChange={(checked: boolean) => handleStatusChange(checked, value)}
                        />
                        <Label
                          htmlFor={`${id}-${i}`}
                          className="flex grow justify-between gap-2 font-normal text-white cursor-pointer"
                        >
                          {statusLabels[value] || value}{" "}
                          <span className="ms-2 text-xs text-muted-foreground">
                            {statusCounts.get(value)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-3">
            {/* 批量删除按钮 */}
            {table.getSelectedRowModel().rows.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="ml-auto"
                    variant="outline"
                    className="border-red-700 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2
                      className="-ms-1 me-2 opacity-60"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    删除
                    <span className="-me-1 ms-3 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                      {table.getSelectedRowModel().rows.length}
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border-gray-700">
                  <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
                      aria-hidden="true"
                    >
                      <CircleAlert className="opacity-80 text-red-500" size={16} strokeWidth={2} />
                    </div>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">确认批量删除？</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        此操作不可撤销。将永久删除 {table.getSelectedRowModel().rows.length}{" "}
                        位已选择的技师。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-800 text-white border-gray-700">
                      取消
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteSelectedRows}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* 表格 */}
        <div className="overflow-hidden rounded-lg border border-gray-800 bg-white/5 backdrop-blur-sm">
          <Table className="table-fixed">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-gray-800">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        style={{ width: `${header.getSize()}px` }}
                        className="h-11 text-gray-300"
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <div
                            className={cn(
                              header.column.getCanSort() &&
                                "flex h-full cursor-pointer select-none items-center justify-between gap-2"
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                            onKeyDown={(e) => {
                              if (
                                header.column.getCanSort() &&
                                (e.key === "Enter" || e.key === " ")
                              ) {
                                e.preventDefault();
                                header.column.getToggleSortingHandler()?.(e);
                              }
                            }}
                            tabIndex={header.column.getCanSort() ? 0 : undefined}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: (
                                <ChevronUp
                                  className="shrink-0 opacity-60"
                                  size={16}
                                  strokeWidth={2}
                                  aria-hidden="true"
                                />
                              ),
                              desc: (
                                <ChevronDown
                                  className="shrink-0 opacity-60"
                                  size={16}
                                  strokeWidth={2}
                                  aria-hidden="true"
                                />
                              ),
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-gray-800"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-gray-400">
                    没有找到技师
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* 分页 */}
        <div className="flex items-center justify-between gap-8">
          {/* 每页显示数量 */}
          <div className="flex items-center gap-3">
            <Label htmlFor={id} className="max-sm:sr-only text-gray-300">
              每页显示
            </Label>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger
                id={id}
                className="w-fit whitespace-nowrap bg-white/5 border-gray-800 text-white"
              >
                <SelectValue placeholder="Select number of results" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
                {[10, 20, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()} className="text-white">
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* 页码信息 */}
          <div className="flex grow justify-end whitespace-nowrap text-sm text-muted-foreground">
            <p className="whitespace-nowrap text-sm text-gray-400" aria-live="polite">
              <span className="text-white">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
                {Math.min(
                  Math.max(
                    table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                      table.getState().pagination.pageSize,
                    0
                  ),
                  table.getRowCount()
                )}
              </span>{" "}
              共 <span className="text-white">{table.getRowCount().toString()}</span> 条
            </p>
          </div>
          {/* 分页按钮 */}
          <div>
            <Pagination>
              <PaginationContent>
                {/* 第一页 */}
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50 border-gray-700 text-gray-300"
                    onClick={() => table.firstPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Go to first page"
                  >
                    <ChevronFirst size={16} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                {/* 上一页 */}
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50 border-gray-700 text-gray-300"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Go to previous page"
                  >
                    <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                {/* 下一页 */}
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50 border-gray-700 text-gray-300"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Go to next page"
                  >
                    <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                {/* 最后一页 */}
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    className="disabled:pointer-events-none disabled:opacity-50 border-gray-700 text-gray-300"
                    onClick={() => table.lastPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Go to last page"
                  >
                    <ChevronLast size={16} strokeWidth={2} aria-hidden="true" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
