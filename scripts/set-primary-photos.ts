/**
 * 设置主图脚本
 * 为每个技师的第一张照片设置为主图
 */

import prisma from "../src/lib/prisma";

async function main() {
  console.log("开始设置主图...");

  // 获取所有有照片的技师
  const therapists = await prisma.therapist.findMany({
    include: {
      photos: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  console.log(`找到 ${therapists.length} 个技师`);

  let updatedCount = 0;

  for (const therapist of therapists) {
    if (therapist.photos.length > 0) {
      const firstPhoto = therapist.photos[0];

      // 检查是否已有主图
      const hasPrimary = therapist.photos.some((p) => p.isPrimary);

      if (!hasPrimary) {
        await prisma.therapistPhoto.update({
          where: { id: firstPhoto.id },
          data: { isPrimary: true },
        });

        console.log(`✅ 技师 ${therapist.nickname} 的第一张照片已设为主图`);
        updatedCount++;
      } else {
        console.log(`⏭️  技师 ${therapist.nickname} 已有主图，跳过`);
      }
    }
  }

  console.log(`\n完成！共更新 ${updatedCount} 个技师的主图设置`);
}

main()
  .catch((e) => {
    console.error("设置主图失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
