"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, LogOut } from "lucide-react";

// 技师端已登录时的导航链接
const therapistLinks = [
  { href: "/therapist/dashboard", label: "工作台" },
  { href: "/therapist/profile/edit", label: "资料管理" },
  { href: "/therapist/notifications", label: "通知" },
];

export default function TherapistNavigation() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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
                  {therapistLinks.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="text-gray-300 hover:text-primary-gold block duration-150 font-medium"
                      >
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ))}
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
                    {therapistLinks.map((link, index) => (
                      <li key={index}>
                        <Link
                          href={link.href}
                          className="text-gray-300 hover:text-primary-gold block duration-150"
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
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 text-gray-300 bg-white/5 rounded-lg">
                      <User className="w-4 h-4 text-primary-gold" />
                      <span className="text-sm font-medium">
                        {session.user.phone || session.user.username}
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
                  // 未登录：显示登录和注册按钮
                  <>
                    <Button
                      onClick={() => router.push("/therapist?modal=login")}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-300 hover:text-primary-gold hover:border-primary-gold"
                    >
                      <span>技师登录</span>
                    </Button>
                    <Button
                      onClick={() => router.push("/therapist?modal=register")}
                      size="sm"
                      className="bg-gradient-to-r from-primary-gold to-yellow-600 hover:from-yellow-600 hover:to-primary-gold text-black font-bold"
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
