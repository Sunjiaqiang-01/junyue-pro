/**
 * 简单内存缓存工具
 * 用于缓存热点数据，减少数据库查询压力
 */

interface CacheItem {
  data: any;
  expireAt: number;
}

const cache = new Map<string, CacheItem>();

/**
 * 获取缓存数据
 * @param key 缓存键
 * @returns 缓存的数据，如果不存在或已过期则返回null
 */
export function getCache<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;

  // 检查是否过期
  if (Date.now() > item.expireAt) {
    cache.delete(key);
    return null;
  }

  return item.data as T;
}

/**
 * 设置缓存数据
 * @param key 缓存键
 * @param data 要缓存的数据
 * @param ttlSeconds 过期时间（秒）
 */
export function setCache(key: string, data: any, ttlSeconds: number): void {
  cache.set(key, {
    data,
    expireAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * 清除缓存
 * @param key 缓存键，如果不提供则清除所有缓存
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}

// 定期清理过期缓存（每分钟执行一次）
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (now > item.expireAt) {
      cache.delete(key);
    }
  }
}, 60000);
