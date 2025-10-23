import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PUT - 更新客服
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;
    const { cityNames, name, wechatQrCode, wechatId, phone, workingHours } = await req.json();

    if (!name || !wechatQrCode || !workingHours) {
      return NextResponse.json(
        { error: "客服名称、微信二维码和工作时间不能为空" },
        { status: 400 }
      );
    }

    // 更新客服基本信息
    await prisma.customerService.update({
      where: { id },
      data: {
        name,
        wechatQrCode,
        wechatId,
        phone,
        workingHours,
      },
    });

    // 删除现有的城市关联
    await prisma.customerServiceCity.deleteMany({
      where: { customerServiceId: id },
    });

    // 如果提供了城市名称数组，创建新的关联
    if (cityNames && Array.isArray(cityNames) && cityNames.length > 0) {
      for (const cityName of cityNames) {
        // 查找或创建城市
        let city = await prisma.city.findFirst({
          where: { name: cityName },
        });

        if (!city) {
          city = await prisma.city.create({
            data: {
              name: cityName,
              code: cityName,
              isActive: true,
              order: 0,
            },
          });
        }

        // 创建客服-城市关联
        await prisma.customerServiceCity.create({
          data: {
            customerServiceId: id,
            cityId: city.id,
          },
        });
      }
    }

    // 返回完整数据
    const fullService = await prisma.customerService.findUnique({
      where: { id },
      include: {
        cities: {
          include: {
            city: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "更新成功",
      data: fullService,
    });
  } catch (error) {
    console.error("更新客服失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// DELETE - 删除客服
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.customerService.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除客服失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
