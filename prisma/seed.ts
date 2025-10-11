import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始填充数据库（v2.0简化版）...");

  // 1. 创建城市和区域
  console.log("🏙️  创建城市和区域...");
  const cities = [
    { name: "广州", code: "GZ", areas: ["天河区", "越秀区", "海珠区", "番禺区"] },
    { name: "深圳", code: "SZ", areas: ["福田区", "罗湖区", "南山区", "宝安区"] },
    { name: "北京", code: "BJ", areas: ["朝阳区", "海淀区", "东城区", "西城区"] },
    { name: "上海", code: "SH", areas: ["浦东新区", "徐汇区", "黄浦区", "静安区"] },
  ];

  for (const cityData of cities) {
    const city = await prisma.city.upsert({
      where: { code: cityData.code },
      update: {},
      create: {
        name: cityData.name,
        code: cityData.code,
        order: cities.indexOf(cityData) + 1,
      },
    });

    for (const areaName of cityData.areas) {
      await prisma.area.upsert({
        where: {
          cityId_name: {
            cityId: city.id,
            name: areaName,
          },
        },
        update: {},
        create: {
          cityId: city.id,
          name: areaName,
          code: `${cityData.code}-${areaName}`,
          order: cityData.areas.indexOf(areaName) + 1,
        },
      });
    }
  }
  console.log(`✅ 创建了 ${cities.length} 个城市和区域`);

  // 2. 创建超级管理员
  console.log("👤 创建超级管理员...");
  const hashedPassword = await bcrypt.hash("admin123456", 10);
  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      name: "超级管理员",
      role: "SUPER_ADMIN",
    },
  });
  console.log(`✅ 创建管理员: ${admin.username}`);

  // 3. 创建客服配置
  console.log("📞 创建客服配置...");
  const customerService = await prisma.customerService.upsert({
    where: { id: "cs-001" },
    update: {},
    create: {
      id: "cs-001",
      wechatQrCode: "/customer-service-qr.jpg",
      wechatId: "junyue-spa",
      phone: "400-123-4567",
      workingHours: "9:00 - 22:00",
      isActive: true,
      order: 1,
    },
  });
  console.log(`✅ 创建客服配置: ${customerService.wechatId}`);

  // 4. 创建测试技师（带完整信息）
  console.log("💆 创建测试技师...");
  const testTherapists = [];
  const names = ["小美", "小红", "小丽", "小芳", "小雪", "小月", "小花", "小兰", "小玉", "小燕"];
  const bios = [
    "资深SPA技师，拥有5年以上从业经验，擅长全身按摩和精油护理，为您带来极致放松体验。",
    "专业认证技师，精通泰式按摩、中式推拿，手法细腻，深受客户好评。",
    "温柔体贴的服务态度，专注于为每位客户提供个性化的SPA体验，让您身心放松。",
    "年轻有活力的技师，学习能力强，服务热情周到，擅长足底按摩和肩颈护理。",
    "拥有国际认证资质，精通多种按摩手法，能为您定制专属的放松方案。",
    "细致耐心的服务风格，擅长精油按摩和面部护理，让您焕发活力。",
    "经验丰富的专业技师，手法娴熟，力度适中，深受回头客喜爱。",
    "温柔细心的服务态度，专注于为客户提供舒适的SPA体验。",
    "热情开朗的技师，服务周到，擅长全身放松按摩。",
    "专业技能过硬，服务态度一流，致力于让每位客户满意而归。"
  ];
  
  // 获取所有城市
  const allCities = await prisma.city.findMany({
    include: { areas: true },
  });
  
  // 创建技师
  for (let i = 1; i <= 10; i++) {
    const cityIndex = (i - 1) % allCities.length;
    const selectedCity = allCities[cityIndex];
    
    const therapist = await prisma.therapist.upsert({
      where: { phone: `1390000000${i < 10 ? '0' + i : i}` },
      update: {},
      create: {
        phone: `1390000000${i < 10 ? '0' + i : i}`,
        password: await bcrypt.hash("123456", 10),
        nickname: names[i - 1],
        age: 22 + (i % 8),
        height: 160 + (i % 15),
        weight: 45 + (i % 10),
        city: selectedCity.name,
        areas: selectedCity.areas.slice(0, Math.min(2, selectedCity.areas.length)).map(a => a.name),
        status: i <= 8 ? "APPROVED" : "PENDING",
        inviteCode: `TECH${String(i).padStart(4, '0')}`,
        invitedBy: i === 1 ? null : "TECH0001",
        isOnline: i <= 5,
        isFeatured: i <= 3,
        isNew: i > 7,
      },
    });
    
    // 创建技师资料
    await prisma.therapistProfile.upsert({
      where: { therapistId: therapist.id },
      update: {},
      create: {
        therapistId: therapist.id,
        introduction: bios[i - 1],
        specialties: ["按摩", "精油护理", "足疗"],
        serviceType: i <= 5 ? ["VISIT_CLIENT", "CLIENT_VISIT"] : ["CLIENT_VISIT"],
        wechat: `wx_${names[i - 1]}`,
        qq: `${888888 + i}`,
      },
    });
    
    // 创建技师照片
    const photosCount = i <= 3 ? 5 : 3;
    for (let j = 1; j <= photosCount; j++) {
      await prisma.therapistPhoto.create({
        data: {
          therapistId: therapist.id,
          url: `https://picsum.photos/seed/therapist${i}-photo${j}/800/1200`,
          order: j,
        },
      });
    }
    
    testTherapists.push(therapist);
  }
  console.log(`✅ 创建了 ${testTherapists.length} 个测试技师`);

  // 5. 为技师创建时间表
  console.log("📅 创建时间表数据...");
  let scheduleCount = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 为前5个在线技师创建未来7天的时间表
  for (let i = 0; i < Math.min(5, testTherapists.length); i++) {
    const therapist = testTherapists[i];
    if (!therapist.isOnline) continue;

    for (let day = 0; day < 7; day++) {
      const scheduleDate = new Date(today);
      scheduleDate.setDate(scheduleDate.getDate() + day);

      // 每天创建4个时间段
      const timeSlots = [
        { start: "09:00", end: "12:00" },
        { start: "14:00", end: "17:00" },
        { start: "18:00", end: "21:00" },
        { start: "21:00", end: "23:00" },
      ];

      for (const slot of timeSlots) {
        try {
          await prisma.therapistSchedule.create({
            data: {
              therapistId: therapist.id,
              date: scheduleDate,
              startTime: slot.start,
              endTime: slot.end,
            },
          });
          scheduleCount++;
        } catch (e) {
          // 跳过重复的时间段
          console.log(`⚠️  跳过重复时间段: ${therapist.nickname} ${scheduleDate.toISOString().split('T')[0]} ${slot.start}`);
        }
      }
    }
  }
  console.log(`✅ 创建了 ${scheduleCount} 个时间段`);

  // 6. 创建公告
  console.log("📢 创建公告...");
  await prisma.announcement.create({
    data: {
      title: "欢迎使用君悦SPA平台",
      content: "君悦SPA技师展示平台已正式上线！您可以浏览技师信息，联系客服预约您心仪的技师。我们的客服团队将竭诚为您服务，安排专业的SPA技师为您提供优质服务。",
      type: "NOTICE",
      isPublished: true,
      publishedAt: new Date(),
    },
  });
  console.log("✅ 创建公告");

  console.log("\n🎉 数据填充完成！");
  console.log("\n📊 数据统计：");
  console.log(`- 城市: ${cities.length} 个`);
  console.log(`- 技师: ${testTherapists.length} 个（已审核: ${testTherapists.filter(t => t.status === 'APPROVED').length}）`);
  console.log(`- 时间表: ${scheduleCount} 个时间段`);
  console.log(`- 客服配置: 1 个`);
  console.log("\n🔑 测试账号：");
  console.log("技师账号: 13900000001 密码: 123456");
  console.log("管理员: admin 密码: admin123456");
  console.log("\n💡 提示：");
  console.log("- 访问 http://localhost:3000 查看首页（将重定向到技师列表）");
  console.log("- 访问 http://localhost:3000/therapists 查看技师列表");
  console.log("- 点击技师卡片查看详情，联系客服预约");
  console.log("- 技师照片使用 picsum.photos 占位图");
}

main()
  .catch((e) => {
    console.error("❌ 数据填充失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
