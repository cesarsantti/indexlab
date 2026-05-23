"use client";
import { useState } from "react";
import { etfAnalyses } from "@/data/mock/etf-analysis";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const quickTickers = ["VOO", "QQQ", "SCHD", "ARKK"];

const concentrationColors: Record<string, string> = {
  Low: "text-emerald-400",
  Moderate: "text-amber-400",
  High: "text-orange-400",
  "Very High": "text-red-400",
};

const concentrationBadge: Record<string, "success" | "warning" | "danger"> = {
  Low: "success",
  Moderate: "warning",
  High: "danger",
  "Very High": "danger",
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number }>; label?: string }) {
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

export default function ETFAnalyzerPage() {
  const [inputTicker, setInputTicker] = useState("");
  const [activeTicker, setActiveTicker] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const router = useRouter();

  const analysis = activeTicker ? etfAnalyses[activeTicker] : null;

  const handleAnalyze = async (ticker: string) => {
    const t = ticker.toUpperCase().trim();
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 900));
    setActiveTicker(t in etfAnalyses ? t : null);
    setAnalyzing(false);
    if (!(t in etfAnalyses)) alert(`No mock data for ${t}. Try: VOO, QQQ, SCHD, or ARKK`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">ETF Analyzer</h1>
        <p className="text-slate-400 mt-1">
          Dissect any ETF — concentration risk, factor exposure, hidden biases, and a smarter custom alternative.
        </p>
      </div>

      {/* Search bar */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 mb-8">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              value={inputTicker}
              onChange={(e) => setInputTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && inputTicker && handleAnalyze(inputTicker)}
              placeholder="Enter ETF ticker (e.g., VOO, QQQ, SCHD...)"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <button
            onClick={() => inputTicker && handleAnalyze(inputTicker)}
            disabled={analyzing || !inputTicker}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            {analyzing ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                Analyze
              </>
            )}
          </button>
        </div>

        {/* Quick tickers */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs text-slate-500">Quick:</span>
          {quickTickers.map((t) => (
            <button
              key={t}
              onClick={() => { setInputTicker(t); handleAnalyze(t); }}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-mono font-medium transition-all cursor-pointer",
                activeTicker === t
                  ? "border-blue-500/50 bg-blue-500/10 text-blue-300"
                  : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {analysis && (
        <div className="space-y-6 animate-fade-in">
          {/* ETF header */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-3xl font-bold font-mono text-slate-100">{analysis.ticker}</span>
                  <Badge variant="outline">{analysis.aum} AUM</Badge>
                  <Badge variant={analysis.concentrationRisk >= 70 ? "danger" : analysis.concentrationRisk >= 40 ? "warning" : "success"}>
                    {analysis.concentrationLabel} Concentration
                  </Badge>
                </div>
                <h2 className="text-base text-slate-300">{analysis.name}</h2>
                <p className="text-sm text-slate-400 mt-1">{analysis.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Expense Ratio</div>
                  <div className="text-lg font-bold text-slate-100">{analysis.expenseRatio}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">YTD Return</div>
                  <div className={cn("text-lg font-bold", analysis.ytdReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {analysis.ytdReturn >= 0 ? "+" : ""}{analysis.ytdReturn}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">1Y Return</div>
                  <div className={cn("text-lg font-bold", analysis.oneYearReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {analysis.oneYearReturn >= 0 ? "+" : ""}{analysis.oneYearReturn}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Concentration Risk */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
              <h3 className="text-sm font-semibold text-slate-100 mb-4">Concentration Risk</h3>
              <div className="flex items-end gap-4 mb-5">
                <div className={cn("text-5xl font-bold tabular-nums", concentrationColors[analysis.concentrationLabel])}>
                  {analysis.concentrationRisk}
                </div>
                <div className="pb-1">
                  <div className="text-xs text-slate-400">Risk Score (0–100)</div>
                  <Badge variant={concentrationBadge[analysis.concentrationLabel]} className="mt-1">
                    {analysis.concentrationLabel}
                  </Badge>
                </div>
              </div>
              <Progress
                value={analysis.concentrationRisk}
                max={100}
                indicatorClassName={
                  analysis.concentrationRisk >= 70
                    ? "bg-red-500"
                    : analysis.concentrationRisk >= 40
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }
                trackClassName="h-2 bg-slate-700"
              />
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-slate-400">Top 10 Weight</div>
                  <div className="font-semibold text-slate-100 mt-0.5">{analysis.top10Weight}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Holdings</div>
                  <div className="font-semibold text-slate-100 mt-0.5">{analysis.holdings.length} shown (sample)</div>
                </div>
              </div>
            </div>

            {/* Top Holdings */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
              <h3 className="text-sm font-semibold text-slate-100 mb-4">Top Holdings</h3>
              <div className="space-y-2.5">
                {analysis.holdings.slice(0, 8).map((h) => (
                  <div key={h.ticker} className="flex items-center gap-3">
                    <span className="w-14 font-mono text-xs font-bold text-slate-300 flex-shrink-0">{h.ticker}</span>
                    <div className="flex-1 min-w-0">
                      <Progress value={h.weight} max={analysis.holdings[0].weight} indicatorClassName="bg-blue-500" trackClassName="h-1.5 bg-slate-700" />
                    </div>
                    <span className="w-10 text-right text-xs font-medium text-slate-300 tabular-nums">{h.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Factor Exposure */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
            <h3 className="text-sm font-semibold text-slate-100 mb-1">Factor Exposure</h3>
            <p className="text-xs text-slate-400 mb-5">Score 0–100 · Gray dashed line = market neutral (50)</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={analysis.factorExposures} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="factor" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(30,41,59,0.5)" }} />
                <Bar dataKey="benchmark" name="Market" fill="#1e293b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="score" name={analysis.ticker} radius={[2, 2, 0, 0]}>
                  {analysis.factorExposures.map((entry, i) => (
                    <Cell key={i} fill={entry.score >= entry.benchmark ? "#3b82f6" : "#f59e0b"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Plain English + Alternative */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Analysis */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-100">Plain-English Analysis</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">{analysis.plainEnglish}</p>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Key Risks</div>
                <ul className="space-y-1.5">
                  {analysis.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <div className="w-1 h-1 rounded-full bg-red-400/70 mt-1.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Alternative suggestion */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                </div>
                <h3 className="text-sm font-semibold text-emerald-300">Suggested Alternative</h3>
              </div>
              <h4 className="text-base font-semibold text-slate-100 mb-2">{analysis.alternativeName}</h4>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">{analysis.alternativeDescription}</p>
              <div className="rounded-lg bg-slate-900/60 border border-slate-700/50 p-3 mb-4">
                <div className="text-xs text-slate-400 mb-1.5 font-medium">Strategy prompt:</div>
                <p className="text-xs text-slate-300 leading-relaxed italic">&ldquo;{analysis.alternativePrompt}&rdquo;</p>
              </div>
              <button
                onClick={() => router.push(`/builder?prompt=${encodeURIComponent(analysis.alternativePrompt)}`)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-all cursor-pointer"
              >
                Build This Index
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {!analysis && !analyzing && (
        <div className="text-center py-20 text-slate-500">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="mx-auto mb-4 opacity-40">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p className="text-lg font-medium text-slate-400">Enter an ETF ticker to begin analysis</p>
          <p className="text-sm mt-1">Try VOO, QQQ, SCHD, or ARKK for instant mock analysis</p>
        </div>
      )}
    </div>
  );
}
