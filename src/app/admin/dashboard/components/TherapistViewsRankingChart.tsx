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
  "#FFD700",
  "#C0C0C0",
  "#CD7F32",
  "#3b82f6",
  "#3b82f6",
  "#3b82f6",
  "#3b82f6",
  "#3b82f6",
  "#3b82f6",
  "#3b82f6",
];

export function TherapistViewsRankingChart({ data }: TherapistViewsRankingChartProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          技师浏览量排行榜
        </CardTitle>
        <CardDescription>TOP 10 最受欢迎技师</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 前三名榜单 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {data.slice(0, 3).map((therapist) => (
            <div
              key={therapist.rank}
              className={`p-4 rounded-lg text-center ${
                therapist.rank === 1
                  ? "bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-500"
                  : therapist.rank === 2
                    ? "bg-gray-50 dark:bg-gray-900 border-2 border-gray-400"
                    : "bg-orange-50 dark:bg-orange-950 border-2 border-orange-600"
              }`}
            >
              <div className="flex justify-center mb-2">{getRankIcon(therapist.rank)}</div>
              <div className="font-bold text-lg mb-1">{therapist.nickname}</div>
              <div className="text-2xl font-bold mb-1">{therapist.viewCount.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">浏览次数</div>
            </div>
          ))}
        </div>

        {/* 柱状图 */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="nickname"
              className="text-xs"
              tick={{ fill: "currentColor" }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Bar dataKey="viewCount" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* 详细排名列表 */}
        <div className="mt-6 space-y-2">
          <h4 className="font-semibold text-sm mb-3">完整排名</h4>
          {data.map((therapist) => (
            <div
              key={therapist.rank}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                  {therapist.rank}
                </div>
                {getRankIcon(therapist.rank)}
                <span className="font-medium">{therapist.nickname}</span>
              </div>
              <Badge variant="secondary">{therapist.viewCount.toLocaleString()} 次</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
