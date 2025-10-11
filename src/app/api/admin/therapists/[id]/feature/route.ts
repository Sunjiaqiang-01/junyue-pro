import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// 设置/取消推荐技师
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
    const { isFeatured } = await request.json();

    // 检查技师是否存在且已审核
    const therapist = await prisma.therapist.findUnique({
      where: { id },
    });

    if (!therapist) {
      return NextResponse.json(
        { success: false, error: '技师不存在' },
        { status: 404 }
      );
    }

    if (therapist.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: '只能推荐已审核通过的技师' },
        { status: 400 }
      );
    }

    // 更新推荐状态
    await prisma.therapist.update({
      where: { id },
      data: { isFeatured },
    });

    return NextResponse.json({
      success: true,
      message: isFeatured ? '设为推荐成功' : '取消推荐成功',
    });
  } catch (error) {
    console.error('更新推荐状态失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}

