/**
 * 错误日志工具
 * 提供结构化的错误日志记录，包含完整上下文信息
 */

/**
 * 日志级别
 */
export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

/**
 * 错误上下文信息
 */
export interface ErrorContext {
  /** 用户ID */
  userId?: string;
  /** 用户角色 */
  userRole?: string;
  /** 请求ID */
  requestId?: string;
  /** 请求路径 */
  path?: string;
  /** HTTP方法 */
  method?: string;
  /** 客户端IP */
  ip?: string;
  /** 附加数据 */
  metadata?: Record<string, any>;
}

/**
 * 错误日志条目
 */
export interface ErrorLog {
  /** 日志级别 */
  level: LogLevel;
  /** 错误消息 */
  message: string;
  /** 时间戳 */
  timestamp: number;
  /** 错误对象（如果有） */
  error?: Error;
  /** 错误堆栈 */
  stack?: string;
  /** 上下文信息 */
  context?: ErrorContext;
}

/**
 * 格式化错误信息
 * @param error - 错误对象
 * @returns 格式化的错误字符串
 */
function formatError(error: Error): string {
  return `${error.name}: ${error.message}`;
}

/**
 * 格式化上下文信息
 * @param context - 上下文对象
 * @returns 格式化的上下文字符串
 */
function formatContext(context?: ErrorContext): string {
  if (!context) return "";

  const parts: string[] = [];

  if (context.requestId) parts.push(`ReqID: ${context.requestId}`);
  if (context.userId) parts.push(`User: ${context.userId}`);
  if (context.userRole) parts.push(`Role: ${context.userRole}`);
  if (context.path) parts.push(`Path: ${context.path}`);
  if (context.method) parts.push(`Method: ${context.method}`);
  if (context.ip) parts.push(`IP: ${context.ip}`);

  return parts.length > 0 ? ` | ${parts.join(" | ")}` : "";
}

/**
 * 记录错误日志
 * @param message - 错误消息
 * @param error - 错误对象（可选）
 * @param context - 上下文信息（可选）
 */
export function logError(
  message: string,
  error?: Error | unknown,
  context?: ErrorContext
): ErrorLog {
  const timestamp = Date.now();
  const errorObj = error instanceof Error ? error : undefined;
  const stack = errorObj?.stack;

  const log: ErrorLog = {
    level: LogLevel.ERROR,
    message,
    timestamp,
    error: errorObj,
    stack,
    context,
  };

  // 彩色控制台输出
  console.error(`❌ [ERROR] ${message}${formatContext(context)}`);

  if (errorObj) {
    console.error(`   └─ ${formatError(errorObj)}`);
  }

  if (stack && process.env.NODE_ENV === "development") {
    console.error(`   └─ Stack:\n${stack}`);
  }

  // 在生产环境可以发送到监控服务（如Sentry）
  if (process.env.NODE_ENV === "production") {
    // TODO: 集成Sentry或其他错误监控服务
    // Sentry.captureException(errorObj || new Error(message), { contexts: { custom: context } });
  }

  return log;
}

/**
 * 记录警告日志
 * @param message - 警告消息
 * @param context - 上下文信息（可选）
 */
export function logWarning(message: string, context?: ErrorContext): ErrorLog {
  const timestamp = Date.now();

  const log: ErrorLog = {
    level: LogLevel.WARN,
    message,
    timestamp,
    context,
  };

  console.warn(`⚠️ [WARN] ${message}${formatContext(context)}`);

  return log;
}

/**
 * 记录信息日志
 * @param message - 信息消息
 * @param context - 上下文信息（可选）
 */
export function logInfo(message: string, context?: ErrorContext): ErrorLog {
  const timestamp = Date.now();

  const log: ErrorLog = {
    level: LogLevel.INFO,
    message,
    timestamp,
    context,
  };

  console.info(`ℹ️ [INFO] ${message}${formatContext(context)}`);

  return log;
}

/**
 * 记录调试日志（仅开发环境）
 * @param message - 调试消息
 * @param metadata - 附加数据（可选）
 */
export function logDebug(message: string, metadata?: Record<string, any>): ErrorLog | null {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const timestamp = Date.now();

  const log: ErrorLog = {
    level: LogLevel.DEBUG,
    message,
    timestamp,
    context: metadata ? { metadata } : undefined,
  };

  console.debug(`🔍 [DEBUG] ${message}`, metadata ? metadata : "");

  return log;
}

/**
 * 安全地序列化错误对象为JSON
 * @param error - 错误对象
 * @returns JSON字符串
 */
export function serializeError(error: Error): string {
  return JSON.stringify({
    name: error.name,
    message: error.message,
    stack: error.stack,
  });
}

/**
 * 从请求中提取错误上下文
 * @param request - 请求对象
 * @param session - 会话信息（可选）
 * @returns 错误上下文对象
 */
export function extractErrorContext(
  request: Request,
  session?: { user?: { id: string; role: string } }
): ErrorContext {
  const url = new URL(request.url);

  return {
    path: url.pathname,
    method: request.method,
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown",
    requestId: request.headers.get("x-request-id") || undefined,
    userId: session?.user?.id,
    userRole: session?.user?.role,
  };
}

/**
 * 错误日志装饰器（高阶函数）
 * 自动捕获并记录未处理的异常
 *
 * @example
 * ```typescript
 * export const GET = withErrorLogging(async (request) => {
 *   // 如果这里抛出异常，会自动记录日志
 *   throw new Error("Something went wrong");
 * });
 * ```
 */
export function withErrorLogging<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  operationName: string
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      logError(
        `Unhandled error in ${operationName}`,
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }) as T;
}

/**
 * 数据库错误处理
 * @param error - Prisma错误对象
 * @param context - 上下文信息
 */
export function logDatabaseError(error: any, context?: ErrorContext): void {
  const message = error.code
    ? `Database error [${error.code}]: ${error.message}`
    : `Database error: ${error.message}`;

  logError(message, error, {
    ...context,
    metadata: {
      ...context?.metadata,
      code: error.code,
      meta: error.meta,
    },
  });
}

/**
 * 安全日志（记录敏感操作）
 * @param action - 操作类型
 * @param context - 上下文信息
 * @param success - 是否成功
 */
export function logSecurityEvent(action: string, context: ErrorContext, success: boolean): void {
  const message = `Security Event: ${action} - ${success ? "SUCCESS" : "FAILED"}`;

  if (success) {
    logInfo(message, context);
  } else {
    logWarning(message, context);
  }
}
