/**
 * Market Data Service
 * Placeholder for real-time and historical price data.
 *
 * Future integration: Alpha Vantage, Polygon.io, or Yahoo Finance API
 */

export interface PriceQuote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
}

export interface HistoricalBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
}

export interface MarketDataService {
  getQuote(ticker: string): Promise<PriceQuote>;
  getQuotes(tickers: string[]): Promise<PriceQuote[]>;
  getHistoricalBars(ticker: string, from: Date, to: Date, interval: "1d" | "1w" | "1mo"): Promise<HistoricalBar[]>;
  getIndexLevel(ticker: string): Promise<number>;
}

// Stub implementation — replace with real API calls
class MockMarketDataService implements MarketDataService {
  async getQuote(ticker: string): Promise<PriceQuote> {
    return {
      ticker,
      price: 100,
      change: 1.5,
      changePercent: 1.5,
      volume: 10_000_000,
      timestamp: new Date(),
    };
  }

  async getQuotes(tickers: string[]): Promise<PriceQuote[]> {
    return tickers.map((ticker) => ({
      ticker,
      price: 100,
      change: 1.5,
      changePercent: 1.5,
      volume: 10_000_000,
      timestamp: new Date(),
    }));
  }

  async getHistoricalBars(
    _ticker: string,
    _from: Date,
    _to: Date,
    _interval: "1d" | "1w" | "1mo"
  ): Promise<HistoricalBar[]> {
    return [];
  }

  async getIndexLevel(_ticker: string): Promise<number> {
    return 100;
  }
}

export const marketDataService: MarketDataService = new MockMarketDataService();
