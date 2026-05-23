"use client";
import { GeneratedIndex } from "@/lib/index-generator";
import { etfAnalyses } from "@/data/mock/etf-analysis";
import { cn } from "@/lib/utils";

// ── Static stats not in mock data ─────────────────────────────────────────────

const ETF_STATS: Record<string, { volatility: number; maxDrawdown: number; sharpeRatio: number }> = {
  VOO:  { volatility: 15.2, maxDrawdown: -24.5, sharpeRatio: 1.12 },
  QQQ:  { volatility: 21.8, maxDrawdown: -32.6, sharpeRatio: 1.08 },
  SCHD: { volatility: 13.8, maxDrawdown: -19.8, sharpeRatio: 0.88 },
  ARKK: { volatility: 62.4, maxDrawdown: -75.3, sharpeRatio: -0.22 },
};

// ── Per-ETF narratives ────────────────────────────────────────────────────────

interface NarrativeArgs { indexName: string; top1: number; etfTop1: number; etfTop10: number }

const NARRATIVES: Record<string, (a: NarrativeArgs) => string> = {
  QQQ: ({ indexName, top1 }) =>
    `Unlike QQQ — where Apple, Microsoft, and NVIDIA alone represent over 25% of the fund — ${indexName} caps any single holding at ${top1.toFixed(0)}% and selects constituents by factor quality, not market-cap size. The result is similar exposure to technology and innovation themes with meaningfully lower mega-cap dependency. A bad earnings quarter from one name won't move the entire index.`,
  VOO: ({ indexName }) =>
    `VOO is a passive market-cap vehicle that automatically overweights whatever has already grown the largest. ${indexName} applies quality and factor screens to the same US equity universe, selecting on fundamentals rather than size alone. The result: higher average profitability across holdings, less crowding in the most expensive mega-caps, and sector allocation driven by business quality rather than passive inflows.`,
  SCHD: ({ indexName }) =>
    `SCHD's strict yield methodology leaves it with near-zero technology exposure. ${indexName} preserves SCHD's quality and income discipline while adding technology dividend growers — companies like Microsoft, Apple, and Texas Instruments that consistently raise their distributions. The result: broader sector coverage and modestly higher total return potential without abandoning the income thesis.`,
  ARKK: ({ indexName }) =>
    `ARKK concentrates in speculative, often unprofitable companies across emerging technology themes. ${indexName} targets the same innovation sectors — SaaS, fintech, biotech — but requires positive free cash flow, a screen ARKK explicitly rejects. The result: dramatically lower volatility, far smaller catastrophic-loss risk, and exposure to secular growth themes without the dependency on speculative narratives that drove ARKK's 75%+ collapse from its 2021 peak.`,
};

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
  label,
  customVal,
  etfVal,
  customDisplay,
  etfDisplay,
  etfTicker,
  higherIsBetter = true,
}: {
  label: string;
  customVal: number;
  etfVal: number;
  customDisplay: string;
  etfDisplay: string;
  etfTicker: string;
  higherIsBetter?: boolean;
}) {
  const diff = customVal - etfVal;
  const threshold = Math.abs(etfVal) * 0.04;
  const customWins = higherIsBetter ? diff > threshold : diff < -threshold;
  const etfWins    = higherIsBetter ? diff < -threshold : diff > threshold;

  return (
    <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-4">
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">{label}</div>
      <div className="flex items-end justify-between gap-1">
        <div>
          <div className="text-[10px] text-slate-500 mb-1">Custom</div>
          <div className={cn(
            "text-xl font-bold tabular-nums leading-none",
            customWins ? "text-emerald-400" : etfWins ? "text-red-400" : "text-slate-100"
          )}>
            {customDisplay}
          </div>
        </div>
        <div className="text-xs text-slate-700 pb-px">vs</div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 mb-1">{etfTicker}</div>
          <div className={cn(
            "text-xl font-bold tabular-nums leading-none",
            etfWins ? "text-emerald-400" : customWins ? "text-slate-400" : "text-slate-100"
          )}>
            {etfDisplay}
          </div>
        </div>
      </div>
      <div className="mt-2.5 h-3.5">
        {customWins && (
          <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l8 16H4z"/></svg>
            Custom index advantage
          </div>
        )}
        {etfWins && (
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20l-8-16h16z"/></svg>
            {etfTicker} advantage
          </div>
        )}
      </div>
    </div>
  );
}

function ConcBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const pct = Math.min((value / maxValue) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-slate-700/60 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold tabular-nums w-9 text-right" style={{ color }}>{value.toFixed(1)}%</span>
    </div>
  );
}

function DeltaBar({ label, delta }: { label: string; delta: number }) {
  const fill = Math.min(Math.abs(delta) * 0.85, 45); // % of each half
  const isPos = delta >= 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 flex items-center h-5 gap-px">
        {/* left half — negative values fill here */}
        <div className="flex-1 flex justify-end items-center">
          {!isPos && (
            <div
              className="h-2 rounded-l-full"
              style={{ width: `${fill}%`, background: "rgba(248,113,113,0.75)" }}
            />
          )}
        </div>
        {/* center axis */}
        <div className="w-px h-4 bg-slate-600 flex-shrink-0" />
        {/* right half — positive values fill here */}
        <div className="flex-1 flex justify-start items-center">
          {isPos && (
            <div
              className="h-2 rounded-r-full"
              style={{ width: `${fill}%`, background: "rgba(52,211,153,0.75)" }}
            />
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 w-14 justify-end">
        <span className={cn(
          "text-xs tabular-nums font-semibold",
          isPos ? "text-emerald-400" : "text-red-400"
        )}>
          {isPos ? "+" : ""}{delta}
        </span>
        <span className="text-[10px] text-slate-600">{isPos ? "▲" : "▼"}</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ETFComparison({ generated }: { generated: GeneratedIndex }) {
  const etfTicker = generated.sourceEtf!;
  const etfData   = etfAnalyses[etfTicker];
  const etfStats  = ETF_STATS[etfTicker];
  if (!etfData || !etfStats) return null;

  // ── Custom index stats ─────────────────────────────────────────────────────
  const sorted     = [...generated.holdings].sort((a, b) => b.weight - a.weight);
  const customTop1 = sorted[0]?.weight ?? 0;
  const customTop10 = sorted.slice(0, 10).reduce((s, h) => s + h.weight, 0);
  const etfTop1    = etfData.holdings[0]?.weight ?? 0;

  // ── Factor deltas ──────────────────────────────────────────────────────────
  const COMMON_FACTORS = ["Value", "Momentum", "Quality", "Low Vol"] as const;
  const factorDeltas = COMMON_FACTORS.map((name) => {
    const c = generated.factorExposures.find((f) => f.factor === name);
    const e = etfData.factorExposures.find((f) => f.factor === name);
    if (!c || !e) return null;
    return { name, customScore: c.index, etfScore: e.score, delta: c.index - e.score };
  }).filter((d): d is NonNullable<typeof d> => d !== null);

  // ── Concentration bar max ──────────────────────────────────────────────────
  const maxConc = Math.max(customTop1, etfTop1, customTop10, etfData.top10Weight) * 1.12;

  // ── Narrative ──────────────────────────────────────────────────────────────
  const narrativeFn = NARRATIVES[etfTicker];
  const narrative = narrativeFn?.({ indexName: generated.name, top1: customTop1, etfTop1, etfTop10: etfData.top10Weight });

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Compare vs Original ETF</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            How your custom index differs from {etfTicker}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
            <span className="font-medium text-blue-300">{generated.name}</span>
          </div>
          <span className="text-slate-600">vs</span>
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500 flex-shrink-0" />
            <span className="font-mono font-bold text-slate-200">{etfTicker}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{etfData.name.split(" ").slice(0, 3).join(" ")}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* ── Risk & performance metrics ──────────────────────────────────── */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Risk &amp; Performance
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              label="1-Year Return"
              customVal={generated.metrics.oneYearReturn}
              etfVal={etfData.oneYearReturn}
              customDisplay={`${generated.metrics.oneYearReturn >= 0 ? "+" : ""}${generated.metrics.oneYearReturn}%`}
              etfDisplay={`${etfData.oneYearReturn >= 0 ? "+" : ""}${etfData.oneYearReturn}%`}
              etfTicker={etfTicker}
              higherIsBetter
            />
            <MetricCard
              label="Annualized Volatility"
              customVal={generated.metrics.volatility}
              etfVal={etfStats.volatility}
              customDisplay={`${generated.metrics.volatility}%`}
              etfDisplay={`${etfStats.volatility}%`}
              etfTicker={etfTicker}
              higherIsBetter={false}
            />
            <MetricCard
              label="Max Drawdown"
              customVal={generated.metrics.maxDrawdown}
              etfVal={etfStats.maxDrawdown}
              customDisplay={`${generated.metrics.maxDrawdown}%`}
              etfDisplay={`${etfStats.maxDrawdown}%`}
              etfTicker={etfTicker}
              higherIsBetter
            />
            <MetricCard
              label="Sharpe Ratio"
              customVal={generated.metrics.sharpeRatio}
              etfVal={etfStats.sharpeRatio}
              customDisplay={generated.metrics.sharpeRatio.toFixed(2)}
              etfDisplay={etfStats.sharpeRatio.toFixed(2)}
              etfTicker={etfTicker}
              higherIsBetter
            />
          </div>
        </div>

        {/* ── Concentration risk ───────────────────────────────────────────── */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Concentration Risk
          </div>
          <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-4">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
              <div className="space-y-3">
                <div className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Custom Index</div>
                <ConcBar label="Top-1 holding"  value={customTop1}  maxValue={maxConc} color="#3b82f6" />
                <ConcBar label="Top-10 weight"  value={customTop10} maxValue={maxConc} color="#3b82f6" />
              </div>
              <div className="space-y-3">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{etfTicker}</div>
                <ConcBar label="Top-1 holding"  value={etfTop1}              maxValue={maxConc} color="#64748b" />
                <ConcBar label="Top-10 weight"  value={etfData.top10Weight}  maxValue={maxConc} color="#64748b" />
              </div>
            </div>
            {customTop1 < etfTop1 && (
              <div className="mt-3 pt-3 border-t border-slate-700/50 text-[11px] text-emerald-500 font-medium">
                ▲ Custom index has {(etfTop1 - customTop1).toFixed(1)}pp lower single-name concentration than {etfTicker}
              </div>
            )}
            {customTop10 < etfData.top10Weight && (
              <div className={cn("text-[11px] text-emerald-500 font-medium", customTop1 < etfTop1 ? "mt-1" : "mt-3 pt-3 border-t border-slate-700/50")}>
                ▲ Top-10 holdings are {(etfData.top10Weight - customTop10).toFixed(1)}pp less concentrated than {etfTicker}
              </div>
            )}
          </div>
        </div>

        {/* ── Factor exposure delta ────────────────────────────────────────── */}
        {factorDeltas.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Factor Exposure Delta
              </div>
              <div className="h-px flex-1 bg-slate-800" />
              <div className="text-[10px] text-slate-600">Custom minus {etfTicker} · green = custom higher</div>
            </div>
            <div className="rounded-lg bg-slate-800/40 border border-slate-700/50 p-4 space-y-3.5">
              {factorDeltas.map(({ name, delta }) => (
                <DeltaBar key={name} label={name} delta={delta} />
              ))}
            </div>
          </div>
        )}

        {/* ── Sector summary ───────────────────────────────────────────────── */}
        {generated.sectorAllocations.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Sector Allocation — Custom Index
            </div>
            <div className="flex flex-wrap gap-1.5">
              {generated.sectorAllocations.slice(0, 6).map((s) => (
                <div
                  key={s.name}
                  className="flex items-center gap-1.5 rounded-md bg-slate-800/60 border border-slate-700/50 px-2.5 py-1.5 text-xs"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-slate-300 font-medium">{s.name.replace("Information Technology", "Tech").replace("Communication Services", "Comms").replace("Consumer Discretionary", "Cons. Disc.").replace("Consumer Staples", "Staples")}</span>
                  <span className="text-slate-500">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Why your index is different ──────────────────────────────────── */}
        {narrative && (
          <div className="rounded-lg bg-blue-500/5 border border-blue-500/15 p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Why Your Index Is Different
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{narrative}</p>
          </div>
        )}

      </div>
    </div>
  );
}
