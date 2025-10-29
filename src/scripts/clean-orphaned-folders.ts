/**
 * 清理孤儿文件夹脚本
 * 删除已不存在于数据库中的技师媒体文件夹
 *
 * 使用方法：
 * npx tsx src/scripts/clean-orphaned-folders.ts
 */

import { join } from "path";
import { readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import { PrismaClient } from "@prisma/client";
// import { deleteTherapistFolders } from "@/lib/folder-manager";

const prisma = new PrismaClient();

async function cleanOrphanedFolders() {
  console.log("🔍 开始扫描孤儿文件夹...\n");

  const baseDirs = [
    { type: "photos", path: join(process.cwd(), "public", "uploads", "therapist-photos") },
    { type: "videos", path: join(process.cwd(), "public", "uploads", "therapist-videos") },
  ];

  let totalOrphaned = 0;
  let totalCleaned = 0;

  for (const { type, path: baseDir } of baseDirs) {
    console.log(`📂 检查 ${type} 文件夹: ${baseDir}`);

    if (!existsSync(baseDir)) {
      console.log(`⚠️  文件夹不存在，跳过\n`);
      continue;
    }

    try {
      const folders = await readdir(baseDir);

      for (const folder of folders) {
        const folderPath = join(baseDir, folder);
        const folderStat = await stat(folderPath);

        if (!folderStat.isDirectory()) {
          continue; // 跳过非文件夹
        }

        // 从文件夹名提取技师ID (格式: {therapistId}_{nickname})
        const match = folder.match(/^([^_]+)_/);
        if (!match) {
          console.log(`⚠️  无法解析文件夹名: ${folder}`);
          continue;
        }

        const therapistId = match[1];

        // 检查技师是否存在于数据库
        const therapistExists = await prisma.therapist.findUnique({
          where: { id: therapistId },
          select: { id: true },
        });

        if (!therapistExists) {
          console.log(`\n🗑️  发现孤儿文件夹: ${folder}`);
          console.log(`   技师ID: ${therapistId} (已不存在于数据库)`);
          totalOrphaned++;

          // 删除文件夹
          try {
            const { deleteFolderRecursive } = await import("@/lib/folder-manager");
            // @ts-ignore
            await deleteFolderRecursive(folderPath);
            console.log(`✅ 已清理: ${folder}`);
            totalCleaned++;
          } catch (error) {
            console.error(`❌ 清理失败: ${folder}`, error);
          }
        }
      }

      console.log(`\n✅ ${type} 文件夹检查完成\n`);
    } catch (error) {
      console.error(`❌ 检查 ${type} 文件夹失败:`, error);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`📊 清理统计:`);
  console.log(`   发现孤儿文件夹: ${totalOrphaned} 个`);
  console.log(`   成功清理: ${totalCleaned} 个`);
  console.log(`   失败: ${totalOrphaned - totalCleaned} 个`);
  console.log("=".repeat(50) + "\n");
}

// 运行清理
cleanOrphanedFolders()
  .then(() => {
    console.log("✅ 清理完成！");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ 清理失败:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
