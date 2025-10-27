import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAdminAccounts() {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("📋 当前管理员账号列表：");
    console.log("================================");
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. 用户名: ${admin.username}`);
      console.log(`   姓名: ${admin.name}`);
      console.log(`   角色: ${admin.role}`);
      console.log(`   ID: ${admin.id}`);
      console.log("--------------------------------");
    });
    console.log(`总计: ${admins.length} 个管理员账号`);
  } catch (error) {
    console.error("❌ 查询失败:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminAccounts();
