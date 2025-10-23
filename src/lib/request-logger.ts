/**
 * 请求日志工具
 * 用于记录API请求信息，便于调试和追踪
 */

import { nanoid } from "nanoid";
import { NextRequest } from "next/server";

/**
 * 请求日志信息
 */
export interface RequestLog {
  /** 请求ID */
  requestId: string;
  /** HTTP方法 */
  method: string;
  /** 请求路径 */
  path: string;
  /** 客户端IP */
  ip: string;
  /** 用户ID（如果已登录） */
  userId?: string;
  /** 用户角色 */
  userRole?: string;
  /** 请求时间 */
  timestamp: number;
  /** User-Agent */
  userAgent?: string;
  /** 查询参数 */
  query?: string;
}

/**
 * 响应日志信息
 */
export interface ResponseLog extends RequestLog {
  /** HTTP状态码 */
  statusCode: number;
  /** 响应时间（毫秒） */
  duration: number;
  /** 是否成功 */
  success: boolean;
  /** 错误信息（如果失败） */
  error?: string;
}

/**
 * 生成唯一的请求ID
 * @returns 16字符的请求ID
 */
export function generateRequestId(): string {
  return nanoid(16);
}

/**
 * 从请求中提取客户端IP
 * @param request - Next.js请求对象
 * @returns 客户端IP地址
 */
export function extractClientIp(request: NextRequest | Request): string {
  const headers = request.headers;

  // 按优先级检查各种IP头
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = headers.get("cf-connecting-ip"); // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  return "unknown";
}

/**
 * 记录请求开始
 * @param request - Next.js请求对象
 * @param userId - 用户ID（可选）
 * @param userRole - 用户角色（可选）
 * @returns 请求日志对象
 */
export function logRequestStart(
  request: NextRequest | Request,
  userId?: string,
  userRole?: string
): RequestLog {
  const requestId = generateRequestId();
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;
  const ip = extractClientIp(request);
  const userAgent = request.headers.get("user-agent") || undefined;
  const query = url.search || undefined;

  const log: RequestLog = {
    requestId,
    method,
    path,
    ip,
    timestamp: Date.now(),
    ...(userId && { userId }),
    ...(userRole && { userRole }),
    ...(userAgent && { userAgent }),
    ...(query && { query }),
  };

  // 彩色控制台输出
  console.log(
    `🔵 [${method}] ${path} | ID: ${requestId} | IP: ${ip}${userId ? ` | User: ${userId}` : ""}`
  );

  return log;
}

/**
 * 记录请求完成
 * @param requestLog - 请求日志对象
 * @param statusCode - HTTP状态码
 * @param error - 错误信息（可选）
 */
export function logRequestEnd(
  requestLog: RequestLog,
  statusCode: number,
  error?: string
): ResponseLog {
  const duration = Date.now() - requestLog.timestamp;
  const success = statusCode >= 200 && statusCode < 400;

  const responseLog: ResponseLog = {
    ...requestLog,
    statusCode,
    duration,
    success,
    ...(error && { error }),
  };

  // 根据状态码选择不同的emoji
  let emoji = "✅";
  if (statusCode >= 500) {
    emoji = "❌"; // 服务器错误
  } else if (statusCode >= 400) {
    emoji = "⚠️"; // 客户端错误
  } else if (statusCode >= 300) {
    emoji = "↩️"; // 重定向
  }

  // 根据响应时间选择颜色
  let durationColor = duration < 100 ? "🟢" : duration < 500 ? "🟡" : "🔴";

  console.log(
    `${emoji} [${requestLog.method}] ${requestLog.path} | ${statusCode} | ${durationColor} ${duration}ms | ID: ${requestLog.requestId}${
      error ? ` | Error: ${error}` : ""
    }`
  );

  return responseLog;
}

/**
 * API日志装饰器（高阶函数）
 * 自动记录请求开始和结束
 *
 * @example
 * ```typescript
 * export const GET = withRequestLogging(async (request) => {
 *   // 你的业务逻辑
 *   return NextResponse.json({ data: "..." });
 * });
 * ```
 */
export function withRequestLogging<
  T extends (request: NextRequest, ...args: any[]) => Promise<Response>,
>(handler: T): T {
  return (async (request: NextRequest, ...args: any[]) => {
    const requestLog = logRequestStart(request);

    try {
      const response = await handler(request, ...args);

      // 从响应中提取状态码
      const statusCode = response.status;

      // 尝试从响应体中提取错误信息
      let error: string | undefined;
      try {
        const clonedResponse = response.clone();
        const body = await clonedResponse.json();
        if (!body.success && body.error) {
          error = body.error;
        }
      } catch {
        // 忽略JSON解析错误
      }

      logRequestEnd(requestLog, statusCode, error);

      // 添加请求ID到响应头
      response.headers.set("X-Request-Id", requestLog.requestId);

      return response;
    } catch (error) {
      // 处理未捕获的异常
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logRequestEnd(requestLog, 500, errorMessage);
      throw error;
    }
  }) as T;
}

/**
 * 创建带有请求ID的响应头
 * @param requestId - 请求ID
 * @returns 包含请求ID的响应头对象
 */
export function createResponseHeaders(requestId: string): HeadersInit {
  return {
    "X-Request-Id": requestId,
    "X-Response-Time": Date.now().toString(),
  };
}
