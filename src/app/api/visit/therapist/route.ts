import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/visit-rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { therapistId, referrer } = await req.json();

    if (!therapistId) {
      return NextResponse.json({ error: "技师ID不能为空" }, { status: 400 });
    }

    // 获取访问者信息
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    // 防刷机制：同一IP 30秒内浏览同一技师只记录一次
    const cacheKey = `therapist:${therapistId}`;
    if (!checkRateLimit(ip, cacheKey, 30)) {
      // 超过频率限制，静默返回成功（不记录）
      return NextResponse.json({ success: true });
    }

    // 检查技师是否存在
    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
      select: { id: true },
    });

    if (!therapist) {
      return NextResponse.json({ error: "技师不存在" }, { status: 404 });
    }

    // 同时执行：1) 记录技师浏览 2) 增加浏览计数
    await prisma.$transaction([
      // 记录浏览详情
      prisma.therapistView.create({
        data: {
          therapistId,
          ip,
          userAgent,
          referrer,
        },
      }),
      // 增加技师的浏览计数
      prisma.therapist.update({
        where: { id: therapistId },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("记录技师浏览失败:", error);
    return NextResponse.json({ error: "记录浏览失败" }, { status: 500 });
  }
}
