import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 标记通知为已读
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'therapist') {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const therapistId = session.user.id;

    // 检查通知是否属于当前技师
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: '通知不存在' },
        { status: 404 }
      );
    }

    if (notification.therapistId !== therapistId) {
      return NextResponse.json(
        { success: false, error: '无权限' },
        { status: 403 }
      );
    }

    // 标记为已读
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      message: '已标记为已读',
    });
  } catch (error) {
    console.error('标记已读失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}

