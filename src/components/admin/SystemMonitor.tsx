"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, HardDrive, MemoryStick, Activity } from "lucide-react";

interface SystemStats {
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
}

export default function SystemMonitor() {
  const [stats, setStats] = useState<SystemStats>({
    cpu: 0,
    memory: 0,
    disk: 0,
    uptime: "0天0小时",
  });

  useEffect(() => {
    // 模拟系统监控数据（实际项目中应从API获取）
    const updateStats = () => {
      setStats({
        cpu: Math.random() * 30 + 20, // 20-50%
        memory: Math.random() * 20 + 60, // 60-80%
        disk: Math.random() * 10 + 45, // 45-55%
        uptime: `${Math.floor(Math.random() * 30 + 1)}天${Math.floor(Math.random() * 24)}小时`,
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  const monitors = [
    {
      title: "CPU 使用率",
      value: stats.cpu,
      icon: Cpu,
      unit: "%",
      color:
        stats.cpu > 70 ? "text-red-400" : stats.cpu > 50 ? "text-yellow-400" : "text-green-400",
      bgColor:
        stats.cpu > 70 ? "bg-red-500/10" : stats.cpu > 50 ? "bg-yellow-500/10" : "bg-green-500/10",
    },
    {
      title: "内存使用",
      value: stats.memory,
      icon: MemoryStick,
      unit: "%",
      color:
        stats.memory > 80
          ? "text-red-400"
          : stats.memory > 60
            ? "text-yellow-400"
            : "text-green-400",
      bgColor:
        stats.memory > 80
          ? "bg-red-500/10"
          : stats.memory > 60
            ? "bg-yellow-500/10"
            : "bg-green-500/10",
    },
    {
      title: "磁盘使用",
      value: stats.disk,
      icon: HardDrive,
      unit: "%",
      color:
        stats.disk > 80 ? "text-red-400" : stats.disk > 60 ? "text-yellow-400" : "text-green-400",
      bgColor:
        stats.disk > 80
          ? "bg-red-500/10"
          : stats.disk > 60
            ? "bg-yellow-500/10"
            : "bg-green-500/10",
    },
    {
      title: "运行时间",
      value: stats.uptime,
      icon: Activity,
      unit: "",
      color: "text-primary-cyan",
      bgColor: "bg-primary-cyan/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {monitors.map((monitor, index) => {
        const Icon = monitor.icon;
        return (
          <Card
            key={index}
            className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/[0.07] transition-all"
          >
            <CardHeader className="border-0 pb-2 p-3 md:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-secondary/80 text-xs md:text-sm font-medium">
                  {monitor.title}
                </CardTitle>
                <div className={`p-1.5 md:p-2 rounded-lg ${monitor.bgColor}`}>
                  <Icon className={`w-3 h-3 md:w-4 md:h-4 ${monitor.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 p-3 md:p-6">
              <div className="flex items-baseline gap-1">
                <span className={`text-xl md:text-2xl font-bold ${monitor.color}`}>
                  {typeof monitor.value === "number" ? monitor.value.toFixed(1) : monitor.value}
                </span>
                {monitor.unit && (
                  <span className="text-xs md:text-sm text-secondary/60">{monitor.unit}</span>
                )}
              </div>
              {typeof monitor.value === "number" && (
                <div className="mt-2 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      monitor.value > 70
                        ? "bg-red-500"
                        : monitor.value > 50
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${monitor.value}%` }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
