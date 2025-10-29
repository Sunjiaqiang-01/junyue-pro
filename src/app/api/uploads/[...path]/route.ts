import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

/**
 * 动态服务 public/uploads 目录下的文件
 * 解决 Next.js 开发服务器不识别运行时上传文件的问题
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;

    // 安全检查：防止路径遍历攻击
    if (path.some((p) => p.includes(".."))) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 构建文件路径
    const filePath = join(process.cwd(), "public", "uploads", ...path);

    // 检查文件是否存在
    if (!existsSync(filePath)) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // 读取文件
    const fileBuffer = await readFile(filePath);

    // 检测MIME类型
    const ext = path[path.length - 1].split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      webp: "image/webp",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      mp4: "video/mp4",
      mov: "video/quicktime",
      avi: "video/x-msvideo",
    };
    const contentType = mimeTypes[ext || ""] || "application/octet-stream";

    // 返回文件（转换为Uint8Array兼容类型）
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("文件服务错误:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
