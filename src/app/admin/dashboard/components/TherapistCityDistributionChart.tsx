"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { MapPin } from "lucide-react";
// import { Badge } from "@/components/ui/badge";

interface CityDistribution {
  city: string;
  count: number;
  percentage: number;
}

interface TherapistCityDistributionChartProps {
  data: CityDistribution[];
  totalTherapists: number;
}

// 扩展颜色数组，支持更多城市（30种颜色）
const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#f43f5e",
  "#6366f1",
  "#14b8a6",
  "#a855f7",
  "#ef4444",
  "#84cc16",
  "#eab308",
  "#22d3ee",
  "#f97316",
  "#d946ef",
  "#0ea5e9",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#06b6d4",
  "#a855f7",
  "#10b981",
  "#f43f5e",
  "#eab308",
  "#22d3ee",
  "#ef4444",
  "#84cc16",
];

// 动态生成颜色的辅助函数（当城市数超过预设颜色时）
const generateColor = (index: number): string => {
  if (index < COLORS.length) {
    return COLORS[index];
  }
  // 使用HSL色彩空间动态生成颜色
  const hue = (index * 137.508) % 360; // 使用黄金角度分布
  return `hsl(${hue}, 70%, 60%)`;
};

export function TherapistCityDistributionChart({
  data,
  totalTherapists,
}: TherapistCityDistributionChartProps) {
  const chartData = data.map((item) => ({
    name: item.city,
    value: item.count,
  }));

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-secondary/80">
              {entry.value} ({entry.payload.value}人)
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-pure-white text-base">
              <MapPin className="w-4 h-4 text-primary-cyan" />
              技师城市分布
            </CardTitle>
            <CardDescription className="text-secondary/60 text-xs mt-0.5">
              各城市占比
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-pure-white">{totalTherapists}</div>
            <div className="text-xs text-secondary/60">总技师数</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={generateColor(index)} />
              ))}
            </Pie>
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
            />
            <Legend content={renderLegend} verticalAlign="bottom" height={60} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
