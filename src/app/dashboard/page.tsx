import Link from "next/link";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { HoldingsTable } from "@/components/dashboard/holdings-table";
import { FactorExposure } from "@/components/dashboard/factor-exposure";
import { SectorAllocation } from "@/components/dashboard/sector-allocation";
import { RebalancePanel } from "@/components/dashboard/rebalance-panel";
import { Badge } from "@/components/ui/badge";

const metrics = [
  {
    label: "1Y Return",
    value: "+68.4%",
    subvalue: "vs +26.3% SPY",
    trend: "up" as const,
    accentColor: "border-t-emerald-500",
    description: "12-month trailing",
  },
  {
    label: "Annualized Vol",
    value: "28.6%",
    subvalue: "vs 15.2% SPY",
    trend: "neutral" as const,
    accentColor: "border-t-amber-500",
    description: "252-day rolling",
  },
  {
    label: "Sharpe Ratio",
    value: "1.84",
    subvalue: "vs 1.12 SPY",
    trend: "up" as const,
    accentColor: "border-t-blue-500",
    description: "Risk-adjusted return",
  },
  {
    label: "Max Drawdown",
    value: "-48.2%",
    subvalue: "Jan–Jul 2022",
    trend: "down" as const,
    accentColor: "border-t-red-500",
    description: "Peak-to-trough",
  },
  {
    label: "Annual Turnover",
    value: "22.4%",
    subvalue: "Low churn",
    trend: "neutral" as const,
    accentColor: "border-t-violet-500",
    description: "Portfolio efficiency",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-100">AI Infrastructure Index</h1>
            <Badge variant="cyan">AIIX</Badge>
            <Badge variant="success">Live</Badge>
          </div>
          <p className="text-sm text-slate-400">
            12 constituents · Quarterly rebalance · Momentum tilt · As of Apr 30, 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/methodology"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 hover:border-slate-500 bg-transparent px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
            </svg>
            Export Methodology
          </Link>
          <Link
            href="/builder"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 px-4 py-2 text-sm font-medium text-white transition-all shadow-lg shadow-blue-900/30"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Index
          </Link>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Performance chart */}
      <PerformanceChart />

      {/* Bottom grid: table full width, then factor + sector side by side */}
      <HoldingsTable />

      <div className="grid lg:grid-cols-2 gap-6">
        <FactorExposure />
        <SectorAllocation />
      </div>

      {/* Rebalance panel */}
      <RebalancePanel />
    </div>
  );
}
