/**
 * 技师文件夹管理工具
 * 处理技师照片和视频的文件夹命名、重命名和迁移
 */

import { join } from "path";
import { mkdir, readdir, rename, stat, copyFile, unlink, rmdir } from "fs/promises";
import { existsSync } from "fs";
import prisma from "@/lib/prisma";

/**
 * 生成技师文件夹名称
 * 格式: {therapistId}_{sanitized_nickname}
 */
export function generateTherapistFolder(therapistId: string, nickname: string): string {
  // 清理昵称中的特殊字符
  const sanitized = nickname
    .replace(/[<>:"|?*\\]/g, "_") // 清理Windows不支持的特殊字符
    .replace(/\s+/g, "_") // 空格转下划线
    .replace(/\//g, "_") // 斜杠转下划线
    .substring(0, 20); // 长度限制20字符

  return `${therapistId}_${sanitized}`;
}

/**
 * 确保技师文件夹存在
 */
export async function ensureTherapistFolder(
  baseDir: string,
  therapistId: string,
  nickname: string
): Promise<string> {
  const folderName = generateTherapistFolder(therapistId, nickname);
  const folderPath = join(baseDir, folderName);

  try {
    if (!existsSync(folderPath)) {
      await mkdir(folderPath, { recursive: true });
      console.log(`✅ 创建技师文件夹: ${folderPath}`);
    }
    return folderName;
  } catch (error) {
    console.error(`❌ 创建文件夹失败: ${folderPath}`, error);
    throw new Error(`创建技师文件夹失败: ${error}`);
  }
}

/**
 * 获取技师当前文件夹名称
 */
export async function getCurrentTherapistFolder(
  baseDir: string,
  therapistId: string
): Promise<string | null> {
  try {
    const items = await readdir(baseDir);

    // 查找以技师ID开头的文件夹
    let folder: string | undefined;
    for (const item of items) {
      if (item.startsWith(`${therapistId}_`) && existsSync(join(baseDir, item))) {
        const itemPath = join(baseDir, item);
        const itemStat = await stat(itemPath);
        if (itemStat.isDirectory()) {
          folder = item;
          break;
        }
      }
    }

    return folder || null;
  } catch (error) {
    console.error(`❌ 查找技师文件夹失败: ${therapistId}`, error);
    return null;
  }
}

/**
 * 迁移文件到新文件夹
 */
export async function migrateFiles(
  sourcePath: string,
  targetPath: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const result = { success: 0, failed: 0, errors: [] as string[] };

  try {
    // 确保目标文件夹存在
    await mkdir(targetPath, { recursive: true });

    // 获取源文件夹中的所有文件
    const files = await readdir(sourcePath);

    for (const file of files) {
      const sourceFile = join(sourcePath, file);
      const targetFile = join(targetPath, file);

      try {
        // 检查是否为文件
        const stats = await stat(sourceFile);
        if (stats.isFile()) {
          // 复制文件到新位置
          await copyFile(sourceFile, targetFile);

          // 验证复制成功后删除原文件
          if (existsSync(targetFile)) {
            await unlink(sourceFile);
            result.success++;
            console.log(`✅ 迁移文件: ${file}`);
          } else {
            throw new Error("文件复制验证失败");
          }
        }
      } catch (error) {
        result.failed++;
        const errorMsg = `迁移文件失败 ${file}: ${error}`;
        result.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    // 如果所有文件都迁移成功，删除空的源文件夹
    if (result.failed === 0 && files.length > 0) {
      try {
        const remainingFiles = await readdir(sourcePath);
        if (remainingFiles.length === 0) {
          await rmdir(sourcePath);
          console.log(`✅ 删除空文件夹: ${sourcePath}`);
        }
      } catch (error) {
        console.warn(`⚠️ 删除空文件夹失败: ${sourcePath}`, error);
      }
    }
  } catch (error) {
    result.errors.push(`文件夹迁移失败: ${error}`);
    console.error(`❌ 文件夹迁移失败:`, error);
  }

  return result;
}

/**
 * 更新数据库中的文件路径
 */
export async function updateDatabasePaths(
  therapistId: string,
  oldFolderName: string,
  newFolderName: string,
  fileType: "photos" | "videos" = "photos"
): Promise<{ updated: number; errors: string[] }> {
  const result = { updated: 0, errors: [] as string[] };

  try {
    if (fileType === "photos") {
      // 更新照片路径
      const photos = await prisma.therapistPhoto.findMany({
        where: { therapistId },
      });

      for (const photo of photos) {
        try {
          const updates: any = {};

          // 更新各种尺寸的URL
          if (photo.url?.includes(oldFolderName)) {
            updates.url = photo.url.replace(oldFolderName, newFolderName);
          }
          if (photo.thumbnailUrl?.includes(oldFolderName)) {
            updates.thumbnailUrl = photo.thumbnailUrl.replace(oldFolderName, newFolderName);
          }
          if (photo.mediumUrl?.includes(oldFolderName)) {
            updates.mediumUrl = photo.mediumUrl.replace(oldFolderName, newFolderName);
          }
          if (photo.largeUrl?.includes(oldFolderName)) {
            updates.largeUrl = photo.largeUrl.replace(oldFolderName, newFolderName);
          }
          if (photo.videoUrl?.includes(oldFolderName)) {
            updates.videoUrl = photo.videoUrl.replace(oldFolderName, newFolderName);
          }
          if (photo.coverUrl?.includes(oldFolderName)) {
            updates.coverUrl = photo.coverUrl.replace(oldFolderName, newFolderName);
          }

          if (Object.keys(updates).length > 0) {
            await prisma.therapistPhoto.update({
              where: { id: photo.id },
              data: updates,
            });
            result.updated++;
          }
        } catch (error) {
          result.errors.push(`更新照片路径失败 ${photo.id}: ${error}`);
        }
      }
    }

    console.log(`✅ 更新了 ${result.updated} 条数据库记录`);
  } catch (error) {
    result.errors.push(`数据库更新失败: ${error}`);
    console.error(`❌ 数据库更新失败:`, error);
  }

  return result;
}

/**
 * 重命名技师文件夹（完整流程）
 */
export async function renameTherapistFolder(
  baseDir: string,
  therapistId: string,
  newNickname: string
): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    // 1. 获取当前文件夹
    const currentFolder = await getCurrentTherapistFolder(baseDir, therapistId);
    if (!currentFolder) {
      return {
        success: false,
        message: "未找到技师文件夹",
      };
    }

    // 2. 生成新文件夹名
    const newFolder = generateTherapistFolder(therapistId, newNickname);
    if (currentFolder === newFolder) {
      return {
        success: true,
        message: "文件夹名称无需更改",
      };
    }

    const currentPath = join(baseDir, currentFolder);
    const newPath = join(baseDir, newFolder);

    // 3. 检查新文件夹是否已存在
    if (existsSync(newPath)) {
      return {
        success: false,
        message: "目标文件夹已存在",
      };
    }

    // 4. 迁移文件
    console.log(`🔄 开始迁移文件夹: ${currentFolder} → ${newFolder}`);
    const migrationResult = await migrateFiles(currentPath, newPath);

    // 5. 更新数据库路径
    const dbResult = await updateDatabasePaths(
      therapistId,
      currentFolder,
      newFolder,
      baseDir.includes("photos") ? "photos" : "videos"
    );

    const allErrors = [...migrationResult.errors, ...dbResult.errors];

    if (migrationResult.failed === 0 && allErrors.length === 0) {
      return {
        success: true,
        message: "文件夹重命名成功",
        details: {
          filesUpdated: migrationResult.success,
          dbRecordsUpdated: dbResult.updated,
          oldFolder: currentFolder,
          newFolder: newFolder,
        },
      };
    } else {
      return {
        success: false,
        message: "文件夹重命名部分失败",
        details: {
          filesUpdated: migrationResult.success,
          filesFailed: migrationResult.failed,
          dbRecordsUpdated: dbResult.updated,
          errors: allErrors,
        },
      };
    }
  } catch (error) {
    console.error(`❌ 重命名技师文件夹失败:`, error);
    return {
      success: false,
      message: `重命名失败: ${error}`,
    };
  }
}

/**
 * 获取技师文件夹路径信息
 */
export function getTherapistFolderPaths(therapistId: string, nickname: string) {
  const folderName = generateTherapistFolder(therapistId, nickname);

  return {
    folderName,
    photosPath: join(process.cwd(), "public", "uploads", "therapist-photos", folderName),
    videosPath: join(process.cwd(), "public", "uploads", "therapist-videos", folderName),
    photosUrl: `/uploads/therapist-photos/${folderName}`,
    videosUrl: `/uploads/therapist-videos/${folderName}`,
  };
}

/**
 * 递归删除文件夹及其所有内容
 */
export async function deleteFolderRecursive(folderPath: string): Promise<void> {
  if (!existsSync(folderPath)) {
    return; // 文件夹不存在，直接返回
  }

  try {
    const items = await readdir(folderPath);

    // 删除文件夹中的所有内容
    for (const item of items) {
      const itemPath = join(folderPath, item);
      const itemStat = await stat(itemPath);

      if (itemStat.isDirectory()) {
        // 递归删除子文件夹
        await deleteFolderRecursive(itemPath);
      } else {
        // 删除文件
        await unlink(itemPath);
      }
    }

    // 删除空文件夹
    await rmdir(folderPath);
    console.log(`✅ 已删除文件夹: ${folderPath}`);
  } catch (error) {
    console.error(`❌ 删除文件夹失败: ${folderPath}`, error);
    throw error;
  }
}

/**
 * 删除技师的所有媒体文件夹
 * @param therapistId 技师ID
 * @returns 删除结果
 */
export async function deleteTherapistFolders(
  therapistId: string
): Promise<{ success: boolean; deletedFolders: string[]; errors: string[] }> {
  const result = {
    success: true,
    deletedFolders: [] as string[],
    errors: [] as string[],
  };

  const baseDirs = [
    { type: "photos", path: join(process.cwd(), "public", "uploads", "therapist-photos") },
    { type: "videos", path: join(process.cwd(), "public", "uploads", "therapist-videos") },
  ];

  for (const { type, path: baseDir } of baseDirs) {
    try {
      // 查找技师文件夹
      const folderName = await getCurrentTherapistFolder(baseDir, therapistId);

      if (folderName) {
        const folderPath = join(baseDir, folderName);

        try {
          await deleteFolderRecursive(folderPath);
          result.deletedFolders.push(`${type}: ${folderName}`);
          console.log(`✅ 已删除技师${type}文件夹: ${folderName}`);
        } catch (error) {
          const errorMsg = `删除${type}文件夹失败: ${error}`;
          result.errors.push(errorMsg);
          result.success = false;
          console.error(`❌ ${errorMsg}`);
        }
      } else {
        console.log(`ℹ️ 未找到技师${type}文件夹: ${therapistId}`);
      }
    } catch (error) {
      const errorMsg = `查找技师${type}文件夹失败: ${error}`;
      result.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  return result;
}
