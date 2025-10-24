"use client";

import { MapPin, ExternalLink } from "lucide-react";
import { AmapLogo } from "@/components/ui/icons/AmapLogo";
import { BaiduLogo } from "@/components/ui/icons/BaiduLogo";
import { TencentLogo } from "@/components/ui/icons/TencentLogo";

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

  // 检测是否为移动设备
  const isMobile = () => {
    if (typeof window === "undefined") return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  // 导航按钮点击处理
  const handleNavigation = (mapType: "amap" | "baidu" | "tencent") => {
    const { latitude, longitude, name, street } = location;
    const encodedName = encodeURIComponent(name);
    const fullAddress = encodeURIComponent(`${name}${street}`);
    const mobile = isMobile();
    let url = "";

    switch (mapType) {
      case "amap":
        if (mobile) {
          // 移动端：导航功能
          url = `https://uri.amap.com/navigation?to=${longitude},${latitude},${encodedName}&mode=car&src=君悦SPA&coordinate=gaode&callnative=1`;
        } else {
          // PC端：查看位置
          url = `https://ditu.amap.com/regeo?lng=${longitude}&lat=${latitude}&name=${encodedName}&src=君悦SPA`;
        }
        break;
      case "baidu":
        if (mobile) {
          // 移动端：导航功能（使用search接口，会自动尝试唤起APP）
          url = `https://map.baidu.com/search/${encodedName}/@${longitude},${latitude},19z?querytype=s&da_src=shareurl&wd=${encodedName}&c=全国&src=0`;
        } else {
          // PC端：查看位置
          url = `https://api.map.baidu.com/marker?location=${latitude},${longitude}&title=${encodedName}&content=${fullAddress}&output=html&src=君悦SPA`;
        }
        break;
      case "tencent":
        if (mobile) {
          // 移动端：导航功能
          url = `https://apis.map.qq.com/uri/v1/routeplan?type=drive&from=当前位置&to=${encodedName}&tocoord=${latitude},${longitude}&referer=君悦SPA&policy=0`;
        } else {
          // PC端：查看位置
          url = `https://apis.map.qq.com/uri/v1/marker?marker=coord:${latitude},${longitude};title:${encodedName};addr:${fullAddress}&referer=君悦SPA`;
        }
        break;
    }

    // 打开地图链接
    window.open(url, "_blank");
  };

  return (
    <div className={className}>
      {/* 地图图片 */}
      <div className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden border-2 border-white/10 mb-4">
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
      <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 mb-3">
        <MapPin className="w-5 h-5 text-primary-cyan flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-white font-semibold text-base mb-1">{location.name}</p>
          <p className="text-gray-400 text-sm">{location.street}</p>
        </div>
      </div>

      {/* 导航按钮 */}
      <div className="grid grid-cols-3 gap-3">
        {/* 高德地图 */}
        <button
          onClick={() => handleNavigation("amap")}
          className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-[#108EE9]/10 hover:bg-[#108EE9]/20 border border-[#108EE9]/30 transition-all duration-200 group"
        >
          <AmapLogo className="w-10 h-10 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-1">
            <span className="text-[#108EE9] text-xs font-bold">高德导航</span>
            <ExternalLink className="w-3 h-3 text-[#108EE9]/60 group-hover:text-[#108EE9] transition-colors" />
          </div>
        </button>

        {/* 百度地图 */}
        <button
          onClick={() => handleNavigation("baidu")}
          className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-[#3385FF]/10 hover:bg-[#3385FF]/20 border border-[#3385FF]/30 transition-all duration-200 group"
        >
          <BaiduLogo className="w-10 h-10 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-1">
            <span className="text-[#3385FF] text-xs font-bold">百度导航</span>
            <ExternalLink className="w-3 h-3 text-[#3385FF]/60 group-hover:text-[#3385FF] transition-colors" />
          </div>
        </button>

        {/* 腾讯地图 */}
        <button
          onClick={() => handleNavigation("tencent")}
          className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-[#0ABF5B]/10 hover:bg-[#0ABF5B]/20 border border-[#0ABF5B]/30 transition-all duration-200 group"
        >
          <TencentLogo className="w-10 h-10 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-1">
            <span className="text-[#0ABF5B] text-xs font-bold">腾讯导航</span>
            <ExternalLink className="w-3 h-3 text-[#0ABF5B]/60 group-hover:text-[#0ABF5B] transition-colors" />
          </div>
        </button>
      </div>
    </div>
  );
}

export default TencentMap;
