import { cn } from "@/lib/utils";

interface Axis2TabCardProps {
  abbreviation: string;
  title: string;
  mainScore?: string;
  classification?: string;
  active: boolean;
  completed: boolean;
  onClick: () => void;
}

export function Axis2TabCard({
  abbreviation,
  title,
  mainScore,
  classification,
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
        "flex-1 min-w-[140px] text-left rounded-md border px-3 py-2.5 transition-colors",
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
      <div className="text-[11px] text-muted-foreground truncate mt-0.5">{title}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className={cn(
            "text-lg font-mono leading-none",
            !mainScore && "text-muted-foreground"
          )}
        >
          {mainScore || "—"}
        </span>
        {classification && (
          <span className="text-[11px] text-muted-foreground truncate">{classification}</span>
        )}
      </div>
    </button>
  );
}
