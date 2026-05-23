"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { aiInfraHoldings, indexMetrics } from "@/data/mock/holdings";

const sections = [
  {
    id: "objective",
    number: "1",
    title: "Index Objective",
    content: `The AI Infrastructure Index (the "Index") is designed to provide exposure to companies that are essential building blocks of artificial intelligence infrastructure, including semiconductor designers and manufacturers, hyperscale cloud providers, high-bandwidth networking equipment companies, and AI server system integrators.

The Index targets the segment of the market that benefits most directly from the capital expenditure cycle surrounding AI model training and inference, rather than the application layer built on top of this infrastructure.`,
  },
  {
    id: "universe",
    number: "2",
    title: "Eligible Universe",
    content: `The Index is constructed from the following eligible universe:

• Primary listing on a US national securities exchange (NYSE, Nasdaq, or NYSE American)
• Classified in the Information Technology, Communication Services, or Semiconductors & Semiconductor Equipment GICS sectors
• Minimum market capitalization of USD 5 billion at the time of index review
• Minimum average daily trading volume of USD 30 million over the trailing 90 calendar days

Foreign private issuers listed via American Depositary Receipts (ADRs) are eligible if they meet the above criteria. TSMC (TSM) qualifies under this provision.`,
  },
  {
    id: "eligibility",
    number: "3",
    title: "Eligibility Criteria",
    content: `To be eligible for inclusion in the Index, a security must satisfy all of the following criteria at the time of the annual reconstitution:

Revenue Relevance Test: At least 20% of the company's trailing twelve-month revenue must be derived from AI infrastructure products or services, including but not limited to: AI-optimized semiconductors, hyperscale cloud AI services, AI-specific networking hardware, and AI server systems.

Financial Health Test: The company must have reported positive trailing twelve-month free cash flow, unless the AI infrastructure revenue concentration exceeds 60% of total revenues, in which case high-growth unprofitable companies may be included at the Index Committee's discretion with a reduced weight cap.

Liquidity Test: Minimum daily dollar volume of USD 30 million (90-day average) to ensure practical indexability.`,
  },
  {
    id: "selection",
    number: "4",
    title: "Selection & Scoring",
    content: `Eligible securities are scored on three dimensions to determine constituent rank:

Momentum Score (40% weight): 12-month price momentum minus 1-month momentum (to reduce short-term reversal effects), normalized to a 0–100 scale across the eligible universe.

Quality Score (35% weight): Composite of return on invested capital (ROIC), gross margin stability, and free cash flow conversion rate. Normalized to a 0–100 scale.

Valuation Score (25% weight): Inverse of trailing EV/Sales, adjusted for revenue growth rate. Higher scores indicate more attractive relative valuation. Normalized to a 0–100 scale.

The top 15 ranked securities by composite score are selected as index constituents. The minimum constituent count is 10; if fewer than 10 companies pass all eligibility criteria, the threshold is relaxed to allow the next-ranked eligible companies.`,
  },
  {
    id: "weighting",
    number: "5",
    title: "Weighting Methodology",
    content: `Constituents are weighted by a modified market capitalization approach with momentum tilt:

Base Weight = (Free-float market cap × Momentum score) / Sum of all (Free-float market cap × Momentum score)

Weight Constraints:
• Maximum single-constituent weight: 20% of index value
• Maximum aggregate weight of any single GICS sub-industry: 40%
• Minimum constituent weight: 1%

If constraints are binding, excess weight is redistributed proportionally to non-capped constituents. Weights are calculated using closing prices on the last business day before the rebalancing effective date.`,
  },
  {
    id: "rebalancing",
    number: "6",
    title: "Rebalancing Schedule",
    content: `The Index undergoes a full reconstitution (constituent review + rebalancing) quarterly on the following schedule:

• Q1: Third Friday of March (effective the following Monday)
• Q2: Third Friday of June
• Q3: Third Friday of September
• Q4: Third Friday of December

Between scheduled reconstitutions, the Index undergoes a weight rebalancing (without constituent change) if any single constituent's weight exceeds its cap by more than 3 percentage points as a result of price movements.

Corporate Actions: Index-level adjustments are made for stock splits, mergers, spin-offs, and delistings on the effective date of each corporate action. Cash dividends are not reinvested (price return index).`,
  },
  {
    id: "risk",
    number: "7",
    title: "Risk Controls",
    content: `The following risk controls are applied during each reconstitution:

Concentration Controls:
• No single constituent may exceed 20% of index weight at rebalancing
• No single GICS Sub-Industry may exceed 40% of index weight
• No single GICS Industry Group may exceed 65% of index weight

Liquidity Controls:
• Minimum 90-day average daily volume of USD 30 million
• Constituents with >25% price decline in the 20 days prior to reconstitution undergo enhanced liquidity review

Turnover Controls:
• Existing constituents receive a "buffer" of 5 composite score points versus new entrants, reducing unnecessary turnover
• Annual one-way turnover target: below 30%`,
  },
  {
    id: "governance",
    number: "8",
    title: "Index Governance",
    content: `The Index is maintained by the IndexLab Index Committee (the "Committee"), which meets quarterly to oversee the reconstitution process and make discretionary adjustments where necessary.

The Committee may, in extraordinary circumstances, make off-cycle changes to the Index including but not limited to: bankruptcy, delisting, government-mandated trading halts, or merger/acquisition announcements that materially alter the company's AI infrastructure relevance.

All Committee decisions are documented and published in the Index Methodology Updates log. Proposed changes to the methodology undergo a 30-day public comment period before implementation.`,
  },
  {
    id: "disclaimer",
    number: "9",
    title: "Disclaimers",
    content: `This index methodology is provided for informational and educational purposes only. The AI Infrastructure Index is not a registered investment product. Past performance of the index does not guarantee future results.

This document does not constitute investment advice. IndexLab does not manage money, act as an investment adviser, or recommend any specific investment strategy. Users should consult with a qualified financial adviser before making investment decisions.

The mock historical data presented in IndexLab applications is constructed for illustrative purposes only and does not represent actual investable performance. Backtest results are subject to inherent limitations including survivorship bias, lookahead bias, and the inability to account for market impact of trading.

IndexLab Beta — For demonstration purposes only. All data is simulated.`,
  },
];

export default function MethodologyPage() {
  const [activeSection, setActiveSection] = useState("objective");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = sections.map((s) => `${s.number}. ${s.title}\n\n${s.content}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Index Methodology</h1>
          <p className="text-slate-400 mt-1">AI Infrastructure Index · Version 2.1 · Effective April 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 hover:border-slate-500 px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 transition-all"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy All
              </>
            )}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print / PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar navigation */}
        <div className="lg:col-span-1">
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 sticky top-24">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sections</div>
            <nav className="space-y-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSection(s.id);
                    document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all text-left cursor-pointer ${
                    activeSection === s.id
                      ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <span className="text-xs font-mono text-slate-500 w-4">{s.number}.</span>
                  {s.title}
                </button>
              ))}
            </nav>

            {/* Quick stats */}
            <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Constituents</span>
                <span className="text-slate-200 font-medium">{indexMetrics.holdings}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Rebalance</span>
                <span className="text-slate-200 font-medium">Quarterly</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Inception</span>
                <span className="text-slate-200 font-medium">{indexMetrics.inception}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Document body */}
        <div className="lg:col-span-3 space-y-6">
          {/* Document header */}
          <div className="rounded-xl bg-gradient-to-br from-blue-500/5 to-violet-500/5 border border-blue-500/20 p-8 print:border-slate-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="16 7 22 7 22 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="text-xs text-slate-400">IndexLab</div>
                <div className="text-sm font-semibold text-slate-100">Index Methodology Document</div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-1">AI Infrastructure Index</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="cyan">Ticker: AIIX</Badge>
              <Badge variant="outline">Version 2.1</Badge>
              <Badge variant="outline">Effective: April 1, 2026</Badge>
              <Badge variant="success">Price Return</Badge>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              This document sets out the complete rules and procedures governing the construction, maintenance, and rebalancing of the AI Infrastructure Index. It is intended to provide full transparency to index users, licensees, and investors.
            </p>
          </div>

          {/* Sections */}
          {sections.map((s) => (
            <div
              key={s.id}
              id={s.id}
              className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden scroll-mt-24"
              onMouseEnter={() => setActiveSection(s.id)}
            >
              <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 border border-blue-500/20 text-xs font-bold font-mono text-blue-400">
                  {s.number}
                </div>
                <h3 className="text-base font-semibold text-slate-100">{s.title}</h3>
              </div>
              <div className="px-6 py-5">
                {s.content.split("\n\n").map((para, i) => (
                  <p key={i} className={`text-sm text-slate-300 leading-relaxed ${i > 0 ? "mt-3" : ""}`}>
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {/* Constituents table */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 border border-blue-500/20 text-xs font-bold font-mono text-blue-400">
                A
              </div>
              <h3 className="text-base font-semibold text-slate-100">Appendix A: Current Constituents</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Ticker</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Company</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:table-cell">Sector</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {aiInfraHoldings.map((h) => (
                    <tr key={h.ticker} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-3 font-mono font-bold text-slate-200">{h.ticker}</td>
                      <td className="px-3 py-3 text-slate-300">{h.name}</td>
                      <td className="px-3 py-3 text-slate-400 hidden sm:table-cell text-xs">{h.sector}</td>
                      <td className="px-3 py-3 text-right font-medium text-slate-200 tabular-nums">{h.weight}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-slate-700">
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-xs text-slate-400">Total ({aiInfraHoldings.length} constituents)</td>
                    <td className="px-3 py-3 text-right font-bold text-slate-100">
                      {aiInfraHoldings.reduce((sum, h) => sum + h.weight, 0).toFixed(1)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-slate-500 text-center pb-4">
            AI Infrastructure Index Methodology · Version 2.1 · © 2026 IndexLab ·{" "}
            <span className="text-slate-600">For demonstration purposes only. All data is simulated.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
