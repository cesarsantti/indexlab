"use client";
import { ParsedStrategy, DetectedSignal, Theme } from "@/lib/strategy-parser";
import { GeneratedIndex, RiskWarning } from "@/lib/index-generator";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// ── Signal chip styles ────────────────────────────────────────────────────────

const SIGNAL_STYLES: Record<DetectedSignal["kind"], { badge: "default" | "success" | "warning" | "purple" | "cyan" | "outline" | "danger"; icon: string }> = {
  theme:         { badge: "default", icon: "◆" },
  factor:        { badge: "purple",  icon: "⬡" },
  exclusion:     { badge: "danger",  icon: "⊘" },
  universe:      { badge: "cyan",    icon: "◉" },
  rebalance:     { badge: "outline", icon: "↻" },
  weighting:     { badge: "warning", icon: "⚖" },
  concentration: { badge: "success", icon: "⊠" },
  constraint:    { badge: "success", icon: "✦" },
};

// ── Label formatting ──────────────────────────────────────────────────────────

const ACRONYMS = new Set(["ai", "saas", "esg", "etf", "fcf", "roe", "roic", "qqq", "spy", "s&p", "nav", "aum"]);

function formatWord(w: string): string {
  if (ACRONYMS.has(w.toLowerCase())) return w.toUpperCase();
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function formatLabel(label: string): string {
  return label
    .replace(/\s*\([^)]+\)/g, "") // strip "(inferred)", "(default)", etc.
    .trim()
    .split(" ")
    .map(formatWord)
    .join(" ");
}

// ── Theme grouping ────────────────────────────────────────────────────────────

const SUPER_THEMES: Array<{ requires: Theme[]; label: string }> = [
  { requires: ["ai", "semiconductor", "cloud"],    label: "AI Infrastructure Theme" },
  { requires: ["ai", "semiconductor"],             label: "AI & Semiconductor Theme" },
  { requires: ["ai", "cloud"],                     label: "AI & Cloud Theme" },
  { requires: ["ai", "software"],                  label: "AI Software Theme" },
  { requires: ["ai", "saas"],                      label: "AI & SaaS Theme" },
  { requires: ["ai"],                              label: "Artificial Intelligence Theme" },
  { requires: ["dividend_growth", "quality"],      label: "Quality Dividend Growth Theme" },
  { requires: ["dividend", "income"],              label: "Income & Dividends Theme" },
  { requires: ["dividend_growth"],                 label: "Dividend Growth Theme" },
  { requires: ["dividend"],                        label: "Dividend Income Theme" },
  { requires: ["healthcare", "biotech"],           label: "Healthcare Innovation Theme" },
  { requires: ["low_volatility", "defensive"],     label: "Defensive Low Volatility Theme" },
  { requires: ["industrial", "defense"],           label: "Industrials & Defense Theme" },
  { requires: ["small_cap", "value"],              label: "Small Cap Value Theme" },
  { requires: ["semiconductor"],                   label: "Semiconductor Theme" },
  { requires: ["clean_energy"],                    label: "Clean Energy Theme" },
  { requires: ["fintech"],                         label: "Fintech & Payments Theme" },
  { requires: ["financial"],                       label: "Financial Sector Theme" },
  { requires: ["energy"],                          label: "Energy Sector Theme" },
  { requires: ["industrial"],                      label: "Industrials Theme" },
  { requires: ["defense"],                         label: "Defense & Aerospace Theme" },
  { requires: ["healthcare"],                      label: "Healthcare Theme" },
  { requires: ["biotech"],                         label: "Biotech Theme" },
  { requires: ["small_cap"],                       label: "Small Cap Theme" },
  { requires: ["low_volatility"],                  label: "Low Volatility Theme" },
  { requires: ["defensive"],                       label: "Defensive Theme" },
  { requires: ["value"],                           label: "Value Investing Theme" },
  { requires: ["quality"],                         label: "Quality Compounders Theme" },
  { requires: ["momentum"],                        label: "Momentum Theme" },
  { requires: ["growth"],                          label: "Growth Theme" },
  { requires: ["cloud"],                           label: "Cloud Computing Theme" },
  { requires: ["software"],                        label: "Enterprise Software Theme" },
  { requires: ["saas"],                            label: "SaaS Theme" },
  { requires: ["staples"],                         label: "Consumer Staples Theme" },
  { requires: ["utilities"],                       label: "Utilities Theme" },
  { requires: ["telecom"],                         label: "Telecom Theme" },
  { requires: ["consumer"],                        label: "Consumer Theme" },
  { requires: ["infrastructure"],                  label: "Infrastructure Theme" },
  { requires: ["income"],                          label: "Income Theme" },
];

function buildThemeChips(themes: Theme[]): string[] {
  const remaining = new Set<Theme>(themes);
  const labels: string[] = [];

  for (const st of SUPER_THEMES) {
    if (st.requires.every((t) => remaining.has(t))) {
      labels.push(st.label);
      st.requires.forEach((t) => remaining.delete(t));
    }
  }

  for (const t of remaining) {
    const words = t.replace(/_/g, " ").split(" ").map(formatWord).join(" ");
    labels.push(`${words} Theme`);
  }

  return labels;
}

// ── Investor Translation ──────────────────────────────────────────────────────

function buildInvestorTranslation(strategy: ParsedStrategy, generated: GeneratedIndex | null): string {
  const { themes, factorTilts, targetHoldings, rebalanceFrequency, concentrationLimit, exclusions } = strategy;
  const n = generated?.holdings.length ?? targetHoldings;
  const rebalStr = {
    monthly:     "monthly",
    quarterly:   "every quarter",
    semi_annual: "twice a year",
    annual:      "once a year",
  }[rebalanceFrequency];

  let core = "";
  let structure = "";

  if (themes.includes("ai") || themes.includes("semiconductor")) {
    const focus =
      themes.includes("semiconductor") && themes.includes("cloud")
        ? "chip designers, cloud platforms, and network infrastructure providers"
        : themes.includes("semiconductor")
          ? "semiconductor designers and chip manufacturers"
          : "cloud platforms and AI-software companies";
    core = `This index owns ~${n} companies at the center of the AI boom — ${focus}. It tilts toward market leaders with strong recent price momentum and dominant competitive positions.`;
    structure = `Expect roughly 1.5–2× the volatility of the S&P 500. The portfolio refreshes ${rebalStr} to rotate toward emerging leaders and trim fading names.`;
  } else if (themes.includes("dividend_growth")) {
    core = `This index assembles ~${n} companies with a track record of raising their dividends year after year — businesses generating reliable free cash flow and sharing it with shareholders.`;
    structure = `It tilts weight toward higher-quality payers and rebalances ${rebalStr}. Dividend growers typically deliver lower volatility and more predictable income than a broad market fund.`;
  } else if (themes.includes("dividend") || themes.includes("income")) {
    core = `This index collects ~${n} of the highest-yielding US dividend payers — companies that consistently return cash through regular distributions.`;
    structure = `Allocations are sized by dividend yield and the portfolio rebalances ${rebalStr}. Think of it as a curated income basket: designed to pay you while you hold it, not to maximize price appreciation.`;
  } else if (themes.includes("low_volatility") || themes.includes("defensive")) {
    core = `This index owns ~${n} defensive stocks — utilities, consumer staples, and other businesses whose revenues don't depend heavily on the economic cycle. They tend to fall less than the market in downturns.`;
    structure = `Lower-volatility names receive larger allocations. You'll likely lag in strong bull markets but preserve more capital when conditions deteriorate. Rebalances ${rebalStr}.`;
  } else if (themes.includes("clean_energy")) {
    core = `This index tracks ~${n} companies enabling the clean energy transition: solar and wind developers, EV manufacturers, grid modernizers, and battery storage providers.`;
    structure = `Clean energy names are sensitive to policy changes, interest rates, and commodity prices — expect above-average short-term volatility. This is a long-duration thematic bet, not a stability play. Rebalances ${rebalStr}.`;
  } else if (themes.includes("healthcare") && themes.includes("biotech")) {
    core = `This index holds ~${n} healthcare companies spanning pharma, biotech, and medical devices — sectors with strong structural demand and relative insulation from economic cycles.`;
    structure = `Individual names can swing sharply on FDA decisions or trial data, but a diversified basket reduces binary event risk. Rebalances ${rebalStr}.`;
  } else if (themes.includes("healthcare")) {
    core = `This index holds ~${n} healthcare companies — from pharmaceutical giants to insurance providers and diagnostic equipment makers. Healthcare is historically one of the more defensive equity sectors.`;
    structure = `Tilts toward high-quality names with durable profitability. Expect lower volatility than tech-focused indexes. Rebalances ${rebalStr}.`;
  } else if (themes.includes("fintech")) {
    core = `This index holds ~${n} fintech and payments companies — digital payment networks, banking disruptors, and financial infrastructure providers enabling the long-term shift away from cash and legacy systems.`;
    structure = `The sector benefits from a structural tailwind but is sensitive to regulatory changes and interest rate cycles. Rebalances ${rebalStr}.`;
  } else if (themes.includes("quality") || factorTilts.includes("quality")) {
    core = `This index selects ~${n} companies with durable competitive advantages: high returns on invested capital, strong balance sheets, and consistent profitability across business cycles.`;
    structure = `Quality strategies tend to outperform in uncertain markets and compound well over long horizons, though they can lag during speculative bull runs. Rebalances ${rebalStr}.`;
  } else if (themes.includes("value") || factorTilts.includes("value")) {
    core = `This index buys ~${n} stocks trading at below-average valuations relative to their earnings, cash flow, or book value — a contrarian approach that bets on mean reversion.`;
    structure = `Value has underperformed growth in recent years but historically outperforms over full market cycles, particularly when interest rates are elevated. Rebalances ${rebalStr}.`;
  } else if (themes.includes("momentum") || factorTilts.includes("momentum")) {
    core = `This index owns ~${n} stocks with the strongest recent price momentum — the "winners keep winning" approach to quantitative investing.`;
    structure = `Momentum strategies work well in trending markets but can experience sharp reversals during regime changes. The portfolio rotates ${rebalStr} to exit fading winners quickly.`;
  } else {
    const tiltDesc =
      factorTilts.length > 0 ? ` with a tilt toward ${factorTilts[0].replace(/_/g, " ")} characteristics` : "";
    core = `This index systematically selects ~${n} stocks using a composite factor scoring model${tiltDesc}. Rather than picking names manually, it applies quantitative rules to build and maintain a rules-based portfolio.`;
    structure = `It rebalances ${rebalStr} and caps any single name at ${concentrationLimit}% to control concentration risk.`;
  }

  const exclusionNote =
    exclusions.length > 0
      ? ` ${exclusions
          .slice(0, 2)
          .map((e) => e.label.replace(/^Exclude\s+/, "").replace(/^Require\s+/, ""))
          .join(" and ")} ${exclusions.length === 1 ? "is" : "are"} screened out.`
      : "";

  return `${core}${exclusionNote} ${structure}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SeverityLabel({ severity }: { severity: RiskWarning["severity"] }) {
  if (severity === "high")
    return <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex-shrink-0 pt-px w-9">High</span>;
  if (severity === "medium")
    return <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex-shrink-0 pt-px w-9">Watch</span>;
  return <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex-shrink-0 pt-px w-9">Note</span>;
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs tabular-nums text-slate-400 w-7 text-right">{value}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface StrategyIntelligenceProps {
  strategy: ParsedStrategy;
  generated: GeneratedIndex | null;
  loading?: boolean;
}

export function StrategyIntelligence({ strategy, generated, loading }: StrategyIntelligenceProps) {
  if (strategy.isEmpty && !loading) return null;

  const themeChips = buildThemeChips(strategy.themes);
  const nonThemeSignals = strategy.detectedSignals.filter((s) => s.kind !== "theme");
  const hasSignals = themeChips.length > 0 || nonThemeSignals.length > 0;
  const translation = !loading && !strategy.isEmpty
    ? buildInvestorTranslation(strategy, generated)
    : null;

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
            ✦
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Strategy Intelligence</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {loading
                ? "Parsing your strategy..."
                : `${strategy.detectedSignals.length} signals detected · ${Math.round(strategy.confidence * 100)}% confidence`}
            </p>
          </div>
        </div>
        {!loading && generated && (
          <Badge variant="success" className="text-xs">
            {generated.holdings.length} holdings selected
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="px-6 py-8 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            <span className="text-sm">Parsing strategy signals...</span>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-800">

          {/* Investor Translation */}
          {translation && (
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Investor Translation</span>
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider">Plain English</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{translation}</p>
            </div>
          )}

          {/* Detected Signals */}
          <div className="px-6 py-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Detected Signals</div>
            {!hasSignals ? (
              <p className="text-sm text-slate-500">Type a strategy description to begin signal detection.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {themeChips.map((label, i) => (
                  <Badge key={`t-${i}`} variant="default" className="text-xs gap-1">
                    <span className="opacity-70">◆</span>
                    {label}
                  </Badge>
                ))}
                {nonThemeSignals.slice(0, 12).map((sig, i) => {
                  const style = SIGNAL_STYLES[sig.kind];
                  return (
                    <Badge key={`s-${i}`} variant={style.badge} className="text-xs gap-1">
                      <span className="opacity-70">{style.icon}</span>
                      {formatLabel(sig.label)}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Why these holdings */}
          {generated && generated.holdings.length > 0 && (
            <div className="px-6 py-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Top Selections — Why They Were Chosen
              </div>
              <div className="space-y-3">
                {generated.holdings.slice(0, 6).map((h) => (
                  <div key={h.ticker} className="flex items-start gap-3">
                    <div className="w-12 font-mono font-bold text-xs text-slate-200 pt-0.5 flex-shrink-0">{h.ticker}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-400 leading-relaxed mb-1.5">{h.inclusionReason}</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {h.scoreBreakdown.slice(0, 2).map((bd) => (
                          <div key={bd.factor} className="flex items-center gap-1.5 text-xs">
                            <span className="text-slate-500 w-16 flex-shrink-0">{bd.factor}</span>
                            <ScoreBar
                              value={bd.score}
                              color={
                                bd.factor === "Momentum"      ? "#3b82f6" :
                                bd.factor === "Quality"       ? "#10b981" :
                                bd.factor === "Valuation"     ? "#f59e0b" :
                                bd.factor === "Low Vol"       ? "#8b5cf6" : "#06b6d4"
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={cn(
                      "text-xs font-semibold tabular-nums flex-shrink-0 pt-0.5",
                      h.ytdReturn >= 0 ? "text-emerald-400" : "text-red-400"
                    )}>
                      {h.ytdReturn >= 0 ? "+" : ""}{h.ytdReturn.toFixed(1)}%
                    </div>
                  </div>
                ))}
                {generated.holdings.length > 6 && (
                  <p className="text-xs text-slate-500">
                    + {generated.holdings.length - 6} more holdings shown on Dashboard
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Portfolio Risk Notes */}
          {generated && generated.riskWarnings.length > 0 && (
            <div className="px-6 py-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Portfolio Risk Notes
              </div>
              <div className="space-y-2.5">
                {generated.riskWarnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <SeverityLabel severity={w.severity} />
                    <p className="text-xs text-slate-300 leading-relaxed">{w.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Benchmark */}
          {generated && (
            <div className="px-6 py-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Suggested Benchmark
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-14 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 font-mono text-sm font-bold text-slate-200 flex-shrink-0">
                  {generated.benchmark}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{strategy.benchmarkRationale}</p>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
