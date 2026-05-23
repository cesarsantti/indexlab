import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  trackClassName?: string;
  indicatorClassName?: string;
}

function Progress({
  value,
  max = 100,
  className,
  trackClassName,
  indicatorClassName,
}: ProgressProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className={cn("relative w-full overflow-hidden rounded-full", trackClassName ?? "h-1.5 bg-slate-700", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", indicatorClassName ?? "bg-blue-500")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export { Progress };
