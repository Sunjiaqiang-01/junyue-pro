import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { nanoid } from "nanoid";
import { writeFile } from "fs/promises";
import { auth } from "@/auth";
import { ensureTherapistFolder } from "@/lib/folder-manager";
import prisma from "@/lib/prisma";

// 文件大小限制
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB (压缩前)

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/avi"];

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // therapist-videos
    const thumbnailFile = formData.get("thumbnail") as File; // 前端生成的缩略图
    const duration = formData.get("duration") as string; // 前端获取的时长

    // 验证上传权限 - 只有技师可以上传视频
    if (session.user.role !== "therapist") {
      return NextResponse.json({ success: false, error: "无权限上传视频" }, { status: 403 });
    }

    if (!file) {
      return NextResponse.json({ error: "未选择文件" }, { status: 400 });
    }

    // 验证文件类型 - 只允许视频
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isVideo) {
      return NextResponse.json({ error: "不支持的文件类型，请上传视频文件" }, { status: 400 });
    }

    // 验证文件大小
    if (file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: `视频大小不能超过 ${MAX_VIDEO_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // 获取技师信息
    const therapist = await prisma.therapist.findUnique({
      where: { id: session.user.id },
      select: { id: true, nickname: true },
    });

    if (!therapist) {
      return NextResponse.json({ success: false, error: "技师信息不存在" }, { status: 404 });
    }

    // 生成唯一文件名基础
    const timestamp = Date.now();
    const randomId = nanoid(10);
    const baseFileName = `${timestamp}-${randomId}`;
    const fileExtension = file.name.split(".").pop() || "mp4";

    // 确保技师专属文件夹存在
    const baseUploadDir = join(process.cwd(), "public", "uploads", "therapist-videos");
    const folderName = await ensureTherapistFolder(baseUploadDir, therapist.id, therapist.nickname);
    const uploadDir = join(baseUploadDir, folderName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 保存原视频文件
    console.log(`🎬 开始保存视频: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    const videoFileName = `${baseFileName}.${fileExtension}`;
    const videoPath = join(uploadDir, videoFileName);
    await writeFile(videoPath, buffer);

    // 保存缩略图（如果提供）
    let coverFileName = "default_cover.webp"; // 默认封面
    if (thumbnailFile && thumbnailFile.size > 0) {
      const thumbnailBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
      coverFileName = `${baseFileName}_cover.webp`;
      const coverPath = join(uploadDir, coverFileName);
      await writeFile(coverPath, thumbnailBuffer);
      console.log(`📸 缩略图已保存: ${coverFileName}`);
    } else {
      console.log(`⚠️ 未提供缩略图，使用默认封面`);
    }

    // 构建正确的URL路径
    const basePath = `/uploads/therapist-videos/${folderName}`;

    console.log(`✅ 视频上传完成: 视频=${videoFileName}, 封面=${coverFileName}`);

    return NextResponse.json({
      success: true,
      url: `${basePath}/${videoFileName}`,
      videoUrl: `${basePath}/${videoFileName}`,
      coverUrl: `${basePath}/${coverFileName}`,
      duration: duration ? parseInt(duration) : 0,
      fileName: videoFileName,
      fileSize: file.size,
      fileType: "video",
    });
  } catch (error) {
    console.error("视频上传错误:", error);
    return NextResponse.json({ error: "视频上传失败" }, { status: 500 });
  }
}
