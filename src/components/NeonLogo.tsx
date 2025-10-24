import Image from "next/image";

interface NeonLogoProps {
  size?: number;
  className?: string;
  variant?: "full" | "navbar";
}

/**
 * 君悦SPA Logo 霓虹光效组件
 *
 * @param size - Logo尺寸（默认：full=100, navbar=40）
 * @param className - 额外的CSS类名
 * @param variant - 变体类型
 *   - "full": 完整霓虹特效（用于登录页等大尺寸场景）
 *   - "navbar": 简化版霓虹特效（用于导航栏等小尺寸场景）
 */
export function NeonLogo({ size, className = "", variant = "navbar" }: NeonLogoProps) {
  const logoSize = size || (variant === "full" ? 100 : 40);

  if (variant === "full") {
    // 完整版：白核青晕流动光环
    return (
      <div className={`relative inline-block ${className}`}>
        {/* Outer layer - Cyan soft glow */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary-cyan/20 via-primary-cyan/40 to-primary-cyan/20 blur-2xl opacity-60 animate-pulse" />

        {/* Flowing light ring - White core + Cyan transition */}
        <div
          className="absolute -inset-1 rounded-full animate-spin"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, rgba(255, 255, 255, 1) 5%, rgba(6, 182, 212, 0.8) 10%, transparent 20%, transparent 100%)",
            animationDuration: "3s",
            filter: "drop-shadow(0 0 6px rgba(6, 182, 212, 0.8))",
          }}
        />

        {/* Secondary flowing ring - White to Cyan gradient */}
        <div
          className="absolute -inset-1 rounded-full"
          style={{
            background:
              "conic-gradient(from 180deg, transparent 0%, rgba(255, 255, 255, 0.7) 8%, rgba(6, 182, 212, 0.5) 15%, transparent 30%, transparent 100%)",
            animation: "spin 4s linear infinite reverse",
            filter: "blur(2px)",
          }}
        />

        {/* Logo container with white ring and cyan shadow */}
        <div className="relative rounded-full ring-1 ring-white/30 shadow-lg shadow-primary-cyan/30">
          <Image
            src="/logo.png"
            alt="君悦SPA Logo"
            width={logoSize}
            height={logoSize}
            className="rounded-full"
            priority
          />
        </div>
      </div>
    );
  }

  // 导航栏简化版：静态青色光晕
  return (
    <div className={`relative inline-block ${className}`}>
      {/* Static cyan glow - subtle */}
      <div className="absolute -inset-1 rounded-full bg-primary-cyan/20 blur-md" />

      {/* Gentle pulsing glow */}
      <div
        className="absolute -inset-0.5 rounded-full bg-primary-cyan/10 blur-sm animate-pulse"
        style={{ animationDuration: "3s" }}
      />

      {/* Logo container with subtle cyan ring */}
      <div className="relative rounded-full ring-1 ring-primary-cyan/30">
        <Image
          src="/logo.png"
          alt="君悦SPA"
          width={logoSize}
          height={logoSize}
          className="rounded-full"
        />
      </div>
    </div>
  );
}
