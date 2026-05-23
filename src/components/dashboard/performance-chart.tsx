"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { backtestData } from "@/data/mock/backtest";
import { useState } from "react";
import { cn } from "@/lib/utils";

const periods = [
  { label: "1Y", months: 12 },
  { label: "2Y", months: 24 },
  { label: "3Y", months: 36 },
  { label: "All", months: Infinity },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/95 backdrop-blur-sm p-3 shadow-xl text-xs">
      <p className="text-slate-400 font-medium mb-2">{label}</p>
      {payload.map((item) => {
        const ret = ((item.value - 100) / 100 * 100).toFixed(1);
        const sign = Number(ret) >= 0 ? "+" : "";
        return (
          <div key={item.name} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
              <span className="text-slate-300">{item.name}</span>
            </div>
            <span className={cn("font-semibold tabular-nums", Number(ret) >= 0 ? "text-emerald-400" : "text-red-400")}>
              {sign}{ret}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function PerformanceChart() {
  const [activePeriod, setActivePeriod] = useState("All");

  const filteredData = activePeriod === "All"
    ? backtestData
    : backtestData.slice(-periods.find((p) => p.label === activePeriod)!.months);

  // Re-index to 100 based on filtered start
  const startIndex = filteredData[0].index;
  const startSpy = filteredData[0].spy;
  const startQqq = filteredData[0].qqq;

  const chartData = filteredData.map((d) => ({
    date: d.date,
    "AI Infra Index": parseFloat(((d.index / startIndex) * 100).toFixed(2)),
    "SPY": parseFloat(((d.spy / startSpy) * 100).toFixed(2)),
    "QQQ": parseFloat(((d.qqq / startQqq) * 100).toFixed(2)),
  }));

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-100">Performance</h3>
          <p className="text-sm text-slate-400 mt-0.5">Indexed to 100 at period start</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-slate-800/60 border border-slate-700 p-1">
          {periods.map((p) => (
            <button
              key={p.label}
              onClick={() => setActivePeriod(p.label)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer",
                activePeriod === p.label
                  ? "bg-slate-700 text-slate-100"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(chartData.length / 8)}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
            formatter={(value) => <span style={{ color: "#94a3b8" }}>{value}</span>}
          />
          <ReferenceLine y={100} stroke="#334155" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="AI Infra Index"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="SPY"
            stroke="#10b981"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            activeDot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="QQQ"
            stroke="#8b5cf6"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            activeDot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
