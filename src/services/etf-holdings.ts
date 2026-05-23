/**
 * ETF Holdings Service
 * Placeholder for ETF composition and analytics data.
 *
 * Future integration: ETF.com API, iShares/Vanguard data feeds, or CFRA
 */

export interface ETFComposition {
  ticker: string;
  name: string;
  issuer: string;
  aum: number;
  expenseRatio: number;
  inceptionDate: string;
  numHoldings: number;
  top10Weight: number;
  holdings: Array<{
    ticker: string;
    name: string;
    weight: number;
    shares: number;
    marketValue: number;
  }>;
  sectorWeights: Record<string, number>;
  countryWeights: Record<string, number>;
}

export interface ConcentrationMetrics {
  ticker: string;
  herfindahlIndex: number;
  top1Weight: number;
  top5Weight: number;
  top10Weight: number;
  effectiveNumHoldings: number;
  concentrationRisk: "Low" | "Moderate" | "High" | "Very High";
}

export interface ETFHoldingsService {
  getComposition(ticker: string): Promise<ETFComposition>;
  getConcentrationMetrics(ticker: string): Promise<ConcentrationMetrics>;
  compareETFs(tickers: string[]): Promise<Record<string, ETFComposition>>;
}

class MockETFHoldingsService implements ETFHoldingsService {
  async getComposition(_ticker: string): Promise<ETFComposition> {
    throw new Error("Not implemented — connect a real ETF holdings data provider");
  }

  async getConcentrationMetrics(_ticker: string): Promise<ConcentrationMetrics> {
    throw new Error("Not implemented — connect a real ETF analytics provider");
  }

  async compareETFs(_tickers: string[]): Promise<Record<string, ETFComposition>> {
    throw new Error("Not implemented — connect a real ETF comparison service");
  }
}

export const etfHoldingsService: ETFHoldingsService = new MockETFHoldingsService();
