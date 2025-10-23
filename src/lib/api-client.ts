import {
  ApiResponse,
  PaginatedListResponse,
  isSuccessResponse,
  isPaginatedResponse,
} from "@/types/api";

/**
 * 统一的API客户端
 * 提供类型安全的API调用和响应验证
 */

interface ApiErrorResponse {
  ok: false;
  error: string;
  status: number;
}

interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
}

type ApiResult<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * 验证API响应格式
 */
function validateApiResponse<T>(response: unknown): response is ApiResponse<T> {
  if (typeof response !== "object" || response === null) {
    return false;
  }
  const obj = response as any;
  return typeof obj.success === "boolean" && typeof obj.timestamp === "number";
}

/**
 * 通用API调用函数 (GET)
 */
export async function apiGet<T>(url: string, options?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    const data = await response.json();

    if (!validateApiResponse<T>(data)) {
      console.warn(`[API警告] 无效的API响应格式: ${url}`, data);
      return {
        ok: false,
        error: "服务器返回无效格式",
        status: response.status,
      };
    }

    if (!data.success) {
      return {
        ok: false,
        error: data.error || "请求失败",
        status: response.status,
      };
    }

    return {
      ok: true,
      data: data.data as T,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "网络错误";
    console.error(`[API错误] ${url}:`, error);
    return {
      ok: false,
      error: message,
      status: 0,
    };
  }
}

/**
 * 通用API调用函数 (POST/PUT)
 */
export async function apiPost<T>(
  url: string,
  body?: unknown,
  options?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });

    const data = await response.json();

    if (!validateApiResponse<T>(data)) {
      console.warn(`[API警告] 无效的API响应格式: ${url}`, data);
      return {
        ok: false,
        error: "服务器返回无效格式",
        status: response.status,
      };
    }

    if (!data.success) {
      return {
        ok: false,
        error: data.error || "请求失败",
        status: response.status,
      };
    }

    return {
      ok: true,
      data: data.data as T,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "网络错误";
    console.error(`[API错误] ${url}:`, error);
    return {
      ok: false,
      error: message,
      status: 0,
    };
  }
}

/**
 * 分页列表API调用
 */
export async function apiGetPaginated<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResult<PaginatedListResponse<T>>> {
  const result = await apiGet<PaginatedListResponse<T>>(url, options);

  if (!result.ok) {
    return result;
  }

  if (!isPaginatedResponse<T>(result.data)) {
    console.warn(`[API警告] 无效的分页响应格式: ${url}`, result.data);
    return {
      ok: false,
      error: "服务器返回无效的分页格式",
      status: 0,
    };
  }

  return result;
}
