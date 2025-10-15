/**
 * 图片处理工具库 - 极简版
 * 只生成单一优化版本，CSS控制显示尺寸
 */

import sharp from "sharp";
import { join } from "path";

/**
 * 处理图片：生成单一优化版本
 * 智能压缩，保持比例，限制最大尺寸
 */
export async function processImage(
  buffer: Buffer,
  uploadDir: string,
  baseFileName: string
): Promise<{
  url: string;
}> {
  try {
    // 智能优化：保持比例，限制最大尺寸，高质量压缩
    const optimizedImage = await sharp(buffer)
      .resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true, // 小图不放大
      })
      .webp({ quality: 90 })
      .toBuffer();

    const fileName = `${baseFileName}.webp`;
    const filePath = join(uploadDir, fileName);

    // 使用 toFile 而不是 writeFile，性能更好
    await sharp(optimizedImage).toFile(filePath);

    return { url: fileName };
  } catch (error) {
    console.error("图片处理失败:", error);
    throw new Error("图片处理失败");
  }
}
