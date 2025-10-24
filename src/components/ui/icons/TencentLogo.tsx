// 腾讯地图 Logo - 真实品牌图标
import Image from "next/image";

export function TencentLogo({ className }: { className?: string }) {
  return (
    <Image src="/logos/tencent.png" alt="腾讯地图" width={40} height={40} className={className} />
  );
}
