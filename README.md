# IndexLab

**No-code index strategy platform for everyday investors.**

IndexLab lets you build, backtest, and understand custom investment indexes with institutional-style transparency — powered by natural language and mock AI infrastructure.

> **Status:** MVP demo with mock data only. All backtest data and holdings are simulated for illustrative purposes.

---

## Features

- **Landing Page** — Strategy prompt input, example chips, feature overview
- **Strategy Builder** — Natural language → parsed methodology, editable parameters (universe, rebalance frequency, max weight, sector cap, factor tilt)
- **Dashboard** — Performance vs SPY/QQQ, holdings table with factor scores, factor exposure chart, sector allocation, rebalance history
- **ETF Analyzer** — Concentration risk, top holdings, factor breakdown, plain-English analysis, custom alternative suggestion (VOO, QQQ, SCHD, ARKK)
- **Methodology Export** — Professional index methodology document with all standard sections

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| UI primitives | Custom components (shadcn-inspired) |
| Data | Mock data only |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 8

### Installation

```bash
# Clone or unzip the project
cd indexlab

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm start
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── builder/page.tsx    # Strategy Builder
│   ├── dashboard/page.tsx  # Index Dashboard
│   ├── etf-analyzer/       # ETF Analyzer
│   └── methodology/        # Methodology Export
├── components/
│   ├── nav.tsx             # Top navigation
│   ├── ui/                 # Reusable UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── tabs.tsx
│   │   ├── dialog.tsx
│   │   └── progress.tsx
│   └── dashboard/          # Dashboard-specific components
│       ├── metric-card.tsx
│       ├── performance-chart.tsx
│       ├── holdings-table.tsx
│       ├── factor-exposure.tsx
│       ├── sector-allocation.tsx
│       └── rebalance-panel.tsx
├── data/
│   └── mock/               # All mock data
│       ├── holdings.ts     # AI Infrastructure Index (NVDA, MSFT, AVGO, AMD, TSM, AMZN, GOOGL, META, MU, ANET, SMCI, ORCL)
│       ├── backtest.ts     # Monthly performance Jan 2022–Apr 2026
│       └── etf-analysis.ts # ETF analysis for VOO, QQQ, SCHD, ARKK
├── lib/
│   └── utils.ts            # cn(), formatters
└── services/               # Placeholder API service interfaces
    ├── market-data.ts      # Real-time prices (→ Polygon.io / Alpha Vantage)
    ├── fundamentals.ts     # Financial data (→ Simfin / FMP)
    ├── etf-holdings.ts     # ETF composition (→ ETF.com API)
    └── news-sentiment.ts   # News + sentiment (→ Benzinga + Claude API)
```

---

## Connecting Real Data

Each service in `src/services/` has a fully typed interface. Replace the stub implementations with real API calls:

| Service | Recommended Provider |
|---------|---------------------|
| Market prices | [Polygon.io](https://polygon.io) or [Alpha Vantage](https://alphavantage.co) |
| Fundamentals & screening | [Financial Modeling Prep](https://financialmodelingprep.com) |
| ETF holdings | [ETF.com API](https://developer.etf.com) |
| News sentiment | [Benzinga API](https://www.benzinga.com/apis) + Claude API |
| AI strategy parsing | [Anthropic Claude API](https://docs.anthropic.com) |

---

## Roadmap

- [ ] Connect Claude API for real natural language → methodology parsing
- [ ] Integrate real market data and fundamentals
- [ ] User accounts and saved index strategies
- [ ] PDF export of methodology documents
- [ ] Live index calculation engine
- [ ] Mobile-responsive improvements

---

## Disclaimer

IndexLab is a demonstration application. All data is simulated. This is not investment advice. Past performance of any index (real or simulated) does not guarantee future results.
