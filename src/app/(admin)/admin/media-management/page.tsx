"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  HardDrive,
  Image,
  Video,
  QrCode,
  Trash2,
  RefreshCw,
  CheckCircle,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface MediaStats {
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercent: string;
    totalFormatted: string;
    usedFormatted: string;
    freeFormatted: string;
  } | null;
  media: {
    therapistPhotos: {
      fileCount: number;
      dbCount: number;
      size: number;
      sizeFormatted: string;
      orphaned: number;
    };
    therapistVideos: {
      fileCount: number;
      dbCount: number;
      size: number;
      sizeFormatted: string;
      orphaned: number;
    };
    customerServiceQR: {
      fileCount: number;
      dbCount: number;
      size: number;
      sizeFormatted: string;
      orphaned: number;
    };
    total: {
      fileCount: number;
      size: number;
      sizeFormatted: string;
    };
  };
}

interface OrphanedFile {
  path: string;
  relativePath: string;
  type: string;
  size: number;
  sizeFormatted: string;
  createdAt: string;
  reason: string;
}

export default function MediaManagementPage() {
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [orphanedFiles, setOrphanedFiles] = useState<OrphanedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // 加载存储统计
  const loadStats = async () => {
    try {
      const res = await fetch("/api/admin/media/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch {
      toast.error("加载存储统计失败");
    } finally {
      setLoading(false);
    }
  };

  // 扫描孤立文件
  const scanOrphanedFiles = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/admin/media/orphaned");
      const data = await res.json();
      if (data.success) {
        setOrphanedFiles(data.data.files);
        toast.success(`扫描完成，发现 ${data.data.summary.totalCount} 个孤立文件`);
      }
    } catch {
      toast.error("扫描孤立文件失败");
    } finally {
      setScanning(false);
    }
  };

  // 清理文件
  const cleanupFiles = async (dryRun = false) => {
    if (selectedFiles.length === 0) {
      toast.error("请先选择要删除的文件");
      return;
    }

    if (!dryRun && !confirm(`确定要删除 ${selectedFiles.length} 个文件吗？此操作不可恢复！`)) {
      return;
    }

    setCleaning(true);
    try {
      const res = await fetch("/api/admin/media/cleanup", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths: selectedFiles, dryRun }),
      });
      const data = await res.json();

      if (data.success) {
        if (dryRun) {
          toast.success(
            `[预览] 将删除 ${data.data.deleted} 个文件，释放 ${data.data.freedFormatted}`
          );
        } else {
          toast.success(`成功删除 ${data.data.deleted} 个文件，释放 ${data.data.freedFormatted}`);
          setSelectedFiles([]);
          // 重新加载数据
          await loadStats();
          await scanOrphanedFiles();
        }
      }
    } catch {
      toast.error("清理失败");
    } finally {
      setCleaning(false);
    }
  };

  useEffect(() => {
    loadStats();
    scanOrphanedFiles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-pure-black">
        <Loader2 className="w-8 h-8 animate-spin text-primary-cyan" />
      </div>
    );
  }

  const diskUsage = stats?.disk ? parseFloat(stats.disk.usagePercent) : 0;

  return (
    <div className="min-h-screen bg-pure-black p-4 md:p-8 pt-24 md:pt-28">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-pure-white mb-2">媒体资源管理</h1>
            <p className="text-secondary/60">监控存储空间，清理无用文件</p>
          </div>
          <Button
            onClick={() => {
              loadStats();
              scanOrphanedFiles();
            }}
            disabled={scanning}
            className="bg-primary-cyan hover:bg-primary-cyan/90 text-pure-black font-semibold"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${scanning ? "animate-spin" : ""}`} />
            刷新数据
          </Button>
        </div>

        {/* 存储空间概览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-pure-white">磁盘使用率</CardTitle>
              <HardDrive className="w-4 h-4 text-primary-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pure-white">{diskUsage}%</div>
              <div className="text-xs text-secondary/60 mt-1">
                {stats?.disk?.usedFormatted} / {stats?.disk?.totalFormatted}
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${
                    diskUsage > 80
                      ? "bg-red-500"
                      : diskUsage > 60
                        ? "bg-yellow-500"
                        : "bg-primary-cyan"
                  }`}
                  style={{ width: `${Math.min(diskUsage, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-pure-white">技师照片</CardTitle>
              <Image className="w-4 h-4 text-primary-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pure-white">
                {stats?.media.therapistPhotos.fileCount}
              </div>
              <div className="text-xs text-secondary/60 mt-1">
                {stats?.media.therapistPhotos.sizeFormatted}
              </div>
              {stats?.media.therapistPhotos.orphaned! > 0 && (
                <Badge variant="destructive" className="mt-2">
                  {stats?.media.therapistPhotos.orphaned} 个孤立
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-pure-white">技师视频</CardTitle>
              <Video className="w-4 h-4 text-primary-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pure-white">
                {stats?.media.therapistVideos.fileCount}
              </div>
              <div className="text-xs text-secondary/60 mt-1">
                {stats?.media.therapistVideos.sizeFormatted}
              </div>
              {stats?.media.therapistVideos.orphaned! > 0 && (
                <Badge variant="destructive" className="mt-2">
                  {stats?.media.therapistVideos.orphaned} 个孤立
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-pure-white">客服二维码</CardTitle>
              <QrCode className="w-4 h-4 text-primary-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pure-white">
                {stats?.media.customerServiceQR.fileCount}
              </div>
              <div className="text-xs text-secondary/60 mt-1">
                {stats?.media.customerServiceQR.sizeFormatted}
              </div>
              {stats?.media.customerServiceQR.orphaned! > 0 && (
                <Badge variant="destructive" className="mt-2">
                  {stats?.media.customerServiceQR.orphaned} 个孤立
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 孤立文件列表 */}
        <Card className="bg-white/5 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-pure-white">孤立文件</CardTitle>
                <CardDescription className="text-secondary/60">
                  这些文件在数据库中没有对应记录，可以安全删除
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {selectedFiles.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => cleanupFiles(true)}
                      disabled={cleaning}
                    >
                      预览删除
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => cleanupFiles(false)}
                      disabled={cleaning}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除 ({selectedFiles.length})
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {orphanedFiles.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>太棒了！没有发现孤立文件。</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedFiles(
                        selectedFiles.length === orphanedFiles.length
                          ? []
                          : orphanedFiles.map((f) => f.path)
                      )
                    }
                  >
                    {selectedFiles.length === orphanedFiles.length ? "取消全选" : "全选"}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    共 {orphanedFiles.length} 个文件
                  </span>
                </div>

                <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                  {orphanedFiles.map((file) => (
                    <div
                      key={file.path}
                      className="p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer"
                      onClick={() =>
                        setSelectedFiles((prev) =>
                          prev.includes(file.path)
                            ? prev.filter((p) => p !== file.path)
                            : [...prev, file.path]
                        )
                      }
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.path)}
                          onChange={() => {}}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{file.relativePath}</div>
                          <div className="text-sm text-muted-foreground">{file.reason}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{file.type}</Badge>
                        <span className="text-sm text-muted-foreground">{file.sizeFormatted}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
