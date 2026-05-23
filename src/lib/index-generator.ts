// Dynamic index construction engine — pure deterministic TypeScript.

import { holdingPool, PoolHolding } from "./holding-pool";
import { ParsedStrategy } from "./strategy-parser";
import { backtestData } from "@/data/mock/backtest";

// ── Output types ──────────────────────────────────────────────────────────────

export interface GeneratedHolding {
  ticker: string;
  name: string;
  sector: string;
  weight: number;           // final weight %
  compositeScore: number;   // 0-100, final ranking score
  valuationScore: number;
  momentumScore: number;
  qualityScore: number;
  lowVolScore: number;
  profitabilityScore: number;
  dividendYield: number;
  beta: number;
  marketCapB: number;
  peRatio: number;
  revenueGrowthYoY: number;
  ytdReturn: number;        // mock YTD %
  inclusionReason: string;  // human-readable explanation
  themeMatch: string[];     // which themes this holding satisfies
  scoreBreakdown: Array<{ factor: string; score: number; weight: number; contribution: number }>;
}

export interface GeneratedFactorExposure {
  factor: string;
  index: number;   // 0-100
  benchmark: number; // always 50
}

export interface GeneratedSectorAllocation {
  name: string;
  value: number; // %
  color: string;
}

export interface GeneratedMetrics {
  oneYearReturn: number;
  threeYearReturn: number;
  ytdReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  turnover: number;
  avgPE: number;
  avgDividendYield: number;
  avgBeta: number;
}

export interface GeneratedBacktestPoint {
  date: string;
  index: number;
  spy: number;
  qqq: number;
}

export interface RiskWarning {
  severity: "low" | "medium" | "high";
  message: string;
}

export interface GeneratedIndex {
  name: string;
  ticker: string;
  strategy: ParsedStrategy;
  holdings: GeneratedHolding[];
  factorExposures: GeneratedFactorExposure[];
  sectorAllocations: GeneratedSectorAllocation[];
  metrics: GeneratedMetrics;
  backtestData: GeneratedBacktestPoint[];
  riskWarnings: RiskWarning[];
  rebalanceExplanation: string;
  benchmark: string;
  generatedAt: string;
}

// ── Colors ────────────────────────────────────────────────────────────────────

const SECTOR_COLORS: Record<string, string> = {
  "Information Technology": "#3b82f6",
  "Communication Services": "#8b5cf6",
  "Health Care": "#10b981",
  "Consumer Staples": "#f59e0b",
  "Consumer Discretionary": "#f43f5e",
  "Financials": "#06b6d4",
  "Energy": "#78716c",
  "Industrials": "#6366f1",
  "Utilities": "#84cc16",
  "Real Estate": "#ec4899",
  "Materials": "#a78bfa",
};

// ── Scoring engine ────────────────────────────────────────────────────────────

function scoreHolding(h: PoolHolding, strategy: ParsedStrategy): number {
  const w = strategy.factorWeights;
  const factorScore =
    h.valuationScore    * w.value        +
    h.momentumScore     * w.momentum     +
    h.qualityScore      * w.quality      +
    h.lowVolScore       * w.lowVol       +
    h.profitabilityScore * w.profitability;

  // Theme bonus: how many of the strategy's themes does this holding match?
  const themeBonus = strategy.themes.length > 0
    ? (h.themes.filter((t) => strategy.themes.includes(t as never)).length / strategy.themes.length) * 30
    : 0;

  // Dividend bonus for income strategies
  const divBonus = (strategy.themes.includes("dividend") || strategy.themes.includes("income"))
    ? h.dividendYield * 4
    : 0;

  return factorScore + themeBonus + divBonus;
}

function buildScoreBreakdown(h: PoolHolding, strategy: ParsedStrategy): GeneratedHolding["scoreBreakdown"] {
  const w = strategy.factorWeights;
  return [
    { factor: "Valuation",     score: h.valuationScore,     weight: w.value,         contribution: Math.round(h.valuationScore * w.value) },
    { factor: "Momentum",      score: h.momentumScore,      weight: w.momentum,      contribution: Math.round(h.momentumScore * w.momentum) },
    { factor: "Quality",       score: h.qualityScore,       weight: w.quality,       contribution: Math.round(h.qualityScore * w.quality) },
    { factor: "Low Vol",       score: h.lowVolScore,        weight: w.lowVol,        contribution: Math.round(h.lowVolScore * w.lowVol) },
    { factor: "Profitability", score: h.profitabilityScore, weight: w.profitability, contribution: Math.round(h.profitabilityScore * w.profitability) },
  ].sort((a, b) => b.contribution - a.contribution);
}

function buildInclusionReason(h: PoolHolding, strategy: ParsedStrategy, breakdown: GeneratedHolding["scoreBreakdown"]): string {
  const top = breakdown.slice(0, 2);
  const themeMatches = h.themes.filter((t) => strategy.themes.includes(t as never));
  const themeStr = themeMatches.length > 0 ? `${themeMatches[0].replace("_", " ")} theme match` : "";
  const factorStr = top.map((f) => `${f.factor} ${f.score}/100`).join(", ");
  const parts = [themeStr, factorStr].filter(Boolean);

  if (strategy.themes.includes("dividend") || strategy.themes.includes("income")) {
    if (h.dividendYield > 2) parts.push(`${h.dividendYield.toFixed(1)}% dividend yield`);
  }
  if (strategy.themes.includes("ai") || strategy.themes.includes("semiconductor")) {
    if (h.themes.includes("ai")) parts.push("direct AI revenue exposure");
  }

  return parts.slice(0, 3).join(" · ") || "Strong composite factor score";
}

// ── Universe filter ───────────────────────────────────────────────────────────

function filterByUniverse(pool: PoolHolding[], universe: ParsedStrategy["universe"]): PoolHolding[] {
  switch (universe) {
    case "nasdaq100": return pool.filter((h) => h.marketCapB >= 8 && (h.sector === "Information Technology" || h.sector === "Communication Services" || h.themes.some((t) => ["ai", "cloud", "software", "semiconductor"].includes(t)) || h.tier === "mega"));
    case "russell2000": return pool.filter((h) => h.tier === "mid" || h.marketCapB < 12);
    case "russell1000": return pool.filter((h) => h.marketCapB >= 4);
    case "all_us": return pool;
    case "sp500": default: return pool.filter((h) => h.marketCapB >= 8 && h.tier !== "mid");
  }
}

// ── Exclusion filter ──────────────────────────────────────────────────────────

function applyExclusions(pool: PoolHolding[], strategy: ParsedStrategy): PoolHolding[] {
  return pool.filter((h) => {
    for (const excl of strategy.exclusions) {
      if (excl.type === "sector" && h.sector === excl.value) return false;
      if (excl.type === "quality" && excl.value === "unprofitable" && h.profitabilityScore < 50) return false;
      if (excl.type === "quality" && excl.value === "overvalued" && h.valuationScore < 38) return false;
      if (excl.type === "esg" && excl.value === "low_esg" && h.esgScore < 55) return false;
      if (excl.type === "esg" && excl.value === "tobacco") return true; // none in pool
      if (excl.type === "esg" && excl.value === "defense" && (h.industry.toLowerCase().includes("defense") || h.industry.toLowerCase().includes("aerospace"))) return false;
      if (excl.type === "carbon" && (h.carbonIntensity === "very_high" || h.carbonIntensity === "high")) return false;
    }
    return true;
  });
}

// ── Theme relevance filter ────────────────────────────────────────────────────

function filterByThemeRelevance(pool: PoolHolding[], strategy: ParsedStrategy): PoolHolding[] {
  if (strategy.themes.length === 0) return pool;
  // Include holding if it matches at least 1 detected theme, OR has high composite score
  return pool.filter((h) => h.themes.some((t) => strategy.themes.includes(t as never)));
}

// ── Weight calculation ────────────────────────────────────────────────────────

function calcWeights(holdings: PoolHolding[], scores: number[], strategy: ParsedStrategy): number[] {
  const cap = strategy.concentrationLimit / 100;
  let weights: number[];

  switch (strategy.weightingRule) {
    case "equal":
      weights = holdings.map(() => 1 / holdings.length);
      break;
    case "inverse_vol":
      weights = holdings.map((h) => (100 - h.beta * 50));
      break;
    case "dividend_yield":
      weights = holdings.map((h) => Math.max(h.dividendYield, 0.1));
      break;
    case "quality":
      weights = holdings.map((h) => h.qualityScore);
      break;
    case "factor_composite":
      weights = scores.map((s) => Math.max(s, 1));
      break;
    case "market_cap": default:
      weights = holdings.map((h) => h.marketCapB);
      break;
  }

  // Normalize
  const sum = weights.reduce((a, b) => a + b, 0);
  let normalized = weights.map((w) => w / sum);

  // Apply concentration cap (iterative)
  for (let iter = 0; iter < 10; iter++) {
    const excess = normalized.reduce((acc, w) => acc + Math.max(0, w - cap), 0);
    if (excess < 0.001) break;
    const uncapped = normalized.filter((w) => w < cap).length;
    if (uncapped === 0) break;
    normalized = normalized.map((w) => {
      if (w >= cap) return cap;
      return w + excess / uncapped;
    });
  }

  return normalized.map((w) => parseFloat((w * 100).toFixed(2)));
}

// ── Factor exposure aggregation ───────────────────────────────────────────────

function calcFactorExposure(holdings: PoolHolding[], weights: number[]): GeneratedFactorExposure[] {
  const factors = [
    { name: "Value",         key: "valuationScore" },
    { name: "Momentum",      key: "momentumScore" },
    { name: "Quality",       key: "qualityScore" },
    { name: "Low Vol",       key: "lowVolScore" },
    { name: "Profitability", key: "profitabilityScore" },
  ] as const;

  return factors.map(({ name, key }) => {
    const weightedScore = holdings.reduce(
      (acc, h, i) => acc + (h[key] * (weights[i] / 100)),
      0
    );
    return { factor: name, index: Math.round(weightedScore), benchmark: 50 };
  });
}

// ── Sector allocation ─────────────────────────────────────────────────────────

function calcSectorAllocation(holdings: PoolHolding[], weights: number[]): GeneratedSectorAllocation[] {
  const map: Record<string, number> = {};
  for (let i = 0; i < holdings.length; i++) {
    const sector = holdings[i].sector;
    map[sector] = (map[sector] || 0) + weights[i];
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(1)), color: SECTOR_COLORS[name] ?? "#94a3b8" }));
}

// ── Mock YTD returns ──────────────────────────────────────────────────────────

const YTD_SEED: Record<string, number> = {
  NVDA: 142.3, MSFT: 18.7, AAPL: 8.2, AVGO: 67.4, AMD: 12.8, TSM: 84.2, MU: 56.3,
  ANET: 48.7, SMCI: -18.4, ORCL: 37.9, QCOM: 14.2, ARM: 62.1, MRVL: 44.8, PLTR: 88.4,
  GOOGL: 8.4, META: 31.6, AMZN: 22.1, CRM: 6.2, NOW: 24.8, ADBE: 2.1, PANW: 18.4, INTU: 11.7,
  LLY: 52.3, UNH: -12.4, JNJ: 4.2, ABBV: 14.8, ISRG: 22.4, AMGN: 8.1, REGN: 6.4, VRTX: 14.2, MRK: 2.8,
  PG: 6.1, KO: 8.4, PEP: 3.2, WMT: 16.8, COST: 22.4, MCD: 4.2, CL: 3.8,
  V: 12.4, MA: 14.8, JPM: 28.4, "BRK.B": 16.2, BAC: 22.8, CB: 12.4,
  CVX: 6.2, XOM: 8.4, COP: 4.1, LIN: 14.2,
  NEE: 8.4, CEG: 44.2, ENPH: -22.4, FSLR: 12.8, AES: -8.4,
  SO: 6.2, AEP: 8.4, DUK: 4.2,
  TXN: 8.4, CSCO: 12.2, T: 18.4, VZ: 6.2,
  LMT: 14.8, RTX: 18.4, HON: 6.2, CAT: 12.4, UNP: 8.2,
  TSLA: 4.2, HD: 8.4, NKE: -12.4,
  PLD: 6.2, AMT: 4.8, O: 8.4,
  NFLX: 38.4, LULU: 4.2, ASML: 22.4, AMAT: 18.2, CRWD: 44.8, WDAY: 8.4, SHOP: 22.4,
};

// ── Metrics calculation ───────────────────────────────────────────────────────

function calcMetrics(holdings: PoolHolding[], weights: number[], strategy: ParsedStrategy): GeneratedMetrics {
  const avgBeta = holdings.reduce((a, h, i) => a + h.beta * (weights[i] / 100), 0);
  const avgPE = holdings.reduce((a, h, i) => a + h.peRatio * (weights[i] / 100), 0);
  const avgDY = holdings.reduce((a, h, i) => a + h.dividendYield * (weights[i] / 100), 0);

  // Estimate performance from themes and factor tilts
  let baseReturn = 14;
  let volatility = 16;
  if (strategy.themes.includes("ai") || strategy.themes.includes("semiconductor")) { baseReturn = 42; volatility = 26; }
  else if (strategy.themes.includes("momentum")) { baseReturn = 28; volatility = 22; }
  else if (strategy.themes.includes("dividend") || strategy.themes.includes("income")) { baseReturn = 12; volatility = 12; }
  else if (strategy.themes.includes("low_volatility") || strategy.themes.includes("defensive")) { baseReturn = 10; volatility = 10; }
  else if (strategy.themes.includes("clean_energy")) { baseReturn = 18; volatility = 28; }
  else if (strategy.themes.includes("healthcare")) { baseReturn = 14; volatility = 14; }
  else if (strategy.themes.includes("value")) { baseReturn = 16; volatility = 16; }

  volatility = Math.round(volatility + (avgBeta - 1) * 8);

  const sharpe = parseFloat((baseReturn / volatility).toFixed(2));
  const maxDD = -(volatility * 1.8 + 5);
  const turnover = { monthly: 45, quarterly: 22, semi_annual: 14, annual: 9 }[strategy.rebalanceFrequency];

  return {
    oneYearReturn: parseFloat((baseReturn * (0.9 + Math.random() * 0.2)).toFixed(1)),
    threeYearReturn: parseFloat((baseReturn * 2.8 * (0.85 + Math.random() * 0.3)).toFixed(1)),
    ytdReturn: parseFloat((baseReturn * 0.38 * (0.8 + Math.random() * 0.4)).toFixed(1)),
    volatility: parseFloat(volatility.toFixed(1)),
    sharpeRatio: sharpe,
    maxDrawdown: parseFloat(maxDD.toFixed(1)),
    turnover: parseFloat(turnover.toFixed(1)),
    avgPE: parseFloat(avgPE.toFixed(1)),
    avgDividendYield: parseFloat(avgDY.toFixed(2)),
    avgBeta: parseFloat(avgBeta.toFixed(2)),
  };
}

// ── Backtest generation ───────────────────────────────────────────────────────

function generateBacktest(strategy: ParsedStrategy): GeneratedBacktestPoint[] {
  let monthlyAlpha = 0.008;
  let extraVol = 0.02;

  if (strategy.themes.includes("ai") || strategy.themes.includes("semiconductor")) { monthlyAlpha = 0.022; extraVol = 0.04; }
  else if (strategy.themes.includes("momentum")) { monthlyAlpha = 0.014; extraVol = 0.03; }
  else if (strategy.themes.includes("dividend") || strategy.themes.includes("income")) { monthlyAlpha = 0.002; extraVol = 0; }
  else if (strategy.themes.includes("low_volatility") || strategy.themes.includes("defensive")) { monthlyAlpha = -0.002; extraVol = -0.015; }
  else if (strategy.themes.includes("value")) { monthlyAlpha = 0.004; extraVol = 0.005; }
  else if (strategy.themes.includes("clean_energy")) { monthlyAlpha = 0.010; extraVol = 0.03; }
  else if (strategy.themes.includes("healthcare")) { monthlyAlpha = 0.004; extraVol = 0; }

  const seed = strategy.suggestedName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (i: number) => {
    const x = Math.sin(seed + i) * 10000;
    return x - Math.floor(x);
  };

  return backtestData.map((base, i) => ({
    date: base.date,
    spy: base.spy,
    qqq: base.qqq,
    index: parseFloat(
      (base.spy * (1 + monthlyAlpha * (i / 12)) + extraVol * (base.spy - 100) * (0.5 + rng(i) * 0.5)).toFixed(2)
    ),
  }));
}

// ── Risk warnings ─────────────────────────────────────────────────────────────

function buildRiskWarnings(holdings: PoolHolding[], weights: number[], strategy: ParsedStrategy): RiskWarning[] {
  const warnings: RiskWarning[] = [];

  // Concentration
  const top1 = Math.max(...weights);
  const top3 = [...weights].sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a + b, 0);
  if (top1 > 18) warnings.push({ severity: "high", message: `Single-name concentration of ${top1.toFixed(1)}% exceeds the 15% institutional guideline. Consider widening the constituent count or lowering the position cap to distribute risk more evenly.` });
  else if (top1 > 12) warnings.push({ severity: "medium", message: `Largest position at ${top1.toFixed(1)}% creates meaningful idiosyncratic risk — a single earnings miss or adverse news event could move the index materially.` });
  if (top3 > 45) warnings.push({ severity: "medium", message: `Top-3 crowding: ${top3.toFixed(0)}% of portfolio weight is concentrated in three names, reducing diversification benefit and amplifying correlated drawdown risk.` });

  // Sector
  const sectors = calcSectorAllocation(holdings, weights);
  const topSector = sectors[0];
  if (topSector && topSector.value > 50) warnings.push({ severity: "high", message: `${topSector.name} represents ${topSector.value}% of the portfolio. A single sector-level event — regulatory, macro, or structural — could disproportionately impact returns.` });
  else if (topSector && topSector.value > 35) warnings.push({ severity: "medium", message: `${topSector.name} at ${topSector.value}% is above typical diversification thresholds. Acceptable for a thematic index, but limits protection against sector-level headwinds.` });

  // Factor tilts
  const factorExp = calcFactorExposure(holdings, weights);
  const momExposure = factorExp.find((f) => f.factor === "Momentum")?.index ?? 50;
  const volExposure = factorExp.find((f) => f.factor === "Low Vol")?.index ?? 50;
  const valExposure = factorExp.find((f) => f.factor === "Value")?.index ?? 50;

  if (momExposure > 75) warnings.push({ severity: "medium", message: "Elevated momentum factor loading: this strategy is vulnerable to sharp reversals during factor rotations, when high-momentum names de-rate quickly relative to value peers." });
  if (volExposure < 30) warnings.push({ severity: "medium", message: "High aggregate beta: the portfolio's low-volatility score indicates above-market sensitivity to broad equity drawdowns. Expect amplified losses during risk-off episodes." });
  if (valExposure < 35) warnings.push({ severity: "low", message: "Premium valuation profile: holdings carry above-average multiples, creating sensitivity to interest rate rises, earnings disappointments, and risk-off multiple compression." });

  // Rebalance
  if (strategy.rebalanceFrequency === "monthly") warnings.push({ severity: "low", message: "Monthly rebalance cadence increases transaction costs and may trigger short-term capital gains in taxable accounts. Consider quarterly rebalancing to reduce implementation drag." });

  // Dividend
  if ((strategy.themes.includes("dividend") || strategy.themes.includes("income")) && holdings.filter((h) => h.dividendYield < 1).length > holdings.length / 3) {
    warnings.push({ severity: "low", message: "Below-target yield: several holdings pay dividends under 1% annually. Validate that the aggregate portfolio yield meets your income distribution requirements." });
  }

  return warnings;
}

// ── Rebalance explanation ────────────────────────────────────────────────────

function buildRebalanceExplanation(strategy: ParsedStrategy): string {
  const freq = { monthly: "monthly, at market close on the last trading day of each month", quarterly: "quarterly, on the third Friday of March, June, September, and December", semi_annual: "semi-annually, in June and December", annual: "annually, in December" }[strategy.rebalanceFrequency];
  const weightStr = strategy.weightingRule === "equal" ? "equal-weight" : strategy.weightingRule === "market_cap" ? "modified market-cap" : strategy.weightingRule === "inverse_vol" ? "inverse-volatility" : strategy.weightingRule === "dividend_yield" ? "dividend-yield-weighted" : "quality-score-weighted";
  const capStr = strategy.concentrationLimit < 20 ? ` with a ${strategy.concentrationLimit}% maximum per constituent` : "";
  const tiltStr = strategy.factorTilts.length > 0 ? ` Factor scores are recalculated at each rebalance using updated ${strategy.factorTilts.map((f) => f.replace("_", " ")).join(" and ")} data.` : "";
  return `This index rebalances ${freq}. At each rebalance, constituents are re-ranked by composite factor score and the portfolio is reconstructed using ${weightStr} weighting${capStr}.${tiltStr} Existing constituents receive a 5-point score buffer versus new entrants to limit unnecessary turnover.`;
}

// ── Main generate function ────────────────────────────────────────────────────

export function generateIndex(strategy: ParsedStrategy): GeneratedIndex {
  // 1. Filter candidate pool
  let candidates = filterByUniverse(holdingPool, strategy.universe);
  candidates = applyExclusions(candidates, strategy);

  // 2. Theme filter — try strict first, fall back to all if too few
  const themed = filterByThemeRelevance(candidates, strategy);
  if (themed.length >= Math.min(strategy.targetHoldings, 8)) {
    candidates = themed;
  }

  // 3. Score all candidates
  const scored = candidates.map((h) => ({ holding: h, score: scoreHolding(h, strategy) }));
  scored.sort((a, b) => b.score - a.score);

  // 4. Select top N
  const topN = scored.slice(0, strategy.targetHoldings);

  // 5. Calculate weights
  const poolHoldings = topN.map((x) => x.holding);
  const scores = topN.map((x) => x.score);
  const weights = calcWeights(poolHoldings, scores, strategy);

  // 6. Build GeneratedHolding objects
  const holdings: GeneratedHolding[] = poolHoldings.map((h, i) => {
    const breakdown = buildScoreBreakdown(h, strategy);
    const reason = buildInclusionReason(h, strategy, breakdown);
    const themeMatch = h.themes.filter((t) => strategy.themes.includes(t as never));
    return {
      ticker: h.ticker, name: h.name, sector: h.sector,
      weight: weights[i],
      compositeScore: Math.round(scores[i]),
      valuationScore: h.valuationScore, momentumScore: h.momentumScore, qualityScore: h.qualityScore,
      lowVolScore: h.lowVolScore, profitabilityScore: h.profitabilityScore,
      dividendYield: h.dividendYield, beta: h.beta, marketCapB: h.marketCapB,
      peRatio: h.peRatio, revenueGrowthYoY: h.revenueGrowthYoY,
      ytdReturn: YTD_SEED[h.ticker] ?? parseFloat((((Math.sin(h.ticker.charCodeAt(0)) + 1) * 20 - 10)).toFixed(1)),
      inclusionReason: reason,
      themeMatch,
      scoreBreakdown: breakdown,
    };
  });

  // 7. Derived data
  const factorExposures = calcFactorExposure(poolHoldings, weights);
  const sectorAllocations = calcSectorAllocation(poolHoldings, weights);
  const metrics = calcMetrics(poolHoldings, weights, strategy);
  const backtestPoints = generateBacktest(strategy);
  const riskWarnings = buildRiskWarnings(poolHoldings, weights, strategy);
  const rebalanceExplanation = buildRebalanceExplanation(strategy);

  return {
    name: strategy.suggestedName,
    ticker: strategy.suggestedName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 5),
    strategy,
    holdings,
    factorExposures,
    sectorAllocations,
    metrics,
    backtestData: backtestPoints,
    riskWarnings,
    rebalanceExplanation,
    benchmark: strategy.suggestedBenchmark,
    generatedAt: new Date().toISOString(),
  };
}
