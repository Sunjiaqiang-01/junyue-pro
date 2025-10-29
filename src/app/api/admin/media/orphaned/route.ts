import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import * as fs from "fs/promises";
import * as path from "path";

interface OrphanedFile {
  path: string;
  relativePath: string;
  type: "therapist-photo" | "therapist-video" | "customer-service-qr";
  size: number;
  sizeFormatted: string;
  createdAt: Date;
  reason: string;
}

// 格式化字节大小
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// 异步递归获取目录中的所有文件（优化版）
async function* getAllFilesAsync(dirPath: string): AsyncGenerator<string> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        yield* getAllFilesAsync(fullPath);
      } else {
        yield fullPath;
      }
    }
  } catch (error) {
    console.error(`读取目录失败 ${dirPath}:`, error);
  }
}

export async function GET() {
  try {
    // 验证管理员权限
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "无权限访问" }, { status: 401 });
    }

    const uploadsPath = path.join(process.cwd(), "public", "uploads");
    const orphanedFiles: OrphanedFile[] = [];

    // 1. 检查技师照片孤立文件
    const therapistPhotosPath = path.join(uploadsPath, "therapist-photos");

    // 获取数据库中所有技师照片的URL
    const therapistPhotosInDB = await prisma.therapistPhoto.findMany({
      select: { url: true, largeUrl: true, mediumUrl: true, thumbnailUrl: true, videoUrl: true },
    });

    const photoUrlsInDB = new Set<string>();
    therapistPhotosInDB.forEach((photo) => {
      if (photo.url) photoUrlsInDB.add(photo.url);
      if (photo.largeUrl) photoUrlsInDB.add(photo.largeUrl);
      if (photo.mediumUrl) photoUrlsInDB.add(photo.mediumUrl);
      if (photo.thumbnailUrl) photoUrlsInDB.add(photo.thumbnailUrl);
      if (photo.videoUrl) photoUrlsInDB.add(photo.videoUrl);
    });

    // 使用异步迭代器扫描文件
    for await (const filePath of getAllFilesAsync(therapistPhotosPath)) {
      const relativePath = `/uploads/${path.relative(uploadsPath, filePath)}`;
      const stats = await fs.stat(filePath);

      // 检查文件是否在数据库中
      if (!photoUrlsInDB.has(relativePath)) {
        orphanedFiles.push({
          path: filePath,
          relativePath,
          type: "therapist-photo",
          size: stats.size,
          sizeFormatted: formatBytes(stats.size),
          createdAt: stats.birthtime,
          reason: "数据库中无对应记录",
        });
      }
    }

    // 2. 检查技师视频孤立文件
    const therapistVideosPath = path.join(uploadsPath, "therapist-videos");

    const therapistVideosInDB = await prisma.therapistVideo.findMany({
      select: { url: true, coverUrl: true },
    });

    const videoUrlsInDB = new Set<string>();
    therapistVideosInDB.forEach((video) => {
      if (video.url) videoUrlsInDB.add(video.url);
      if (video.coverUrl) videoUrlsInDB.add(video.coverUrl);
    });

    for await (const filePath of getAllFilesAsync(therapistVideosPath)) {
      const relativePath = `/uploads/${path.relative(uploadsPath, filePath)}`;
      const stats = await fs.stat(filePath);

      if (!videoUrlsInDB.has(relativePath)) {
        orphanedFiles.push({
          path: filePath,
          relativePath,
          type: "therapist-video",
          size: stats.size,
          sizeFormatted: formatBytes(stats.size),
          createdAt: stats.birthtime,
          reason: "数据库中无对应记录",
        });
      }
    }

    // 3. 检查客服二维码孤立文件
    const customerServiceQRPath = path.join(uploadsPath, "customer-service-qr");

    const customerServicesInDB = await prisma.customerService.findMany({
      select: { wechatQrCode: true },
    });

    const qrUrlsInDB = new Set<string>();
    customerServicesInDB.forEach((cs) => {
      if (cs.wechatQrCode) qrUrlsInDB.add(cs.wechatQrCode);
    });

    for await (const filePath of getAllFilesAsync(customerServiceQRPath)) {
      const relativePath = `/uploads/${path.relative(uploadsPath, filePath)}`;
      const stats = await fs.stat(filePath);

      if (!qrUrlsInDB.has(relativePath)) {
        orphanedFiles.push({
          path: filePath,
          relativePath,
          type: "customer-service-qr",
          size: stats.size,
          sizeFormatted: formatBytes(stats.size),
          createdAt: stats.birthtime,
          reason: "数据库中无对应记录",
        });
      }
    }

    // 按大小降序排序
    orphanedFiles.sort((a, b) => b.size - a.size);

    // 计算总大小
    const totalSize = orphanedFiles.reduce((sum, file) => sum + file.size, 0);

    return NextResponse.json({
      success: true,
      data: {
        files: orphanedFiles,
        summary: {
          totalCount: orphanedFiles.length,
          totalSize,
          totalSizeFormatted: formatBytes(totalSize),
          byType: {
            therapistPhoto: orphanedFiles.filter((f) => f.type === "therapist-photo").length,
            therapistVideo: orphanedFiles.filter((f) => f.type === "therapist-video").length,
            customerServiceQR: orphanedFiles.filter((f) => f.type === "customer-service-qr").length,
          },
        },
      },
    });
  } catch (error) {
    console.error("检测孤立文件失败:", error);
    return NextResponse.json({ success: false, error: "检测孤立文件失败" }, { status: 500 });
  }
}
