import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 全部标记为已读
export async function POST() {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'therapist') {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const therapistId = session.user.id;

    // 标记所有未读通知为已读
    await prisma.notification.updateMany({
      where: {
        therapistId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      message: '已全部标记为已读',
    });
  } catch (error) {
    console.error('标记已读失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}

