import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { nanoid } from "nanoid";
import { auth } from "@/auth";
import { processImage } from "@/lib/image-processor";
import { ensureTherapistFolder } from "@/lib/folder-manager";
import prisma from "@/lib/prisma";

// 文件大小限制
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // avatars | therapist-photos | evidence

    // 验证上传权限
    if (type === "therapist-photos") {
      if (session.user.role !== "therapist") {
        return NextResponse.json({ success: false, error: "无权限上传技师照片" }, { status: 403 });
      }
    } else if (type === "evidence") {
      if (session.user.role !== "admin") {
        return NextResponse.json({ success: false, error: "无权限上传凭证" }, { status: 403 });
      }
    }

    if (!file) {
      return NextResponse.json({ error: "未选择文件" }, { status: 400 });
    }

    // 验证文件类型 - 只允许图片
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);

    if (!isImage) {
      return NextResponse.json({ error: "不支持的文件类型，请上传图片文件" }, { status: 400 });
    }

    // 验证文件大小
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: `图片大小不能超过 ${MAX_IMAGE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // 生成唯一文件名基础
    const timestamp = Date.now();
    const randomId = nanoid(10);
    const baseFileName = `${timestamp}-${randomId}`;

    let uploadDir: string;
    let folderName: string = "";

    // 为技师照片创建专属文件夹
    if (type === "therapist-photos") {
      // 获取技师信息
      const therapist = await prisma.therapist.findUnique({
        where: { id: session.user.id },
        select: { id: true, nickname: true },
      });

      if (!therapist) {
        return NextResponse.json({ success: false, error: "技师信息不存在" }, { status: 404 });
      }

      // 确保技师专属文件夹存在
      const baseUploadDir = join(process.cwd(), "public", "uploads", type);
      folderName = await ensureTherapistFolder(baseUploadDir, therapist.id, therapist.nickname);
      uploadDir = join(baseUploadDir, folderName);
    } else {
      // 其他类型文件使用原有逻辑
      uploadDir = join(process.cwd(), "public", "uploads", type || "avatars");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 处理图片: 生成单一优化版本
    console.log(`📸 开始处理图片: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    const { url } = await processImage(buffer, uploadDir, baseFileName);

    // 构建正确的URL路径
    const basePath = folderName
      ? `/uploads/${type}/${folderName}`
      : `/uploads/${type || "avatars"}`;

    console.log(`✅ 图片处理完成: ${url}`);

    return NextResponse.json({
      success: true,
      url: `${basePath}/${url}`,
      fileName: url,
      fileSize: file.size,
      fileType: "image",
    });
  } catch (error) {
    console.error("图片上传错误:", error);
    return NextResponse.json({ error: "图片上传失败" }, { status: 500 });
  }
}
