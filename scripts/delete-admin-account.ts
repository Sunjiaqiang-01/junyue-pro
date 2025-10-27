import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function deleteAdminAccount() {
  try {
    console.log("🔄 开始删除admin账号...");

    // 删除admin账号
    const deleted = await prisma.admin.delete({
      where: { username: "admin" },
    });

    console.log("✅ 已成功删除admin账号！");
    console.log(`   删除的账号ID: ${deleted.id}`);
    console.log(`   删除的账号名: ${deleted.username}`);

    // 确认剩余账号
    const remaining = await prisma.admin.findMany({
      select: {
        username: true,
        name: true,
      },
    });

    console.log("\n📋 剩余管理员账号：");
    remaining.forEach((admin) => {
      console.log(`   - ${admin.username} (${admin.name})`);
    });
  } catch (error) {
    console.error("❌ 删除失败:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAdminAccount();
