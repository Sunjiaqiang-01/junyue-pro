// 百度地图 Logo - 真实品牌图标
import Image from "next/image";

export function BaiduLogo({ className }: { className?: string }) {
  return (
    <Image src="/logos/baidu.png" alt="百度地图" width={40} height={40} className={className} />
  );
}
