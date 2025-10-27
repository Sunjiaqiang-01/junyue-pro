// 高德地图 Logo - 真实品牌图标
import Image from "next/image";

export function AmapLogo({ className }: { className?: string }) {
  return (
    <Image src="/logos/amap.png" alt="高德地图" width={40} height={40} className={className} />
  );
}
