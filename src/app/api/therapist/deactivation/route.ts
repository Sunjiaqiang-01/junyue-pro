import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 提交注销申请
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "therapist") {
      return NextResponse.json({ success: false, error: "未授权访问" }, { status: 401 });
    }

    const therapistId = session.user.id;

    // 检查是否已有待处理的注销申请
    const existingRequest = await prisma.therapistDeactivationRequest.findFirst({
      where: {
        therapistId,
        status: {
          in: ["PENDING", "APPROVED"],
        },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: "您已有待处理的注销申请" },
        { status: 400 }
      );
    }

    // 创建注销申请
    const deactivationRequest = await prisma.therapistDeactivationRequest.create({
      data: {
        therapistId,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      data: deactivationRequest,
    });
  } catch (error) {
    console.error("提交注销申请失败:", error);
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 });
  }
}

// 查询注销申请状态
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "therapist") {
      return NextResponse.json({ success: false, error: "未授权访问" }, { status: 401 });
    }

    const therapistId = session.user.id;

    // 查找最新的注销申请
    const deactivationRequest = await prisma.therapistDeactivationRequest.findFirst({
      where: {
        therapistId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: deactivationRequest,
    });
  } catch (error) {
    console.error("查询注销申请失败:", error);
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 });
  }
}
