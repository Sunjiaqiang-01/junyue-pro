/**
 * 图片验证工具库
 * 支持所有主流图片格式，同时确保安全性
 */

// 1. 定义支持的图片格式配置
interface ImageFormat {
  mime: string;
  extensions: string[];
  magicBytes: string[]; // 支持多个签名（如TIFF有两种）
  maxSize?: number; // 可选的格式特定大小限制
}

export const SUPPORTED_FORMATS: Record<string, ImageFormat> = {
  jpeg: {
    mime: "image/jpeg",
    extensions: [".jpg", ".jpeg"],
    magicBytes: ["FFD8FF"], // JPEG文件必以此开头
  },
  png: {
    mime: "image/png",
    extensions: [".png"],
    magicBytes: ["89504E47"], // PNG signature
  },
  gif: {
    mime: "image/gif",
    extensions: [".gif"],
    magicBytes: ["474946383761", "474946383961"], // GIF87a, GIF89a
  },
  webp: {
    mime: "image/webp",
    extensions: [".webp"],
    magicBytes: ["52494646"], // RIFF (WebP容器)
  },
  bmp: {
    mime: "image/bmp",
    extensions: [".bmp"],
    magicBytes: ["424D"], // BM
  },
  tiff: {
    mime: "image/tiff",
    extensions: [".tif", ".tiff"],
    magicBytes: ["49492A00", "4D4D002A"], // Little-endian, Big-endian
  },
  ico: {
    mime: "image/x-icon",
    extensions: [".ico"],
    magicBytes: ["00000100"], // ICO signature
  },
  svg: {
    mime: "image/svg+xml",
    extensions: [".svg"],
    magicBytes: ["3C737667", "3C3F786D6C"], // <svg, <?xml
    maxSize: 5 * 1024 * 1024, // SVG限制5MB（防止XML炸弹）
  },
  heic: {
    mime: "image/heic",
    extensions: [".heic", ".heif"],
    magicBytes: ["6674797068656963"], // ftypheic
  },
  avif: {
    mime: "image/avif",
    extensions: [".avif"],
    magicBytes: ["66747970617669"], // ftypavi
  },
};

// 2. 获取所有支持的MIME类型
export function getSupportedMimeTypes(): string[] {
  return Object.values(SUPPORTED_FORMATS).map((f) => f.mime);
}

// 3. 获取所有支持的扩展名
export function getSupportedExtensions(): string[] {
  return Object.values(SUPPORTED_FORMATS).flatMap((f) => f.extensions);
}

// 4. 验证文件头（Magic Bytes）
export function validateFileHeader(buffer: ArrayBuffer): {
  valid: boolean;
  format?: string;
  mime?: string;
} {
  const uint8 = new Uint8Array(buffer);

  // 读取前16个字节（足够识别所有格式）
  const headerBytes = Array.from(uint8.slice(0, 16))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  // 遍历所有支持的格式
  for (const [formatName, format] of Object.entries(SUPPORTED_FORMATS)) {
    for (const magicBytes of format.magicBytes) {
      if (headerBytes.startsWith(magicBytes)) {
        return {
          valid: true,
          format: formatName,
          mime: format.mime,
        };
      }
    }
  }

  return { valid: false };
}

// 5. 验证文件扩展名
export function validateExtension(fileName: string): {
  valid: boolean;
  extension?: string;
} {
  const lowerName = fileName.toLowerCase();

  for (const format of Object.values(SUPPORTED_FORMATS)) {
    for (const ext of format.extensions) {
      if (lowerName.endsWith(ext)) {
        return { valid: true, extension: ext };
      }
    }
  }

  return { valid: false };
}

// 6. 验证MIME类型
export function validateMimeType(mimeType: string): {
  valid: boolean;
  format?: string;
} {
  const format = Object.entries(SUPPORTED_FORMATS).find(([_, f]) => f.mime === mimeType);

  if (format) {
    return { valid: true, format: format[0] };
  }

  return { valid: false };
}

// 7. 完整验证函数
export interface ValidationResult {
  valid: boolean;
  error?: string;
  format?: string;
  mime?: string;
  safeFileName?: string;
}

export async function validateImageFile(
  file: File,
  maxSizeBytes: number = 10 * 1024 * 1024 // 默认10MB
): Promise<ValidationResult> {
  // 第1层：文件大小检查
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `文件大小超出限制（最大${(maxSizeBytes / 1024 / 1024).toFixed(0)}MB）`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: "文件为空",
    };
  }

  // 第2层：MIME类型检查
  const mimeCheck = validateMimeType(file.type);
  if (!mimeCheck.valid) {
    return {
      valid: false,
      error: `不支持的文件类型：${file.type}。支持格式：JPEG, PNG, GIF, WebP, BMP, TIFF, SVG, HEIC, AVIF`,
    };
  }

  // 第3层：文件扩展名检查
  const extCheck = validateExtension(file.name);
  if (!extCheck.valid) {
    return {
      valid: false,
      error: `不支持的文件扩展名。支持的扩展名：${getSupportedExtensions().join(", ")}`,
    };
  }

  // 第4层：文件头验证（Magic Bytes）
  const buffer = await file.arrayBuffer();
  const headerCheck = validateFileHeader(buffer);

  if (!headerCheck.valid) {
    return {
      valid: false,
      error: "文件头验证失败，文件可能已损坏或被伪造",
    };
  }

  // 第5层：交叉验证（MIME类型与文件头是否匹配）
  if (mimeCheck.format && headerCheck.format) {
    // 特殊情况：jpeg和jpg是同一格式
    const normalizedMimeFormat = mimeCheck.format === "jpg" ? "jpeg" : mimeCheck.format;
    const normalizedHeaderFormat = headerCheck.format === "jpg" ? "jpeg" : headerCheck.format;

    if (normalizedMimeFormat !== normalizedHeaderFormat) {
      return {
        valid: false,
        error: `文件类型不匹配（声称是${file.type}，实际是${headerCheck.mime}）`,
      };
    }
  }

  // 第6层：格式特定限制
  const format = SUPPORTED_FORMATS[headerCheck.format!];
  if (format.maxSize && file.size > format.maxSize) {
    return {
      valid: false,
      error: `${headerCheck.format?.toUpperCase()}文件大小超出限制（最大${(format.maxSize / 1024 / 1024).toFixed(0)}MB）`,
    };
  }

  // 生成安全的文件名
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const safeExt = extCheck.extension || ".jpg";
  const safeFileName = `${timestamp}-${randomStr}${safeExt}`;

  return {
    valid: true,
    format: headerCheck.format,
    mime: headerCheck.mime,
    safeFileName,
  };
}

// 8. SVG特殊处理（防止XSS和XML炸弹）
export async function sanitizeSvg(svgContent: string): Promise<string> {
  // 移除危险标签和属性
  const dangerousPatterns = [
    /<script[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?<\/iframe>/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi, // onclick, onerror等
    /javascript:/gi,
    /data:text\/html/gi,
  ];

  let sanitized = svgContent;
  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, "");
  }

  return sanitized;
}
