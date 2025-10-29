import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 重新提交审核
export async function POST() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "therapist") {
      return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
    }

    const therapistId = session.user.id;

    // 获取技师信息
    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
      include: {
        profile: true,
        photos: true,
      },
    });

    if (!therapist) {
      return NextResponse.json({ success: false, error: "技师不存在" }, { status: 404 });
    }

    // 检查当前状态
    if (therapist.status === "APPROVED") {
      return NextResponse.json(
        { success: false, error: "您的资料已通过审核，无需重新提交" },
        { status: 400 }
      );
    }

    if (therapist.status === "PENDING") {
      return NextResponse.json(
        { success: false, error: "您的资料正在审核中，请耐心等待" },
        { status: 400 }
      );
    }

    // 验证资料完整度
    const errors = [];

    if (!therapist.profile) {
      errors.push("请先完善个人资料");
    } else {
      if (!therapist.profile.introduction) {
        errors.push("请填写个人介绍");
      }
    }

    if (!therapist.phone) {
      errors.push("请填写联系电话");
    }

    if (therapist.photos.length < 3) {
      errors.push("请至少上传3张照片");
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: false, error: errors.join("；") }, { status: 400 });
    }

    // 更新状态为待审核
    await prisma.therapist.update({
      where: { id: therapistId },
      data: {
        status: "PENDING",
        auditReason: null, // 清除审核原因
      },
    });

    return NextResponse.json({
      success: true,
      message: "资料已提交审核，预计48小时内完成",
    });
  } catch (error) {
    console.error("重新提交审核失败:", error);
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 });
  }
}
