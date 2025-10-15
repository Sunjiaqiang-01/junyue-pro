import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 撤销注销申请
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "therapist") {
      return NextResponse.json({ success: false, error: "未授权访问" }, { status: 401 });
    }

    const therapistId = session.user.id;

    // 查找待处理的注销申请
    const existingRequest = await prisma.therapistDeactivationRequest.findFirst({
      where: {
        therapistId,
        status: "PENDING",
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: "没有找到可撤销的注销申请" },
        { status: 404 }
      );
    }

    // 更新状态为已撤销
    const updatedRequest = await prisma.therapistDeactivationRequest.update({
      where: {
        id: existingRequest.id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    console.error("撤销注销申请失败:", error);
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 });
  }
}
