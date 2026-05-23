"use client";
import { useState, Fragment } from "react";
import { aiInfraHoldings } from "@/data/mock/holdings";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn, formatPercent, getReturnColor } from "@/lib/utils";

type SortKey = "weight" | "valuationScore" | "momentumScore" | "qualityScore" | "ytdReturn";

const sectorColors: Record<string, "default" | "success" | "danger" | "warning" | "purple" | "cyan" | "outline"> = {
  Semiconductors: "purple",
  "Cloud Infrastructure": "cyan",
  "Semiconductor Manufacturing": "warning",
  "Cloud & AI": "default",
  "AI & Social Infrastructure": "success",
  "Memory & Storage": "warning",
  "Data Center Networking": "cyan",
  "AI Server Systems": "outline",
};

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-slate-200 tabular-nums text-xs w-6 text-right">{score}</span>
      <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden hidden sm:block">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

export function HoldingsTable() {
  const [sortKey, setSortKey] = useState<SortKey>("weight");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const sorted = [...aiInfraHoldings].sort((a, b) => {
    const av = a[sortKey] as number;
    const bv = b[sortKey] as number;
    return sortAsc ? av - bv : bv - av;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(false); }
  };

  function ColHeader({ label, sk }: { label: string; sk: SortKey }) {
    const active = sortKey === sk;
    return (
      <th
        className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-200 select-none whitespace-nowrap"
        onClick={() => handleSort(sk)}
      >
        <div className="flex items-center gap-1">
          {label}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={cn("transition-opacity", active ? "opacity-100" : "opacity-20")}>
            {sortAsc && active ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
          </svg>
        </div>
      </th>
    );
  }

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800">
        <h3 className="text-base font-semibold text-slate-100">Holdings</h3>
        <p className="text-sm text-slate-400 mt-0.5">{aiInfraHoldings.length} constituents · As of Apr 30, 2026 · Click row to expand rationale</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-36">Ticker</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden lg:table-cell">Sector</th>
              <ColHeader label="Weight" sk="weight" />
              <ColHeader label="Value" sk="valuationScore" />
              <ColHeader label="Momentum" sk="momentumScore" />
              <ColHeader label="Quality" sk="qualityScore" />
              <ColHeader label="YTD" sk="ytdReturn" />
              <th className="px-3 py-3 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {sorted.map((h) => (
              <Fragment key={h.ticker}>
                <tr
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === h.ticker ? null : h.ticker)}
                >
                  <td className="px-6 py-3.5">
                    <div>
                      <span className="font-mono font-bold text-slate-100">{h.ticker}</span>
                      <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[130px]">{h.name}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 hidden lg:table-cell">
                    <Badge variant={sectorColors[h.sector] ?? "outline"} className="whitespace-nowrap text-xs">
                      {h.sector}
                    </Badge>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200 tabular-nums w-10 text-right">{h.weight}%</span>
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden hidden sm:block">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${(h.weight / 20) * 100}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5"><ScoreBar score={h.valuationScore} color="#f59e0b" /></td>
                  <td className="px-3 py-3.5"><ScoreBar score={h.momentumScore} color="#3b82f6" /></td>
                  <td className="px-3 py-3.5"><ScoreBar score={h.qualityScore} color="#10b981" /></td>
                  <td className={cn("px-3 py-3.5 font-medium tabular-nums text-right", getReturnColor(h.ytdReturn))}>
                    {formatPercent(h.ytdReturn)}
                  </td>
                  <td className="px-3 py-3.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn("text-slate-500 transition-transform duration-200", expandedRow === h.ticker ? "rotate-180" : "")}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </td>
                </tr>
                {expandedRow === h.ticker && (
                  <tr className="bg-slate-800/20">
                    <td colSpan={8} className="px-6 py-4">
                      <div className="text-xs text-slate-300 leading-relaxed">
                        <span className="text-slate-500 font-medium mr-2">Inclusion rationale:</span>
                        {h.reason}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
                        <span>Mkt Cap: <span className="text-slate-200 font-medium">{h.marketCap}</span></span>
                        <span>P/E: <span className="text-slate-200 font-medium">{h.peRatio}x</span></span>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
