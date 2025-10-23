"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface EnhancedTherapistCardProps {
  therapist: {
    id: string;
    nickname: string;
    age: number;
    height: number;
    weight: number;
    cardValue?: string; // 🆕 牌值
    city: string;
    areas: string[];
    location?: {
      // 🆕 位置信息
      name: string;
      street: string;
      latitude: number;
      longitude: number;
    };
    isNew: boolean;
    isFeatured: boolean;
    avatar: string;
    introduction?: string;
  };
  onClick?: () => void;
  enableAnimations?: boolean;
  className?: string;
}

export function EnhancedTherapistCard({
  therapist,
  onClick,
  enableAnimations = true,
  className,
}: EnhancedTherapistCardProps) {
  const [hovered, setHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !shouldReduceMotion;

  const containerVariants = {
    rest: {
      scale: 1,
      y: 0,
      filter: "blur(0px)",
    },
    hover: shouldAnimate
      ? {
          scale: 1.02,
          y: -4,
          filter: "blur(0px)",
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 28,
            mass: 0.6,
          },
        }
      : {},
  };

  const imageVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 28,
        mass: 0.6,
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 15,
      scale: 0.95,
      filter: "blur(2px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.5,
      },
    },
  };

  const letterVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 8,
        stiffness: 200,
        mass: 0.8,
      },
    },
  };

  return (
    <motion.div
      data-slot="therapist-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      variants={containerVariants}
      className={cn(
        "relative w-full aspect-[9/16] rounded-2xl border border-white/5 text-card-foreground overflow-hidden cursor-pointer group backdrop-blur-sm hover:border-white/10 transition-all",
        className
      )}
    >
      {/* Full Cover Image - 9:16 比例 */}
      <motion.img
        src={therapist.avatar}
        alt={therapist.nickname}
        className="absolute inset-0 w-full h-full object-cover"
        variants={imageVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      {/* Smooth Blur Overlay - Multiple layers for seamless fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 via-black/20 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/90 via-black/60 via-black/30 via-black/15 via-black/8 to-transparent backdrop-blur-[1px]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/85 via-black/40 to-transparent backdrop-blur-sm" />

      {/* Status Badges - Top Right (删除在线状态) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        {therapist.isFeatured && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0 shadow-lg shadow-yellow-500/30 text-xs px-2 py-0.5">
            <Star className="w-3 h-3 mr-1" />
            推荐
          </Badge>
        )}
        {therapist.isNew && (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 border-0 shadow-lg shadow-green-500/30 text-xs px-2 py-0.5">
            新人
          </Badge>
        )}
      </div>

      {/* Content */}
      <motion.div
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        className="absolute bottom-0 left-0 right-0 p-5 space-y-2.5"
      >
        {/* Name + Age (同一行) */}
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <motion.h2
            className="text-xl font-bold text-white"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.02,
                },
              },
            }}
          >
            {therapist.nickname.split("").map((letter, index) => (
              <motion.span key={index} variants={letterVariants} className="inline-block">
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </motion.h2>
          <span className="text-sm text-gray-300">{therapist.age}岁</span>
        </motion.div>

        {/* Basic Info - 身高体重牌值（紧凑一行） */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 text-sm text-gray-300"
        >
          <span>{therapist.height}cm</span>
          <span>•</span>
          <span>{therapist.weight}kg</span>
          {therapist.cardValue && (
            <>
              <span>•</span>
              <span>{therapist.cardValue}</span>
            </>
          )}
        </motion.div>

        {/* 个人简介（单行） */}
        {therapist.introduction && (
          <motion.p variants={itemVariants} className="text-sm text-gray-300 line-clamp-1">
            {therapist.introduction}
          </motion.p>
        )}

        {/* Location - 双行显示（地名 + 街道） */}
        {therapist.location ? (
          <motion.div variants={itemVariants} className="flex items-start gap-1.5 text-gray-400">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
            <div className="flex flex-col gap-0.5">
              <span className="text-white font-medium text-sm leading-tight">
                {therapist.location.name}
              </span>
              <span className="text-gray-400 text-xs leading-tight">
                {therapist.location.street}
              </span>
            </div>
          </motion.div>
        ) : (
          therapist.city && (
            <motion.div variants={itemVariants} className="flex items-center gap-1.5 text-gray-400">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {therapist.city}
                {therapist.areas.length > 0 && ` · ${therapist.areas[0]}`}
              </span>
            </motion.div>
          )
        )}

        {/* View Details Button */}
        <motion.button
          variants={itemVariants}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          whileHover={{
            scale: 1.02,
            transition: { type: "spring", stiffness: 400, damping: 25 },
          }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full cursor-pointer py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200",
            "border border-primary-cyan/30",
            "bg-transparent text-primary-cyan hover:bg-primary-cyan/10",
            "transform-gpu"
          )}
        >
          查看详情
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default EnhancedTherapistCard;
