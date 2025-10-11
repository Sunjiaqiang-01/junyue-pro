import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// POST - 上传照片
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'therapist') {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: '照片URL不能为空' },
        { status: 400 }
      );
    }

    // 获取当前最大order值
    const maxOrderPhoto = await prisma.therapistPhoto.findFirst({
      where: { therapistId: session.user.id },
      orderBy: { order: 'desc' },
    });

    const newOrder = maxOrderPhoto ? maxOrderPhoto.order + 1 : 1;

    // 创建照片记录
    const photo = await prisma.therapistPhoto.create({
      data: {
        therapistId: session.user.id,
        url,
        order: newOrder,
      },
    });

    return NextResponse.json({
      success: true,
      data: photo,
    });
  } catch (error) {
    console.error('上传照片失败:', error);
    return NextResponse.json(
      { error: '上传失败' },
      { status: 500 }
    );
  }
}

