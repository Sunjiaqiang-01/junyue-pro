import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/registration-codes/[id]/toggle - 启用/禁用注册码
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const { id } = params;

    // 获取当前注册码
    const code = await prisma.registrationCode.findUnique({
      where: { id },
    });

    if (!code) {
      return NextResponse.json({ success: false, error: "注册码不存在" }, { status: 404 });
    }

    // 切换状态
    const updated = await prisma.registrationCode.update({
      where: { id },
      data: {
        isActive: !code.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("切换状态失败:", error);
    return NextResponse.json({ success: false, error: "切换状态失败" }, { status: 500 });
  }
}
