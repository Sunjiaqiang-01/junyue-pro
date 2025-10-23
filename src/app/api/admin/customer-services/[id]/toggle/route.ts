import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH - 启用/禁用客服
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;

    const service = await prisma.customerService.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json({ error: "客服不存在" }, { status: 404 });
    }

    const updated = await prisma.customerService.update({
      where: { id },
      data: {
        isActive: !service.isActive,
      },
      include: {
        city: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: updated.isActive ? "已启用" : "已禁用",
      data: updated,
    });
  } catch (error) {
    console.error("切换客服状态失败:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
