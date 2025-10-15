import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/admin/registration-codes/[id] - 删除注册码
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const { id } = params;

    // 检查是否有技师使用了该注册码
    const therapistCount = await prisma.therapist.count({
      where: { registrationCodeId: id },
    });

    if (therapistCount > 0) {
      return NextResponse.json(
        { success: false, error: `该注册码已被 ${therapistCount} 个技师使用，无法删除` },
        { status: 400 }
      );
    }

    // 删除注册码
    await prisma.registrationCode.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除失败:", error);
    return NextResponse.json({ success: false, error: "删除失败" }, { status: 500 });
  }
}
