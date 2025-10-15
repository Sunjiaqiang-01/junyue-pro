/**
 * 迁移现有照片数据
 * 为现有照片设置兼容字段
 */

import prisma from "../src/lib/prisma";

async function main() {
  console.log("开始迁移现有照片数据...");

  const photos = await prisma.therapistPhoto.findMany();

  console.log(`找到 ${photos.length} 张照片需要迁移`);

  let migratedCount = 0;

  for (const photo of photos) {
    // 如果已经有多尺寸数据,跳过
    if (photo.largeUrl) {
      console.log(`⏭️  照片 ${photo.id} 已有多尺寸数据,跳过`);
      continue;
    }

    // 旧照片设置为非视频,并将url复制到largeUrl
    await prisma.therapistPhoto.update({
      where: { id: photo.id },
      data: {
        isVideo: false,
        largeUrl: photo.url,
        mediumUrl: photo.url, // 临时使用同一个URL
        thumbnailUrl: photo.url, // 临时使用同一个URL
      },
    });

    migratedCount++;
    console.log(`✅ 迁移照片 ${photo.id}`);
  }

  console.log(`\n完成！共迁移 ${migratedCount} 张照片`);
}

main()
  .catch((e) => {
    console.error("迁移失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
