/**
 * 客户端文件压缩工具
 * 在上传前压缩图片和视频,节省带宽和上传时间
 */

/**
 * 压缩图片文件
 * 注意:这个需要在客户端环境使用
 */
export async function compressImageClient(file: File): Promise<File> {
  // 如果文件小于1MB,不需要压缩
  if (file.size < 1024 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // 限制最大尺寸
        const MAX_SIZE = 1920;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = (height / width) * MAX_SIZE;
            width = MAX_SIZE;
          } else {
            width = (width / height) * MAX_SIZE;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // 转换为Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("压缩失败"));
              return;
            }

            // 如果压缩后更大,使用原文件
            if (blob.size >= file.size) {
              resolve(file);
              return;
            }

            // 创建新文件
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            console.log(
              `📸 客户端压缩: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
            );
            resolve(compressedFile);
          },
          "image/jpeg",
          0.85 // 质量85%
        );
      };

      img.onerror = () => {
        reject(new Error("图片加载失败"));
      };
    };

    reader.onerror = () => {
      reject(new Error("文件读取失败"));
    };
  });
}

/**
 * 获取视频时长
 */
export async function getVideoClientDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(Math.round(video.duration));
    };

    video.onerror = () => {
      reject(new Error("视频加载失败"));
    };

    video.src = URL.createObjectURL(file);
  });
}

/**
 * 验证文件
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  if (!isImage && !isVideo) {
    return { valid: false, error: "不支持的文件类型" };
  }

  // 检查文件大小
  const maxSize = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `文件大小超过限制(${isImage ? "10MB" : "100MB"})`,
    };
  }

  return { valid: true };
}

/**
 * 批量压缩文件
 */
export async function compressFiles(files: File[]): Promise<File[]> {
  const compressed: File[] = [];

  for (const file of files) {
    const validation = validateFile(file);
    if (!validation.valid) {
      console.warn(`跳过文件 ${file.name}: ${validation.error}`);
      continue;
    }

    if (file.type.startsWith("image/")) {
      try {
        const compressedFile = await compressImageClient(file);
        compressed.push(compressedFile);
      } catch (error) {
        console.error(`压缩 ${file.name} 失败:`, error);
        compressed.push(file); // 压缩失败使用原文件
      }
    } else {
      compressed.push(file); // 视频不在客户端压缩
    }
  }

  return compressed;
}
