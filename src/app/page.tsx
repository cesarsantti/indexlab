"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const exampleStrategies = [
  "AI Infrastructure Leaders",
  "Quality Dividend Growth",
  "Clean Energy Transition",
  "Emerging Markets Momentum",
  "Healthcare Innovation",
  "US Small Cap Value",
];

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    ),
    title: "Natural Language Strategy Builder",
    description:
      "Describe your investment thesis in plain English. Our AI parses your intent into a formal index methodology with rules you can inspect and edit.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Institutional Backtesting",
    description:
      "Run your strategy against real historical data. See performance vs SPY and QQQ, drawdown analysis, annual returns, and Sharpe ratios across market cycles.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Factor Exposure Analysis",
    description:
      "Understand what's actually driving your returns. Decompose performance into value, momentum, quality, low volatility, and size factor exposures.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    title: "Methodology Export",
    description:
      "Generate a professional index methodology document — the same format used by S&P, MSCI, and FTSE Russell — to share with advisors or for your own records.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
];

const stats = [
  { value: "1,200+", label: "Custom Indexes Built" },
  { value: "$4.8T", label: "Assets Analyzed" },
  { value: "12", label: "Factor Models" },
  { value: "40+", label: "Years of Data" },
];

export default function LandingPage() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  const handleBuild = () => {
    router.push(
      prompt.trim()
        ? `/builder?prompt=${encodeURIComponent(prompt.trim())}`
        : "/builder"
    );
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 20%, rgba(139,92,246,0.08) 0%, transparent 50%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-16">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            No-code index construction platform
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
            Build institutional-grade{" "}
            <span className="gradient-text">custom indexes</span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Describe your investment thesis in plain English. IndexLab turns your idea into a
            rules-based index with backtests, factor analysis, and a professional methodology document.
          </p>
        </div>

        {/* Strategy Input */}
        <div className="max-w-2xl mx-auto mb-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-violet-500/20 blur-xl opacity-60" />
            <div className="relative rounded-xl border border-slate-700 bg-slate-900/80 backdrop-blur-sm overflow-hidden focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/10 transition-all duration-300">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBuild()}
                placeholder="e.g., High-quality US tech companies with strong free cash flow and growing AI exposure..."
                className="w-full bg-transparent px-5 py-4 pr-40 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <button
                  onClick={handleBuild}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 shadow-lg"
                >
                  Build Index
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-16">
          {exampleStrategies.map((s) => (
            <button
              key={s}
              onClick={() => setPrompt(s)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 hover:border-slate-500 hover:bg-slate-800 px-3.5 py-1.5 text-sm text-slate-300 hover:text-slate-100 transition-all duration-200 cursor-pointer"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              {s}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mb-20 grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-800 rounded-xl overflow-hidden border border-slate-800">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-slate-900 px-6 py-5 text-center">
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div>
          <h2 className="text-2xl font-bold text-center text-slate-100 mb-3">
            Everything you need to invest like an institution
          </h2>
          <p className="text-center text-slate-400 mb-10 max-w-xl mx-auto">
            IndexLab brings the tools that fund managers use to individual investors — no coding required.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className={`rounded-xl border ${f.border} ${f.bg} p-6 transition-all duration-200 hover:scale-[1.01]`}>
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-900/60 mb-4 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 shadow-xl shadow-blue-900/30"
            >
              Start Building Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 hover:border-slate-500 px-8 py-3.5 text-base font-medium text-slate-300 hover:text-slate-100 transition-all"
            >
              View Example Dashboard
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">No account required to explore • Mock data only</p>
        </div>
      </div>
    </div>
  );
}
