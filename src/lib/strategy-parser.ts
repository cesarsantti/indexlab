// Strategy parsing engine — pure TypeScript, no external APIs.

export type Theme =
  | "ai" | "cloud" | "semiconductor" | "software" | "saas"
  | "dividend" | "dividend_growth" | "income"
  | "value" | "quality" | "growth" | "momentum" | "low_volatility"
  | "defensive" | "staples" | "healthcare" | "biotech"
  | "clean_energy" | "fintech" | "financial"
  | "energy" | "industrial" | "infrastructure" | "defense"
  | "consumer" | "telecom" | "utilities" | "small_cap";

export type Universe = "sp500" | "russell1000" | "nasdaq100" | "russell2000" | "all_us";
export type FactorTilt = "value" | "momentum" | "quality" | "low_volatility" | "profitability";
export type WeightingRule = "market_cap" | "equal" | "inverse_vol" | "dividend_yield" | "quality" | "factor_composite";
export type RebalanceFrequency = "monthly" | "quarterly" | "semi_annual" | "annual";

export interface ExclusionRule {
  type: "sector" | "quality" | "esg" | "carbon" | "country" | "custom";
  value: string;
  label: string;
}

export interface DetectedSignal {
  kind: "theme" | "universe" | "factor" | "exclusion" | "constraint" | "rebalance" | "weighting" | "concentration";
  label: string;
  confidence: number; // 0-1
  source: string;     // snippet from prompt that triggered this
}

export interface ParsedStrategy {
  // Core detections
  themes: Theme[];
  universe: Universe;
  factorTilts: FactorTilt[];
  exclusions: ExclusionRule[];
  weightingRule: WeightingRule;
  rebalanceFrequency: RebalanceFrequency;
  concentrationLimit: number;  // max single-name % (5–25)
  targetHoldings: number;      // approx # of constituents
  // Factor weights for scoring (0-1, sum = 1)
  factorWeights: {
    value: number;
    momentum: number;
    quality: number;
    lowVol: number;
    profitability: number;
  };
  // Meta
  detectedSignals: DetectedSignal[];
  suggestedName: string;
  suggestedBenchmark: string;
  benchmarkRationale: string;
  confidence: number;        // overall parse confidence 0-1
  isEmpty: boolean;          // prompt too short to parse
}

// ── helpers ──────────────────────────────────────────────────────────────────

function score(text: string, keywords: Array<{ w: string; v: number }>): number {
  let total = 0;
  for (const kw of keywords) {
    if (new RegExp(`\\b${kw.w}\\b`, "i").test(text)) total += kw.v;
  }
  return total;
}

function cap(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

// ── Theme keyword maps ────────────────────────────────────────────────────────

const THEME_MAP: Record<Theme, Array<{ w: string; v: number }>> = {
  ai: [
    { w: "ai", v: 3 }, { w: "artificial intelligence", v: 3 }, { w: "machine learning", v: 2 },
    { w: "llm", v: 2 }, { w: "generative", v: 2 }, { w: "gpu", v: 3 }, { w: "data center", v: 2 },
    { w: "semiconductor", v: 2 }, { w: "chip", v: 2 }, { w: "nvidia", v: 3 }, { w: "hyperscaler", v: 2 },
    { w: "inferenc", v: 2 }, { w: "training", v: 1 }, { w: "transformer", v: 2 }, { w: "openai", v: 2 },
  ],
  cloud: [
    { w: "cloud", v: 3 }, { w: "saas", v: 2 }, { w: "aws", v: 2 }, { w: "azure", v: 2 },
    { w: "infrastructure", v: 1 }, { w: "platform", v: 1 }, { w: "software.as.a.service", v: 2 },
  ],
  semiconductor: [
    { w: "semiconductor", v: 3 }, { w: "chip", v: 3 }, { w: "silicon", v: 2 }, { w: "wafer", v: 2 },
    { w: "foundry", v: 2 }, { w: "fabless", v: 2 }, { w: "gpu", v: 2 }, { w: "cpu", v: 2 },
    { w: "tsmc", v: 2 }, { w: "nvidia", v: 2 }, { w: "amd", v: 2 },
  ],
  software: [
    { w: "software", v: 3 }, { w: "enterprise", v: 2 }, { w: "platform", v: 1 }, { w: "saas", v: 2 },
    { w: "subscription", v: 2 }, { w: "recurring revenue", v: 2 }, { w: "arr", v: 2 },
  ],
  saas: [
    { w: "saas", v: 3 }, { w: "software.as.a.service", v: 3 }, { w: "cloud.software", v: 2 },
    { w: "arr", v: 2 }, { w: "net retention", v: 2 }, { w: "nrr", v: 2 },
  ],
  dividend: [
    { w: "dividend", v: 3 }, { w: "divi", v: 3 }, { w: "income", v: 2 }, { w: "yield", v: 2 },
    { w: "distribution", v: 2 }, { w: "payout", v: 2 }, { w: "cash return", v: 2 },
  ],
  dividend_growth: [
    { w: "dividend growth", v: 3 }, { w: "growing dividend", v: 3 }, { w: "dividend increase", v: 2 },
    { w: "dividend aristocrat", v: 3 }, { w: "consecutive.*increas", v: 3 }, { w: "drip", v: 2 },
  ],
  income: [
    { w: "income", v: 3 }, { w: "high yield", v: 3 }, { w: "yield", v: 2 }, { w: "cash flow", v: 2 },
    { w: "passive income", v: 3 }, { w: "monthly.*dividend", v: 3 },
  ],
  value: [
    { w: "value", v: 3 }, { w: "undervalued", v: 3 }, { w: "cheap", v: 2 }, { w: "low p.e", v: 3 },
    { w: "low pe", v: 3 }, { w: "contrarian", v: 2 }, { w: "deep value", v: 3 }, { w: "discount", v: 2 },
    { w: "below.*book", v: 2 }, { w: "cyclical", v: 1 },
  ],
  quality: [
    { w: "quality", v: 3 }, { w: "high quality", v: 3 }, { w: "wide moat", v: 3 }, { w: "moat", v: 2 },
    { w: "competitive advantage", v: 2 }, { w: "durable", v: 2 }, { w: "roic", v: 2 }, { w: "roe", v: 2 },
    { w: "compoun", v: 2 }, { w: "fortress balance sheet", v: 3 },
  ],
  growth: [
    { w: "growth", v: 2 }, { w: "high growth", v: 3 }, { w: "hyper growth", v: 3 }, { w: "revenue growth", v: 2 },
    { w: "fast.growing", v: 2 }, { w: "expanding", v: 1 }, { w: "scale", v: 1 }, { w: "grower", v: 2 },
  ],
  momentum: [
    { w: "momentum", v: 3 }, { w: "trend", v: 2 }, { w: "trending", v: 2 }, { w: "winning", v: 2 },
    { w: "outperform", v: 2 }, { w: "52.week high", v: 3 }, { w: "breakout", v: 2 }, { w: "strong performer", v: 2 },
  ],
  low_volatility: [
    { w: "low volatilit", v: 3 }, { w: "low vol", v: 3 }, { w: "low beta", v: 3 }, { w: "minimum variance", v: 3 },
    { w: "defensive", v: 2 }, { w: "stable", v: 2 }, { w: "conservative", v: 2 }, { w: "risk.averse", v: 2 },
    { w: "protect", v: 1 }, { w: "safe", v: 1 }, { w: "capital preservation", v: 3 },
  ],
  defensive: [
    { w: "defensive", v: 3 }, { w: "staple", v: 3 }, { w: "recession.proof", v: 3 }, { w: "non.cyclical", v: 3 },
    { w: "bear market", v: 2 }, { w: "downside", v: 2 }, { w: "hedg", v: 2 }, { w: "protection", v: 2 },
  ],
  staples: [
    { w: "staple", v: 3 }, { w: "consumer staple", v: 3 }, { w: "household", v: 2 }, { w: "necessity", v: 2 },
    { w: "food", v: 2 }, { w: "beverage", v: 2 }, { w: "coca.cola", v: 2 }, { w: "procter", v: 2 },
  ],
  healthcare: [
    { w: "healthcare", v: 3 }, { w: "health", v: 2 }, { w: "medical", v: 2 }, { w: "hospital", v: 2 },
    { w: "pharma", v: 2 }, { w: "drug", v: 1 }, { w: "therapeutic", v: 2 }, { w: "life science", v: 2 },
  ],
  biotech: [
    { w: "biotech", v: 3 }, { w: "biopharmaceutical", v: 3 }, { w: "genomic", v: 3 }, { w: "crispr", v: 3 },
    { w: "clinical", v: 2 }, { w: "pipeline", v: 2 }, { w: "fda", v: 2 }, { w: "precision medicine", v: 2 },
  ],
  clean_energy: [
    { w: "clean energy", v: 3 }, { w: "renewable", v: 3 }, { w: "green", v: 2 }, { w: "solar", v: 3 },
    { w: "wind", v: 3 }, { w: "ev", v: 2 }, { w: "electric vehicle", v: 2 }, { w: "esg", v: 2 },
    { w: "sustainab", v: 2 }, { w: "climate", v: 2 }, { w: "net.zero", v: 2 }, { w: "carbon.neutral", v: 2 },
    { w: "transition", v: 1 }, { w: "nuclear", v: 1 },
  ],
  fintech: [
    { w: "fintech", v: 3 }, { w: "payment", v: 3 }, { w: "visa", v: 2 }, { w: "mastercard", v: 2 },
    { w: "digital payment", v: 3 }, { w: "neobank", v: 3 }, { w: "crypto", v: 2 }, { w: "blockchain", v: 2 },
  ],
  financial: [
    { w: "financ", v: 2 }, { w: "bank", v: 3 }, { w: "insur", v: 2 }, { w: "asset management", v: 2 },
    { w: "lending", v: 2 }, { w: "credit", v: 2 },
  ],
  energy: [
    { w: "oil", v: 3 }, { w: "gas", v: 2 }, { w: "energy", v: 2 }, { w: "fossil fuel", v: 2 },
    { w: "petroleum", v: 3 }, { w: "upstream", v: 3 }, { w: "midstream", v: 3 }, { w: "refin", v: 2 },
  ],
  industrial: [
    { w: "industrial", v: 3 }, { w: "manufactur", v: 2 }, { w: "machinery", v: 2 }, { w: "engineering", v: 2 },
    { w: "aerospace", v: 2 }, { w: "rail", v: 2 }, { w: "logistic", v: 2 },
  ],
  infrastructure: [
    { w: "infrastructure", v: 3 }, { w: "network", v: 2 }, { w: "data center", v: 2 }, { w: "tower", v: 2 },
    { w: "pipeline", v: 1 }, { w: "utility", v: 1 },
  ],
  defense: [
    { w: "defense", v: 3 }, { w: "defence", v: 3 }, { w: "military", v: 3 }, { w: "weapon", v: 2 },
    { w: "lockheed", v: 2 }, { w: "raytheon", v: 2 }, { w: "nato", v: 2 }, { w: "geopolit", v: 2 },
  ],
  consumer: [
    { w: "consumer", v: 2 }, { w: "retail", v: 2 }, { w: "brand", v: 2 }, { w: "e.commerce", v: 2 },
    { w: "apparel", v: 2 }, { w: "luxury", v: 2 },
  ],
  telecom: [
    { w: "telecom", v: 3 }, { w: "communication", v: 2 }, { w: "wireless", v: 2 }, { w: "5g", v: 2 },
    { w: "broadband", v: 2 }, { w: "at&t", v: 2 }, { w: "verizon", v: 2 },
  ],
  utilities: [
    { w: "utilit", v: 3 }, { w: "electric", v: 2 }, { w: "grid", v: 2 }, { w: "power", v: 2 },
    { w: "regulated", v: 2 },
  ],
  small_cap: [
    { w: "small.cap", v: 3 }, { w: "small cap", v: 3 }, { w: "micro.cap", v: 3 }, { w: "russell 2000", v: 3 },
    { w: "smid", v: 3 },
  ],
};

// ── Factor tilt map ───────────────────────────────────────────────────────────

const FACTOR_MAP: Record<FactorTilt, Array<{ w: string; v: number }>> = {
  value: [
    { w: "value", v: 3 }, { w: "undervalued", v: 3 }, { w: "cheap", v: 2 }, { w: "low pe", v: 3 },
    { w: "contrarian", v: 2 }, { w: "discounted", v: 2 }, { w: "low multiple", v: 2 },
    { w: "avoid overvalued", v: 3 }, { w: "not overpriced", v: 2 },
  ],
  momentum: [
    { w: "momentum", v: 3 }, { w: "trend", v: 2 }, { w: "52.week", v: 2 }, { w: "best performing", v: 2 },
    { w: "outperform", v: 2 }, { w: "winners", v: 2 }, { w: "breakout", v: 2 },
  ],
  quality: [
    { w: "quality", v: 3 }, { w: "moat", v: 2 }, { w: "roic", v: 3 }, { w: "roe", v: 2 },
    { w: "competitive advantage", v: 2 }, { w: "compoun", v: 2 }, { w: "balance sheet", v: 2 },
    { w: "high quality", v: 3 }, { w: "durable", v: 2 },
  ],
  low_volatility: [
    { w: "low vol", v: 3 }, { w: "low beta", v: 3 }, { w: "defensive", v: 2 }, { w: "stable", v: 2 },
    { w: "minimum variance", v: 3 }, { w: "safe", v: 1 }, { w: "risk-adjusted", v: 2 },
    { w: "capital preservation", v: 3 }, { w: "conservative", v: 2 },
  ],
  profitability: [
    { w: "profitable", v: 3 }, { w: "profit", v: 2 }, { w: "free cash flow", v: 3 }, { w: "fcf", v: 3 },
    { w: "earnings quality", v: 3 }, { w: "cash generative", v: 3 }, { w: "margin", v: 2 },
    { w: "positive.*cash flow", v: 2 }, { w: "earnings", v: 1 },
  ],
};

// ── Exclusion patterns ────────────────────────────────────────────────────────

const EXCLUSION_PATTERNS: Array<{ pattern: RegExp; rule: ExclusionRule }> = [
  { pattern: /\b(no|avoid|exclude|without|not?)\b.{0,30}\b(financial|bank|banking|insurance)\b/i, rule: { type: "sector", value: "Financials", label: "Exclude Financials" } },
  { pattern: /\b(no|avoid|exclude|without)\b.{0,30}\b(oil|gas|fossil|petroleum|energy)\b/i, rule: { type: "sector", value: "Energy", label: "Exclude Fossil Fuels" } },
  { pattern: /\b(no|avoid|exclude|without)\b.{0,30}\b(tech|technology)\b/i, rule: { type: "sector", value: "Information Technology", label: "Exclude Technology" } },
  { pattern: /\b(no|avoid|exclude|without)\b.{0,30}\b(tobacco|cigarette|smok)\b/i, rule: { type: "esg", value: "tobacco", label: "Exclude Tobacco" } },
  { pattern: /\b(no|avoid|exclude|without)\b.{0,30}\b(weapon|defense|militar|arms)\b/i, rule: { type: "esg", value: "defense", label: "Exclude Defense/Weapons" } },
  { pattern: /\b(no|avoid|exclude|without)\b.{0,30}\b(healthcare|pharma|health)\b/i, rule: { type: "sector", value: "Health Care", label: "Exclude Healthcare" } },
  { pattern: /\b(no|avoid|exclude|without)\b.{0,30}\b(real estate|reit)\b/i, rule: { type: "sector", value: "Real Estate", label: "Exclude REITs" } },
  { pattern: /\b(avoid|no|exclude)\b.{0,20}\b(unprofitable|money.losing|burning cash|negative.*fcf)\b/i, rule: { type: "quality", value: "unprofitable", label: "Require Profitability" } },
  { pattern: /\b(avoid|no|exclude)\b.{0,20}\b(overvalued|expensive|high.?pe|high.?multiple)\b/i, rule: { type: "quality", value: "overvalued", label: "Avoid Overvalued" } },
  { pattern: /\b(esg|sustainable|responsible|green)\b.{0,20}\b(filter|screen|focus|only)\b|\bexclude.*carbon\b|\bno.*fossil\b/i, rule: { type: "esg", value: "low_esg", label: "ESG Screen" } },
  { pattern: /\b(no|avoid|exclude)\b.{0,20}\b(china|chinese)\b/i, rule: { type: "country", value: "China", label: "Exclude China" } },
];

// ── Name & benchmark tables ───────────────────────────────────────────────────

interface NameBenchmark {
  name: string;
  ticker: string;
  benchmark: string;
  benchmarkRationale: string;
}

function deriveNameAndBenchmark(themes: Theme[], tilts: FactorTilt[], universe: Universe): NameBenchmark {
  const t = themes;
  const hasTheme = (...ts: Theme[]) => ts.some((x) => t.includes(x));

  if (hasTheme("ai") && hasTheme("semiconductor")) return { name: "AI Infrastructure Index", ticker: "AIIX", benchmark: "QQQ", benchmarkRationale: "QQQ is the closest passive proxy for large-cap tech/semiconductor exposure." };
  if (hasTheme("ai") && hasTheme("cloud")) return { name: "AI & Cloud Leaders Index", ticker: "AICL", benchmark: "QQQ", benchmarkRationale: "QQQ captures the same large-cap tech universe your strategy targets." };
  if (hasTheme("ai")) return { name: "Artificial Intelligence Index", ticker: "AIIX", benchmark: "QQQ", benchmarkRationale: "QQQ best approximates large-cap AI-exposed equities." };
  if (hasTheme("semiconductor")) return { name: "Semiconductor Leaders Index", ticker: "SEMI", benchmark: "SOXX", benchmarkRationale: "SOXX is the standard semiconductor sector benchmark." };
  if (hasTheme("dividend_growth") && hasTheme("quality")) return { name: "Quality Dividend Growth Index", ticker: "QDGX", benchmark: "SCHD", benchmarkRationale: "SCHD is the leading dividend growth benchmark with quality screens." };
  if (hasTheme("dividend") && hasTheme("income")) return { name: "High Income Dividend Index", ticker: "HIDX", benchmark: "DVY", benchmarkRationale: "DVY tracks high-yield US dividend payers, matching your income focus." };
  if (hasTheme("dividend")) return { name: "Dividend Leaders Index", ticker: "DIVX", benchmark: "VYM", benchmarkRationale: "VYM is the most widely-used broad dividend benchmark." };
  if (hasTheme("clean_energy")) return { name: "Clean Energy Transition Index", ticker: "CETX", benchmark: "ICLN", benchmarkRationale: "ICLN is the standard global clean energy benchmark." };
  if (hasTheme("healthcare") && hasTheme("biotech")) return { name: "Healthcare Innovation Index", ticker: "HLTH", benchmark: "XLV", benchmarkRationale: "XLV tracks the full healthcare sector including pharma, biotech, and devices." };
  if (hasTheme("healthcare")) return { name: "Healthcare Select Index", ticker: "HLTH", benchmark: "XLV", benchmarkRationale: "XLV is the go-to passive healthcare sector benchmark." };
  if (hasTheme("low_volatility") && hasTheme("defensive")) return { name: "Defensive Low Volatility Index", ticker: "DLVX", benchmark: "SPLV", benchmarkRationale: "SPLV tracks the S&P 500 low-volatility segment, directly comparable." };
  if (hasTheme("low_volatility")) return { name: "Low Volatility Equity Index", ticker: "LVEX", benchmark: "SPLV", benchmarkRationale: "SPLV is the primary low-volatility large-cap benchmark." };
  if (hasTheme("fintech")) return { name: "Fintech & Payments Index", ticker: "FNTX", benchmark: "FINX", benchmarkRationale: "FINX tracks fintech and payments companies globally." };
  if (hasTheme("financial")) return { name: "Financial Sector Select Index", ticker: "FSLX", benchmark: "XLF", benchmarkRationale: "XLF is the standard US financial sector benchmark." };
  if (hasTheme("energy") && !hasTheme("clean_energy")) return { name: "Energy Sector Value Index", ticker: "ENGX", benchmark: "XLE", benchmarkRationale: "XLE tracks the S&P 500 energy sector." };
  if (hasTheme("industrial")) return { name: "Industrial Leaders Index", ticker: "INDX", benchmark: "XLI", benchmarkRationale: "XLI is the S&P 500 industrials benchmark." };
  if (hasTheme("small_cap") && tilts.includes("value")) return { name: "Small Cap Value Index", ticker: "SCVX", benchmark: "IWN", benchmarkRationale: "IWN is the Russell 2000 Value benchmark." };
  if (hasTheme("small_cap")) return { name: "Small Cap Quality Index", ticker: "SCQX", benchmark: "IWM", benchmarkRationale: "IWM tracks the Russell 2000, the standard small-cap benchmark." };
  if (tilts.includes("value") && tilts.includes("quality")) return { name: "Quality Value Equity Index", ticker: "QVEX", benchmark: "QUAL", benchmarkRationale: "QUAL targets high-quality US equities, matching your quality-value tilt." };
  if (tilts.includes("quality")) return { name: "Quality Compounder Index", ticker: "QCIX", benchmark: "QUAL", benchmarkRationale: "QUAL is the standard quality factor benchmark." };
  if (tilts.includes("momentum")) return { name: "Momentum Leaders Index", ticker: "MMTX", benchmark: "MTUM", benchmarkRationale: "MTUM tracks US large/mid-cap momentum stocks." };
  if (tilts.includes("value")) return { name: "Deep Value Equity Index", ticker: "DVEX", benchmark: "IVE", benchmarkRationale: "IVE is the S&P 500 Value benchmark." };

  const universeLabel = { sp500: "US Equity", russell1000: "US Large Cap", nasdaq100: "Nasdaq", russell2000: "Small Cap", all_us: "US Market" }[universe];
  const factorLabel = tilts.length > 0 ? ` ${tilts[0].charAt(0).toUpperCase() + tilts[0].slice(1)}` : "";
  return { name: `${universeLabel}${factorLabel} Index`, ticker: "CUSM", benchmark: "SPY", benchmarkRationale: "SPY is the broadest US equity benchmark, suitable as default comparison." };
}

// ── Factor weight derivation ──────────────────────────────────────────────────

function deriveFactorWeights(themes: Theme[], tilts: FactorTilt[]): ParsedStrategy["factorWeights"] {
  const weights = { value: 0.1, momentum: 0.1, quality: 0.2, lowVol: 0.05, profitability: 0.15 };
  const themeBoosts: Partial<Record<Theme, Partial<ParsedStrategy["factorWeights"]>>> = {
    ai:          { momentum: 0.25, quality: 0.20, profitability: 0.10 },
    semiconductor: { momentum: 0.20, quality: 0.20 },
    dividend:    { value: 0.15, profitability: 0.20, quality: 0.15 },
    dividend_growth: { quality: 0.25, profitability: 0.20, value: 0.10 },
    income:      { value: 0.10, profitability: 0.25 },
    value:       { value: 0.30, quality: 0.10 },
    quality:     { quality: 0.30, profitability: 0.15 },
    growth:      { momentum: 0.20, profitability: 0.15 },
    momentum:    { momentum: 0.35 },
    low_volatility: { lowVol: 0.35, quality: 0.15 },
    defensive:   { lowVol: 0.25, quality: 0.15 },
    healthcare:  { quality: 0.20, momentum: 0.10 },
    clean_energy: { momentum: 0.15, profitability: 0.10 },
  };

  for (const theme of themes) {
    const boost = themeBoosts[theme];
    if (boost) {
      for (const [k, v] of Object.entries(boost)) weights[k as keyof typeof weights] = (weights[k as keyof typeof weights] || 0) + (v as number);
    }
  }

  for (const tilt of tilts) {
    const map: Record<FactorTilt, keyof typeof weights> = { value: "value", momentum: "momentum", quality: "quality", low_volatility: "lowVol", profitability: "profitability" };
    weights[map[tilt]] += 0.25;
  }

  // Normalize to sum = 1
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const result: ParsedStrategy["factorWeights"] = { value: 0, momentum: 0, quality: 0, lowVol: 0, profitability: 0 };
  for (const k of Object.keys(weights) as Array<keyof typeof weights>) {
    result[k] = cap(weights[k] / total, 0.02, 0.60);
  }
  return result;
}

// ── Main parse function ───────────────────────────────────────────────────────

export function parseStrategy(prompt: string): ParsedStrategy {
  const isEmpty = prompt.trim().length < 8;
  if (isEmpty) {
    return {
      themes: [], universe: "sp500", factorTilts: [], exclusions: [], weightingRule: "market_cap",
      rebalanceFrequency: "quarterly", concentrationLimit: 20, targetHoldings: 20,
      factorWeights: { value: 0.2, momentum: 0.2, quality: 0.2, lowVol: 0.2, profitability: 0.2 },
      detectedSignals: [], suggestedName: "", suggestedBenchmark: "SPY", benchmarkRationale: "",
      confidence: 0, isEmpty: true,
    };
  }

  const signals: DetectedSignal[] = [];

  // ── 1. Theme detection ──────────────────────────────────────────────────
  const themes: Theme[] = [];
  for (const [theme, keywords] of Object.entries(THEME_MAP) as Array<[Theme, typeof THEME_MAP[Theme]]>) {
    const s = score(prompt, keywords);
    if (s >= 2) {
      themes.push(theme);
      const matchKw = keywords.find((kw) => new RegExp(`\\b${kw.w}\\b`, "i").test(prompt));
      signals.push({ kind: "theme", label: theme.replace("_", " "), confidence: Math.min(s / 6, 1), source: matchKw?.w ?? "" });
    }
  }

  // ── 2. Universe detection ──────────────────────────────────────────────
  let universe: Universe = "sp500";
  if (/\b(russell\s*2000|small.?cap|micro.?cap|smid)\b/i.test(prompt)) { universe = "russell2000"; signals.push({ kind: "universe", label: "Russell 2000", confidence: 0.9, source: "small cap / russell 2000" }); }
  else if (/\b(nasdaq.?100|nasdaq\s+100|tech.?heavy|qqq)\b/i.test(prompt)) { universe = "nasdaq100"; signals.push({ kind: "universe", label: "Nasdaq-100", confidence: 0.9, source: "nasdaq-100" }); }
  else if (/\b(russell\s*1000|large.?and.?mid|broad)\b/i.test(prompt)) { universe = "russell1000"; signals.push({ kind: "universe", label: "Russell 1000", confidence: 0.8, source: "russell 1000" }); }
  else if (/\b(all\s+us|total\s+market|broad\s+market|3000)\b/i.test(prompt)) { universe = "all_us"; signals.push({ kind: "universe", label: "All US Equities", confidence: 0.8, source: "all us / total market" }); }
  else if (/\b(s&p\s*500|sp\s*500|large.?cap|blue.?chip)\b/i.test(prompt)) { universe = "sp500"; signals.push({ kind: "universe", label: "S&P 500", confidence: 0.85, source: "s&p 500" }); }
  else {
    // Infer from themes
    if (themes.includes("ai") || themes.includes("semiconductor") || themes.includes("software")) { universe = "nasdaq100"; signals.push({ kind: "universe", label: "Nasdaq-100 (inferred)", confidence: 0.6, source: "tech theme" }); }
    else if (themes.includes("small_cap")) { universe = "russell2000"; signals.push({ kind: "universe", label: "Russell 2000 (inferred)", confidence: 0.7, source: "small cap theme" }); }
    else { signals.push({ kind: "universe", label: "S&P 500 (default)", confidence: 0.5, source: "default" }); }
  }

  // ── 3. Factor tilt detection ────────────────────────────────────────────
  const factorTilts: FactorTilt[] = [];
  for (const [factor, keywords] of Object.entries(FACTOR_MAP) as Array<[FactorTilt, typeof FACTOR_MAP[FactorTilt]]>) {
    const s = score(prompt, keywords);
    if (s >= 2) {
      factorTilts.push(factor);
      const matchKw = keywords.find((kw) => new RegExp(`\\b${kw.w}\\b`, "i").test(prompt));
      signals.push({ kind: "factor", label: `${factor.replace("_", " ")} tilt`, confidence: Math.min(s / 6, 1), source: matchKw?.w ?? "" });
    }
  }
  // Infer factor tilts from themes if none detected
  if (factorTilts.length === 0) {
    if (themes.includes("ai") || themes.includes("momentum")) factorTilts.push("momentum");
    if (themes.includes("quality") || themes.includes("dividend_growth")) factorTilts.push("quality");
    if (themes.includes("value")) factorTilts.push("value");
    if (themes.includes("low_volatility") || themes.includes("defensive")) factorTilts.push("low_volatility");
    if (themes.includes("dividend") || themes.includes("income")) factorTilts.push("profitability");
  }

  // ── 4. Exclusion detection ──────────────────────────────────────────────
  const exclusions: ExclusionRule[] = [];
  for (const { pattern, rule } of EXCLUSION_PATTERNS) {
    if (pattern.test(prompt)) {
      exclusions.push(rule);
      signals.push({ kind: "exclusion", label: rule.label, confidence: 0.85, source: rule.label.toLowerCase() });
    }
  }

  // ── 5. Concentration limit ──────────────────────────────────────────────
  let concentrationLimit = 20;
  const capMatch = prompt.match(/(\d+(?:\.\d+)?)\s*%\s+(?:cap|max(?:imum)?|limit|per\s*(?:stock|name|position|holding))/i)
    ?? prompt.match(/(?:cap|max(?:imum)?|limit|weight)\s+(?:each\s+(?:stock|name|position)?\s+)?(?:at|to)?\s*(\d+(?:\.\d+)?)\s*%/i)
    ?? prompt.match(/no\s+(?:more\s+than|single\s+name\s+over)\s+(\d+)\s*%/i);
  if (capMatch) {
    concentrationLimit = cap(parseFloat(capMatch[1]), 3, 30);
    signals.push({ kind: "concentration", label: `Max ${concentrationLimit}% per name`, confidence: 0.95, source: capMatch[0] });
  } else if (themes.includes("income") || themes.includes("dividend")) {
    concentrationLimit = 8;
  } else if (themes.includes("low_volatility") || themes.includes("defensive")) {
    concentrationLimit = 6;
  } else if (themes.includes("ai") || themes.includes("semiconductor")) {
    concentrationLimit = 20;
  }

  // ── 6. Rebalance frequency ──────────────────────────────────────────────
  let rebalanceFrequency: RebalanceFrequency = "quarterly";
  if (/\bmonthly\b|\bevery\s+month\b/i.test(prompt)) { rebalanceFrequency = "monthly"; signals.push({ kind: "rebalance", label: "Monthly rebalance", confidence: 0.95, source: "monthly" }); }
  else if (/\bsemi.?annual\b|\btwice\s+a\s+year\b|\bbiannual\b/i.test(prompt)) { rebalanceFrequency = "semi_annual"; signals.push({ kind: "rebalance", label: "Semi-annual rebalance", confidence: 0.95, source: "semi-annual" }); }
  else if (/\bannual\b|\byearly\b|\bonce\s+a\s+year\b/i.test(prompt)) { rebalanceFrequency = "annual"; signals.push({ kind: "rebalance", label: "Annual rebalance", confidence: 0.95, source: "annual" }); }
  else if (/\bquarterly\b|\bevery\s+quarter\b/i.test(prompt)) { rebalanceFrequency = "quarterly"; signals.push({ kind: "rebalance", label: "Quarterly rebalance", confidence: 0.95, source: "quarterly" }); }

  // ── 7. Weighting rule ───────────────────────────────────────────────────
  let weightingRule: WeightingRule = "market_cap";
  if (/\bequal.?weight\b|\bequally.?weight\b/i.test(prompt)) { weightingRule = "equal"; signals.push({ kind: "weighting", label: "Equal weight", confidence: 0.95, source: "equal weight" }); }
  else if (/\brisk.?parity\b|\binverse.?vol\b/i.test(prompt)) { weightingRule = "inverse_vol"; signals.push({ kind: "weighting", label: "Inverse-vol weight", confidence: 0.95, source: "risk parity" }); }
  else if (/\bdividend.?weight\b|\byield.?weight\b/i.test(prompt)) { weightingRule = "dividend_yield"; signals.push({ kind: "weighting", label: "Dividend-yield weight", confidence: 0.9, source: "dividend weight" }); }
  else if (/\bquality.?weight\b|\bfactor.?weight\b/i.test(prompt)) { weightingRule = "quality"; signals.push({ kind: "weighting", label: "Quality-score weight", confidence: 0.9, source: "quality weight" }); }
  // Infer from theme
  else if (themes.includes("income") || themes.includes("dividend")) {
    weightingRule = "dividend_yield";
  } else if (themes.includes("low_volatility")) {
    weightingRule = "inverse_vol";
  }

  // ── 8. Target holdings ──────────────────────────────────────────────────
  let targetHoldings = 20;
  const holdingsMatch = prompt.match(/\b(?:top|best|select)?\s*(\d+)\s*(?:stock|holding|position|name|compan)\b/i)
    ?? prompt.match(/\b(\d+).?(?:stock|holding|name|compan)\b/i);
  if (holdingsMatch) {
    targetHoldings = cap(parseInt(holdingsMatch[1]), 5, 60);
    signals.push({ kind: "constraint", label: `${targetHoldings} holdings`, confidence: 0.9, source: holdingsMatch[0] });
  } else {
    // Infer from themes
    if (themes.includes("ai") && themes.includes("semiconductor")) targetHoldings = 12;
    else if (themes.includes("income") || themes.includes("dividend")) targetHoldings = 30;
    else if (themes.includes("low_volatility") || themes.includes("defensive")) targetHoldings = 40;
    else if (themes.includes("clean_energy")) targetHoldings = 15;
    else if (themes.includes("healthcare") && themes.includes("biotech")) targetHoldings = 15;
    else if (themes.includes("small_cap")) targetHoldings = 40;
    else targetHoldings = 25;
  }

  // ── 9. Assemble output ──────────────────────────────────────────────────
  const { name, ticker, benchmark, benchmarkRationale } = deriveNameAndBenchmark(themes, factorTilts, universe);
  const factorWeights = deriveFactorWeights(themes, factorTilts);
  const confidence = Math.min(0.4 + themes.length * 0.12 + factorTilts.length * 0.08, 0.98);

  return {
    themes,
    universe,
    factorTilts,
    exclusions,
    weightingRule,
    rebalanceFrequency,
    concentrationLimit,
    targetHoldings,
    factorWeights,
    detectedSignals: signals,
    suggestedName: name,
    suggestedBenchmark: benchmark,
    benchmarkRationale,
    confidence,
    isEmpty: false,
  };
}
