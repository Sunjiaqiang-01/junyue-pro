import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/registration-codes/[id]/therapists - 获取使用该注册码的技师列表
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
    }

    const { id } = params;

    // 获取使用该注册码的技师
    const therapists = await prisma.therapist.findMany({
      where: {
        registrationCodeId: id,
      },
      select: {
        id: true,
        nickname: true,
        phone: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: therapists,
    });
  } catch (error) {
    console.error("获取技师列表失败:", error);
    return NextResponse.json({ success: false, error: "获取技师列表失败" }, { status: 500 });
  }
}
