"use client";

import { Badge } from "@/components/ui/badge-2";
import {
  Card21st as Card,
  CardContent21st as CardContent,
  CardHeader21st as CardHeader,
  CardTitle21st as CardTitle,
} from "@/components/ui/card-21st";
import { ArrowDown, ArrowUp, Users, UserCheck, Clock, TrendingUp } from "lucide-react";

interface AdminStatsCardsProps {
  stats: {
    totalTherapists: number;
    approvedTherapists: number;
    pendingTherapists: number;
    onlineTherapists: number;
    todayNew: number;
  } | null;
}

const statsConfig = [
  {
    title: "技师总数",
    key: "totalTherapists" as const,
    bg: "bg-zinc-950",
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
    bg: "bg-green-600",
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
    bg: "bg-yellow-600",
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
    bg: "bg-blue-600",
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

export default function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((config, index) => {
        const value = stats?.[config.key] || 0;
        // 简单的增长率计算（这里可以后续从API获取真实数据）
        const delta = index === 0 ? 2.5 : index === 1 ? 5.2 : index === 2 ? -1.3 : 3.8;

        return (
          <Card
            key={config.key}
            className={`relative overflow-hidden ${config.bg} text-white border-0`}
          >
            <CardHeader className="border-0 z-10 relative pb-2">
              <CardTitle className="text-white/90 text-sm font-medium">{config.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 z-10 relative pt-0">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl font-semibold tracking-tight">
                  {value.toLocaleString()}
                </span>
                <Badge className="bg-white/20 font-semibold text-xs">
                  {delta > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(delta)}%
                </Badge>
              </div>
              <div className="text-xs text-white/80 mt-2 border-t border-white/20 pt-2.5">
                较上周:{" "}
                <span className="font-medium text-white">
                  {delta > 0 ? "增长" : "下降"} {Math.abs(delta)}%
                </span>
              </div>
            </CardContent>
            {config.svg}
          </Card>
        );
      })}
    </div>
  );
}
