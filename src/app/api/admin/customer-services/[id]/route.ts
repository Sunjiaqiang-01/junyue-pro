import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PUT - 更新客服配置
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;
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

    // 更新客服并同步城市关联
    const customerService = await prisma.customerService.update({
      where: { id },
      data: {
        name,
        wechatQrCode,
        wechatId,
        qq,
        workingHours,
        // 先删除所有旧的城市关联，再创建新的
        cities: {
          deleteMany: {}, // 删除所有旧关联
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
      message: "更新成功",
      data: customerService,
    });
  } catch (error) {
    console.error("更新客服配置失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// DELETE - 删除客服配置
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;

    // 删除客服（cities关联会自动级联删除，因为设置了onDelete: Cascade）
    await prisma.customerService.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除客服配置失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}

// PATCH - 切换客服状态
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;

    // 获取当前状态
    const service = await prisma.customerService.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!service) {
      return NextResponse.json({ error: "客服不存在" }, { status: 404 });
    }

    // 切换状态
    await prisma.customerService.update({
      where: { id },
      data: {
        isActive: !service.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: service.isActive ? "已禁用" : "已启用",
    });
  } catch (error) {
    console.error("切换客服状态失败:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
