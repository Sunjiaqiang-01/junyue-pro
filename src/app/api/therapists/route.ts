import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 获取查询参数
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const city = searchParams.get("city") || "";
    const area = searchParams.get("area") || "";
    const minAge = searchParams.get("minAge");
    const maxAge = searchParams.get("maxAge");
    const minHeight = searchParams.get("minHeight");
    const maxHeight = searchParams.get("maxHeight");
    const isOnline = searchParams.get("isOnline") === "true";
    const isFeatured = searchParams.get("isFeatured") === "true";
    const isNew = searchParams.get("isNew") === "true";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // 构建查询条件
    const where: any = {
      status: "APPROVED", // 只显示审核通过的技师
      isOnline: true, // 只显示在线的技师
    };

    if (search) {
      // 智能搜索：解析搜索意图
      const trimmedSearch = search.trim();
      const numMatch = trimmedSearch.match(/^(\d+)(岁|cm|kg)?$/);

      if (numMatch) {
        const num = parseInt(numMatch[1]);
        const unit = numMatch[2];

        // 1. 带单位的数字搜索
        if (unit === "岁") {
          // 明确年龄搜索
          where.age = { gte: num - 2, lte: num + 2 };
        } else if (unit === "kg") {
          // 明确体重搜索
          where.weight = { gte: num - 5, lte: num + 5 };
        } else if (unit === "cm") {
          // 带cm：根据范围判断
          if (num >= 10 && num <= 30) {
            // 10-30cm：牌值（模糊匹配）
            where.cardValue = { contains: num.toString(), mode: "insensitive" };
          } else if (num >= 150 && num <= 220) {
            // 150-220cm：身高
            where.height = { gte: num - 5, lte: num + 5 };
          }
        }
        // 2. 纯数字搜索（关键改进）
        else {
          if (num >= 10 && num <= 30) {
            // 10-30：优先牌值 + 全字段模糊搜索
            where.OR = [
              { cardValue: { contains: num.toString(), mode: "insensitive" } },
              { nickname: { contains: trimmedSearch, mode: "insensitive" } },
              { city: { contains: trimmedSearch, mode: "insensitive" } },
              { profile: { introduction: { contains: trimmedSearch, mode: "insensitive" } } },
            ];
          } else if (num >= 150 && num <= 220) {
            // 150-220：身高
            where.height = { gte: num - 5, lte: num + 5 };
          } else if (num >= 40 && num <= 149) {
            // 40-149：体重或身高
            where.OR = [
              { weight: { gte: num - 5, lte: num + 5 } },
              { height: { gte: num - 5, lte: num + 5 } },
            ];
          } else if (num >= 18 && num <= 60) {
            // 18-60：年龄
            where.age = { gte: num - 2, lte: num + 2 };
          } else {
            // 其他数字：全字段模糊搜索
            where.OR = [
              { cardValue: { contains: trimmedSearch, mode: "insensitive" } },
              { nickname: { contains: trimmedSearch, mode: "insensitive" } },
              { city: { contains: trimmedSearch, mode: "insensitive" } },
              { profile: { introduction: { contains: trimmedSearch, mode: "insensitive" } } },
            ];
          }
        }
      } else {
        // 3. 非数字：全字段模糊搜索
        where.OR = [
          { nickname: { contains: trimmedSearch, mode: "insensitive" } },
          { city: { contains: trimmedSearch, mode: "insensitive" } },
          { cardValue: { contains: trimmedSearch, mode: "insensitive" } },
          { profile: { introduction: { contains: trimmedSearch, mode: "insensitive" } } },
        ];
      }
    }

    if (city) {
      where.city = city;
    }

    if (area) {
      where.areas = { has: area };
    }

    if (minAge || maxAge) {
      where.age = {};
      if (minAge) where.age.gte = parseInt(minAge);
      if (maxAge) where.age.lte = parseInt(maxAge);
    }

    if (minHeight || maxHeight) {
      where.height = {};
      if (minHeight) where.height.gte = parseInt(minHeight);
      if (maxHeight) where.height.lte = parseInt(maxHeight);
    }

    if (isOnline) {
      where.isOnline = true;
    }

    if (isFeatured) {
      where.isFeatured = true;
    }

    if (isNew) {
      where.isNew = true;
    }

    // 计算分页
    const skip = (page - 1) * limit;

    // 查询技师列表
    const [therapists, total] = await Promise.all([
      prisma.therapist.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        select: {
          id: true,
          nickname: true,
          age: true,
          height: true,
          weight: true,
          cardValue: true,
          city: true,
          areas: true,
          location: true,
          isOnline: true,
          isNew: true,
          isFeatured: true,
          viewCount: true, // 🆕 添加浏览量
          createdAt: true,
          photos: {
            where: { isPrimary: true }, // 🆕 只查询主图
            take: 1,
            select: {
              url: true, // ✅ 只需要原图URL
            },
          },
          // ❌ 移除 profile.introduction（列表页不需要）
        },
      }),
      prisma.therapist.count({ where }),
    ]);

    // 格式化数据
    const formattedTherapists = therapists.map((therapist) => ({
      id: therapist.id,
      nickname: therapist.nickname,
      age: therapist.age,
      height: therapist.height,
      weight: therapist.weight,
      cardValue: therapist.cardValue,
      city: therapist.city,
      areas: therapist.areas,
      location: therapist.location,
      isOnline: therapist.isOnline,
      isNew: therapist.isNew,
      isFeatured: therapist.isFeatured,
      viewCount: therapist.viewCount, // 🆕 返回浏览量
      // ✅ 使用原图（已WebP压缩，配合Next.js Image自动优化）
      avatar: therapist.photos[0]?.url || "/placeholder-avatar.svg",
      // ❌ 移除 introduction 和 specialties（列表页不需要）
    }));

    return NextResponse.json({
      success: true,
      data: {
        therapists: formattedTherapists,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("获取技师列表失败:", error);
    return NextResponse.json({ success: false, error: "获取技师列表失败" }, { status: 500 });
  }
}
