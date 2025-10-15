import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/admin/registration-codes/batch - 批量删除注册码
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: "无效的参数" }, { status: 400 });
    }

    // 检查是否有技师使用了这些注册码
    const therapistCount = await prisma.therapist.count({
      where: { registrationCodeId: { in: ids } },
    });

    if (therapistCount > 0) {
      return NextResponse.json(
        { success: false, error: `选中的注册码中有 ${therapistCount} 个已被技师使用，无法删除` },
        { status: 400 }
      );
    }

    // 批量删除
    const result = await prisma.registrationCode.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        count: result.count,
      },
    });
  } catch (error) {
    console.error("批量删除失败:", error);
    return NextResponse.json({ success: false, error: "批量删除失败" }, { status: 500 });
  }
}
