import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 获取查询参数
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const area = searchParams.get('area') || '';
    const minAge = searchParams.get('minAge');
    const maxAge = searchParams.get('maxAge');
    const minHeight = searchParams.get('minHeight');
    const maxHeight = searchParams.get('maxHeight');
    const isOnline = searchParams.get('isOnline') === 'true';
    const isFeatured = searchParams.get('isFeatured') === 'true';
    const isNew = searchParams.get('isNew') === 'true';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 构建查询条件
    const where: any = {
      status: 'APPROVED', // 只显示审核通过的技师
    };

    if (search) {
      where.OR = [
        { nickname: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
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
          city: true,
          areas: true,
          isOnline: true,
          isNew: true,
          isFeatured: true,
          createdAt: true,
          photos: {
            orderBy: { order: 'asc' },
            take: 1,
            select: { url: true },
          },
          profile: {
            select: {
              introduction: true,
              specialties: true,
              // 不返回联系方式
            },
          },
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
      city: therapist.city,
      areas: therapist.areas,
      isOnline: therapist.isOnline,
      isNew: therapist.isNew,
      isFeatured: therapist.isFeatured,
      avatar: therapist.photos[0]?.url || '/placeholder-avatar.jpg',
      introduction: therapist.profile?.introduction || '',
      specialties: therapist.profile?.specialties || [],
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
    console.error('获取技师列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取技师列表失败' },
      { status: 500 }
    );
  }
}

