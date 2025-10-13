import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(request: Request) {
  try {
    // 验证管理员权限
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "无权限" }, { status: 403 });
    }

    const body = await request.json();
    const { title, content } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json({ success: false, error: "内容不能为空" }, { status: 400 });
    }

    // 查找第一个攻略（如果有）
    const existingGuide = await prisma.guideContent.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    let guide;
    if (existingGuide) {
      // 更新现有攻略
      guide = await prisma.guideContent.update({
        where: { id: existingGuide.id },
        data: {
          title: title || "必看攻略",
          content,
        },
      });
    } else {
      // 创建新攻略
      guide = await prisma.guideContent.create({
        data: {
          title: title || "必看攻略",
          content,
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
    console.error("更新攻略内容失败:", error);
    return NextResponse.json({ success: false, error: "更新攻略内容失败" }, { status: 500 });
  }
}
