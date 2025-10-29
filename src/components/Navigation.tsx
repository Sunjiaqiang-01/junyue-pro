"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "首页" },
    { href: "/therapists", label: "浏览技师" },
    { href: "#about", label: "关于我们" },
    { href: "#services", label: "服务特色" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-pure-black/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12">
              <Image
                src="/logo.png"
                alt="君悦SPA"
                fill
                className="object-contain group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="text-xl font-semibold text-pure-white">君悦SPA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-secondary/80 hover:text-primary-cyan transition-colors duration-200 font-normal text-sm"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/therapists"
              className="px-6 py-2.5 bg-primary-cyan text-pure-black font-medium rounded-lg hover:bg-primary-cyan/90 transition-all duration-200"
            >
              立即预约
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-secondary/60 hover:text-primary-cyan transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-pure-black/95 backdrop-blur-lg border-t border-white/5">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-secondary/60 hover:text-primary-cyan transition-colors duration-200 font-normal py-2"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/therapists"
              onClick={() => setIsOpen(false)}
              className="block w-full px-6 py-3 bg-primary-cyan text-pure-black font-medium rounded-lg text-center hover:bg-primary-cyan/90 transition-all duration-200"
            >
              立即预约
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
