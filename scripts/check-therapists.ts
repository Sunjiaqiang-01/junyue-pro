import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n🔍 检查现有技师数据...\n");

  const therapists = await prisma.therapist.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      phone: true,
      nickname: true,
      registrationCodeId: true,
      status: true,
    },
    take: 10,
  });

  console.log(`✅ 找到 ${therapists.length} 个技师\n`);

  therapists.forEach((t, index) => {
    console.log(`${index + 1}. ${t.nickname || t.username}`);
    console.log(`   ID: ${t.id.slice(0, 8)}...`);
    console.log(`   Username: ${t.username || "❌ 未设置"}`);
    console.log(`   Email: ${t.email || "❌ 未设置"}`);
    console.log(`   Phone: ${t.phone || "❌ 未设置"}`);
    console.log(`   RegistrationCodeId: ${t.registrationCodeId || "❌ 未设置"}`);
    console.log(`   Status: ${t.status}\n`);
  });

  // 统计
  const stats = {
    total: therapists.length,
    withEmail: therapists.filter((t) => t.email).length,
    withPhone: therapists.filter((t) => t.phone).length,
    withUsername: therapists.filter((t) => t.username).length,
    withRegistrationCode: therapists.filter((t) => t.registrationCodeId).length,
  };

  console.log("📊 统计：");
  console.log(`   总数: ${stats.total}`);
  console.log(`   有Username: ${stats.withUsername}/${stats.total}`);
  console.log(`   有Email: ${stats.withEmail}/${stats.total}`);
  console.log(`   有Phone: ${stats.withPhone}/${stats.total}`);
  console.log(`   有RegistrationCode: ${stats.withRegistrationCode}/${stats.total}\n`);

  if (stats.withEmail < stats.total) {
    console.log("⚠️  警告：部分技师缺少Email字段！");
  }
  if (stats.withRegistrationCode < stats.total) {
    console.log("⚠️  警告：部分技师未关联注册验证码！");
  }
}

main()
  .catch((e) => {
    console.error("❌ 错误:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
