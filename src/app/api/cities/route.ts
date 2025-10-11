import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
      select: {
        id: true,
        name: true,
        code: true,
        areas: {
          where: {
            isActive: true,
          },
          orderBy: {
            order: 'asc',
          },
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: cities,
    });
  } catch (error) {
    console.error('获取城市列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取城市列表失败' },
      { status: 500 }
    );
  }
}

