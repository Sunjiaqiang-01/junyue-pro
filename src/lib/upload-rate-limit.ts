/**
 * 文件上传速率限制
 * 防止单个用户/IP恶意上传大量文件
 */

import { prisma } from "@/lib/prisma";

interface UploadAttempt {
  userId?: string;
  ipAddress: string;
  timestamp: Date;
}

// 内存缓存（简化版，生产环境建议用Redis）
const uploadCache = new Map<string, UploadAttempt[]>();

// 配置
const UPLOAD_LIMITS = {
  perUser: {
    maxUploads: 10, // 每个用户每分钟最多10个文件
    windowMs: 60 * 1000, // 1分钟
  },
  perIP: {
    maxUploads: 20, // 每个IP每分钟最多20个文件
    windowMs: 60 * 1000, // 1分钟
  },
};

/**
 * 清理过期的上传记录
 */
function cleanExpiredRecords(key: string, windowMs: number) {
  const records = uploadCache.get(key) || [];
  const now = Date.now();
  const validRecords = records.filter((record) => now - record.timestamp.getTime() < windowMs);

  if (validRecords.length > 0) {
    uploadCache.set(key, validRecords);
  } else {
    uploadCache.delete(key);
  }
}

/**
 * 检查用户上传速率限制
 * @param userId 用户ID
 * @param ipAddress IP地址
 * @returns 是否允许上传及剩余次数
 */
export async function checkUploadRateLimit(
  userId: string | undefined,
  ipAddress: string
): Promise<{ allowed: boolean; remaining: number; resetIn?: number }> {
  const now = Date.now();

  // 1. 检查用户级别限制（如果已登录）
  if (userId) {
    const userKey = `user:${userId}`;
    cleanExpiredRecords(userKey, UPLOAD_LIMITS.perUser.windowMs);

    const userRecords = uploadCache.get(userKey) || [];

    if (userRecords.length >= UPLOAD_LIMITS.perUser.maxUploads) {
      const oldestRecord = userRecords[0];
      const resetIn = Math.ceil(
        (oldestRecord.timestamp.getTime() + UPLOAD_LIMITS.perUser.windowMs - now) / 1000
      );

      return {
        allowed: false,
        remaining: 0,
        resetIn,
      };
    }
  }

  // 2. 检查IP级别限制
  const ipKey = `ip:${ipAddress}`;
  cleanExpiredRecords(ipKey, UPLOAD_LIMITS.perIP.windowMs);

  const ipRecords = uploadCache.get(ipKey) || [];

  if (ipRecords.length >= UPLOAD_LIMITS.perIP.maxUploads) {
    const oldestRecord = ipRecords[0];
    const resetIn = Math.ceil(
      (oldestRecord.timestamp.getTime() + UPLOAD_LIMITS.perIP.windowMs - now) / 1000
    );

    return {
      allowed: false,
      remaining: 0,
      resetIn,
    };
  }

  // 计算剩余次数
  const remaining = userId
    ? UPLOAD_LIMITS.perUser.maxUploads - (uploadCache.get(`user:${userId}`)?.length || 0)
    : UPLOAD_LIMITS.perIP.maxUploads - ipRecords.length;

  return {
    allowed: true,
    remaining,
  };
}

/**
 * 记录上传行为
 * @param userId 用户ID
 * @param ipAddress IP地址
 */
export function recordUploadAttempt(userId: string | undefined, ipAddress: string) {
  const attempt: UploadAttempt = {
    userId,
    ipAddress,
    timestamp: new Date(),
  };

  // 记录用户级别
  if (userId) {
    const userKey = `user:${userId}`;
    const userRecords = uploadCache.get(userKey) || [];
    userRecords.push(attempt);
    uploadCache.set(userKey, userRecords);
  }

  // 记录IP级别
  const ipKey = `ip:${ipAddress}`;
  const ipRecords = uploadCache.get(ipKey) || [];
  ipRecords.push(attempt);
  uploadCache.set(ipKey, ipRecords);
}

/**
 * 定期清理缓存（建议每小时运行）
 */
export function cleanupUploadCache() {
  const now = Date.now();
  const maxAge = Math.max(UPLOAD_LIMITS.perUser.windowMs, UPLOAD_LIMITS.perIP.windowMs);

  for (const [key, records] of uploadCache.entries()) {
    const validRecords = records.filter((record) => now - record.timestamp.getTime() < maxAge);

    if (validRecords.length > 0) {
      uploadCache.set(key, validRecords);
    } else {
      uploadCache.delete(key);
    }
  }

  console.log(`🧹 上传缓存清理完成，当前${uploadCache.size}个活跃记录`);
}

// 每小时自动清理一次
setInterval(cleanupUploadCache, 60 * 60 * 1000);
