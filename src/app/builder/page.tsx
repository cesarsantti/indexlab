"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";

const universeOptions = [
  { value: "sp500", label: "S&P 500 (500 stocks)" },
  { value: "russell1000", label: "Russell 1000 (large cap)" },
  { value: "nasdaq100", label: "Nasdaq-100 (tech-heavy)" },
  { value: "russell3000", label: "Russell 3000 (broad market)" },
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

interface ParsedMethodology {
  objective: string;
  universe: string;
  selectionCriteria: string[];
  weightingScheme: string;
  rebalancing: string;
  riskControls: string[];
}

function parsePrompt(prompt: string): ParsedMethodology {
  const lower = prompt.toLowerCase();
  const isAI = lower.includes("ai") || lower.includes("artificial intelligence") || lower.includes("infrastructure");
  const isDividend = lower.includes("dividend") || lower.includes("income");
  const isClean = lower.includes("clean") || lower.includes("energy") || lower.includes("esg");
  const isSmall = lower.includes("small") || lower.includes("micro");
  const isValue = lower.includes("value") || lower.includes("cheap");
  const isMomentum = lower.includes("momentum") || lower.includes("trend");

  if (isAI) {
    return {
      objective: "Capture the growth of the AI infrastructure ecosystem, including semiconductor designers, cloud platforms, and enabling hardware companies.",
      universe: "Nasdaq-100 and S&P 500 Technology and Communication Services sectors",
      selectionCriteria: [
        "Revenue exposure to AI/ML infrastructure ≥ 20% of total revenue",
        "Market capitalization ≥ $10 billion",
        "Average daily trading volume ≥ $50 million (90-day)",
        "Positive trailing twelve-month free cash flow",
      ],
      weightingScheme: "Modified market-cap weight with momentum tilt; weights capped at 20% per constituent",
      rebalancing: "Quarterly, on the last business day of March, June, September, and December",
      riskControls: ["Max single-stock weight: 20%", "Max sector weight: 40%", "Min 10 constituents"],
    };
  }

  if (isDividend) {
    return {
      objective: "Generate sustainable income and capital appreciation through high-quality dividend-paying US equities with a history of growing distributions.",
      universe: "S&P 500 and Russell 1000",
      selectionCriteria: [
        "Consecutive dividend increases ≥ 5 years",
        "Dividend payout ratio ≤ 65% of free cash flow",
        "FCF yield ≥ 2.5%",
        "Debt-to-equity ≤ 1.5x",
      ],
      weightingScheme: "Dividend-yield-weighted, capped at 5% per constituent",
      rebalancing: "Semi-annual, in June and December",
      riskControls: ["Max single-stock weight: 5%", "Max sector weight: 25%", "Min 30 constituents"],
    };
  }

  if (isClean) {
    return {
      objective: "Provide exposure to companies enabling the clean energy transition including solar, wind, EV, grid modernization, and energy storage.",
      universe: "All US-listed equities with market cap ≥ $500M",
      selectionCriteria: [
        "Clean energy revenue ≥ 50% of total revenue",
        "Positive revenue growth (2-year CAGR ≥ 10%)",
        "Minimum average daily volume of $10M",
        "ESG controversy score ≤ 3 (out of 5)",
      ],
      weightingScheme: "Equal weight within sector buckets (Solar, Wind, EV, Storage, Grid)",
      rebalancing: "Quarterly",
      riskControls: ["Max single-stock weight: 8%", "Min 5 stocks per sub-sector", "Min 20 total constituents"],
    };
  }

  return {
    objective: `Systematic rules-based index targeting ${prompt.slice(0, 80)}${prompt.length > 80 ? "..." : ""}`,
    universe: isSmall ? "Russell 2000 (small cap)" : "S&P 500 (large cap)",
    selectionCriteria: [
      "Market capitalization ≥ $1 billion",
      isValue ? "P/E ratio in bottom 30% of universe" : isMomentum ? "12-month price momentum ≥ 75th percentile" : "Revenue growth ≥ 10% TTM",
      "Positive operating income (trailing 4 quarters)",
      "Average daily volume ≥ $5 million",
    ],
    weightingScheme: isValue ? "Value-score weighted" : isMomentum ? "Momentum-score weighted" : "Market-cap weighted",
    rebalancing: "Quarterly",
    riskControls: ["Max single-stock weight: 10%", "Max sector weight: 30%", "Min 20 constituents"],
  };
}

function BuilderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPrompt = searchParams.get("prompt") ?? "";

  const [prompt, setPrompt] = useState(initialPrompt);
  const [parsed, setParsed] = useState<ParsedMethodology | null>(
    initialPrompt ? parsePrompt(initialPrompt) : null
  );
  const [universe, setUniverse] = useState("nasdaq100");
  const [rebalance, setRebalance] = useState("quarterly");
  const [maxWeight, setMaxWeight] = useState(20);
  const [sectorCap, setSectorCap] = useState(35);
  const [factorTilt, setFactorTilt] = useState("momentum");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (initialPrompt) setParsed(parsePrompt(initialPrompt));
  }, [initialPrompt]);

  const handleParse = () => {
    if (prompt.trim()) setParsed(parsePrompt(prompt));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1800));
    setGenerating(false);
    router.push("/dashboard");
  };

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
        {/* Left: Prompt + Methodology */}
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
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-slate-500">Press Parse to extract the methodology rules from your description.</p>
              <button
                onClick={handleParse}
                disabled={!prompt.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all disabled:opacity-40"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.54A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.54A2.5 2.5 0 0 0 14.5 2Z" />
                </svg>
                Parse with AI
              </button>
            </div>
          </div>

          {/* Parsed methodology */}
          {parsed && (
            <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden animate-fade-in">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Parsed Methodology</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Extracted from your description — review and adjust</p>
                </div>
                <Badge variant="success">Parsed</Badge>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Objective</div>
                  <p className="text-sm text-slate-300 leading-relaxed">{parsed.objective}</p>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Eligible Universe</div>
                  <p className="text-sm text-slate-300">{parsed.universe}</p>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Selection Criteria</div>
                  <ul className="space-y-1.5">
                    {parsed.selectionCriteria.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Weighting</div>
                  <p className="text-sm text-slate-300">{parsed.weightingScheme}</p>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Risk Controls</div>
                  <div className="flex flex-wrap gap-2">
                    {parsed.riskControls.map((r, i) => (
                      <Badge key={i} variant="outline">{r}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Editable assumptions */}
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
              <span>Estimated constituents</span>
              <span className="text-slate-200 font-medium">10–15</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Annual turnover (est.)</span>
              <span className="text-slate-200 font-medium">15–25%</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Backtest period available</span>
              <span className="text-slate-200 font-medium">Jan 2019 – Apr 2026</span>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 px-6 py-4 text-base font-semibold text-white transition-all duration-200 shadow-xl shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {generating ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                Building index...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                Generate Index
              </>
            )}
          </button>
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
