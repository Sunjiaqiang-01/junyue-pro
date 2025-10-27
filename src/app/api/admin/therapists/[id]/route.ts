import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteTherapistFolders } from "@/lib/folder-manager";

// 获取单个技师详细信息
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "无权限" }, { status: 403 });
    }

    const { id } = await params;

    const therapist = await prisma.therapist.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
        },
        profile: true,
        videos: true,
        schedules: {
          orderBy: { date: "asc" },
          take: 10,
        },
      },
    });

    if (!therapist) {
      return NextResponse.json({ success: false, error: "技师不存在" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: therapist,
    });
  } catch (error) {
    console.error("获取技师详情失败:", error);
    return NextResponse.json({ success: false, error: "获取技师详情失败" }, { status: 500 });
  }
}

// 更新技师信息
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "无权限" }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();

    // 准备更新数据
    const updateData: any = {};

    // 基本信息字段
    if (data.nickname !== undefined) updateData.nickname = data.nickname;
    if (data.age !== undefined) updateData.age = data.age;
    if (data.height !== undefined) updateData.height = data.height;
    if (data.weight !== undefined) updateData.weight = data.weight;
    if (data.cardValue !== undefined) updateData.cardValue = data.cardValue;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.areas !== undefined) updateData.areas = data.areas;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.location !== undefined) updateData.location = data.location;

    // 更新技师基本信息
    const updatedTherapist = await prisma.therapist.update({
      where: { id },
      data: updateData,
    });

    // 如果有profile数据需要更新
    if (data.profile) {
      const profileUpdateData: any = {};

      if (data.profile.introduction !== undefined) {
        profileUpdateData.introduction = data.profile.introduction;
      }
      if (data.profile.specialties !== undefined) {
        profileUpdateData.specialties = data.profile.specialties;
      }
      if (data.profile.serviceType !== undefined) {
        profileUpdateData.serviceType = data.profile.serviceType;
      }
      if (data.profile.serviceAddress !== undefined) {
        profileUpdateData.serviceAddress = data.profile.serviceAddress;
      }
      if (data.profile.serviceRadius !== undefined) {
        profileUpdateData.serviceRadius = data.profile.serviceRadius;
      }

      // 更新或创建profile
      await prisma.therapistProfile.upsert({
        where: { therapistId: id },
        update: profileUpdateData,
        create: {
          therapistId: id,
          ...profileUpdateData,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedTherapist,
    });
  } catch (error) {
    console.error("更新技师资料失败:", error);
    return NextResponse.json({ success: false, error: "更新失败" }, { status: 500 });
  }
}

// 删除技师（完整删除所有数据）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ success: false, error: "无权限" }, { status: 403 });
    }

    const { id } = await params;

    // 验证技师是否存在
    const therapist = await prisma.therapist.findUnique({
      where: { id },
      select: { nickname: true },
    });

    if (!therapist) {
      return NextResponse.json({ success: false, error: "技师不存在" }, { status: 404 });
    }

    // 使用事务删除所有相关数据
    await prisma.$transaction(async (tx) => {
      // 1. 删除技师照片
      await tx.therapistPhoto.deleteMany({
        where: { therapistId: id },
      });

      // 2. 删除技师视频
      await tx.therapistVideo.deleteMany({
        where: { therapistId: id },
      });

      // 3. 删除技师排班
      await tx.therapistSchedule.deleteMany({
        where: { therapistId: id },
      });

      // 4. 删除技师资料
      await tx.therapistProfile.deleteMany({
        where: { therapistId: id },
      });

      // 5. 删除技师相关的通知
      await tx.notification.deleteMany({
        where: { therapistId: id },
      });

      // 6. 删除技师注销申请
      await tx.therapistDeactivationRequest.deleteMany({
        where: { therapistId: id },
      });

      // 7. 最后删除技师账户
      await tx.therapist.delete({
        where: { id },
      });
    });

    // 8. 删除媒体文件夹（即使失败也不影响数据库删除）
    try {
      const folderResult = await deleteTherapistFolders(id);
      console.log(`📁 文件夹删除结果:`, folderResult);

      if (folderResult.deletedFolders.length > 0) {
        console.log(`✅ 已删除文件夹: ${folderResult.deletedFolders.join(", ")}`);
      }
      if (folderResult.errors.length > 0) {
        console.warn(`⚠️ 文件夹删除警告: ${folderResult.errors.join(", ")}`);
      }
    } catch (error) {
      console.error(`⚠️ 删除媒体文件夹失败（不影响数据库删除）:`, error);
    }

    return NextResponse.json({
      success: true,
      message: `技师 ${therapist.nickname} 及所有相关数据已永久删除`,
    });
  } catch (error) {
    console.error("删除技师失败:", error);
    return NextResponse.json({ success: false, error: "删除失败" }, { status: 500 });
  }
}
