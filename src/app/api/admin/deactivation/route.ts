import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 获取待审核的注销申请列表
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "未授权访问" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";

    // 获取注销申请列表
    const requests = await prisma.therapistDeactivationRequest.findMany({
      where: {
        status: status as any,
      },
      include: {
        therapist: {
          select: {
            id: true,
            nickname: true,
            phone: true,
            city: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        requestedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("获取注销申请列表失败:", error);
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 });
  }
}
