/**
 * News & Sentiment Service
 * Placeholder for financial news analysis and sentiment scoring.
 *
 * Future integration: Benzinga, NewsAPI + Claude sentiment analysis, or Bloomberg Terminal API
 */

export interface NewsArticle {
  id: string;
  ticker: string;
  headline: string;
  source: string;
  publishedAt: Date;
  url: string;
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  summary: string;
  relevanceScore: number;
}

export interface SentimentSummary {
  ticker: string;
  overallSentiment: "bullish" | "neutral" | "bearish";
  sentimentScore: number;
  bullishArticles: number;
  neutralArticles: number;
  bearishArticles: number;
  keyThemes: string[];
  riskFlags: string[];
  analysisDate: Date;
}

export interface IndexSentiment {
  indexName: string;
  overallScore: number;
  holdingSentiments: SentimentSummary[];
  marketNarrative: string;
  topRisks: string[];
  catalysts: string[];
}

export interface NewsSentimentService {
  getArticles(ticker: string, days?: number): Promise<NewsArticle[]>;
  getSentimentSummary(ticker: string): Promise<SentimentSummary>;
  getIndexSentiment(tickers: string[]): Promise<IndexSentiment>;
}

class MockNewsSentimentService implements NewsSentimentService {
  async getArticles(_ticker: string, _days?: number): Promise<NewsArticle[]> {
    throw new Error("Not implemented — connect a news API with LLM sentiment analysis");
  }

  async getSentimentSummary(_ticker: string): Promise<SentimentSummary> {
    throw new Error("Not implemented — connect a sentiment scoring service");
  }

  async getIndexSentiment(_tickers: string[]): Promise<IndexSentiment> {
    throw new Error("Not implemented — connect an index-level sentiment aggregator");
  }
}

export const newsSentimentService: NewsSentimentService = new MockNewsSentimentService();
