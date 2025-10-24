"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, LogOut, Clock } from "lucide-react";
import { NeonLogo } from "./NeonLogo";
import { motion } from "framer-motion";

// 管理端已登录时的导航链接
const adminLinks = [
  { href: "/admin/dashboard", label: "数据看板" },
  { href: "/admin/therapists-center", label: "技师中心", badge: true },
  { href: "/admin/content", label: "内容管理" },
  { href: "/admin/registration-codes", label: "注册码" },
];

export default function AdminNavigation() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [deactivationCount, setDeactivationCount] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
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
                <NeonLogo size={40} variant="full" />
                <p className="font-semibold text-xl tracking-tighter text-pure-white">君悦SPA</p>
              </Link>

              {/* Mobile menu button */}
              {open ? (
                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-white/10 bg-black/95 backdrop-blur-sm hover:bg-white/5 transition-all duration-200 lg:hidden"
                >
                  <svg
                    className="text-secondary/60 hover:text-primary-cyan w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="text-sm font-bold text-white">关闭</span>
                </button>
              ) : (
                <button
                  onClick={() => setOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-primary-cyan bg-black/95 backdrop-blur-sm hover:bg-primary-cyan/10 transition-all duration-200 shadow-lg shadow-primary-cyan/20 hover:shadow-primary-cyan/30 lg:hidden"
                >
                  <svg
                    className="text-primary-cyan w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  <span className="text-sm font-bold text-primary-cyan">菜单</span>
                </button>
              )}
            </div>

            {/* Desktop Navigation - 仅在已登录时显示 */}
            {isLoggedIn && (
              <motion.div
                onMouseLeave={() => setHovered(null)}
                className="absolute inset-0 m-auto hidden size-fit lg:flex gap-2 text-lg font-semibold"
              >
                {adminLinks.map((link, index) => {
                  const totalPending = pendingCount + deactivationCount;
                  return (
                    <Link
                      key={index}
                      href={link.href}
                      onMouseEnter={() => setHovered(index)}
                      className="relative px-4 py-2 text-white hover:text-primary-cyan transition-colors duration-200"
                    >
                      {hovered === index && (
                        <motion.div
                          layoutId="hovered"
                          className="absolute inset-0 h-full w-full rounded-full bg-primary-cyan/10"
                        />
                      )}
                      <span className="relative z-20">{link.label}</span>
                      {link.badge && totalPending > 0 && (
                        <span className="absolute -top-1 -right-2 bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center z-30">
                          {totalPending}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </motion.div>
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
                  <ul className="space-y-6">
                    {adminLinks.map((link, index) => {
                      const totalPending = pendingCount + deactivationCount;
                      return (
                        <li key={index} className="relative">
                          <Link
                            href={link.href}
                            className="text-xl font-semibold text-white hover:text-primary-cyan block duration-150 transition-colors flex items-center gap-2"
                            onClick={() => setOpen(false)}
                          >
                            <span>{link.label}</span>
                            {link.badge && totalPending > 0 && (
                              <span className="bg-yellow-500 text-black text-xs font-bold rounded-full px-2 py-0.5">
                                {totalPending}
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
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 text-pure-white bg-white/5 rounded-lg border border-white/10">
                      <User className="w-4 h-4 text-primary-cyan" />
                      <span className="text-sm font-semibold">
                        {session.user.name || session.user.username || "管理员"}
                      </span>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      size="sm"
                      className="border border-white/10 text-secondary/80 hover:text-primary-cyan hover:border-primary-cyan/50 hover:bg-primary-cyan/10 bg-transparent font-semibold"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      <span>退出登录</span>
                    </Button>
                  </>
                ) : (
                  // 未登录：显示登录按钮
                  <Button
                    onClick={() => router.push("/admin/login")}
                    variant="ghost"
                    size="sm"
                    className="border border-white/10 text-secondary/80 hover:text-primary-cyan hover:border-primary-cyan/50 hover:bg-primary-cyan/10 bg-transparent font-semibold"
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
