/**
 * 图片处理工具库 - 简化版
 * 只生成优化后的原图，配合Next.js Image自动优化
 * - 原图：1200x1200 WebP格式（约50-100KB）
 * - Next.js会根据sizes属性自动生成合适尺寸
 */

import sharp from "sharp";
import { join } from "path";

/**
 * 处理图片：只生成优化后的原图
 * @param buffer 图片缓冲区
 * @param uploadDir 上传目录
 * @param baseFileName 基础文件名
 * @returns 原图URL
 */
export async function processImage(
  buffer: Buffer,
  uploadDir: string,
  baseFileName: string
): Promise<string> {
  try {
    // ✅ 原图优化：1200x1200（配合Next.js Image自动优化）
    const optimizedImage = await sharp(buffer)
      .resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true, // 小图不放大
      })
      .webp({ quality: 85 }) // 平衡质量与文件大小
      .toBuffer();

    const fileName = `${baseFileName}.webp`;
    await sharp(optimizedImage).toFile(join(uploadDir, fileName));

    return fileName;
  } catch (error) {
    console.error("图片处理失败:", error);
    throw new Error("图片处理失败");
  }
}
