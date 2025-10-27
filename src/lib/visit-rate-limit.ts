// IP访问限流机制
// 防止恶意刷访问量

interface VisitRecord {
  lastVisit: number;
  count: number;
}

// 使用Map存储IP访问记录（内存缓存）
const visitCache = new Map<string, VisitRecord>();

// 清理过期记录（每小时执行一次）
setInterval(
  () => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    for (const [key, record] of visitCache.entries()) {
      if (now - record.lastVisit > oneHour) {
        visitCache.delete(key);
      }
    }
  },
  60 * 60 * 1000
); // 每小时清理一次

/**
 * 检查IP是否超过访问频率限制
 * @param ip - IP地址
 * @param cacheKey - 缓存键（如：'site:/home', 'therapist:xxx'）
 * @param limitSeconds - 限制时间（秒），同一IP在此时间内只记录一次
 * @returns 是否允许记录
 */
export function checkRateLimit(ip: string, cacheKey: string, limitSeconds: number = 30): boolean {
  const key = `${cacheKey}:${ip}`;
  const now = Date.now();
  const record = visitCache.get(key);

  // 如果没有记录，允许访问
  if (!record) {
    visitCache.set(key, { lastVisit: now, count: 1 });
    return true;
  }

  // 检查是否在限制时间内
  const timeDiff = now - record.lastVisit;
  if (timeDiff < limitSeconds * 1000) {
    // 在限制时间内，增加计数但不允许记录
    record.count++;

    // 如果频率过高（30秒内超过5次），可能是恶意刷量
    if (record.count > 5 && timeDiff < 30000) {
      console.warn(`[访问限流] IP ${ip} 访问频率过高: ${cacheKey}, 计数: ${record.count}`);
      return false;
    }

    return false;
  }

  // 超过限制时间，允许记录并更新时间戳
  visitCache.set(key, { lastVisit: now, count: 1 });
  return true;
}

/**
 * 获取IP访问统计（用于监控）
 */
export function getVisitStats() {
  const stats = {
    totalKeys: visitCache.size,
    records: Array.from(visitCache.entries()).map(([key, record]) => ({
      key,
      lastVisit: new Date(record.lastVisit).toISOString(),
      count: record.count,
    })),
  };
  return stats;
}

/**
 * 清空所有访问记录（仅用于测试或重置）
 */
export function clearAllRecords() {
  visitCache.clear();
}
