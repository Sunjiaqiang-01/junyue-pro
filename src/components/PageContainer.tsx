import { cn } from "@/lib/utils";
import { NAVBAR_HEIGHT } from "@/components/ui/resizable-navbar";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 页面容器组件
 *
 * 用途：为所有页面提供统一的顶部间距，避免内容被固定导航栏遮挡
 *
 * 使用方法：
 * ```tsx
 * <PageContainer className="bg-deep-black">
 *   <ResizableNavigation />
 *   <div className="px-4 py-8">
 *     {/* 页面内容 *\/}
 *   </div>
 * </PageContainer>
 * ```
 */
export default function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("min-h-screen", className)}>
      {/* 导航栏占位符 - 防止内容被fixed导航栏遮挡 */}
      <div style={{ height: `${NAVBAR_HEIGHT}px` }} aria-hidden="true" />

      {/* 页面内容 */}
      {children}
    </div>
  );
}
