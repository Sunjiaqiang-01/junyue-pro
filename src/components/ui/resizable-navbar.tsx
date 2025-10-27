"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";

import React, { useRef, useState } from "react";

// 导航栏高度常量（用于全局统一）
export const NAVBAR_HEIGHT = 72; // 72px = h-18 in Tailwind

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      // IMPORTANT: Change this to class of `fixed` if you want the navbar to be fixed
      className={cn("sticky inset-x-0 top-20 z-40 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ visible?: boolean }>, { visible })
          : child
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(16px)" : "none",
        boxShadow: visible
          ? "0 8px 32px rgba(212, 175, 55, 0.2), 0 0 0 1px rgba(212, 175, 55, 0.4)"
          : "0 0 0 1px rgba(212, 175, 55, 0.2)",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      style={{
        minWidth: "800px",
        height: `${NAVBAR_HEIGHT}px`,
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-2 lg:flex dark:bg-transparent",
        visible &&
          "bg-gradient-to-b from-black via-gray-900/95 to-black/95 dark:bg-gradient-to-b dark:from-black dark:via-gray-900/95 dark:to-black/95",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-lg font-semibold text-secondary/80 transition duration-200 hover:text-primary-cyan lg:flex lg:space-x-2 dark:text-secondary/80 dark:hover:text-primary-cyan",
        className
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-4 py-2 text-white hover:text-primary-cyan dark:text-white dark:hover:text-primary-cyan transition-colors duration-200"
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <motion.div
              layoutId="hovered"
              className="absolute inset-0 h-full w-full rounded-full bg-primary-cyan/10 dark:bg-primary-cyan/10"
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(16px)" : "none",
        boxShadow: visible
          ? "0 0 50px rgba(212, 175, 55, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.5)"
          : "0 0 0 1px rgba(212, 175, 55, 0.2)",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? "4px" : "2rem",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
        visible &&
          "bg-gradient-to-b from-black to-gray-900 dark:bg-gradient-to-b dark:from-black dark:to-gray-900",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({ children, className }: MobileNavHeaderProps) => {
  return (
    <div className={cn("flex w-full flex-row items-center justify-between", className)}>
      {children}
    </div>
  );
};

export const MobileNavMenu = ({ children, className, isOpen, onClose }: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-pure-black px-4 py-8 shadow-[0_0_50px_rgba(6,_182,_212,_0.3)] border border-primary-cyan/50 dark:bg-pure-black",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => {
  return isOpen ? (
    // 展开时：关闭按钮
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-white/10 bg-black/95 backdrop-blur-sm hover:bg-white/5 transition-all duration-200"
    >
      <IconX className="text-secondary/60 hover:text-primary-cyan w-5 h-5" />
      <span className="text-sm font-bold text-white">关闭</span>
    </button>
  ) : (
    // 未展开时：菜单按钮
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-primary-cyan bg-black/95 backdrop-blur-sm hover:bg-primary-cyan/10 transition-all duration-200 shadow-lg shadow-primary-cyan/20 hover:shadow-primary-cyan/30"
    >
      <IconMenu2 className="text-primary-cyan w-5 h-5" />
      <span className="text-sm font-bold text-white">菜单</span>
    </button>
  );
};

export const NavbarLogo = () => {
  return (
    <a
      href="#"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
    >
      <img src="https://assets.aceternity.com/logo-dark.png" alt="logo" width={30} height={30} />
      <span className="font-medium text-black dark:text-white">Startup</span>
    </a>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (React.ComponentPropsWithoutRef<"a"> | React.ComponentPropsWithoutRef<"button">)) => {
  const baseStyles =
    "px-4 py-2 rounded-md bg-white button bg-white text-black text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

  const variantStyles = {
    primary:
      "bg-primary-cyan text-pure-black shadow-[0_8px_24px_rgba(6,_182,_212,_0.4)] hover:shadow-[0_12px_32px_rgba(6,_182,_212,_0.5)] hover:bg-primary-cyan/90",
    secondary:
      "bg-transparent shadow-none text-primary-cyan border border-primary-cyan hover:bg-primary-cyan/10 dark:text-primary-cyan dark:border-primary-cyan",
    dark: "bg-black text-white shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    gradient:
      "bg-primary-cyan text-pure-black shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] hover:bg-primary-cyan/90",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};
