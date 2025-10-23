import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/visit-rate-limit";

export async function POST(req: NextRequest) {
  try {
    const { page, referrer } = await req.json();

    // 获取访问者信息
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || undefined;

    // 防刷机制：同一IP 30秒内访问同一页面只记录一次
    const cacheKey = `site:${page}`;
    if (!checkRateLimit(ip, cacheKey, 30)) {
      // 超过频率限制，静默返回成功（不记录）
      return NextResponse.json({ success: true });
    }

    // 记录网站访问
    await prisma.siteVisit.create({
      data: {
        ip,
        userAgent,
        page,
        referrer,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("记录网站访问失败:", error);
    return NextResponse.json({ error: "记录访问失败" }, { status: 500 });
  }
}
