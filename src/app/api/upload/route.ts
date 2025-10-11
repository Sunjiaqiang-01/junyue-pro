import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import { nanoid } from "nanoid";

const MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_SIZE || "104857600"); // 100MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // avatars | therapist-photos | therapist-videos | evidence

    if (!file) {
      return NextResponse.json(
        { error: "未选择文件" },
        { status: 400 }
      );
    }

    // 验证文件类型
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "不支持的文件类型" },
        { status: 400 }
      );
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `文件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomId = nanoid(10);
    const fileExtension = file.name.split(".").pop();
    
    let fileName: string;
    let uploadDir: string;

    if (isImage) {
      // 图片转换为WebP格式
      fileName = `${timestamp}-${randomId}.webp`;
      uploadDir = join(process.cwd(), "public", "uploads", type || "avatars");
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 使用Sharp压缩并转换为WebP
      const optimizedBuffer = await sharp(buffer)
        .resize(1200, 1200, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();

      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, optimizedBuffer);
    } else {
      // 视频直接存储
      fileName = `${timestamp}-${randomId}.${fileExtension}`;
      uploadDir = join(process.cwd(), "public", "uploads", type || "therapist-videos");
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);
    }

    // 返回文件URL
    const fileUrl = `/uploads/${type || (isImage ? "avatars" : "therapist-videos")}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName,
      fileSize: file.size,
      fileType: isImage ? "image" : "video",
    });
  } catch (error) {
    console.error("文件上传错误:", error);
    return NextResponse.json(
      { error: "文件上传失败" },
      { status: 500 }
    );
  }
}

