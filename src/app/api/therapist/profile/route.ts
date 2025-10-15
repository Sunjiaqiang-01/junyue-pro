import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { renameTherapistFolder } from "@/lib/folder-manager";
import { join } from "path";

// GET - 获取技师资料
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "therapist") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const therapist = await prisma.therapist.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        photos: {
          orderBy: [
            { isPrimary: "desc" }, // 主图排第一
            { order: "asc" }, // 其他按order排序
          ],
        },
        videos: true,
      },
    });

    if (!therapist) {
      return NextResponse.json({ error: "技师不存在" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: therapist,
    });
  } catch (error) {
    console.error("获取技师资料失败:", error);
    return NextResponse.json({ error: "获取资料失败" }, { status: 500 });
  }
}

// PUT - 更新技师资料
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "therapist") {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const body = await req.json();
    const {
      nickname,
      age,
      height,
      weight,
      cardValue,
      city,
      phone,
      location,
      introduction,
      serviceAddress,
    } = body;

    // 获取当前技师信息（用于检查昵称是否变更）
    const currentTherapist = await prisma.therapist.findUnique({
      where: { id: session.user.id },
      select: { nickname: true },
    });

    if (!currentTherapist) {
      return NextResponse.json({ error: "技师不存在" }, { status: 404 });
    }

    // 更新技师基本信息
    await prisma.therapist.update({
      where: { id: session.user.id },
      data: {
        nickname,
        age: age ? parseInt(age) : undefined,
        height: height ? parseInt(height) : undefined,
        weight: weight ? parseInt(weight) : undefined,
        cardValue,
        city,
        phone,
        location,
      },
    });

    // 如果昵称发生变更，异步重命名文件夹
    if (nickname && nickname !== currentTherapist.nickname) {
      console.log(`🔄 技师昵称变更: ${currentTherapist.nickname} → ${nickname}`);

      // 异步处理文件夹重命名，不阻塞响应
      Promise.all([
        renameTherapistFolder(
          join(process.cwd(), "public", "uploads", "therapist-photos"),
          session.user.id,
          nickname
        ),
        renameTherapistFolder(
          join(process.cwd(), "public", "uploads", "therapist-videos"),
          session.user.id,
          nickname
        ),
      ])
        .then((results) => {
          results.forEach((result, index) => {
            const type = index === 0 ? "photos" : "videos";
            if (result.success) {
              console.log(`✅ ${type}文件夹重命名成功:`, result.message);
            } else {
              console.error(`❌ ${type}文件夹重命名失败:`, result.message);
            }
          });
        })
        .catch((error) => {
          console.error("❌ 文件夹重命名过程中发生错误:", error);
        });
    }

    // 更新或创建技师资料
    await prisma.therapistProfile.upsert({
      where: { therapistId: session.user.id },
      update: {
        introduction,
        serviceAddress,
      },
      create: {
        therapistId: session.user.id,
        introduction: introduction || "",
        specialties: [],
        serviceType: [],
        serviceAddress,
      },
    });

    return NextResponse.json({
      success: true,
      message: "资料更新成功",
    });
  } catch (error) {
    console.error("更新技师资料失败:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
