/**
 * 错误信息脱敏工具
 * 防止在生产环境中泄露敏感技术细节
 */

// 敏感信息模式（需要脱敏的内容）
const SENSITIVE_PATTERNS = [
  // 文件路径
  /\/root\/[^\s]+/gi,
  /\/home\/[^\s]+/gi,
  /\/var\/[^\s]+/gi,
  /C:\\[^\s]+/gi,

  // 数据库连接字符串
  /postgresql:\/\/[^\s]+/gi,
  /mysql:\/\/[^\s]+/gi,
  /mongodb:\/\/[^\s]+/gi,
  /redis:\/\/[^\s]+/gi,

  // IP地址（保留localhost）
  /\b(?!127\.0\.0\.1|localhost)\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,

  // 端口号（除了常见端口）
  /:(\d{4,5})\b(?!80|443|3000)/g,

  // 环境变量名称
  /process\.env\.[A-Z_]+/gi,

  // SQL错误详情
  /column "[^"]+"/gi,
  /table "[^"]+"/gi,
  /constraint "[^"]+"/gi,

  // 密码/密钥提示
  /password/gi,
  /secret/gi,
  /token/gi,
  /api[_-]?key/gi,
];

/**
 * 通用错误消息（用户友好）
 */
const GENERIC_MESSAGES: Record<string, string> = {
  database: "数据库操作失败，请稍后重试",
  auth: "身份验证失败，请重新登录",
  file: "文件处理失败，请检查文件格式",
  network: "网络请求失败，请检查网络连接",
  validation: "输入数据不符合要求",
  permission: "您没有权限执行此操作",
  notFound: "请求的资源不存在",
  server: "服务器内部错误，请稍后重试",
};

/**
 * 脱敏错误消息
 * @param error 原始错误对象或字符串
 * @param context 错误上下文（用于选择合适的通用消息）
 * @returns 脱敏后的错误消息
 */
export function sanitizeError(error: unknown, context?: keyof typeof GENERIC_MESSAGES): string {
  // 生产环境：返回通用消息
  if (process.env.NODE_ENV === "production") {
    // 如果指定了上下文，返回对应的通用消息
    if (context && GENERIC_MESSAGES[context]) {
      return GENERIC_MESSAGES[context];
    }

    // 尝试根据错误类型推断上下文
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("database") || errorMessage.includes("prisma")) {
      return GENERIC_MESSAGES.database;
    }
    if (errorMessage.includes("auth") || errorMessage.includes("unauthorized")) {
      return GENERIC_MESSAGES.auth;
    }
    if (errorMessage.includes("file") || errorMessage.includes("upload")) {
      return GENERIC_MESSAGES.file;
    }
    if (errorMessage.includes("fetch") || errorMessage.includes("network")) {
      return GENERIC_MESSAGES.network;
    }
    if (errorMessage.includes("permission") || errorMessage.includes("forbidden")) {
      return GENERIC_MESSAGES.permission;
    }
    if (errorMessage.includes("not found") || errorMessage.includes("404")) {
      return GENERIC_MESSAGES.notFound;
    }

    // 默认通用消息
    return GENERIC_MESSAGES.server;
  }

  // 开发环境：脱敏后返回原始消息（用于调试）
  const errorMessage = error instanceof Error ? error.message : String(error);
  let sanitized = errorMessage;

  // 应用所有脱敏模式
  SENSITIVE_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, "[已隐藏]");
  });

  return sanitized;
}

/**
 * 脱敏错误堆栈（仅开发环境使用）
 * @param error 错误对象
 * @returns 脱敏后的堆栈信息
 */
export function sanitizeStack(error: Error): string | undefined {
  if (process.env.NODE_ENV === "production") {
    return undefined; // 生产环境不返回堆栈
  }

  if (!error.stack) {
    return undefined;
  }

  let sanitized = error.stack;

  // 应用所有脱敏模式
  SENSITIVE_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, "[已隐藏]");
  });

  return sanitized;
}

/**
 * 创建安全的错误响应
 * @param error 原始错误
 * @param context 错误上下文
 * @param statusCode HTTP状态码
 * @returns 安全的错误响应对象
 */
export function createSafeErrorResponse(
  error: unknown,
  context?: keyof typeof GENERIC_MESSAGES,
  statusCode: number = 500
): {
  error: string;
  code: number;
  timestamp: string;
  stack?: string;
} {
  const message = sanitizeError(error, context);
  const stack = error instanceof Error ? sanitizeStack(error) : undefined;

  return {
    error: message,
    code: statusCode,
    timestamp: new Date().toISOString(),
    ...(stack && { stack }), // 仅在开发环境包含堆栈
  };
}

/**
 * 日志记录助手（自动脱敏）
 * @param level 日志级别
 * @param message 消息
 * @param data 附加数据
 */
export function logSafe(level: "info" | "warn" | "error", message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const sanitizedMessage = sanitizeError(message);

  // 脱敏附加数据
  let sanitizedData = data;
  if (data && typeof data === "object") {
    sanitizedData = JSON.parse(
      JSON.stringify(data, (key, value) => {
        // 隐藏密码字段
        if (
          typeof key === "string" &&
          (key.toLowerCase().includes("password") ||
            key.toLowerCase().includes("secret") ||
            key.toLowerCase().includes("token"))
        ) {
          return "[已隐藏]";
        }
        return value;
      })
    );
  }

  const logEntry: Record<string, unknown> = {
    timestamp,
    level: level.toUpperCase(),
    message: sanitizedMessage,
  };

  if (sanitizedData) {
    logEntry.data = sanitizedData;
  }

  // 输出到控制台
  if (level === "error") {
    console.error(JSON.stringify(logEntry, null, 2));
  } else if (level === "warn") {
    console.warn(JSON.stringify(logEntry, null, 2));
  } else {
    console.log(JSON.stringify(logEntry, null, 2));
  }
}
