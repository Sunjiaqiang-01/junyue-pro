import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCache, setCache } from "@/lib/cache";
import os from "os";

// 获取系统状态和数据库统计
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "无权限" }, { status: 403 });
    }

    // 🆕 检查缓存（10分钟有效期）
    const cacheKey = "admin:system:stats";
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // 获取服务器信息
    const platform = os.platform();
    const nodeVersion = process.version;
    const uptime = process.uptime();

    // 内存信息
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    // CPU信息
    const cpus = os.cpus();
    const cpuModel = cpus[0]?.model || "Unknown";
    const cpuCores = cpus.length;

    // 计算CPU使用率（简单估算）
    let totalIdle = 0;
    let totalTick = 0;
    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });
    const cpuUsage = 100 - (100 * totalIdle) / totalTick;

    // 获取数据库统计
    const [
      therapistsCount,
      pendingTherapistsCount,
      approvedTherapistsCount,
      onlineTherapistsCount,
      adminsCount,
      customerServicesCount,
      citiesCount,
      registrationCodesCount,
      announcementsCount,
      notificationsCount,
    ] = await Promise.all([
      prisma.therapist.count(),
      prisma.therapist.count({ where: { status: "PENDING" } }),
      prisma.therapist.count({ where: { status: "APPROVED" } }),
      prisma.therapist.count({ where: { isOnline: true } }),
      prisma.admin.count(),
      prisma.customerService.count(),
      prisma.city.count(),
      prisma.registrationCode.count(),
      prisma.announcement.count(),
      prisma.notification.count(),
    ]);

    // 获取今日新增技师数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTherapistsCount = await prisma.therapist.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    const stats = {
      server: {
        platform,
        nodeVersion,
        uptime: Math.floor(uptime),
        memory: {
          total: totalMemory,
          used: usedMemory,
          free: freeMemory,
          percentage: memoryPercentage,
        },
        cpu: {
          model: cpuModel,
          cores: cpuCores,
          usage: cpuUsage,
        },
      },
      database: {
        therapists: therapistsCount,
        pendingTherapists: pendingTherapistsCount,
        approvedTherapists: approvedTherapistsCount,
        onlineTherapists: onlineTherapistsCount,
        todayTherapists: todayTherapistsCount,
        admins: adminsCount,
        customerServices: customerServicesCount,
        cities: citiesCount,
        registrationCodes: registrationCodesCount,
        announcements: announcementsCount,
        notifications: notificationsCount,
      },
    };

    // 🆕 缓存结果（10分钟 = 600秒）
    setCache(cacheKey, stats, 600);

    return NextResponse.json({
      success: true,
      data: stats,
      cached: false,
    });
  } catch (error) {
    console.error("获取系统状态失败:", error);
    return NextResponse.json({ success: false, error: "获取系统状态失败" }, { status: 500 });
  }
}
