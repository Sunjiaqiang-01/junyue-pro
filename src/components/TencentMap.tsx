"use client";

import { MapPin } from "lucide-react";

interface TencentMapProps {
  location: {
    name: string; // 地名，例如 "华贸中心"
    street: string; // 街道，例如 "建国路118号"
    latitude: number; // 纬度
    longitude: number; // 经度
  };
  className?: string;
}

// 腾讯地图API Key
const TENCENT_MAP_KEY = "XF5BZ-SACWC-J7V27-A36VI-TWGQ3-N2BWX";

export function TencentMap({ location, className }: TencentMapProps) {
  // 使用腾讯地图静态图API
  const mapUrl = `https://apis.map.qq.com/ws/staticmap/v2/?center=${location.latitude},${location.longitude}&zoom=16&size=600*400&markers=color:0xff0000|${location.latitude},${location.longitude}&key=${TENCENT_MAP_KEY}`;

  return (
    <div className={className}>
      {/* 地图图片 */}
      <div className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden border-2 border-gray-800 mb-4">
        <img
          src={mapUrl}
          alt={`${location.name}的位置`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* 地图标记覆盖层（增强视觉效果） */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </div>

      {/* 位置信息文字 */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-gray-800">
        <MapPin className="w-5 h-5 text-primary-gold flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-white font-semibold text-base mb-1">{location.name}</p>
          <p className="text-gray-400 text-sm">{location.street}</p>
        </div>
      </div>
    </div>
  );
}

export default TencentMap;
