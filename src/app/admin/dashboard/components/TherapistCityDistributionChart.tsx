"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CityDistribution {
  city: string;
  count: number;
  percentage: number;
}

interface TherapistCityDistributionChartProps {
  data: CityDistribution[];
  totalTherapists: number;
}

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
];

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          技师城市分布
        </CardTitle>
        <CardDescription>各城市技师数量占比</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-2xl font-bold">{totalTherapists}</div>
          <div className="text-sm text-muted-foreground">总技师数</div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => `${value} (${entry.payload.value}人)`}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* 详细列表 */}
        <div className="mt-6 space-y-2">
          <h4 className="font-semibold text-sm mb-3">详细分布</h4>
          <div className="grid grid-cols-2 gap-3">
            {data.map((item, index) => (
              <div
                key={item.city}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium text-sm">{item.city}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{item.count}人</div>
                  <div className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
