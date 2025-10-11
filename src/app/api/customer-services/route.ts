import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 获取激活的客服配置（按order排序，取第一个）
    const customerService = await prisma.customerService.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    if (!customerService) {
      return NextResponse.json(
        { error: '暂无客服信息' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        wechatQrCode: customerService.wechatQrCode,
        wechatId: customerService.wechatId,
        phone: customerService.phone,
        workingHours: customerService.workingHours,
      },
    });
  } catch (error) {
    console.error('获取客服信息失败:', error);
    return NextResponse.json(
      { error: '获取客服信息失败' },
      { status: 500 }
    );
  }
}

