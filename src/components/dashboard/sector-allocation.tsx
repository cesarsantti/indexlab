"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const sectorData = [
  { name: "Semiconductors", value: 28.7, color: "#8b5cf6" },
  { name: "Cloud Infrastructure", value: 25.3, color: "#3b82f6" },
  { name: "Cloud & AI", value: 14.7, color: "#06b6d4" },
  { name: "AI & Social", value: 8.5, color: "#10b981" },
  { name: "Memory & Storage", value: 7.4, color: "#f59e0b" },
  { name: "Networking", value: 6.4, color: "#f43f5e" },
  { name: "AI Servers", value: 5.6, color: "#94a3b8" },
  { name: "Other", value: 3.4, color: "#334155" },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-xl text-xs">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: payload[0].payload.color }} />
        <span className="text-slate-300">{payload[0].name}</span>
      </div>
      <p className="text-slate-100 font-semibold mt-1">{payload[0].value}%</p>
    </div>
  );
}

export function SectorAllocation() {
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 h-full">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-100">Sector Allocation</h3>
        <p className="text-sm text-slate-400 mt-0.5">By market value weight</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={62}
                dataKey="value"
                paddingAngle={2}
                stroke="none"
              >
                {sectorData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-1.5 min-w-0">
          {sectorData.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <div className="flex-1 flex items-center justify-between gap-1 min-w-0">
                <span className="text-xs text-slate-400 truncate">{s.name}</span>
                <span className="text-xs font-medium text-slate-200 tabular-nums flex-shrink-0">{s.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
