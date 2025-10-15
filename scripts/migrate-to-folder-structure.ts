/**
 * 数据迁移脚本：将现有技师照片和视频迁移到新的文件夹结构
 * 执行命令: npx tsx scripts/migrate-to-folder-structure.ts
 */

import { PrismaClient } from "@prisma/client";
import { join } from "path";
import { readdir, stat, copyFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { generateTherapistFolder } from "../src/lib/folder-manager";

const prisma = new PrismaClient();

interface MigrationStats {
  therapistsProcessed: number;
  photosUpdated: number;
  videosUpdated: number;
  filesMoved: number;
  errors: string[];
}

async function migrateTherapistFiles() {
  const stats: MigrationStats = {
    therapistsProcessed: 0,
    photosUpdated: 0,
    videosUpdated: 0,
    filesMoved: 0,
    errors: [],
  };

  console.log("🚀 开始迁移技师文件到新的文件夹结构...\n");

  try {
    // 获取所有技师
    const therapists = await prisma.therapist.findMany({
      select: {
        id: true,
        nickname: true,
        photos: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            mediumUrl: true,
            largeUrl: true,
            videoUrl: true,
            coverUrl: true,
            isVideo: true,
          },
        },
      },
    });

    console.log(`📊 找到 ${therapists.length} 个技师需要处理\n`);

    for (const therapist of therapists) {
      console.log(`👤 处理技师: ${therapist.nickname} (${therapist.id})`);

      try {
        await migrateTherapistFolder(therapist, stats);
        stats.therapistsProcessed++;
        console.log(`✅ 技师 ${therapist.nickname} 处理完成\n`);
      } catch (error) {
        const errorMsg = `❌ 处理技师 ${therapist.nickname} 失败: ${error}`;
        console.error(errorMsg);
        stats.errors.push(errorMsg);
      }
    }
  } catch (error) {
    console.error("❌ 迁移过程中发生错误:", error);
    stats.errors.push(`迁移过程错误: ${error}`);
  } finally {
    await prisma.$disconnect();
  }

  // 输出统计信息
  console.log("\n📈 迁移统计:");
  console.log(`技师处理数量: ${stats.therapistsProcessed}`);
  console.log(`照片更新数量: ${stats.photosUpdated}`);
  console.log(`视频更新数量: ${stats.videosUpdated}`);
  console.log(`文件移动数量: ${stats.filesMoved}`);
  console.log(`错误数量: ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log("\n❌ 错误详情:");
    stats.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  console.log("\n🎉 迁移完成！");
}

async function migrateTherapistFolder(
  therapist: { id: string; nickname: string; photos: any[] },
  stats: MigrationStats
) {
  if (therapist.photos.length === 0) {
    console.log(`  ℹ️ 技师 ${therapist.nickname} 没有照片/视频，跳过`);
    return;
  }

  // 生成新的文件夹名称
  const newFolderName = generateTherapistFolder(therapist.id, therapist.nickname);

  // 创建新的文件夹路径
  const photosBaseDir = join(process.cwd(), "public", "uploads", "therapist-photos");
  const videosBaseDir = join(process.cwd(), "public", "uploads", "therapist-videos");

  const newPhotosDir = join(photosBaseDir, newFolderName);
  const newVideosDir = join(videosBaseDir, newFolderName);

  // 确保新文件夹存在
  if (!existsSync(newPhotosDir)) {
    await mkdir(newPhotosDir, { recursive: true });
    console.log(`  📁 创建照片文件夹: ${newFolderName}`);
  }

  if (!existsSync(newVideosDir)) {
    await mkdir(newVideosDir, { recursive: true });
    console.log(`  📁 创建视频文件夹: ${newFolderName}`);
  }

  // 处理每个照片/视频
  for (const photo of therapist.photos) {
    try {
      await migratePhotoFiles(photo, newFolderName, photosBaseDir, videosBaseDir, stats);
    } catch (error) {
      const errorMsg = `迁移文件失败 ${photo.id}: ${error}`;
      console.error(`  ❌ ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }
}

async function migratePhotoFiles(
  photo: any,
  newFolderName: string,
  photosBaseDir: string,
  videosBaseDir: string,
  stats: MigrationStats
) {
  const updates: any = {};
  const isVideo = photo.isVideo;
  const baseDir = isVideo ? videosBaseDir : photosBaseDir;
  const urlPrefix = isVideo ? "/uploads/therapist-videos" : "/uploads/therapist-photos";

  // 需要处理的文件URL列表
  const fileUrls = [
    { field: "url", url: photo.url },
    { field: "thumbnailUrl", url: photo.thumbnailUrl },
    { field: "mediumUrl", url: photo.mediumUrl },
    { field: "largeUrl", url: photo.largeUrl },
    { field: "videoUrl", url: photo.videoUrl },
    { field: "coverUrl", url: photo.coverUrl },
  ].filter((item) => item.url); // 过滤掉空值

  for (const { field, url } of fileUrls) {
    try {
      const fileName = url.split("/").pop(); // 获取文件名
      if (!fileName) continue;

      const oldFilePath = join(process.cwd(), "public", url);
      const newFilePath = join(baseDir, newFolderName, fileName);
      const newUrl = `${urlPrefix}/${newFolderName}/${fileName}`;

      // 检查旧文件是否存在
      if (existsSync(oldFilePath)) {
        // 如果新位置不存在相同文件，则移动
        if (!existsSync(newFilePath)) {
          await copyFile(oldFilePath, newFilePath);
          await unlink(oldFilePath);
          stats.filesMoved++;
          console.log(`    📦 移动文件: ${fileName}`);
        } else {
          // 文件已存在，删除旧文件
          await unlink(oldFilePath);
          console.log(`    🔄 删除重复文件: ${fileName}`);
        }
      }

      // 更新URL
      updates[field] = newUrl;
    } catch (error) {
      console.error(`    ❌ 处理文件失败 ${field}: ${error}`);
    }
  }

  // 更新数据库记录
  if (Object.keys(updates).length > 0) {
    await prisma.therapistPhoto.update({
      where: { id: photo.id },
      data: updates,
    });

    if (isVideo) {
      stats.videosUpdated++;
    } else {
      stats.photosUpdated++;
    }

    console.log(`    ✅ 更新数据库记录: ${photo.id}`);
  }
}

// 执行迁移
if (require.main === module) {
  migrateTherapistFiles().catch(console.error);
}

export { migrateTherapistFiles };
