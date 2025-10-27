import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { clearCache } from "@/lib/cache";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { isOnline } = body;

    if (typeof isOnline !== "boolean") {
      return NextResponse.json({ error: "参数错误" }, { status: 400 });
    }

    // 检查技师是否存在
    const therapist = await prisma.therapist.findUnique({
      where: { id },
      select: { id: true, nickname: true, status: true },
    });

    if (!therapist) {
      return NextResponse.json({ error: "技师不存在" }, { status: 404 });
    }

    // 只有审核通过的技师才能设置在线状态
    if (therapist.status !== "APPROVED") {
      return NextResponse.json({ error: "只有审核通过的技师才能设置在线状态" }, { status: 400 });
    }

    // 更新在线状态
    await prisma.therapist.update({
      where: { id },
      data: { isOnline },
    });

    // 清除缓存
    clearCache("admin:system:stats");

    return NextResponse.json({
      success: true,
      message: `已将技师${therapist.nickname}设置为${isOnline ? "在线" : "离线"}`,
      isOnline,
    });
  } catch (error) {
    console.error("切换在线状态失败:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
