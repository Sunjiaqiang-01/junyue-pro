"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Trophy, Medal, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TherapistRanking {
  nickname: string;
  viewCount: number;
  rank: number;
}

interface TherapistViewsRankingChartProps {
  data: TherapistRanking[];
}

const COLORS = [
  "#06b6d4", // 青色
  "#06b6d4",
  "#06b6d4",
  "#06b6d4",
  "#06b6d4",
  "#06b6d4",
  "#06b6d4",
  "#06b6d4",
  "#06b6d4",
  "#06b6d4",
];

export function TherapistViewsRankingChart({ data }: TherapistViewsRankingChartProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-primary-cyan" />;
      case 2:
        return <Medal className="w-5 h-5 text-primary-cyan/70" />;
      case 3:
        return <Award className="w-5 h-5 text-primary-cyan/50" />;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-pure-white text-base">
          <Trophy className="w-4 h-4 text-primary-cyan" />
          技师浏览量排行榜
        </CardTitle>
        <CardDescription className="text-secondary/60 text-xs mt-0.5">TOP 10</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {/* 柱状图 */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="nickname"
              className="text-xs"
              tick={{ fill: "#94a3b8" }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
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
            <Bar dataKey="viewCount" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
