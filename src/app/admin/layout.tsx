"use client";

import type { Metadata } from "next";
import { usePathname } from "next/navigation";
import AdminNavigation from "@/components/AdminNavigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 登录页面不显示导航栏
  const showNavigation = pathname !== "/admin/login";

  return (
    <div className="min-h-screen bg-pure-black">
      {showNavigation && <AdminNavigation />}
      <div className={showNavigation ? "pt-20" : ""}>{children}</div>
    </div>
  );
}
