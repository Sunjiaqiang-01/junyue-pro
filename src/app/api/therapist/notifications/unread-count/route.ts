import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 获取未读通知数量
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'therapist') {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const therapistId = session.user.id;

    const count = await prisma.notification.count({
      where: {
        therapistId,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('获取未读数失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}

