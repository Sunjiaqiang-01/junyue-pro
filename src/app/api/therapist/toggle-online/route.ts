import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 切换在线/离线状态
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

    // 获取当前状态
    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
    });

    if (!therapist) {
      return NextResponse.json(
        { success: false, error: '技师不存在' },
        { status: 404 }
      );
    }

    // 只有审核通过的技师才能设置在线状态
    if (therapist.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: '只有审核通过的技师才能设置在线状态' },
        { status: 400 }
      );
    }

    // 切换状态
    await prisma.therapist.update({
      where: { id: therapistId },
      data: { isOnline: !therapist.isOnline },
    });

    return NextResponse.json({
      success: true,
      message: therapist.isOnline ? '已设为离线' : '已设为在线',
      isOnline: !therapist.isOnline,
    });
  } catch (error) {
    console.error('切换状态失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}

