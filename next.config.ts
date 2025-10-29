import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "junyue.org", // 🔒 只允许自己的域名
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp", "image/avif"],
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // 防止被iframe嵌入（点击劫持）
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // 防止MIME类型嗅探
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block", // XSS过滤器
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin", // 控制Referer信息
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()", // 禁用敏感API
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
