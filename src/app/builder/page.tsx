"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { parseStrategy, ParsedStrategy, FactorTilt, Universe, RebalanceFrequency } from "@/lib/strategy-parser";
import { generateIndex, GeneratedIndex } from "@/lib/index-generator";
import { saveIndex } from "@/lib/strategy-store";
import { StrategyIntelligence } from "@/components/builder/strategy-intelligence";

const universeOptions = [
  { value: "sp500", label: "S&P 500 (500 stocks)" },
  { value: "russell1000", label: "Russell 1000 (large cap)" },
  { value: "nasdaq100", label: "Nasdaq-100 (tech-heavy)" },
  { value: "russell2000", label: "Russell 2000 (small cap)" },
  { value: "all_us", label: "All US Equities (~4,000 stocks)" },
];

const rebalanceOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semi_annual", label: "Semi-Annual" },
  { value: "annual", label: "Annual" },
];

const factorTiltOptions = [
  { value: "none", label: "None (market weight)" },
  { value: "value", label: "Value" },
  { value: "momentum", label: "Momentum" },
  { value: "quality", label: "Quality" },
  { value: "low_vol", label: "Low Volatility" },
  { value: "multi", label: "Multi-Factor" },
];

const EMPTY_STRATEGY: ParsedStrategy = {
  themes: [], universe: "sp500", factorTilts: [], exclusions: [], weightingRule: "market_cap",
  rebalanceFrequency: "quarterly", concentrationLimit: 20, targetHoldings: 20,
  factorWeights: { value: 0.2, momentum: 0.2, quality: 0.2, lowVol: 0.2, profitability: 0.2 },
  detectedSignals: [], suggestedName: "", suggestedBenchmark: "SPY", benchmarkRationale: "",
  confidence: 0, isEmpty: true,
};

function mapFactorTilt(tilts: FactorTilt[]): string {
  if (tilts.length === 0) return "none";
  if (tilts.length > 1) return "multi";
  const t = tilts[0];
  if (t === "low_volatility") return "low_vol";
  if (t === "profitability") return "quality";
  return t;
}

interface DisplayMethodology {
  objective: string;
  universe: string;
  selectionCriteria: string[];
  weightingScheme: string;
  rebalancing: string;
  riskControls: string[];
}

const UNIVERSE_LABELS: Record<string, string> = {
  sp500: "S&P 500 (500 US large-cap stocks)",
  russell1000: "Russell 1000 (top 1,000 US stocks by market cap)",
  nasdaq100: "Nasdaq-100 (100 largest non-financial Nasdaq companies)",
  russell2000: "Russell 2000 (US small-cap universe)",
  all_us: "All US-listed equities (~4,000 stocks)",
};

const WEIGHT_LABELS: Record<string, string> = {
  market_cap: "Modified market-cap weighted",
  equal: "Equal weighted — each constituent carries the same allocation",
  inverse_vol: "Inverse-volatility weighted — lower-beta names receive higher weights",
  dividend_yield: "Dividend-yield weighted — higher-yielding names receive larger allocations",
  quality: "Quality-score weighted — allocations proportional to quality composite",
  factor_composite: "Factor-composite weighted — allocations proportional to overall factor score",
};

const REBAL_LABELS: Record<string, string> = {
  monthly: "Monthly — last trading day of each month",
  quarterly: "Quarterly — third Friday of March, June, September, and December",
  semi_annual: "Semi-annually — last business day of June and December",
  annual: "Annually — last business day of December",
};

function toDisplayMethodology(ps: ParsedStrategy): DisplayMethodology {
  const themeStr = ps.themes.slice(0, 2).map((t) => t.replace("_", " ")).join(" and ");
  const tiltStr = ps.factorTilts.length > 0 ? ` with ${ps.factorTilts[0].replace("_", " ")} tilt` : "";
  const objective = ps.suggestedName
    ? `${ps.suggestedName} — a rules-based index targeting ${themeStr || "systematic factor"} exposure${tiltStr}.`
    : "Systematic rules-based index using composite factor scoring.";

  const criteria: string[] = [`Select top ${ps.targetHoldings} constituents ranked by composite factor score`];
  if (ps.factorTilts.length > 0) criteria.push(`Factor tilt: ${ps.factorTilts.map((t) => t.replace("_", " ")).join(" + ")}`);
  ps.exclusions.forEach((e) => criteria.push(e.label));
  criteria.push("Min. average daily trading volume ≥ $10M (90-day)");
  if (["sp500", "russell1000", "nasdaq100"].includes(ps.universe)) criteria.push("Market capitalization ≥ $8B");

  const riskControls = [`Max single-name weight: ${ps.concentrationLimit}%`, `Target ${ps.targetHoldings} constituents`];
  if (ps.exclusions.length > 0) riskControls.push(`${ps.exclusions.length} exclusion screen${ps.exclusions.length > 1 ? "s" : ""} active`);

  return {
    objective,
    universe: UNIVERSE_LABELS[ps.universe] ?? ps.universe,
    selectionCriteria: criteria,
    weightingScheme: WEIGHT_LABELS[ps.weightingRule] ?? ps.weightingRule,
    rebalancing: REBAL_LABELS[ps.rebalanceFrequency] ?? ps.rebalanceFrequency,
    riskControls,
  };
}

const TURNOVER_ESTIMATE: Record<string, string> = {
  monthly: "40–55%", quarterly: "15–25%", semi_annual: "8–14%", annual: "5–10%",
};

function BuilderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPrompt = searchParams.get("prompt") ?? "";

  const [prompt, setPrompt] = useState(initialPrompt);
  const [parsedStrategy, setParsedStrategy] = useState<ParsedStrategy | null>(null);
  const [generatedIndex, setGeneratedIndex] = useState<GeneratedIndex | null>(null);
  const [parsingLoading, setParsingLoading] = useState(false);
  const [universe, setUniverse] = useState("sp500");
  const [rebalance, setRebalance] = useState("quarterly");
  const [maxWeight, setMaxWeight] = useState(20);
  const [sectorCap, setSectorCap] = useState(35);
  const [factorTilt, setFactorTilt] = useState("momentum");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (prompt.trim().length < 8) {
      setParsingLoading(false);
      setParsedStrategy(null);
      setGeneratedIndex(null);
      return;
    }
    setParsingLoading(true);
    const timer = setTimeout(() => {
      const ps = parseStrategy(prompt);
      const gi = generateIndex(ps);
      setParsedStrategy(ps);
      setGeneratedIndex(gi);
      setUniverse(ps.universe);
      setRebalance(ps.rebalanceFrequency);
      setMaxWeight(Math.min(25, Math.max(5, ps.concentrationLimit)));
      setFactorTilt(mapFactorTilt(ps.factorTilts));
      setParsingLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [prompt]);

  const handleGenerate = async () => {
    setGenerating(true);
    if (parsedStrategy) {
      const finalStrategy: ParsedStrategy = {
        ...parsedStrategy,
        universe: universe as Universe,
        rebalanceFrequency: rebalance as RebalanceFrequency,
        concentrationLimit: maxWeight,
      };
      const finalIndex = generateIndex(finalStrategy);
      saveIndex(finalIndex);
    }
    await new Promise((r) => setTimeout(r, 1200));
    setGenerating(false);
    router.push("/dashboard");
  };

  const displayMethodology = parsedStrategy && !parsedStrategy.isEmpty ? toDisplayMethodology(parsedStrategy) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
          <span>Strategy Builder</span>
          <span>/</span>
          <span className="text-slate-200">New Index</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Define Your Strategy</h1>
        <p className="text-slate-400 mt-1">Describe your investment thesis, then fine-tune the methodology parameters.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Prompt + Intelligence + Methodology */}
        <div className="lg:col-span-3 space-y-5">
          {/* Strategy prompt */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
            <label className="block text-sm font-semibold text-slate-200 mb-3">
              Investment Thesis
              <span className="ml-2 text-xs font-normal text-slate-500">Describe your strategy in plain language</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="e.g., I want to own the 12-15 most important companies in AI infrastructure — chips, cloud platforms, and the networks connecting them. Focus on companies with dominant market positions and strong free cash flow. Cap any single name at 20%."
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none leading-relaxed transition-all"
            />
            <div className="flex items-center mt-3 h-5">
              {parsingLoading ? (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                  </svg>
                  Parsing strategy signals...
                </div>
              ) : parsedStrategy && !parsedStrategy.isEmpty ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {parsedStrategy.detectedSignals.length} signals detected · {Math.round(parsedStrategy.confidence * 100)}% confidence
                </div>
              ) : (
                <p className="text-xs text-slate-500">Start typing to analyze your strategy in real time.</p>
              )}
            </div>
          </div>

          {/* Strategy Intelligence panel */}
          <StrategyIntelligence
            strategy={parsedStrategy ?? EMPTY_STRATEGY}
            generated={generatedIndex}
            loading={parsingLoading && prompt.trim().length >= 8}
          />

          {/* Parsed methodology card */}
          {displayMethodology && (
            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden animate-fade-in">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Parsed Methodology</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Extracted rules — review and adjust parameters on the right</p>
                </div>
                <Badge variant="success">Auto-parsed</Badge>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Objective</div>
                  <p className="text-sm text-slate-300 leading-relaxed">{displayMethodology.objective}</p>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Eligible Universe</div>
                  <p className="text-sm text-slate-300">{displayMethodology.universe}</p>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Selection Criteria</div>
                  <ul className="space-y-1.5">
                    {displayMethodology.selectionCriteria.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Weighting</div>
                  <p className="text-sm text-slate-300">{displayMethodology.weightingScheme}</p>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Rebalancing</div>
                  <p className="text-sm text-slate-300">{displayMethodology.rebalancing}</p>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Risk Controls</div>
                  <div className="flex flex-wrap gap-2">
                    {displayMethodology.riskControls.map((r, i) => (
                      <Badge key={i} variant="outline">{r}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Parameters + Summary + Generate */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
            <h3 className="text-sm font-semibold text-slate-100 mb-5">Index Parameters</h3>

            <div className="space-y-5">
              {/* Universe */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Eligible Universe</label>
                <select
                  value={universe}
                  onChange={(e) => setUniverse(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {universeOptions.map((o) => (
                    <option key={o.value} value={o.value} className="bg-slate-800">{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Rebalance */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Rebalance Frequency</label>
                <div className="grid grid-cols-2 gap-2">
                  {rebalanceOptions.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => setRebalance(o.value)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all cursor-pointer ${
                        rebalance === o.value
                          ? "border-blue-500/50 bg-blue-500/10 text-blue-300"
                          : "border-slate-700 bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:border-slate-600"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max single-name weight */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-400">Max Single-Name Weight</label>
                  <span className="text-sm font-semibold text-blue-400">{maxWeight}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={1}
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>5%</span><span>25%</span>
                </div>
              </div>

              {/* Sector cap */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-400">Sector Cap</label>
                  <span className="text-sm font-semibold text-violet-400">{sectorCap}%</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={60}
                  step={5}
                  value={sectorCap}
                  onChange={(e) => setSectorCap(Number(e.target.value))}
                  className="w-full accent-violet-500 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>15%</span><span>60%</span>
                </div>
              </div>

              {/* Factor tilt */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Factor Tilt</label>
                <select
                  value={factorTilt}
                  onChange={(e) => setFactorTilt(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {factorTiltOptions.map((o) => (
                    <option key={o.value} value={o.value} className="bg-slate-800">{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Summary card */}
          <div className="rounded-xl bg-slate-800/40 border border-slate-700/50 p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Index name</span>
              <span className="text-slate-200 font-medium truncate ml-4 max-w-[140px] text-right">{parsedStrategy?.suggestedName || "—"}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated constituents</span>
              <span className="text-slate-200 font-medium">{parsedStrategy ? parsedStrategy.targetHoldings : "—"}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Annual turnover (est.)</span>
              <span className="text-slate-200 font-medium">{TURNOVER_ESTIMATE[rebalance] ?? "—"}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Suggested benchmark</span>
              <span className="text-slate-200 font-medium font-mono">{parsedStrategy?.suggestedBenchmark || "SPY"}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Backtest period</span>
              <span className="text-slate-200 font-medium">Jan 2022 – Apr 2026</span>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim() || parsingLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 px-6 py-4 text-base font-semibold text-white transition-all duration-200 shadow-xl shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {generating ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
                Building index...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
                </svg>
                Generate Index
              </>
            )}
          </button>
          {!parsedStrategy && !parsingLoading && (
            <p className="text-xs text-center text-slate-500">Enter at least a few words about your strategy to get started.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96 text-slate-400">Loading...</div>}>
      <BuilderContent />
    </Suspense>
  );
}
