/**
 * Fundamentals Service
 * Placeholder for company financial data.
 *
 * Future integration: Simfin, Financial Modeling Prep, or EDGAR direct
 */

export interface Fundamentals {
  ticker: string;
  name: string;
  marketCap: number;
  peRatio: number;
  pbRatio: number;
  evEbitda: number;
  revenueGrowthYoY: number;
  grossMargin: number;
  operatingMargin: number;
  freeCashFlowMargin: number;
  debtToEquity: number;
  returnOnEquity: number;
  returnOnAssets: number;
  epsGrowth5Y: number;
  dividendYield: number;
}

export interface FactorScores {
  ticker: string;
  valueScore: number;
  momentumScore: number;
  qualityScore: number;
  lowVolatilityScore: number;
  sizeScore: number;
  composite: number;
}

export interface FundamentalsService {
  getFundamentals(ticker: string): Promise<Fundamentals>;
  getFactorScores(tickers: string[]): Promise<FactorScores[]>;
  screenUniverse(criteria: ScreeningCriteria): Promise<string[]>;
}

export interface ScreeningCriteria {
  universe: "SP500" | "Russell1000" | "Russell3000" | "Nasdaq100";
  minMarketCapB?: number;
  minRevenueGrowth?: number;
  minGrossMargin?: number;
  maxPE?: number;
  minROE?: number;
  requireDividend?: boolean;
  sectors?: string[];
}

class MockFundamentalsService implements FundamentalsService {
  async getFundamentals(_ticker: string): Promise<Fundamentals> {
    throw new Error("Not implemented — connect a real fundamentals data provider");
  }

  async getFactorScores(_tickers: string[]): Promise<FactorScores[]> {
    throw new Error("Not implemented — connect a real factor scoring engine");
  }

  async screenUniverse(_criteria: ScreeningCriteria): Promise<string[]> {
    throw new Error("Not implemented — connect a real screening database");
  }
}

export const fundamentalsService: FundamentalsService = new MockFundamentalsService();
