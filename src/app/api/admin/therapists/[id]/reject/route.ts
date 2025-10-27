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
    const { reason } = await req.json();

    if (!reason) {
      return NextResponse.json({ error: "请提供拒绝原因" }, { status: 400 });
    }

    // 更新技师状态为已拒绝
    await prisma.therapist.update({
      where: { id },
      data: {
        status: "REJECTED",
        auditReason: reason,
        auditedAt: new Date(),
      },
    });

    // 创建通知
    await prisma.notification.create({
      data: {
        therapistId: id,
        type: "AUDIT",
        title: "审核未通过",
        content: `很抱歉，您的资料审核未通过。原因：${reason}。请修改后重新提交。`,
      },
    });

    // 🆕 清除系统统计缓存
    clearCache("admin:system:stats");

    return NextResponse.json({
      success: true,
      message: "已拒绝",
    });
  } catch (error) {
    console.error("拒绝审核失败:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
