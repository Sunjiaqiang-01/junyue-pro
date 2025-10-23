/**
 * 统一的API响应类型定义
 * 确保前后端数据结构一致
 */

/**
 * 标准分页列表响应格式
 * @template T - 列表项的类型
 */
export interface PaginatedListResponse<T> {
  /** 列表数据 */
  items: T[];
  /** 分页信息 */
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 直接列表响应格式（不含分页）
 * @template T - 列表项的类型
 */
export interface DirectListResponse<T> {
  data: T[];
}

/**
 * 统一API响应格式
 * @template T - 响应数据类型
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: number;
  requestId?: string;
}

/**
 * 分页API响应
 * @template T - 列表项类型
 */
export type PaginatedApiResponse<T> = ApiResponse<PaginatedListResponse<T>>;

/**
 * 类型守卫函数：检查是否为分页列表响应
 */
export function isPaginatedResponse<T>(
  data: unknown
): data is {
  items: T[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
} {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as any;
  return (
    Array.isArray(obj.items) &&
    obj.pagination &&
    typeof obj.pagination.page === "number" &&
    typeof obj.pagination.pageSize === "number" &&
    typeof obj.pagination.total === "number" &&
    typeof obj.pagination.totalPages === "number"
  );
}

/**
 * 类型守卫函数：检查API响应是否成功
 */
export function isSuccessResponse<T>(response: unknown): response is ApiResponse<T> {
  if (typeof response !== "object" || response === null) return false;
  const obj = response as any;
  return obj.success === true;
}
