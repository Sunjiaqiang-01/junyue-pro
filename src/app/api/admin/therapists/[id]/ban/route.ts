import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 封禁/解封技师
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "无权限" }, { status: 403 });
    }

    const { id } = await context.params;
    const { ban } = await request.json();

    // 检查技师是否存在
    const therapist = await prisma.therapist.findUnique({
      where: { id },
    });

    if (!therapist) {
      return NextResponse.json({ success: false, error: "技师不存在" }, { status: 404 });
    }

    // 更新状态
    const newStatus = ban ? "BANNED" : "APPROVED";

    await prisma.therapist.update({
      where: { id },
      data: {
        status: newStatus,
        isFeatured: ban ? false : therapist.isFeatured, // 封禁时取消推荐
      },
    });

    // 创建通知
    await prisma.notification.create({
      data: {
        therapistId: id,
        type: "SYSTEM",
        title: ban ? "账号已被封禁" : "账号已解封",
        content: ban
          ? "您的账号因违规被管理员封禁，如有疑问请联系客服。"
          : "您的账号已被解封，可以正常使用了。",
      },
    });

    return NextResponse.json({
      success: true,
      message: ban ? "封禁成功" : "解封成功",
    });
  } catch (error) {
    console.error("更新封禁状态失败:", error);
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 });
  }
}
