/**
 * 统一API响应格式工具
 * 提供标准化的API响应结构，便于前端统一处理
 */

/**
 * 统一API响应类型
 * @template T - 响应数据类型
 */
export interface ApiResponse<T = any> {
  /** 请求是否成功 */
  success: boolean;
  /** 响应数据（成功时） */
  data?: T;
  /** 错误信息（失败时） */
  error?: string;
  /** 错误代码（失败时，可选） */
  code?: string;
  /** 响应时间戳 */
  timestamp: number;
  /** 请求ID（用于追踪） */
  requestId?: string;
}

/**
 * 创建成功响应
 * @template T - 数据类型
 * @param data - 响应数据
 * @param requestId - 请求ID（可选）
 * @returns 标准化的成功响应
 *
 * @example
 * ```typescript
 * return NextResponse.json(
 *   apiSuccess({ users: [...] }),
 *   { status: 200 }
 * );
 * ```
 */
export function apiSuccess<T = any>(data: T, requestId?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: Date.now(),
    ...(requestId && { requestId }),
  };
}

/**
 * 创建错误响应
 * @param error - 错误信息
 * @param code - 错误代码（可选）
 * @param requestId - 请求ID（可选）
 * @returns 标准化的错误响应
 *
 * @example
 * ```typescript
 * return NextResponse.json(
 *   apiError("用户不存在", "USER_NOT_FOUND"),
 *   { status: 404 }
 * );
 * ```
 */
export function apiError(error: string, code?: string, requestId?: string): ApiResponse<never> {
  return {
    success: false,
    error,
    ...(code && { code }),
    timestamp: Date.now(),
    ...(requestId && { requestId }),
  };
}

/**
 * 分页响应数据类型
 */
export interface PaginationMeta {
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 总条数 */
  total: number;
  /** 总页数 */
  totalPages: number;
}

/**
 * 分页响应类型
 * @template T - 列表项类型
 */
export interface PaginatedResponse<T> {
  /** 列表数据 */
  items: T[];
  /** 分页信息 */
  pagination: PaginationMeta;
}

/**
 * 创建分页成功响应
 * @template T - 列表项类型
 * @param items - 列表数据
 * @param pagination - 分页信息
 * @param requestId - 请求ID（可选）
 * @returns 标准化的分页响应
 *
 * @example
 * ```typescript
 * return NextResponse.json(
 *   apiPaginatedSuccess(therapists, {
 *     page: 1,
 *     pageSize: 20,
 *     total: 100,
 *     totalPages: 5
 *   })
 * );
 * ```
 */
export function apiPaginatedSuccess<T>(
  items: T[],
  pagination: PaginationMeta,
  requestId?: string
): ApiResponse<PaginatedResponse<T>> {
  return apiSuccess(
    {
      items,
      pagination,
    },
    requestId
  );
}

/**
 * 常用错误代码常量
 */
export const ErrorCodes = {
  // 认证相关 (401)
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  SESSION_EXPIRED: "SESSION_EXPIRED",

  // 权限相关 (403)
  FORBIDDEN: "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",

  // 资源相关 (404)
  NOT_FOUND: "NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",

  // 请求相关 (400)
  BAD_REQUEST: "BAD_REQUEST",
  INVALID_PARAMETER: "INVALID_PARAMETER",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  MISSING_FIELD: "MISSING_FIELD",

  // 业务逻辑 (409, 422)
  CONFLICT: "CONFLICT",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  BUSINESS_LOGIC_ERROR: "BUSINESS_LOGIC_ERROR",

  // 限流相关 (429)
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",

  // 服务器相关 (500)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
} as const;

/**
 * 错误代码类型
 */
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
