"use client";

import { Box, Zap, CheckCircle, RefreshCw } from "lucide-react";

interface DashboardStatsProps {
  total: number;
  running: number;
  failed: number;
  success: number;
}

export function DashboardStats({
  total,
  running,
  failed,
  success,
}: DashboardStatsProps) {
  const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

  const stats = [
    {
      label: "Total Jobs",
      value: total,
      icon: Box,
      color: "",
    },
    {
      label: "Success",
      value: success,
      icon: CheckCircle,
      color: "text-green-400",
    },
    {
      label: "Success Rate",
      value: `${successRate}%`,
      icon: Zap,
      color: successRate >= 80 ? "text-green-400" : successRate >= 50 ? "text-amber-400" : "text-red-400",
    },
    {
      label: "Running Now",
      value: running,
      icon: RefreshCw,
      color: "text-blue-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className="w-4 h-4 text-zinc-500" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
          <div className={`text-2xl font-bold font-mono ${stat.color}`}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
