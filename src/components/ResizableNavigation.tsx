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
import Image from "next/image";

// 自定义Logo组件（替换默认的NavbarLogo）
const JunyueLogo = () => {
  return (
    <a
      href="/home"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal"
    >
      <Image
        src="/logo.png"
        alt="君悦SPA"
        width={30}
        height={30}
        className="rounded-full"
      />
      <span className="font-medium text-primary-gold">君悦SPA</span>
    </a>
  );
};

export default function ResizableNavigation() {
  const navItems = [
    {
      name: "首页",
      link: "/home",
    },
    {
      name: "技师列表",
      link: "/therapists",
    },
    {
      name: "关于我们",
      link: "#about",
    },
    {
      name: "服务特色",
      link: "#features",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full">
      <Navbar className="fixed top-0">
        {/* Desktop Navigation */}
        <NavBody>
          <JunyueLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            <NavbarButton variant="secondary" href="/therapist/login">登录</NavbarButton>
            <NavbarButton variant="primary" href="/therapist/register">技师入驻</NavbarButton>
          </div>
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

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-lg text-white hover:text-primary-gold dark:text-white dark:hover:text-primary-gold transition-colors duration-200"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="secondary"
                href="/therapist/login"
                className="w-full"
              >
                登录
              </NavbarButton>
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                href="/therapist/register"
                className="w-full"
              >
                技师入驻
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}

