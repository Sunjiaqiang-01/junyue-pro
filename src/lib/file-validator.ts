/**
 * 文件安全验证工具
 * 通过Magic Number（文件头）验证真实文件类型，防止伪造
 */

// 文件类型Magic Number映射
const FILE_SIGNATURES: Record<string, number[][]> = {
  // 图片格式
  jpeg: [
    [0xff, 0xd8, 0xff], // JPEG
  ],
  png: [
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG
  ],
  webp: [
    [0x52, 0x49, 0x46, 0x46], // RIFF (WebP的前4字节)
  ],
  gif: [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],

  // 视频格式
  mp4: [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftyp
    [0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70], // ftyp
  ],
  avi: [
    [0x52, 0x49, 0x46, 0x46], // RIFF
  ],
};

/**
 * 检查Buffer是否匹配指定的Magic Number
 */
function matchesSignature(buffer: Buffer, signature: number[]): boolean {
  if (buffer.length < signature.length) {
    return false;
  }

  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) {
      return false;
    }
  }

  return true;
}

/**
 * 验证文件真实类型（通过Magic Number）
 * @param buffer 文件Buffer
 * @param expectedType 期望的文件类型（jpeg, png, webp, mp4等）
 * @returns 是否匹配
 */
export function validateFileType(buffer: Buffer, expectedType: string): boolean {
  const signatures = FILE_SIGNATURES[expectedType.toLowerCase()];

  if (!signatures) {
    console.warn(`⚠️ 未知的文件类型: ${expectedType}`);
    return false;
  }

  // 检查是否匹配任一签名
  return signatures.some((signature) => matchesSignature(buffer, signature));
}

/**
 * 检测文件真实类型
 * @param buffer 文件Buffer
 * @returns 文件类型或null
 */
export function detectFileType(buffer: Buffer): string | null {
  for (const [type, signatures] of Object.entries(FILE_SIGNATURES)) {
    if (signatures.some((sig) => matchesSignature(buffer, sig))) {
      return type;
    }
  }
  return null;
}

/**
 * 验证图片尺寸（防止解压炸弹攻击）
 * @param buffer 图片Buffer
 * @returns 尺寸信息或错误
 */
export async function validateImageDimensions(
  buffer: Buffer
): Promise<{ valid: boolean; width?: number; height?: number; error?: string }> {
  try {
    // 动态导入sharp（避免在不需要时加载）
    const sharp = (await import("sharp")).default;

    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // 限制最大尺寸（防止DoS攻击）
    const MAX_DIMENSION = 10000; // 10000px
    const MAX_PIXELS = 100000000; // 1亿像素

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      return {
        valid: false,
        width,
        height,
        error: `图片尺寸过大: ${width}x${height}，最大允许${MAX_DIMENSION}px`,
      };
    }

    if (width * height > MAX_PIXELS) {
      return {
        valid: false,
        width,
        height,
        error: `图片像素总数过大: ${width * height}，最大允许${MAX_PIXELS}`,
      };
    }

    return {
      valid: true,
      width,
      height,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "图片验证失败",
    };
  }
}

/**
 * 清理文件名（移除危险字符）
 * @param filename 原始文件名
 * @returns 清理后的文件名
 */
export function sanitizeFilename(filename: string): string {
  // 移除路径遍历字符
  let cleaned = filename.replace(/\.\./g, "");

  // 只保留字母、数字、中文、下划线、连字符、点
  cleaned = cleaned.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_\-\.]/g, "_");

  // 移除开头的点（防止隐藏文件）
  cleaned = cleaned.replace(/^\.+/, "");

  // 限制长度
  if (cleaned.length > 100) {
    const ext = cleaned.split(".").pop() || "";
    cleaned = cleaned.substring(0, 100 - ext.length - 1) + "." + ext;
  }

  return cleaned || "unnamed";
}

/**
 * 完整的文件安全验证
 * @param file 上传的文件
 * @param buffer 文件Buffer
 * @param allowedTypes 允许的文件类型
 * @returns 验证结果
 */
export async function validateUploadedFile(
  file: File,
  buffer: Buffer,
  allowedTypes: string[]
): Promise<{ valid: boolean; error?: string; detectedType?: string }> {
  // 1. 检测真实文件类型
  const detectedType = detectFileType(buffer);

  if (!detectedType) {
    return {
      valid: false,
      error: "无法识别的文件类型",
    };
  }

  // 2. 验证是否在允许的类型中
  if (!allowedTypes.includes(detectedType)) {
    return {
      valid: false,
      error: `不支持的文件类型: ${detectedType}。允许的类型: ${allowedTypes.join(", ")}`,
      detectedType,
    };
  }

  // 3. 验证MIME类型与实际类型是否一致
  const mimeType = file.type.split("/")[1];
  if (mimeType && mimeType !== detectedType && detectedType !== "jpeg") {
    // JPEG特殊处理（jpg和jpeg都指向同一格式）
    if (!(mimeType === "jpg" && detectedType === "jpeg")) {
      console.warn(`⚠️ MIME类型不一致: 声称${file.type}，实际${detectedType}`);
    }
  }

  // 4. 图片额外验证尺寸
  if (["jpeg", "png", "webp", "gif"].includes(detectedType)) {
    const dimensionCheck = await validateImageDimensions(buffer);
    if (!dimensionCheck.valid) {
      return {
        valid: false,
        error: dimensionCheck.error,
        detectedType,
      };
    }
  }

  return {
    valid: true,
    detectedType,
  };
}
