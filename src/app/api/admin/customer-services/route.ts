import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET - 获取客服配置
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const services = await prisma.customerService.findMany({
      include: {
        city: {
          select: {
            id: true,
            name: true,
          },
        },
        cities: {
          select: {
            id: true,
            city: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("获取客服配置失败:", error);
    return NextResponse.json({ error: "获取客服配置失败" }, { status: 500 });
  }
}

// POST - 创建客服配置
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { name, cityNames, wechatQrCode, wechatId, qq, workingHours } = await req.json();

    if (!name || !wechatQrCode || !workingHours) {
      return NextResponse.json(
        { error: "客服名称、微信二维码和工作时间不能为空" },
        { status: 400 }
      );
    }

    // 如果提供了城市名称，查找对应的城市ID
    let cityIds: string[] = [];
    if (cityNames && cityNames.length > 0) {
      console.log("🔍 查找城市:", cityNames);
      const cities = await prisma.city.findMany({
        where: {
          name: {
            in: cityNames,
          },
        },
        select: {
          id: true,
          name: true,
        },
      });
      console.log("✅ 找到城市:", cities);
      cityIds = cities.map((c) => c.id);
      console.log("📋 城市ID列表:", cityIds);

      if (cityIds.length !== cityNames.length) {
        const foundNames = cities.map((c) => c.name);
        const notFound = cityNames.filter((name: string) => !foundNames.includes(name));
        console.warn("⚠️ 以下城市未找到:", notFound);
      }
    }

    // 创建客服并关联城市
    const customerService = await prisma.customerService.create({
      data: {
        name,
        wechatQrCode,
        wechatId,
        qq,
        workingHours,
        isActive: true,
        order: 0,
        // 创建城市关联
        cities: {
          create: cityIds.map((cityId) => ({
            cityId,
          })),
        },
      },
      include: {
        cities: {
          include: {
            city: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "创建成功",
      data: customerService,
    });
  } catch (error) {
    console.error("创建客服配置失败:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
