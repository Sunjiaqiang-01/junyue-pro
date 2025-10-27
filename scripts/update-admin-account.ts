import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function updateAdminAccount() {
  try {
    console.log("🔄 开始更新管理员账号...");

    const username = "junyue";
    const password = "junyue123.123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // 查找是否存在管理员账号
    const existingAdmin = await prisma.admin.findFirst();

    // 查找junyue账号
    const junyueAdmin = await prisma.admin.findUnique({
      where: { username: username },
    });

    if (junyueAdmin) {
      // 更新现有junyue账号密码
      await prisma.admin.update({
        where: { username: username },
        data: {
          password: hashedPassword,
          name: "君悦管理员",
        },
      });
      console.log("✅ 管理员账号密码更新成功！");
    } else if (existingAdmin) {
      // 更新第一个管理员账号
      await prisma.admin.update({
        where: { id: existingAdmin.id },
        data: {
          username: username,
          password: hashedPassword,
          name: "君悦管理员",
        },
      });
      console.log("✅ 管理员账号更新成功！");
    } else {
      // 创建新管理员账号
      await prisma.admin.create({
        data: {
          username: username,
          password: hashedPassword,
          name: "君悦管理员",
          role: "SUPER_ADMIN",
        },
      });
      console.log("✅ 管理员账号创建成功！");
    }

    console.log(`📝 用户名: ${username}`);
    console.log(`📝 密码: ${password}`);
    console.log("");
    console.log("⚠️  请妥善保管账号密码！");
  } catch (error) {
    console.error("❌ 更新失败:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminAccount();
