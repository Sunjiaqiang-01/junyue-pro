import { prisma } from "@/lib/prisma";

/**
 * 检查邮件发送频率限制
 * @param email 邮箱地址
 * @param limitMinutes 限制时间（分钟）
 * @returns 是否允许发送
 */
export async function checkEmailRateLimit(
  email: string,
  limitMinutes: number = 1
): Promise<{ allowed: boolean; remainingSeconds?: number }> {
  const limitTime = new Date(Date.now() - limitMinutes * 60 * 1000);

  // 查找该邮箱最近的验证码记录
  const recentCode = await prisma.verificationCode.findFirst({
    where: {
      email,
      createdAt: {
        gt: limitTime,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (recentCode) {
    const timeSinceLastSend = Date.now() - recentCode.createdAt.getTime();
    const remainingMs = limitMinutes * 60 * 1000 - timeSinceLastSend;
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    return {
      allowed: false,
      remainingSeconds: remainingSeconds > 0 ? remainingSeconds : 0,
    };
  }

  return { allowed: true };
}

/**
 * 检查验证码尝试次数（防暴力破解）
 * @param email 邮箱地址
 * @param maxAttempts 最大尝试次数
 * @param windowMinutes 时间窗口（分钟）
 * @returns 是否允许尝试
 */
export async function checkVerifyAttempts(
  email: string,
  maxAttempts: number = 5,
  windowMinutes: number = 10
): Promise<{ allowed: boolean; remaining?: number }> {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

  const attemptCount = await prisma.securityLog.count({
    where: {
      email,
      action: "CODE_VERIFY",
      success: false,
      createdAt: {
        gt: windowStart,
      },
    },
  });

  if (attemptCount >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  return {
    allowed: true,
    remaining: maxAttempts - attemptCount,
  };
}

/**
 * 记录安全日志
 * @param data 日志数据
 */
export async function logSecurityAction(data: {
  email: string;
  action: "CODE_VERIFY" | "PASSWORD_RESET" | "LOGIN_ATTEMPT" | "USERNAME_CHECK";
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}) {
  await prisma.securityLog.create({
    data,
  });
}

/**
 * 清理旧的安全日志（建议定时任务调用）
 * @param daysToKeep 保留天数
 */
export async function cleanOldSecurityLogs(daysToKeep: number = 30) {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

  await prisma.securityLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });
}

/**
 * 检查邀请码使用次数限制（防止批量注册）
 * @param inviteCode 邀请码
 * @param maxUses 最大使用次数
 * @returns 是否允许使用
 */
export async function checkInviteCodeLimit(
  inviteCode: string,
  maxUses: number = 100
): Promise<{ allowed: boolean; remaining?: number }> {
  const usageCount = await prisma.therapist.count({
    where: {
      registrationCodeId: inviteCode,
    },
  });

  if (usageCount >= maxUses) {
    return { allowed: false, remaining: 0 };
  }

  return {
    allowed: true,
    remaining: maxUses - usageCount,
  };
}
