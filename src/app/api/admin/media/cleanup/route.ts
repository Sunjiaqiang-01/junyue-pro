import { NextResponse } from "next/server";
import { auth } from "@/auth";
import * as fs from "fs/promises";

export async function DELETE(request: Request) {
  try {
    // 验证管理员权限
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, error: "无权限访问" }, { status: 401 });
    }

    const { paths, dryRun = false } = await request.json();

    if (!Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json(
        { success: false, error: "请提供要删除的文件路径" },
        { status: 400 }
      );
    }

    const results = {
      deleted: 0,
      freed: 0,
      errors: [] as { path: string; error: string }[],
    };

    for (const filePath of paths) {
      try {
        // 安全检查：确保路径在 uploads 目录内
        if (!filePath.includes("/public/uploads/")) {
          results.errors.push({ path: filePath, error: "不允许删除uploads目录外的文件" });
          continue;
        }

        // 获取文件大小
        const stats = await fs.stat(filePath);
        const fileSize = stats.size;

        if (dryRun) {
          // 预览模式：只统计，不实际删除
          results.deleted++;
          results.freed += fileSize;
        } else {
          // 实际删除
          await fs.unlink(filePath);
          results.deleted++;
          results.freed += fileSize;
        }
      } catch (error: any) {
        console.error(`❌ 删除失败: ${filePath}`, error);
        results.errors.push({
          path: filePath,
          error: error.message || "删除失败",
        });
      }
    }

    // 格式化释放的空间
    const freedMB = (results.freed / 1024 / 1024).toFixed(2);

    return NextResponse.json({
      success: true,
      data: {
        ...results,
        freedFormatted: `${freedMB} MB`,
        dryRun,
      },
    });
  } catch (error) {
    console.error("清理文件失败:", error);
    return NextResponse.json({ success: false, error: "清理文件失败" }, { status: 500 });
  }
}
