import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * 获取注册验证码列表（管理员专用）
 */
export async function GET(req: Request) {
  try {
    // 验证管理员权限
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "无权限" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const status = searchParams.get("status"); // all, active, used, expired
    const codeType = searchParams.get("codeType");

    // 构建查询条件
    const where: any = {};

    if (status === "active") {
      where.isActive = true;
      where.expiresAt = { gt: new Date() };
      where.OR = [{ maxUses: -1 }, { currentUses: { lt: prisma.registrationCode.fields.maxUses } }];
    } else if (status === "used") {
      where.currentUses = { gt: 0 };
    } else if (status === "expired") {
      where.expiresAt = { lt: new Date() };
    }

    if (codeType && ["ONETIME", "LIMITED", "UNLIMITED"].includes(codeType)) {
      where.codeType = codeType;
    }

    // 查询总数
    const total = await prisma.registrationCode.count({ where });

    // 查询数据
    const codes = await prisma.registrationCode.findMany({
      where,
      include: {
        _count: {
          select: { therapists: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json({
      success: true,
      data: {
        codes: codes.map((code) => ({
          id: code.id,
          code: code.code,
          type: code.codeType,
          maxUses: code.maxUses,
          currentUses: code.currentUses,
          remainingUses: code.maxUses === -1 ? -1 : code.maxUses - code.currentUses,
          isActive: code.isActive,
          expiresAt: code.expiresAt,
          isExpired: code.expiresAt ? code.expiresAt < new Date() : false,
          note: code.note,
          createdAt: code.createdAt,
          therapistsCount: code._count.therapists,
        })),
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error) {
    console.error("获取验证码列表错误:", error);
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
