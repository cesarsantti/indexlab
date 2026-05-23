import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  subvalue?: string;
  trend?: "up" | "down" | "neutral";
  accentColor?: string;
  icon?: React.ReactNode;
  description?: string;
}

export function MetricCard({
  label,
  value,
  subvalue,
  trend,
  accentColor = "border-blue-500",
  icon,
  description,
}: MetricCardProps) {
  const trendColors = {
    up: "text-emerald-400",
    down: "text-red-400",
    neutral: "text-slate-400",
  };

  return (
    <div className={cn(
      "relative rounded-xl bg-slate-900 border border-slate-800 p-5",
      "border-t-2 overflow-hidden transition-all duration-200 hover:border-t-slate-700",
      accentColor
    )}>
      {/* Background glow */}
      <div className="absolute inset-0 opacity-5"
        style={{ background: "radial-gradient(circle at top left, currentColor 0%, transparent 60%)" }}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
          {icon && (
            <div className="text-slate-600">{icon}</div>
          )}
        </div>

        <div className={cn(
          "text-2xl font-bold tracking-tight",
          trend ? trendColors[trend] : "text-slate-100"
        )}>
          {value}
        </div>

        {subvalue && (
          <div className={cn(
            "mt-1 text-xs font-medium",
            trend ? trendColors[trend] : "text-slate-400"
          )}>
            {subvalue}
          </div>
        )}

        {description && (
          <div className="mt-2 text-xs text-slate-500">{description}</div>
        )}
      </div>
    </div>
  );
}
