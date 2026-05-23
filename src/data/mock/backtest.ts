export interface BacktestPoint {
  date: string;
  index: number;
  spy: number;
  qqq: number;
}

export interface MonthlyReturn {
  date: string;
  return: number;
}

// Indexed to 100 at Jan 2022. Values represent cumulative performance.
export const backtestData: BacktestPoint[] = [
  { date: "Jan '22", index: 100.0, spy: 100.0, qqq: 100.0 },
  { date: "Feb '22", index: 95.8, spy: 97.1, qqq: 94.3 },
  { date: "Mar '22", index: 91.2, spy: 95.6, qqq: 90.8 },
  { date: "Apr '22", index: 88.4, spy: 91.8, qqq: 84.2 },
  { date: "May '22", index: 82.7, spy: 88.3, qqq: 78.9 },
  { date: "Jun '22", index: 76.1, spy: 83.4, qqq: 73.1 },
  { date: "Jul '22", index: 68.4, spy: 78.2, qqq: 67.4 },
  { date: "Aug '22", index: 73.9, spy: 82.7, qqq: 73.2 },
  { date: "Sep '22", index: 69.8, spy: 79.1, qqq: 69.8 },
  { date: "Oct '22", index: 62.4, spy: 74.3, qqq: 63.2 },
  { date: "Nov '22", index: 67.2, spy: 79.6, qqq: 68.4 },
  { date: "Dec '22", index: 63.1, spy: 77.4, qqq: 64.8 },
  { date: "Jan '23", index: 52.4, spy: 76.1, qqq: 63.2 },
  { date: "Feb '23", index: 62.7, spy: 80.4, qqq: 69.8 },
  { date: "Mar '23", index: 60.1, spy: 78.9, qqq: 68.4 },
  { date: "Apr '23", index: 66.8, spy: 83.2, qqq: 74.1 },
  { date: "May '23", index: 70.4, spy: 84.7, qqq: 76.2 },
  { date: "Jun '23", index: 83.2, spy: 88.9, qqq: 83.6 },
  { date: "Jul '23", index: 91.4, spy: 92.4, qqq: 88.7 },
  { date: "Aug '23", index: 98.7, spy: 94.8, qqq: 92.1 },
  { date: "Sep '23", index: 92.3, spy: 91.6, qqq: 87.4 },
  { date: "Oct '23", index: 87.1, spy: 88.4, qqq: 83.9 },
  { date: "Nov '23", index: 89.6, spy: 91.2, qqq: 87.6 },
  { date: "Dec '23", index: 102.8, spy: 96.7, qqq: 96.4 },
  { date: "Jan '24", index: 109.4, spy: 100.1, qqq: 99.8 },
  { date: "Feb '24", index: 118.7, spy: 104.8, qqq: 105.6 },
  { date: "Mar '24", index: 132.4, spy: 110.2, qqq: 111.4 },
  { date: "Apr '24", index: 146.8, spy: 107.6, qqq: 108.2 },
  { date: "May '24", index: 140.3, spy: 109.4, qqq: 110.8 },
  { date: "Jun '24", index: 156.2, spy: 113.8, qqq: 117.4 },
  { date: "Jul '24", index: 169.4, spy: 116.2, qqq: 120.6 },
  { date: "Aug '24", index: 162.1, spy: 113.8, qqq: 116.4 },
  { date: "Sep '24", index: 174.8, spy: 118.4, qqq: 121.8 },
  { date: "Oct '24", index: 181.6, spy: 120.7, qqq: 124.3 },
  { date: "Nov '24", index: 189.3, spy: 123.4, qqq: 128.7 },
  { date: "Dec '24", index: 211.4, spy: 128.6, qqq: 134.2 },
  { date: "Jan '25", index: 206.8, spy: 127.4, qqq: 132.1 },
  { date: "Feb '25", index: 218.3, spy: 131.2, qqq: 136.4 },
  { date: "Mar '25", index: 203.7, spy: 126.8, qqq: 130.2 },
  { date: "Apr '25", index: 212.4, spy: 129.6, qqq: 133.8 },
  { date: "May '25", index: 224.8, spy: 133.4, qqq: 138.7 },
  { date: "Jun '25", index: 238.6, spy: 137.8, qqq: 143.6 },
  { date: "Jul '25", index: 252.1, spy: 140.4, qqq: 147.2 },
  { date: "Aug '25", index: 259.3, spy: 142.1, qqq: 149.8 },
  { date: "Sep '25", index: 265.7, spy: 144.6, qqq: 152.4 },
  { date: "Oct '25", index: 257.4, spy: 141.8, qqq: 148.6 },
  { date: "Nov '25", index: 267.2, spy: 146.2, qqq: 154.1 },
  { date: "Dec '25", index: 284.6, spy: 150.8, qqq: 159.4 },
  { date: "Jan '26", index: 292.1, spy: 153.2, qqq: 162.8 },
  { date: "Feb '26", index: 279.4, spy: 148.7, qqq: 157.4 },
  { date: "Mar '26", index: 287.8, spy: 151.4, qqq: 160.6 },
  { date: "Apr '26", index: 295.6, spy: 154.2, qqq: 164.3 },
];

export const annualReturns = [
  { year: "2022", index: -47.6, spy: -18.1, qqq: -32.6 },
  { year: "2023", index: +96.6, spy: +26.3, qqq: +54.9 },
  { year: "2024", index: +105.4, spy: +28.6, qqq: +32.7 },
  { year: "2025", index: +38.6, spy: +17.3, qqq: +18.8 },
  { year: "2026 YTD", index: +3.9, spy: +2.2, qqq: +3.1 },
];

export const drawdownData = [
  { date: "Peak (Nov '21)", drawdown: 0 },
  { date: "Jan '22", drawdown: 0 },
  { date: "Jun '22", drawdown: -23.9 },
  { date: "Jan '23", drawdown: -47.6 },
  { date: "Jun '23", drawdown: -16.8 },
  { date: "Jan '24", drawdown: 0 },
  { date: "Mar '25", drawdown: -3.8 },
  { date: "Apr '26", drawdown: 0 },
];

export const rebalanceEvents = [
  {
    date: "Q1 2024",
    description: "Added ORCL, increased ANET weight",
    changes: [
      { ticker: "ORCL", action: "Added", weightDelta: "+3.2%" },
      { ticker: "ANET", action: "Increased", weightDelta: "+1.8%" },
      { ticker: "SMCI", action: "Reduced", weightDelta: "-2.4%" },
      { ticker: "MU", action: "Reduced", weightDelta: "-1.1%" },
    ],
  },
  {
    date: "Q3 2024",
    description: "Reduced AMD, increased NVDA & TSM",
    changes: [
      { ticker: "NVDA", action: "Increased", weightDelta: "+2.1%" },
      { ticker: "TSM", action: "Increased", weightDelta: "+1.4%" },
      { ticker: "AMD", action: "Reduced", weightDelta: "-2.8%" },
      { ticker: "META", action: "Reduced", weightDelta: "-0.7%" },
    ],
  },
  {
    date: "Q1 2025",
    description: "Quarterly rebalance, no changes to constituents",
    changes: [
      { ticker: "NVDA", action: "Trimmed", weightDelta: "-1.2%" },
      { ticker: "MSFT", action: "Increased", weightDelta: "+0.8%" },
      { ticker: "AMZN", action: "Increased", weightDelta: "+0.4%" },
    ],
  },
];
