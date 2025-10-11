import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * 技师数据操作工具函数
 */

// 根据手机号查找技师
export async function findTherapistByPhone(phone: string) {
  return prisma.therapist.findUnique({
    where: { phone },
    include: {
      profile: true,
      photos: { orderBy: { order: "asc" } },
      videos: true,
    },
  });
}

// 根据ID查找技师
export async function findTherapistById(id: string) {
  return prisma.therapist.findUnique({
    where: { id },
    include: {
      profile: true,
      photos: { orderBy: { order: "asc" } },
      videos: true,
    },
  });
}

// 创建技师
export async function createTherapist(data: Prisma.TherapistCreateInput) {
  return prisma.therapist.create({
    data,
    include: { profile: true },
  });
}

// 更新技师信息
export async function updateTherapist(id: string, data: Prisma.TherapistUpdateInput) {
  return prisma.therapist.update({
    where: { id },
    data,
  });
}

// 获取技师列表（分页、筛选、排序）
export async function getTherapistList(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  city?: string;
  isOnline?: boolean;
  keyword?: string;
  sortBy?: "createdAt" | "nickname";
}) {
  const {
    page = 1,
    pageSize = 20,
    status,
    city,
    isOnline,
    keyword,
    sortBy = "createdAt",
  } = params;

  const where: Prisma.TherapistWhereInput = {};

  if (status) {
    where.status = status as any;
  }

  if (city) {
    where.city = city;
  }

  if (isOnline !== undefined) {
    where.isOnline = isOnline;
  }

  if (keyword) {
    where.OR = [
      { phone: { contains: keyword } },
      { nickname: { contains: keyword } },
    ];
  }

  let orderBy: Prisma.TherapistOrderByWithRelationInput = { createdAt: "desc" };
  if (sortBy === "nickname") {
    orderBy = { nickname: "asc" };
  }

  const [therapists, total] = await Promise.all([
    prisma.therapist.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
      include: {
        profile: true,
        photos: { orderBy: { order: "asc" }, take: 1 },
      },
    }),
    prisma.therapist.count({ where }),
  ]);

  return {
    therapists,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// 更新技师在线状态
export async function updateTherapistOnlineStatus(id: string, isOnline: boolean) {
  return prisma.therapist.update({
    where: { id },
    data: {
      isOnline,
      lastOnlineAt: isOnline ? new Date() : undefined,
    },
  });
}
