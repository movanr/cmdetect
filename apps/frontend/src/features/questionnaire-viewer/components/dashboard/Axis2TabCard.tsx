import { cn } from "@/lib/utils";
import type { TabSummaryEntry } from "./Axis2ScoreCard";

interface Axis2TabCardProps {
  abbreviation: string;
  entries: TabSummaryEntry[];
  active: boolean;
  completed: boolean;
  onClick: () => void;
}

export function Axis2TabCard({
  abbreviation,
  entries,
  active,
  completed,
  onClick,
}: Axis2TabCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex-1 min-w-[160px] text-left rounded-md border px-3 py-2.5 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "bg-card border-border shadow-sm ring-1 ring-primary/40 rounded-b-none relative z-10 -mb-px"
          : "bg-muted/40 border-border hover:bg-muted/60",
        !completed && !active && "opacity-70"
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold leading-tight">{abbreviation}</span>
        {!completed && (
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            offen
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-col gap-0.5 min-h-[1.25rem]">
        {entries.length === 0 ? (
          <span className="text-sm text-muted-foreground">—</span>
        ) : (
          entries.map((entry) => (
            <div key={entry.label} className="text-[11px] leading-tight">
              <span className="text-muted-foreground">{entry.label}: </span>
              <span className="font-medium text-foreground">{entry.value}</span>
            </div>
          ))
        )}
      </div>
    </button>
  );
}
