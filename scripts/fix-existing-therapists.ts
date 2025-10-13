import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n🔧 开始修复现有技师数据...\n");

  // 1. 查找所有缺少email的技师
  const therapistsWithoutEmail = await prisma.therapist.findMany({
    where: {
      email: null,
    },
    select: {
      id: true,
      username: true,
      nickname: true,
    },
  });

  console.log(`📊 找到 ${therapistsWithoutEmail.length} 个缺少email的技师\n`);

  if (therapistsWithoutEmail.length === 0) {
    console.log("✅ 所有技师都已有email，无需修复！\n");
    return;
  }

  // 2. 为每个技师生成默认email
  for (const therapist of therapistsWithoutEmail) {
    const defaultEmail = `${therapist.username}@temp.junyuespa.com`;

    await prisma.therapist.update({
      where: { id: therapist.id },
      data: { email: defaultEmail },
    });

    console.log(`✅ ${therapist.nickname || therapist.username}: ${defaultEmail}`);
  }

  console.log(`\n✅ 已为 ${therapistsWithoutEmail.length} 个技师添加默认email`);
  console.log("\n⚠️  提示：这些技师应该尽快修改为真实邮箱以便找回密码！\n");
}

main()
  .catch((e) => {
    console.error("❌ 错误:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
