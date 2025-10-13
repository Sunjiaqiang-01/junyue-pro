import { NextRequest, NextResponse } from "next/server";

// 腾讯地图API Key（从环境变量或直接使用）
const TENCENT_MAP_KEY = "XF5BZ-SACWC-J7V27-A36VI-TWGQ3-N2BWX";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get("keyword");
    const region = searchParams.get("region") || "全国"; // 默认全国搜索

    if (!keyword) {
      return NextResponse.json({ error: "请输入搜索关键词" }, { status: 400 });
    }

    // 调用腾讯地图关键词输入提示API
    const apiUrl = `https://apis.map.qq.com/ws/place/v1/suggestion?keyword=${encodeURIComponent(keyword)}&region=${encodeURIComponent(region)}&key=${TENCENT_MAP_KEY}&output=json`;

    console.log("🗺️ 腾讯地图API请求:", apiUrl);

    const response = await fetch(apiUrl);
    const data = await response.json();

    console.log("🗺️ 腾讯地图API响应:", JSON.stringify(data, null, 2));

    if (data.status !== 0) {
      console.error("❌ 腾讯地图API错误:", {
        status: data.status,
        message: data.message,
      });
      return NextResponse.json(
        { error: "搜索失败", message: data.message || "未知错误" },
        { status: 500 }
      );
    }

    // 格式化返回数据 - 统一为前端期望的格式
    const suggestions =
      data.data?.map((item: any) => ({
        name: item.title, // 前端期望 name
        address: item.address,
        latitude: item.location?.lat || 0, // 前端期望 latitude（不是嵌套的）
        longitude: item.location?.lng || 0, // 前端期望 longitude（不是嵌套的）
      })) || [];

    console.log("✅ 格式化后的数据:", suggestions);

    return NextResponse.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error("❌ 腾讯地图搜索异常:", error);
    return NextResponse.json(
      { error: "搜索服务异常", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    );
  }
}
