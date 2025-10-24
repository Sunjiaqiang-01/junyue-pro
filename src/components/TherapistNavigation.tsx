"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { NeonLogo } from "./NeonLogo";

// 技师端已登录时的导航链接
const therapistLinks = [
  { href: "/therapist/dashboard", label: "工作台" },
  { href: "/therapist/profile/edit", label: "资料管理" },
  { href: "/therapist/notifications", label: "通知" },
  { href: "/therapist/settings", label: "设置" },
];

export default function TherapistNavigation() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/therapist" });
  };

  const isLoggedIn = status === "authenticated" && session?.user?.role === "therapist";

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
                href={isLoggedIn ? "/therapist/dashboard" : "/therapist"}
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
                {therapistLinks.map((link, index) => (
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
                  </Link>
                ))}
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
                    {therapistLinks.map((link, index) => (
                      <li key={index}>
                        <Link
                          href={link.href}
                          className="text-xl font-semibold text-white hover:text-primary-cyan block duration-150 transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-2 sm:space-y-0 md:w-fit">
                {isLoggedIn ? (
                  // 已登录：显示用户信息和退出按钮
                  <>
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 text-pure-white bg-white/5 rounded-lg border border-white/10">
                      <User className="w-4 h-4 text-primary-cyan" />
                      <span className="text-sm font-semibold">
                        {session.user.phone || session.user.username}
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
                  // 未登录：显示登录和注册按钮
                  <>
                    <Button
                      onClick={() => router.push("/therapist?modal=login")}
                      variant="ghost"
                      size="sm"
                      className="border border-white/10 text-pure-white hover:text-primary-cyan hover:border-primary-cyan/50 hover:bg-primary-cyan/10 bg-transparent font-semibold"
                    >
                      <span>技师登录</span>
                    </Button>
                    <Button
                      onClick={() => router.push("/therapist?modal=register")}
                      size="sm"
                      className="bg-primary-cyan hover:bg-primary-cyan/90 text-pure-black font-semibold shadow-lg shadow-primary-cyan/30"
                    >
                      <span>立即注册</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
