"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Eye } from "lucide-react";

interface PageViewData {
  date: string;
  views: number;
}

interface PageViewsTrendChartProps {
  data: PageViewData[];
  totalViews: number;
  todayViews: number;
}

export function PageViewsTrendChart({ data, totalViews, todayViews }: PageViewsTrendChartProps) {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-pure-white text-base">
              <Eye className="w-4 h-4 text-primary-cyan" />
              网站浏览量趋势
            </CardTitle>
            <CardDescription className="text-secondary/60 text-xs mt-0.5">
              最近7天 · 今日: {todayViews.toLocaleString()}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-pure-white">{totalViews.toLocaleString()}</div>
            <div className="text-xs text-secondary/60">总浏览量</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" className="text-xs" tick={{ fill: "#94a3b8" }} />
            <YAxis className="text-xs" tick={{ fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.95)",
                border: "1px solid #06b6d4",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
              labelStyle={{
                color: "#06b6d4",
                fontWeight: "600",
                marginBottom: "4px",
              }}
              itemStyle={{
                color: "#fff",
                fontSize: "14px",
              }}
              formatter={(value: number) => [`${value.toLocaleString()}`, "浏览量"]}
            />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorViews)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
