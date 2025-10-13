import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 生成初始测试验证码
 */
async function main() {
  console.log("🚀 开始生成初始验证码...\n");

  // 查找第一个管理员
  const admin = await prisma.admin.findFirst();

  if (!admin) {
    console.error("❌ 未找到管理员，请先创建管理员账号");
    process.exit(1);
  }

  console.log(`✅ 找到管理员: ${admin.username}\n`);

  // 生成10个一次性验证码（7天有效）
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    codes.push(code);
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7天后过期

  await prisma.registrationCode.createMany({
    data: codes.map((code) => ({
      code,
      codeType: "ONETIME",
      maxUses: 1,
      expiresAt,
      note: "初始测试验证码（7天有效）",
      createdBy: admin.id,
    })),
  });

  console.log("✅ 成功生成10个一次性验证码（7天有效）:\n");
  codes.forEach((code, index) => {
    console.log(`  ${index + 1}. ${code}`);
  });

  console.log(`\n过期时间: ${expiresAt.toLocaleString("zh-CN")}`);
  console.log("\n💡 请将这些验证码分发给技师用于注册");
}

main()
  .catch((e) => {
    console.error("❌ 错误:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
