import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// 递归获取目录大小和文件数量
async function getDirectoryStats(dirPath: string): Promise<{ size: number; count: number }> {
  let totalSize = 0;
  let fileCount = 0;

  try {
    if (!fs.existsSync(dirPath)) {
      return { size: 0, count: 0 };
    }

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        const subDirStats = await getDirectoryStats(filePath);
        totalSize += subDirStats.size;
        fileCount += subDirStats.count;
      } else {
        totalSize += stats.size;
        fileCount++;
      }
    }
  } catch (error) {
    console.error(`获取目录统计失败 ${dirPath}:`, error);
  }

  return { size: totalSize, count: fileCount };
}

// 获取磁盘使用情况（Linux）
function getDiskUsage(dirPath: string): { total: number; used: number; free: number } | null {
  try {
    // 使用 df 命令获取磁盘使用情况
    const output = execSync(`df -B1 ${dirPath} | tail -1`).toString();
    const parts = output.trim().split(/\s+/);

    // df 输出格式: Filesystem 1B-blocks Used Available Use% Mounted on
    const total = parseInt(parts[1] || "0");
    const used = parseInt(parts[2] || "0");
    const free = parseInt(parts[3] || "0");

    return { total, used, free };
  } catch (error) {
    console.error("获取磁盘使用情况失败:", error);
    return null;
  }
}

// 格式化字节大小
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export async function GET() {
  try {
    // 验证管理员权限
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "无权限访问" }, { status: 401 });
    }

    const uploadsPath = path.join(process.cwd(), "public", "uploads");

    // 1. 获取磁盘使用情况
    const diskUsage = getDiskUsage(uploadsPath);

    // 2. 获取各类媒体文件统计
    const [therapistPhotosStats, therapistVideosStats, customerServiceQRStats] = await Promise.all([
      getDirectoryStats(path.join(uploadsPath, "therapist-photos")),
      getDirectoryStats(path.join(uploadsPath, "therapist-videos")),
      getDirectoryStats(path.join(uploadsPath, "customer-service-qr")),
    ]);

    // 3. 从数据库获取技师和客服数量
    const [therapistCount, customerServiceCount, therapistPhotoCount, therapistVideoCount] =
      await Promise.all([
        prisma.therapist.count(),
        prisma.customerService.count(),
        prisma.therapistPhoto.count(),
        prisma.therapistVideo.count(),
      ]);

    // 4. 计算总计
    const totalMediaSize =
      therapistPhotosStats.size + therapistVideosStats.size + customerServiceQRStats.size;
    const totalMediaCount =
      therapistPhotosStats.count + therapistVideosStats.count + customerServiceQRStats.count;

    return NextResponse.json({
      success: true,
      data: {
        // 磁盘使用情况
        disk: diskUsage
          ? {
              total: diskUsage.total,
              used: diskUsage.used,
              free: diskUsage.free,
              usagePercent: ((diskUsage.used / diskUsage.total) * 100).toFixed(2),
              totalFormatted: formatBytes(diskUsage.total),
              usedFormatted: formatBytes(diskUsage.used),
              freeFormatted: formatBytes(diskUsage.free),
            }
          : null,

        // 媒体文件统计
        media: {
          therapistPhotos: {
            fileCount: therapistPhotosStats.count,
            dbCount: therapistPhotoCount,
            size: therapistPhotosStats.size,
            sizeFormatted: formatBytes(therapistPhotosStats.size),
            orphaned: therapistPhotosStats.count - therapistPhotoCount, // 可能的孤立文件
          },
          therapistVideos: {
            fileCount: therapistVideosStats.count,
            dbCount: therapistVideoCount,
            size: therapistVideosStats.size,
            sizeFormatted: formatBytes(therapistVideosStats.size),
            orphaned: therapistVideosStats.count - therapistVideoCount,
          },
          customerServiceQR: {
            fileCount: customerServiceQRStats.count,
            dbCount: customerServiceCount,
            size: customerServiceQRStats.size,
            sizeFormatted: formatBytes(customerServiceQRStats.size),
            orphaned: customerServiceQRStats.count - customerServiceCount,
          },
          total: {
            fileCount: totalMediaCount,
            size: totalMediaSize,
            sizeFormatted: formatBytes(totalMediaSize),
          },
        },

        // 数据库统计
        database: {
          therapistCount,
          customerServiceCount,
          therapistPhotoCount,
          therapistVideoCount,
        },
      },
    });
  } catch (error) {
    console.error("获取媒体统计失败:", error);
    return NextResponse.json({ success: false, error: "获取媒体统计失败" }, { status: 500 });
  }
}
