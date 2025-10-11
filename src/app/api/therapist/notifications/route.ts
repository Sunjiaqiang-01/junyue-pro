import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 获取技师通知列表
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

    const notifications = await prisma.notification.findMany({
      where: { therapistId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('获取通知列表失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}

