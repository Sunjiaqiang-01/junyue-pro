import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/registration-codes/batch/toggle - 批量启用/禁用注册码
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const { ids, isActive } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0 || typeof isActive !== "boolean") {
      return NextResponse.json({ success: false, error: "无效的参数" }, { status: 400 });
    }

    // 批量更新
    const result = await prisma.registrationCode.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        count: result.count,
      },
    });
  } catch (error) {
    console.error("批量操作失败:", error);
    return NextResponse.json({ success: false, error: "批量操作失败" }, { status: 500 });
  }
}
