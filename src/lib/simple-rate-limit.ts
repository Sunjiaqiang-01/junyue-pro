/**
 * 简单的内存频率限制工具
 * 注意：重启后失效，生产环境建议使用Redis
 */

interface RequestRecord {
  timestamps: number[];
}

const ipRequestMap = new Map<string, RequestRecord>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number; // 秒
}

/**
 * 检查频率限制
 * @param identifier 标识符（通常是IP地址）
 * @param maxRequests 时间窗口内最大请求数
 * @param windowMs 时间窗口（毫秒）
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 10000
): RateLimitResult {
  const now = Date.now();

  // 获取或创建记录
  let record = ipRequestMap.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    ipRequestMap.set(identifier, record);
  }

  // 清理过期的请求记录
  record.timestamps = record.timestamps.filter((timestamp) => now - timestamp < windowMs);

  // 检查是否超限
  if (record.timestamps.length >= maxRequests) {
    const oldestRequest = record.timestamps[0];
    const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      retryAfter: retryAfter > 0 ? retryAfter : 1,
    };
  }

  // 记录本次请求
  record.timestamps.push(now);

  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
  };
}

/**
 * 获取客户端IP地址
 * @param request NextRequest对象
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "127.0.0.1"; // 默认IP
}

/**
 * 定时清理过期数据（防止内存泄漏）
 */
function cleanup() {
  const now = Date.now();
  const maxAge = 60000; // 1分钟

  for (const [identifier, record] of ipRequestMap.entries()) {
    record.timestamps = record.timestamps.filter((timestamp) => now - timestamp < maxAge);

    // 如果记录为空，删除该标识符
    if (record.timestamps.length === 0) {
      ipRequestMap.delete(identifier);
    }
  }

  console.log(`🧹 频率限制清理完成，当前记录数: ${ipRequestMap.size}`);
}

// 每分钟清理一次
setInterval(cleanup, 60000);

// 导出清理函数供测试使用
export { cleanup };
