import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// DELETE - 删除照片
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'therapist') {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    // 验证照片所有权
    const photo = await prisma.therapistPhoto.findUnique({
      where: { id: params.id },
    });

    if (!photo) {
      return NextResponse.json(
        { error: '照片不存在' },
        { status: 404 }
      );
    }

    if (photo.therapistId !== session.user.id) {
      return NextResponse.json(
        { error: '无权限删除此照片' },
        { status: 403 }
      );
    }

    // 删除照片
    await prisma.therapistPhoto.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: '照片删除成功',
    });
  } catch (error) {
    console.error('删除照片失败:', error);
    return NextResponse.json(
      { error: '删除失败' },
      { status: 500 }
    );
  }
}

