import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 切换公告显示/隐藏状态
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无权限' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const { isActive } = await request.json();

    // 检查公告是否存在
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existingAnnouncement) {
      return NextResponse.json(
        { success: false, error: '公告不存在' },
        { status: 404 }
      );
    }

    // 更新状态
    await prisma.announcement.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({
      success: true,
      message: isActive ? '已显示' : '已隐藏',
    });
  } catch (error) {
    console.error('更新公告状态失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}

