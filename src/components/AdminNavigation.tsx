"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, LogOut, Clock } from "lucide-react";

// 管理端已登录时的导航链接
const adminLinks = [
  { href: "/admin/dashboard", label: "数据看板" },
  { href: "/admin/system", label: "系统监控" },
  { href: "/admin/therapists", label: "技师管理" },
  { href: "/admin/therapists/pending", label: "技师审核", badge: true },
  { href: "/admin/deactivation", label: "注销申请", badge: true, badgeType: "deactivation" },
  { href: "/admin/customer-services", label: "客服配置" },
  { href: "/admin/announcements", label: "公告管理" },
];

export default function AdminNavigation() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [deactivationCount, setDeactivationCount] = useState(0);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 获取待审核数量
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchPendingCount();
      fetchDeactivationCount();
    }
  }, [status, session]);

  const fetchPendingCount = async () => {
    try {
      const res = await fetch("/api/admin/therapists/pending");
      const data = await res.json();
      if (data.success && data.data) {
        setPendingCount(data.data.length);
      }
    } catch (error) {
      console.error("获取待审核数量失败:", error);
    }
  };

  const fetchDeactivationCount = async () => {
    try {
      const res = await fetch("/api/admin/deactivation?status=PENDING");
      const data = await res.json();
      if (data.success && data.data) {
        setDeactivationCount(data.data.length);
      }
    } catch (error) {
      console.error("获取注销申请数量失败:", error);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/admin/login" });
  };

  const isLoggedIn = status === "authenticated" && session?.user?.role === "admin";

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="px-2">
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-black/50 max-w-4xl rounded-2xl border border-gray-800 backdrop-blur-lg lg:px-5"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 lg:gap-0 py-2">
            {/* Logo */}
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href={isLoggedIn ? "/admin/dashboard" : "/admin/login"}
                aria-label="home"
                className="flex gap-2 items-center"
              >
                <div className="relative w-10 h-10">
                  <Image src="/logo.png" alt="君悦SPA" fill className="object-contain" />
                </div>
                <p className="font-semibold text-xl tracking-tighter text-primary-gold">君悦SPA</p>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setOpen(!open)}
                aria-label={open ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <div className="relative flex items-center justify-center">
                  <div className="relative size-4">
                    <span
                      className={cn(
                        "bg-white absolute left-0 block h-0.5 w-4 transition-all duration-100",
                        open ? "top-[0.4rem] -rotate-45" : "top-1"
                      )}
                    />
                    <span
                      className={cn(
                        "bg-white absolute left-0 block h-0.5 w-4 transition-all duration-100",
                        open ? "top-[0.4rem] rotate-45" : "top-2.5"
                      )}
                    />
                  </div>
                </div>
              </button>
            </div>

            {/* Desktop Navigation - 仅在已登录时显示 */}
            {isLoggedIn && (
              <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                <ul className="flex gap-8 text-sm">
                  {adminLinks.map((link, index) => {
                    const badgeCount =
                      link.badgeType === "deactivation" ? deactivationCount : pendingCount;
                    return (
                      <li key={index} className="relative">
                        <Link
                          href={link.href}
                          className="text-gray-300 hover:text-primary-gold block duration-150 font-medium"
                        >
                          <span>{link.label}</span>
                          {link.badge && badgeCount > 0 && (
                            <span className="absolute -top-2 -right-3 bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                              {badgeCount}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Right side buttons */}
            <div
              className={cn(
                "bg-black/90 mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-gray-800 p-6 shadow-2xl backdrop-blur-lg md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none",
                open && "block"
              )}
            >
              {/* Mobile menu items - 仅在已登录时显示 */}
              {isLoggedIn && (
                <div className="lg:hidden">
                  <ul className="space-y-6 text-base">
                    {adminLinks.map((link, index) => {
                      const badgeCount =
                        link.badgeType === "deactivation" ? deactivationCount : pendingCount;
                      return (
                        <li key={index} className="relative">
                          <Link
                            href={link.href}
                            className="text-gray-300 hover:text-primary-gold block duration-150 flex items-center gap-2"
                            onClick={() => setOpen(false)}
                          >
                            <span>{link.label}</span>
                            {link.badge && badgeCount > 0 && (
                              <span className="bg-yellow-500 text-black text-xs font-bold rounded-full px-2 py-0.5">
                                {badgeCount}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-2 sm:space-y-0 md:w-fit">
                {isLoggedIn ? (
                  // 已登录：显示管理员信息和退出按钮
                  <>
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 text-gray-300 bg-white/5 rounded-lg">
                      <User className="w-4 h-4 text-primary-gold" />
                      <span className="text-sm font-medium">
                        {session.user.name || session.user.username || "管理员"}
                      </span>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-300 hover:text-red-500 hover:border-red-500"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>退出登录</span>
                    </Button>
                  </>
                ) : (
                  // 未登录：显示登录按钮
                  <Button
                    onClick={() => router.push("/admin/login")}
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-gray-300 hover:text-primary-gold hover:border-primary-gold"
                  >
                    <span>管理员登录</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
