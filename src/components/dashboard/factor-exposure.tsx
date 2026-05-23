"use client";
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

const factorData = [
  { factor: "Value",     index: 68, benchmark: 50 },
  { factor: "Momentum",  index: 84, benchmark: 50 },
  { factor: "Quality",   index: 88, benchmark: 50 },
  { factor: "Low Vol",   index: 32, benchmark: 50 },
  { factor: "Size",      index: 15, benchmark: 50 },
  { factor: "Profitability", index: 82, benchmark: 50 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl text-xs">
      <p className="text-slate-300 font-semibold mb-1">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex justify-between gap-4">
          <span className="text-slate-400">{item.name}</span>
          <span className="text-slate-100 font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function FactorExposure() {
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 h-full">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-100">Factor Exposure</h3>
        <p className="text-sm text-slate-400 mt-0.5">Score 0–100, benchmark = 50</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={factorData}
          layout="vertical"
          margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey="factor"
            type="category"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(30,41,59,0.5)" }} />
          <Bar dataKey="benchmark" name="Market" fill="#1e293b" radius={[0, 3, 3, 0]}>
            {factorData.map((_, i) => <Cell key={i} fill="#1e293b" />)}
          </Bar>
          <Bar dataKey="index" name="AI Infra Index" radius={[0, 3, 3, 0]}>
            {factorData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.index > entry.benchmark ? "#3b82f6" : "#f59e0b"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          Above market
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-500" />
          Below market
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-slate-700" />
          Market neutral
        </div>
      </div>
    </div>
  );
}
