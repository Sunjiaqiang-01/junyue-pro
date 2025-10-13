import { NextRequest, NextResponse } from "next/server";

// 腾讯地图API Key
const TENCENT_MAP_KEY = "XF5BZ-SACWC-J7V27-A36VI-TWGQ3-N2BWX";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json({ error: "缺少经纬度参数" }, { status: 400 });
    }

    // 调用腾讯地图逆地址解析API
    const geocoderUrl = `https://apis.map.qq.com/ws/geocoder/v1/?location=${lat},${lng}&key=${TENCENT_MAP_KEY}&get_poi=1&poi_options=radius=1000;policy=1&output=json`;

    console.log("🗺️ 腾讯地图逆地址解析请求:", geocoderUrl);

    const response = await fetch(geocoderUrl);
    const data = await response.json();

    console.log("🗺️ 腾讯地图逆地址解析响应:", JSON.stringify(data, null, 2));

    if (data.status !== 0) {
      console.error("❌ 腾讯地图逆地址解析错误:", {
        status: data.status,
        message: data.message,
      });
      return NextResponse.json(
        { error: "逆地址解析失败", message: data.message || "未知错误" },
        { status: 500 }
      );
    }

    const result = data.result;

    // 格式化返回数据
    const formattedData = {
      address: result.address,
      formatted_address: result.formatted_addresses?.recommend || result.address,
      location: {
        latitude: result.location.lat,
        longitude: result.location.lng,
      },
      // 附近POI列表
      pois:
        result.pois?.map((poi: any) => ({
          name: poi.title,
          address: poi.address,
          latitude: poi.location.lat,
          longitude: poi.location.lng,
          distance: poi._distance, // 距离中心点的距离（米）
          category: poi.category,
        })) || [],
    };

    console.log("✅ 格式化后的逆地址解析数据:", formattedData);

    return NextResponse.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("❌ 腾讯地图逆地址解析异常:", error);
    return NextResponse.json(
      { error: "逆地址解析服务异常", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    );
  }
}
