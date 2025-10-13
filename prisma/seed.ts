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
    "专业技能过硬，服务态度一流，致力于让每位客户满意而归。",
  ];

  // 获取所有城市
  const allCities = await prisma.city.findMany({
    include: { areas: true },
  });

  // 准备位置数据（真实地标）
  const locations = [
    // 广州
    { name: "天河城", street: "天河路208号", latitude: 23.1367, longitude: 113.3234 },
    { name: "珠江新城", street: "花城大道", latitude: 23.12, longitude: 113.325 },
    // 深圳
    { name: "华强北", street: "华强北路", latitude: 22.5442, longitude: 114.0875 },
    { name: "海岸城", street: "文心五路33号", latitude: 22.5164, longitude: 113.932 },
    // 北京
    { name: "国贸中心", street: "建国门外大街1号", latitude: 39.9088, longitude: 116.459 },
    { name: "三里屯", street: "工体北路", latitude: 39.9367, longitude: 116.4503 },
    // 上海
    { name: "陆家嘴", street: "世纪大道8号", latitude: 31.2397, longitude: 121.499 },
    { name: "南京路步行街", street: "南京东路", latitude: 31.2354, longitude: 121.4797 },
    { name: "淮海中路", street: "淮海中路", latitude: 31.2201, longitude: 121.4628 },
    { name: "徐家汇", street: "虹桥路", latitude: 31.1943, longitude: 121.4368 },
  ];

  // 牌值数据
  const cardValues = ["15cm", "16cm", "17cm", "18cm", "19cm", "20cm", "21cm", "22cm"];

  // 创建技师
  for (let i = 1; i <= 10; i++) {
    const cityIndex = (i - 1) % allCities.length;
    const selectedCity = allCities[cityIndex];
    const locationData = locations[i - 1];

    const therapist = await prisma.therapist.upsert({
      where: { phone: `1390000000${i < 10 ? "0" + i : i}` },
      update: {},
      create: {
        phone: `1390000000${i < 10 ? "0" + i : i}`,
        password: await bcrypt.hash("123456", 10),
        nickname: names[i - 1],
        age: 22 + (i % 8),
        height: 160 + (i % 15),
        weight: 45 + (i % 10),
        cardValue: cardValues[(i - 1) % cardValues.length], // 🆕 牌值
        city: selectedCity.name,
        areas: selectedCity.areas
          .slice(0, Math.min(2, selectedCity.areas.length))
          .map((a) => a.name),
        location: locationData, // 🆕 位置信息（JSON）
        status: i <= 8 ? "APPROVED" : "PENDING",
        inviteCode: `TECH${String(i).padStart(4, "0")}`,
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

    // 创建技师照片（9:16比例 - 720x1280）
    const photosCount = i <= 3 ? 5 : 3;
    for (let j = 1; j <= photosCount; j++) {
      await prisma.therapistPhoto.create({
        data: {
          therapistId: therapist.id,
          url: `https://picsum.photos/seed/therapist${i}-photo${j}/720/1280`,
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
          console.log(
            `⚠️  跳过重复时间段: ${therapist.nickname} ${scheduleDate.toISOString().split("T")[0]} ${slot.start}`
          );
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
      content:
        "君悦SPA技师展示平台已正式上线！您可以浏览技师信息，联系客服预约您心仪的技师。我们的客服团队将竭诚为您服务，安排专业的SPA技师为您提供优质服务。",
      type: "NOTICE",
      isPublished: true,
      publishedAt: new Date(),
    },
  });
  console.log("✅ 创建公告");

  // 7. 创建必看攻略
  console.log("📖 创建必看攻略...");
  await prisma.guideContent.upsert({
    where: { id: "guide-001" },
    update: {},
    create: {
      id: "guide-001",
      title: "必看攻略",
      content: `# 必看攻略 📖

欢迎来到君悦SPA！为了给您提供更好的服务体验，请仔细阅读以下攻略。

---

## 📞 如何预约技师？

预约流程非常简单，只需4步：

1. **浏览技师列表**：在「技师列表」页面查看所有在线技师
2. **选择心仪技师**：点击「查看详情」了解技师的详细信息
3. **联系客服预约**：点击「联系客服预约」按钮
4. **告知技师信息**：提供技师姓名或编号给客服

> 💡 **提示**：推荐技师和新人技师会有特殊标记哦！

---

## 💰 收费说明

### 价格标准
- 具体价格因技师和服务项目而异
- 请联系客服咨询详细价格
- 支持多种支付方式

### 优惠活动
- 新客户首次消费享受优惠
- 定期推出会员活动
- 详情请咨询客服

---

## ⏰ 服务时间

- **服务时间**：09:00 - 22:00（全年无休）
- **客服在线**：09:00 - 22:00
- **节假日**：正常营业

---

## ❓ 常见问题

### Q1: 可以上门服务吗？
**A:** 部分技师支持上门服务，具体请在技师详情中查看或联系客服确认。

### Q2: 如何修改或取消预约？
**A:** 请提前至少2小时联系客服修改预约。预约后24小时内可免费取消。

### Q3: 服务包含哪些项目？
**A:** 服务项目包括但不限于：全身按摩、精油护理、足底按摩、肩颈护理等。具体项目请查看技师详情或咨询客服。

### Q4: 如何成为技师？
**A:** 点击导航栏的「技师入驻」按钮，填写相关信息提交审核即可。

### Q5: 隐私保障如何？
**A:** 我们严格保护客户隐私，所有信息均加密存储，不会泄露给第三方。

---

## 📱 联系我们

如有任何疑问，请随时联系客服：

- 点击页面右下角的**客服按钮**
- 客服工作时间：09:00 - 22:00
- 节假日正常在线

---

**祝您体验愉快！** 🌟`,
      order: 1,
      isActive: true,
    },
  });
  console.log("✅ 创建必看攻略");

  console.log("\n🎉 数据填充完成！");
  console.log("\n📊 数据统计：");
  console.log(`- 城市: ${cities.length} 个`);
  console.log(
    `- 技师: ${testTherapists.length} 个（已审核: ${testTherapists.filter((t) => t.status === "APPROVED").length}）`
  );
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
