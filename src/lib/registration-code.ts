import { prisma } from "@/lib/prisma";

/**
 * 生成6位数字注册验证码（避免弱密码）
 */
export function generateRegistrationCode(): string {
  const weakCodes = [
    "000000",
    "111111",
    "222222",
    "333333",
    "444444",
    "555555",
    "666666",
    "777777",
    "888888",
    "999999",
    "123456",
    "654321",
    "000001",
    "999999",
  ];

  let code: string;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (weakCodes.includes(code));

  return code;
}

/**
 * 批量生成注册验证码
 * @param options 生成选项
 */
export async function batchGenerateRegistrationCodes(options: {
  count: number; // 生成数量
  codeType: "ONETIME" | "LIMITED" | "UNLIMITED";
  maxUses: number; // 最大使用次数
  expiresInDays?: number; // 有效天数（-1或null表示永久）
  note?: string; // 备注
  createdBy: string; // 管理员ID
}) {
  const { count, codeType, maxUses, expiresInDays, note, createdBy } = options;

  const codes: string[] = [];
  const existingCodes = new Set(
    (await prisma.registrationCode.findMany({ select: { code: true } })).map((c) => c.code)
  );

  // 生成不重复的验证码
  while (codes.length < count) {
    const code = generateRegistrationCode();
    if (!existingCodes.has(code) && !codes.includes(code)) {
      codes.push(code);
    }
  }

  // 计算过期时间
  let expiresAt: Date | null = null;
  if (expiresInDays && expiresInDays > 0) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  }

  // 批量创建
  const createdCodes = await prisma.registrationCode.createMany({
    data: codes.map((code) => ({
      code,
      codeType,
      maxUses: codeType === "ONETIME" ? 1 : maxUses,
      expiresAt,
      note,
      createdBy,
    })),
  });

  return {
    success: true,
    count: createdCodes.count,
    codes,
  };
}

/**
 * 验证注册验证码
 * @param code 验证码
 */
export async function validateRegistrationCode(code: string): Promise<{
  valid: boolean;
  error?: string;
  codeId?: string;
  codeInfo?: {
    type: string;
    remainingUses: number;
    expiresAt: Date | null;
  };
}> {
  // 查找验证码
  const regCode = await prisma.registrationCode.findUnique({
    where: { code },
  });

  if (!regCode) {
    return { valid: false, error: "验证码不存在" };
  }

  if (!regCode.isActive) {
    return { valid: false, error: "验证码已被禁用" };
  }

  // 检查是否过期
  if (regCode.expiresAt && regCode.expiresAt < new Date()) {
    return { valid: false, error: "验证码已过期" };
  }

  // 检查使用次数
  if (regCode.maxUses !== -1 && regCode.currentUses >= regCode.maxUses) {
    return { valid: false, error: "验证码已达到最大使用次数" };
  }

  return {
    valid: true,
    codeId: regCode.id,
    codeInfo: {
      type: regCode.codeType,
      remainingUses: regCode.maxUses === -1 ? -1 : regCode.maxUses - regCode.currentUses,
      expiresAt: regCode.expiresAt,
    },
  };
}

/**
 * 使用验证码（增加使用次数）
 * @param codeId 验证码ID
 */
export async function useRegistrationCode(codeId: string) {
  await prisma.registrationCode.update({
    where: { id: codeId },
    data: {
      currentUses: {
        increment: 1,
      },
    },
  });
}

/**
 * 获取验证码统计信息
 */
export async function getRegistrationCodeStats() {
  const total = await prisma.registrationCode.count();
  const active = await prisma.registrationCode.count({
    where: { isActive: true },
  });
  const used = await prisma.registrationCode.count({
    where: {
      currentUses: {
        gte: 1,
      },
    },
  });
  const expired = await prisma.registrationCode.count({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return {
    total, // 总数
    active, // 启用的
    used, // 已使用的
    expired, // 已过期的
    unused: total - used, // 未使用的
  };
}
