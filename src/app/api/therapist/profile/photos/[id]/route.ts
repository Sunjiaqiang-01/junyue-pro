import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// DELETE - 删除照片
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "therapist") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const { id } = await params;

    // 验证照片所有权
    const photo = await prisma.therapistPhoto.findUnique({
      where: { id },
    });

    if (!photo) {
      return NextResponse.json({ error: "照片不存在" }, { status: 404 });
    }

    if (photo.therapistId !== session.user.id) {
      return NextResponse.json({ error: "无权限删除此照片" }, { status: 403 });
    }

    // 删除物理文件
    const filesToDelete = [photo.url, photo.videoUrl, photo.coverUrl].filter(Boolean); // 过滤掉null/undefined值

    for (const fileUrl of filesToDelete) {
      try {
        const filePath = join(process.cwd(), "public", fileUrl!);
        if (existsSync(filePath)) {
          await unlink(filePath);
          console.log("✅ 成功删除物理文件:", filePath);
        }
      } catch (error) {
        // 文件可能已不存在，记录警告但继续执行
        console.warn("⚠️ 删除物理文件失败（文件可能不存在）:", fileUrl, error);
      }
    }

    // 使用事务删除照片并处理主图逻辑
    await prisma.$transaction(async (tx) => {
      // 删除数据库记录
      await tx.therapistPhoto.delete({
        where: { id },
      });

      // 如果删除的是主图，自动将下一张照片设为主图
      if (photo.isPrimary && !photo.isVideo) {
        const newPrimaryPhoto = await tx.therapistPhoto.findFirst({
          where: {
            therapistId: session.user.id,
            isVideo: false, // 只选择照片作为主图
          },
          orderBy: { order: "asc" }, // 按顺序选择第一张
        });

        if (newPrimaryPhoto) {
          await tx.therapistPhoto.update({
            where: { id: newPrimaryPhoto.id },
            data: { isPrimary: true },
          });
          console.log("✅ 自动设置新主图:", newPrimaryPhoto.id);
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "照片删除成功",
    });
  } catch (error) {
    console.error("删除照片失败:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
