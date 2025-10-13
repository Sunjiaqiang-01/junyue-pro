/**
 * 数据清理脚本
 * 将现有技师账号中的虚假默认值改为0值标记
 *
 * 使用方法：
 * npx tsx scripts/clean-default-values.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDefaultValues() {
  console.log("开始清理虚假默认值...\n");

  try {
    // 查找使用默认值的技师
    const therapistsWithDefaults = await prisma.therapist.findMany({
      where: {
        OR: [
          { age: 25, height: 165, weight: 50 }, // 旧的默认值组合
          { city: "广州" }, // 默认城市
        ],
      },
      select: {
        id: true,
        username: true,
        nickname: true,
        age: true,
        height: true,
        weight: true,
        city: true,
        createdAt: true,
      },
    });

    console.log(`找到 ${therapistsWithDefaults.length} 个可能使用默认值的技师账号\n`);

    if (therapistsWithDefaults.length === 0) {
      console.log("没有需要清理的数据");
      return;
    }

    // 显示将要清理的账号
    console.log("以下账号将被清理：");
    therapistsWithDefaults.forEach((t, index) => {
      console.log(
        `${index + 1}. ${t.username} (${t.nickname}) - ` +
          `年龄:${t.age} 身高:${t.height} 体重:${t.weight} 城市:${t.city} - ` +
          `注册于 ${t.createdAt.toLocaleDateString("zh-CN")}`
      );
    });

    console.log("\n确认要清理这些数据吗？(y/n)");
    console.log("提示：此操作将把年龄、身高、体重改为0，城市改为空字符串\n");

    // 在实际使用时，可以添加交互式确认
    // 这里为了演示，直接执行清理
    const shouldClean = true; // 改为 false 可以只查看不清理

    if (!shouldClean) {
      console.log("取消清理操作");
      return;
    }

    // 批量更新
    const result = await prisma.therapist.updateMany({
      where: {
        OR: [{ age: 25, height: 165, weight: 50 }, { city: "广州" }],
      },
      data: {
        age: 0,
        height: 0,
        weight: 0,
        city: "",
      },
    });

    console.log(`\n✅ 成功清理 ${result.count} 条记录`);
    console.log('这些技师账号的基本信息已标记为"未填写"状态');
    console.log("技师需要重新登录并完善资料后才能提交审核\n");
  } catch (error) {
    console.error("❌ 清理失败:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行清理
cleanDefaultValues();
