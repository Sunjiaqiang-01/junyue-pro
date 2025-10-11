import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 更新技师状态为已通过
    await prisma.therapist.update({
      where: { id },
      data: {
        status: 'APPROVED',
        auditedAt: new Date(),
      },
    });

    // 创建通知
    await prisma.notification.create({
      data: {
        therapistId: id,
        type: 'AUDIT',
        title: '审核通过',
        content: '恭喜！您的资料已通过审核，现在可以正常展示在平台上了。',
      },
    });

    return NextResponse.json({
      success: true,
      message: '审核通过',
    });
  } catch (error) {
    console.error('审核通过失败:', error);
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    );
  }
}

