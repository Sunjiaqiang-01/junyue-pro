import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 获取第一个启用的攻略内容
    const guide = await prisma.guideContent.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    // 如果没有攻略，返回默认内容
    if (!guide) {
      return NextResponse.json({
        success: true,
        data: {
          title: "必看攻略",
          content: "# 必看攻略\n\n暂无内容",
          updatedAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        title: guide.title,
        content: guide.content,
        updatedAt: guide.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("获取攻略内容失败:", error);
    return NextResponse.json({ success: false, error: "获取攻略内容失败" }, { status: 500 });
  }
}
