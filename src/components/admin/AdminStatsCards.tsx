"use client";

import { Badge } from "@/components/ui/badge-2";
import {
  Card21st as Card,
  CardContent21st as CardContent,
  CardHeader21st as CardHeader,
  CardTitle21st as CardTitle,
} from "@/components/ui/card-21st";
import { ArrowDown, ArrowUp, Users, UserCheck, Clock, TrendingUp } from "lucide-react";

interface TrendData {
  growth: number;
}

interface AdminStatsCardsProps {
  stats: {
    totalTherapists: number;
    approvedTherapists: number;
    pendingTherapists: number;
    onlineTherapists: number;
    todayNew: number;
  } | null;
  trends?: {
    totalTherapists?: TrendData;
    approvedTherapists?: TrendData;
    pendingTherapists?: TrendData;
    onlineTherapists?: TrendData;
  } | null;
}

const statsConfig = [
  {
    title: "技师总数",
    key: "totalTherapists" as const,
    bg: "bg-transparent border border-white/5",
    svg: (
      <svg
        className="absolute right-0 top-0 h-full w-2/3 pointer-events-none"
        viewBox="0 0 300 200"
        fill="none"
        style={{ zIndex: 0 }}
      >
        <circle cx="220" cy="100" r="90" fill="#fff" fillOpacity="0.08" />
        <circle cx="260" cy="60" r="60" fill="#fff" fillOpacity="0.10" />
        <circle cx="200" cy="160" r="50" fill="#fff" fillOpacity="0.07" />
        <circle cx="270" cy="150" r="30" fill="#fff" fillOpacity="0.12" />
      </svg>
    ),
  },
  {
    title: "已审核通过",
    key: "approvedTherapists" as const,
    bg: "bg-transparent border border-white/5",
    svg: (
      <svg
        className="absolute right-0 top-0 w-48 h-48 pointer-events-none"
        viewBox="0 0 200 200"
        fill="none"
        style={{ zIndex: 0 }}
      >
        <defs>
          <filter id="blur2" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        <ellipse
          cx="170"
          cy="60"
          rx="40"
          ry="18"
          fill="#fff"
          fillOpacity="0.13"
          filter="url(#blur2)"
        />
        <rect x="120" y="20" width="60" height="20" rx="8" fill="#fff" fillOpacity="0.10" />
        <polygon points="150,0 200,0 200,50" fill="#fff" fillOpacity="0.07" />
        <circle cx="180" cy="100" r="14" fill="#fff" fillOpacity="0.16" />
      </svg>
    ),
  },
  {
    title: "待审核",
    key: "pendingTherapists" as const,
    bg: "bg-transparent border border-white/5",
    svg: (
      <svg
        className="absolute right-0 top-0 w-48 h-48 pointer-events-none"
        viewBox="0 0 200 200"
        fill="none"
        style={{ zIndex: 0 }}
      >
        <defs>
          <filter id="blur3" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>
        <rect
          x="120"
          y="0"
          width="70"
          height="70"
          rx="35"
          fill="#fff"
          fillOpacity="0.09"
          filter="url(#blur3)"
        />
        <ellipse cx="170" cy="80" rx="28" ry="12" fill="#fff" fillOpacity="0.12" />
        <polygon points="200,0 200,60 140,0" fill="#fff" fillOpacity="0.07" />
        <circle cx="150" cy="30" r="10" fill="#fff" fillOpacity="0.15" />
      </svg>
    ),
  },
  {
    title: "在线技师",
    key: "onlineTherapists" as const,
    bg: "bg-transparent border border-white/5",
    svg: (
      <svg
        className="absolute right-0 top-0 w-48 h-48 pointer-events-none"
        viewBox="0 0 200 200"
        fill="none"
        style={{ zIndex: 0 }}
      >
        <defs>
          <filter id="blur4" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>
        <polygon points="200,0 200,100 100,0" fill="#fff" fillOpacity="0.09" />
        <ellipse
          cx="170"
          cy="40"
          rx="30"
          ry="18"
          fill="#fff"
          fillOpacity="0.13"
          filter="url(#blur4)"
        />
        <rect x="140" y="60" width="40" height="18" rx="8" fill="#fff" fillOpacity="0.10" />
        <circle cx="150" cy="30" r="14" fill="#fff" fillOpacity="0.18" />
        <line x1="120" y1="0" x2="200" y2="80" stroke="#fff" strokeOpacity="0.08" strokeWidth="6" />
      </svg>
    ),
  },
];

export default function AdminStatsCards({ stats, trends }: AdminStatsCardsProps) {
  const icons = [Users, UserCheck, Clock, TrendingUp];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {statsConfig.map((config, index) => {
        const value = stats?.[config.key] || 0;
        // 使用真实的增长率数据，如果没有则显示0
        const trendData = trends?.[config.key];
        const delta = trendData?.growth || 0;
        const Icon = icons[index];

        return (
          <Card
            key={config.key}
            className="relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 text-white hover:bg-white/[0.07] transition-all"
          >
            <CardHeader className="border-0 pb-2 p-3 md:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-secondary/80 text-xs md:text-sm font-medium">
                  {config.title}
                </CardTitle>
                <Icon className="w-3 h-3 md:w-4 md:h-4 text-primary-cyan" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 p-3 md:p-6">
              <div className="flex items-baseline gap-1 md:gap-2">
                <span className="text-xl md:text-2xl font-bold text-pure-white">
                  {value.toLocaleString()}
                </span>
                <Badge
                  className={`text-[10px] md:text-xs font-semibold ${delta > 0 ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}
                >
                  {delta > 0 ? (
                    <ArrowUp className="w-2 h-2 md:w-3 md:h-3" />
                  ) : (
                    <ArrowDown className="w-2 h-2 md:w-3 md:h-3" />
                  )}
                  {Math.abs(delta)}%
                </Badge>
              </div>
              <p className="text-[10px] md:text-xs text-secondary/60 mt-1">
                较上周: {delta > 0 ? "增长" : "下降"} {Math.abs(delta)}%
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
