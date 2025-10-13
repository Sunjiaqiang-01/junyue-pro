import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { batchGenerateRegistrationCodes } from "@/lib/registration-code";

/**
 * 批量生成注册验证码（管理员专用）
 */
export async function POST(req: Request) {
  try {
    // 验证管理员权限
    const session = await auth();

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { count, codeType, maxUses, expiresInDays, note } = await req.json();

    // 验证参数
    if (!count || count < 1 || count > 1000) {
      return NextResponse.json({ error: "生成数量必须在1-1000之间" }, { status: 400 });
    }

    if (!["ONETIME", "LIMITED", "UNLIMITED"].includes(codeType)) {
      return NextResponse.json({ error: "验证码类型无效" }, { status: 400 });
    }

    if (codeType === "LIMITED" && (!maxUses || maxUses < 1)) {
      return NextResponse.json({ error: "限次数类型必须设置最大使用次数" }, { status: 400 });
    }

    // 生成验证码
    const result = await batchGenerateRegistrationCodes({
      count,
      codeType,
      maxUses: codeType === "ONETIME" ? 1 : maxUses || -1,
      expiresInDays,
      note,
      createdBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      message: `成功生成${result.count}个验证码`,
      data: {
        count: result.count,
        codes: result.codes,
        type: codeType,
        maxUses: codeType === "ONETIME" ? 1 : maxUses || -1,
        expiresInDays: expiresInDays || null,
      },
    });
  } catch (error) {
    console.error("生成验证码错误:", error);
    return NextResponse.json({ error: "生成失败" }, { status: 500 });
  }
}
