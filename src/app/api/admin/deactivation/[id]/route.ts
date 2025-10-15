import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 审核注销申请（通过或驳回）
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "未授权访问" }, { status: 401 });
    }

    const { action, reviewNote } = await request.json();
    const requestId = params.id;
    const reviewerId = session.user.id;

    // 验证操作类型
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ success: false, error: "无效的操作类型" }, { status: 400 });
    }

    // 查找注销申请
    const deactivationRequest = await prisma.therapistDeactivationRequest.findUnique({
      where: { id: requestId },
      include: {
        therapist: true,
      },
    });

    if (!deactivationRequest) {
      return NextResponse.json({ success: false, error: "注销申请不存在" }, { status: 404 });
    }

    if (deactivationRequest.status !== "PENDING") {
      return NextResponse.json({ success: false, error: "该申请已被处理" }, { status: 400 });
    }

    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

    // 开始事务处理
    const result = await prisma.$transaction(async (tx) => {
      // 更新注销申请状态
      const updatedRequest = await tx.therapistDeactivationRequest.update({
        where: { id: requestId },
        data: {
          status: newStatus,
          reviewerId,
          reviewNote,
          reviewedAt: new Date(),
          executedAt: action === "approve" ? new Date() : null,
        },
      });

      // 如果通过申请，执行注销操作
      if (action === "approve") {
        // 软删除技师账号 - 更新状态为BANNED并清空敏感信息
        await tx.therapist.update({
          where: { id: deactivationRequest.therapistId },
          data: {
            status: "BANNED",
            phone: null,
            email: null,
            isOnline: false,
            // 保留基本信息用于历史记录，但标记为已注销
            nickname: `${deactivationRequest.therapist.nickname}(已注销)`,
          },
        });

        // 清空技师的个人资料敏感信息
        await tx.therapistProfile.updateMany({
          where: { therapistId: deactivationRequest.therapistId },
          data: {
            introduction: "该技师已注销账号",
          },
        });
      }

      return updatedRequest;
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("审核注销申请失败:", error);
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 });
  }
}
