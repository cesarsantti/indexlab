import { rebalanceEvents } from "@/data/mock/backtest";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function RebalancePanel() {
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-100">Rebalance History</h3>
        <p className="text-sm text-slate-400 mt-0.5">Quarterly rebalancing • Next: Jun 30, 2026</p>
      </div>

      <div className="space-y-4">
        {rebalanceEvents.map((event, i) => (
          <div key={i} className="relative pl-5 border-l-2 border-slate-800">
            <div className="absolute -left-1.5 top-1 w-2.5 h-2.5 rounded-full bg-blue-500/80 border-2 border-slate-900" />
            <div className="text-xs font-semibold text-blue-400 mb-1">{event.date}</div>
            <p className="text-sm text-slate-300 mb-2">{event.description}</p>
            <div className="flex flex-wrap gap-2">
              {event.changes.map((change) => (
                <div
                  key={change.ticker}
                  className="flex items-center gap-1.5 rounded-md bg-slate-800/60 border border-slate-700/50 px-2.5 py-1 text-xs"
                >
                  <span className="font-mono font-bold text-slate-200">{change.ticker}</span>
                  <Badge
                    variant={
                      change.action === "Added" || change.action === "Increased"
                        ? "success"
                        : "warning"
                    }
                    className="py-0 px-1.5"
                  >
                    {change.action}
                  </Badge>
                  <span className={cn(
                    "font-medium",
                    change.weightDelta.startsWith("+") ? "text-emerald-400" : "text-amber-400"
                  )}>
                    {change.weightDelta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
        <p className="text-xs text-blue-300">
          <span className="font-semibold">Methodology note: </span>
          Rebalancing triggers when any constituent drifts more than 3% from target weight, or quarterly at minimum.
          All trades execute at market-on-close prices on the last business day of the quarter.
        </p>
      </div>
    </div>
  );
}
