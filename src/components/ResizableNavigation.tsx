"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  NavbarButton,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { NeonLogo } from "./NeonLogo";

// 自定义Logo组件（替换默认的NavbarLogo）
const JunyueLogo = () => {
  return (
    <a
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal"
    >
      <NeonLogo size={40} variant="full" />
      <span className="font-semibold text-xl tracking-tighter text-pure-white">君悦SPA</span>
    </a>
  );
};

export default function ResizableNavigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 判断是否是技师端路由（精确匹配，排除 /therapists 技师列表页）
  const isTherapistRoute =
    (pathname === "/therapist" ||
      pathname?.startsWith("/therapist/dashboard") ||
      pathname?.startsWith("/therapist/profile") ||
      pathname?.startsWith("/therapist/notifications")) ??
    false;

  const navItems = [
    {
      name: "首页",
      link: "/",
    },
    {
      name: "技师列表",
      link: "/therapists",
    },
    {
      name: "必看攻略",
      link: "/guide",
    },
  ];

  return (
    <div className="relative w-full">
      <Navbar className="fixed top-0">
        {/* Desktop Navigation */}
        <NavBody>
          <JunyueLogo />
          <NavItems items={navItems} />
          {/* 根据路由条件显示按钮 */}
          {isTherapistRoute ? (
            // 技师端：显示登录和注册按钮
            <div className="flex items-center gap-4">
              <NavbarButton variant="secondary" href="/therapist?modal=login">
                登录
              </NavbarButton>
              <NavbarButton variant="primary" href="/therapist?modal=register">
                技师入驻
              </NavbarButton>
            </div>
          ) : (
            // 用户端：显示联系客服按钮
            <div className="flex items-center gap-4">
              <NavbarButton
                variant="primary"
                as="button"
                onClick={() => {
                  // 触发客服弹窗（通过自定义事件）
                  const event = new CustomEvent("openCustomerService");
                  window.dispatchEvent(event);
                }}
              >
                联系客服
              </NavbarButton>
            </div>
          )}
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <JunyueLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-xl font-semibold text-white hover:text-primary-gold dark:text-white dark:hover:text-primary-gold transition-colors duration-200"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            {/* 移动端按钮 - 根据路由条件显示 */}
            {isTherapistRoute ? (
              // 技师端：显示登录和注册按钮
              <div className="flex w-full flex-col gap-4">
                <NavbarButton
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="secondary"
                  href="/therapist?modal=login"
                  className="w-full"
                >
                  登录
                </NavbarButton>
                <NavbarButton
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="primary"
                  href="/therapist?modal=register"
                  className="w-full"
                >
                  技师入驻
                </NavbarButton>
              </div>
            ) : (
              // 用户端：显示联系客服按钮
              <div className="flex w-full flex-col gap-4">
                <NavbarButton
                  as="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    const event = new CustomEvent("openCustomerService");
                    window.dispatchEvent(event);
                  }}
                  variant="primary"
                  className="w-full"
                >
                  联系客服
                </NavbarButton>
              </div>
            )}
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
