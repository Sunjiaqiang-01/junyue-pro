import { Skeleton } from "@/components/ui/skeleton";

export function TherapistCardSkeleton() {
  return (
    <div className="relative w-full aspect-[9/16] rounded-2xl border border-white/5 overflow-hidden bg-pure-black">
      {/* 图片骨架 */}
      <Skeleton className="absolute inset-0" />

      {/* 渐变遮罩层 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 via-black/20 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/90 via-black/60 via-black/30 via-black/15 via-black/8 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      {/* 内容骨架 */}
      <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2.5">
        {/* 姓名 + 年龄 */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-12" />
        </div>

        {/* 基本信息 */}
        <Skeleton className="h-4 w-40" />

        {/* 位置信息 */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* 按钮 */}
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}
