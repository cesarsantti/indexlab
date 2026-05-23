export interface ETFHolding {
  ticker: string;
  name: string;
  weight: number;
}

export interface FactorExposure {
  factor: string;
  score: number;
  benchmark: number;
}

export interface ETFAnalysis {
  ticker: string;
  name: string;
  description: string;
  aum: string;
  expenseRatio: number;
  ytdReturn: number;
  oneYearReturn: number;
  concentrationRisk: number;
  concentrationLabel: string;
  top10Weight: number;
  holdings: ETFHolding[];
  factorExposures: FactorExposure[];
  plainEnglish: string;
  risks: string[];
  alternativeName: string;
  alternativeDescription: string;
  alternativePrompt: string;
}

export const etfAnalyses: Record<string, ETFAnalysis> = {
  VOO: {
    ticker: "VOO",
    name: "Vanguard S&P 500 ETF",
    description: "Tracks the S&P 500 index, representing the 500 largest US public companies.",
    aum: "$470B",
    expenseRatio: 0.03,
    ytdReturn: 6.2,
    oneYearReturn: 26.3,
    concentrationRisk: 42,
    concentrationLabel: "Moderate",
    top10Weight: 33.6,
    holdings: [
      { ticker: "AAPL", name: "Apple Inc.", weight: 7.1 },
      { ticker: "MSFT", name: "Microsoft", weight: 6.8 },
      { ticker: "NVDA", name: "NVIDIA", weight: 6.2 },
      { ticker: "AMZN", name: "Amazon", weight: 3.9 },
      { ticker: "META", name: "Meta Platforms", weight: 2.6 },
      { ticker: "GOOGL", name: "Alphabet A", weight: 2.2 },
      { ticker: "GOOG", name: "Alphabet C", weight: 2.0 },
      { ticker: "BRK.B", name: "Berkshire Hathaway", weight: 1.7 },
      { ticker: "AVGO", name: "Broadcom", weight: 1.6 },
      { ticker: "LLY", name: "Eli Lilly", weight: 1.5 },
    ],
    factorExposures: [
      { factor: "Value", score: 52, benchmark: 50 },
      { factor: "Momentum", score: 61, benchmark: 50 },
      { factor: "Quality", score: 68, benchmark: 50 },
      { factor: "Low Vol", score: 44, benchmark: 50 },
      { factor: "Size", score: 12, benchmark: 50 },
    ],
    plainEnglish:
      "VOO is the gold standard passive index fund. You're buying a tiny slice of 500 American companies, weighted by size. The biggest companies dominate — the top 7 stocks make up over 30% of your investment. When tech giants like Apple, Microsoft, and NVIDIA do well, VOO does well. When they don't, neither does VOO. It's cheap (0.03% fee), diversified, and beats 80%+ of actively managed funds over 10+ years. The main risk is that it's heavily concentrated in tech, so it's not as 'diversified' as the name suggests.",
    risks: [
      "Top 10 holdings represent 33.6% of the fund — high-tech concentration",
      "Market-cap weighting means you automatically own more of overvalued stocks",
      "Limited exposure to value, small-cap, and international equities",
      "Passive replication means no downside protection during market crashes",
    ],
    alternativeName: "Quality-Tilted US Equity Index",
    alternativeDescription:
      "Build a 50-stock custom index from the S&P 500 with quality factor tilt, max 3% single-name weight, and sector caps at 25%.",
    alternativePrompt:
      "Build a quality-focused US equity index from the S&P 500 universe. Screen for companies with ROE > 20%, debt/equity < 0.5, earnings growth > 10% for 5 consecutive years. Equal-weight the top 50, cap any sector at 25%, rebalance semi-annually.",
  },

  QQQ: {
    ticker: "QQQ",
    name: "Invesco QQQ Trust",
    description: "Tracks the Nasdaq-100 Index, the 100 largest non-financial companies on the Nasdaq.",
    aum: "$290B",
    expenseRatio: 0.20,
    ytdReturn: 8.4,
    oneYearReturn: 31.7,
    concentrationRisk: 71,
    concentrationLabel: "High",
    top10Weight: 49.2,
    holdings: [
      { ticker: "AAPL", name: "Apple Inc.", weight: 9.0 },
      { ticker: "MSFT", name: "Microsoft", weight: 8.6 },
      { ticker: "NVDA", name: "NVIDIA", weight: 8.1 },
      { ticker: "AMZN", name: "Amazon", weight: 5.0 },
      { ticker: "META", name: "Meta Platforms", weight: 4.8 },
      { ticker: "AVGO", name: "Broadcom", weight: 4.6 },
      { ticker: "TSLA", name: "Tesla", weight: 3.8 },
      { ticker: "GOOGL", name: "Alphabet A", weight: 2.8 },
      { ticker: "GOOG", name: "Alphabet C", weight: 2.6 },
      { ticker: "COST", name: "Costco", weight: 2.4 },
    ],
    factorExposures: [
      { factor: "Value", score: 38, benchmark: 50 },
      { factor: "Momentum", score: 76, benchmark: 50 },
      { factor: "Quality", score: 72, benchmark: 50 },
      { factor: "Low Vol", score: 31, benchmark: 50 },
      { factor: "Size", score: 8, benchmark: 50 },
    ],
    plainEnglish:
      "QQQ is essentially a bet on big US tech. The top 3 holdings (Apple, Microsoft, NVIDIA) alone make up 25%+ of the fund. It's not really '100 companies' diversification — it's highly concentrated tech exposure. That's why it crushed other indexes during the 2023-2024 AI boom (+55%, +27%) but also crashed harder in 2022 (-33%). The 0.20% expense ratio is 6x more expensive than VOO for similar large-cap exposure. QQQ is a momentum-heavy, growth-oriented vehicle with significant single-stock concentration risk.",
    risks: [
      "Top 3 stocks are 25%+ of the entire fund — extreme concentration",
      "Excludes financials entirely, creating sector blind spots",
      "0.20% expense ratio is expensive for passive exposure",
      "High momentum loading means sharp drawdowns during market rotations",
      "Tesla at 3.8% adds idiosyncratic volatility unrelated to tech fundamentals",
    ],
    alternativeName: "Nasdaq Innovation Index",
    alternativeDescription:
      "A diversified Nasdaq-100 alternative with equal weighting and stricter sector caps to reduce FAANG concentration.",
    alternativePrompt:
      "Build a diversified tech innovation index from Nasdaq-100 constituents. Equal weight the top 40 companies by revenue growth + R&D intensity. Cap any single stock at 4%, cap any sector at 30%, rebalance quarterly. Exclude companies with negative free cash flow.",
  },

  SCHD: {
    ticker: "SCHD",
    name: "Schwab US Dividend Equity ETF",
    description: "Tracks high-dividend US equities with quality and financial strength screens.",
    aum: "$62B",
    expenseRatio: 0.06,
    ytdReturn: 4.1,
    oneYearReturn: 14.8,
    concentrationRisk: 31,
    concentrationLabel: "Low",
    top10Weight: 40.8,
    holdings: [
      { ticker: "ABBV", name: "AbbVie Inc.", weight: 4.7 },
      { ticker: "MRK", name: "Merck & Co.", weight: 4.3 },
      { ticker: "KO", name: "Coca-Cola", weight: 4.2 },
      { ticker: "CSCO", name: "Cisco Systems", weight: 4.1 },
      { ticker: "PEP", name: "PepsiCo", weight: 4.0 },
      { ticker: "AMGN", name: "Amgen", weight: 3.9 },
      { ticker: "PFE", name: "Pfizer Inc.", weight: 3.8 },
      { ticker: "HD", name: "Home Depot", weight: 3.7 },
      { ticker: "VZ", name: "Verizon", weight: 3.6 },
      { ticker: "TXN", name: "Texas Instruments", weight: 3.5 },
    ],
    factorExposures: [
      { factor: "Value", score: 81, benchmark: 50 },
      { factor: "Momentum", score: 42, benchmark: 50 },
      { factor: "Quality", score: 74, benchmark: 50 },
      { factor: "Low Vol", score: 72, benchmark: 50 },
      { factor: "Size", score: 34, benchmark: 50 },
    ],
    plainEnglish:
      "SCHD is one of the best-designed dividend ETFs on the market. It doesn't just buy high-yielding stocks — it screens for quality: consistent dividend growth, strong free cash flow, and solid balance sheets. The result is a portfolio of mature, profitable companies that pay and grow dividends. Underperforms growth during bull markets but provides meaningful downside protection and income. Currently yielding ~3.5%. The main limitation: near-zero tech exposure (only Cisco/TI) means it will significantly lag during tech-driven bull markets.",
    risks: [
      "Near-zero exposure to tech mega-caps and AI beneficiaries",
      "Healthcare sector (ABBV, MRK, PFE) exposes fund to drug patent cliffs",
      "Dividend-focused strategy underperforms in low-interest-rate growth environments",
      "Financials sector underexposure may miss banking cycle recoveries",
    ],
    alternativeName: "Dividend Quality Growth Index",
    alternativeDescription:
      "Enhanced SCHD alternative adding tech dividend payers and a growth-quality composite screen.",
    alternativePrompt:
      "Build a dividend growth index from Russell 1000 companies. Require 5+ years of consecutive dividend increases, payout ratio < 60%, and FCF yield > 3%. Include tech dividend payers (MSFT, AAPL, TXN, AVGO). Equal weight 40 holdings, cap sectors at 20%, rebalance semi-annually.",
  },

  ARKK: {
    ticker: "ARKK",
    name: "ARK Innovation ETF",
    description: "Actively managed fund investing in 'disruptive innovation' across technology sectors.",
    aum: "$6.8B",
    expenseRatio: 0.75,
    ytdReturn: -12.4,
    oneYearReturn: -8.7,
    concentrationRisk: 88,
    concentrationLabel: "Very High",
    top10Weight: 68.4,
    holdings: [
      { ticker: "TSLA", name: "Tesla Inc.", weight: 11.8 },
      { ticker: "ROKU", name: "Roku Inc.", weight: 8.4 },
      { ticker: "COIN", name: "Coinbase", weight: 8.1 },
      { ticker: "PATH", name: "UiPath", weight: 7.2 },
      { ticker: "RBLX", name: "Roblox Corp.", weight: 6.9 },
      { ticker: "HOOD", name: "Robinhood", weight: 6.4 },
      { ticker: "EXAS", name: "Exact Sciences", weight: 5.8 },
      { ticker: "CRISPR", name: "CRISPR Therapeutics", weight: 5.6 },
      { ticker: "TDOC", name: "Teladoc Health", weight: 4.4 },
      { ticker: "SQ", name: "Block Inc.", weight: 3.8 },
    ],
    factorExposures: [
      { factor: "Value", score: 18, benchmark: 50 },
      { factor: "Momentum", score: 44, benchmark: 50 },
      { factor: "Quality", score: 28, benchmark: 50 },
      { factor: "Low Vol", score: 12, benchmark: 50 },
      { factor: "Size", score: 62, benchmark: 50 },
    ],
    plainEnglish:
      "ARKK is a high-conviction, actively managed bet on speculative innovation themes. It peaked at $159 in February 2021 and has never recovered — still down 75%+ from its all-time high. The fund charges 0.75% annually (25x more than VOO) for active management that has significantly underperformed passive alternatives. Top holdings are primarily unprofitable or marginally profitable companies in fintech, crypto, biotech, and consumer tech. It has extreme single-name concentration risk with Tesla at 12%+. ARKK is essentially a retail speculation vehicle dressed up as institutional innovation investing.",
    risks: [
      "Down 75%+ from all-time high — catastrophic long-term destruction of capital",
      "0.75% expense ratio is extremely expensive for the returns delivered",
      "Tesla at 11.8% creates massive idiosyncratic CEO/narrative risk",
      "Most holdings are unprofitable with no clear path to free cash flow",
      "Active management has consistently underperformed passive alternatives",
      "Very high volatility — 60%+ annualized vol, not suitable for risk-averse investors",
    ],
    alternativeName: "Profitable Innovation Leaders Index",
    alternativeDescription:
      "A rules-based innovation index that screens for actual profitability, unlike ARKK's speculative approach.",
    alternativePrompt:
      "Build a profitable innovation index from US companies in SaaS, fintech, biotech, and clean tech. Screen for positive free cash flow, revenue growth > 20%, and gross margins > 60%. Equal weight 25 holdings, max 6% per stock, rebalance quarterly. Exclude any company with negative operating income.",
  },
};
