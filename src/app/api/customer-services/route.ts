import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");

    // 如果没有提供城市参数，返回所有激活的客服供用户选择
    if (!city) {
      console.log("📋 用户未选择城市，返回所有客服列表");
      const allServices = await prisma.customerService.findMany({
        where: {
          isActive: true,
        },
        include: {
          cities: {
            include: {
              city: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      });

      if (allServices.length === 0) {
        return NextResponse.json({ error: "暂无客服信息" }, { status: 404 });
      }

      // 返回客服列表
      return NextResponse.json({
        success: true,
        multiple: true,
        data: allServices.map((service) => ({
          id: service.id,
          name: service.name,
          wechatQrCode: service.wechatQrCode,
          wechatId: service.wechatId,
          qq: service.qq,
          workingHours: service.workingHours,
          cities: service.cities.map((c) => c.city.name),
        })),
      });
    }

    // 如果提供了城市参数，按优先级查找单个客服
    console.log("🔍 用户查找城市客服:", city);
    let customerService = null;

    // 1. 优先查找专属客服（cities包含该城市）
    customerService = await prisma.customerService.findFirst({
      where: {
        isActive: true,
        cities: {
          some: {
            city: { name: city },
          },
        },
      },
      include: {
        cities: {
          include: {
            city: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    console.log(
      "✅ 专属客服查询结果:",
      customerService ? `找到 ${customerService.name}` : "未找到"
    );

    // 2. 如果没有专属客服，查找全国服务客服（cities为空）
    if (!customerService) {
      customerService = await prisma.customerService.findFirst({
        where: {
          isActive: true,
          cities: {
            none: {},
          },
        },
        orderBy: {
          order: "asc",
        },
      });
      console.log(
        "✅ 全国客服查询结果:",
        customerService ? `找到 ${customerService.name}` : "未找到"
      );
    }

    // 3. 兜底：返回第一个可用客服
    if (!customerService) {
      customerService = await prisma.customerService.findFirst({
        where: {
          isActive: true,
        },
        orderBy: {
          order: "asc",
        },
      });
      console.log(
        "✅ 兜底客服查询结果:",
        customerService ? `找到 ${customerService.name}` : "未找到"
      );
    }

    if (!customerService) {
      return NextResponse.json({ error: "暂无客服信息" }, { status: 404 });
    }

    // 返回单个客服
    return NextResponse.json({
      success: true,
      multiple: false,
      data: {
        id: customerService.id,
        name: customerService.name,
        wechatQrCode: customerService.wechatQrCode,
        wechatId: customerService.wechatId,
        qq: customerService.qq,
        workingHours: customerService.workingHours,
      },
    });
  } catch (error) {
    console.error("获取客服信息失败:", error);
    return NextResponse.json({ error: "获取客服信息失败" }, { status: 500 });
  }
}
