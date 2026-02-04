import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { COMMON } from "../../labels";
import type { StepStatus } from "./StatusIcon";

export interface StepBarProps {
  config: { badge: string; title: string };
  status: StepStatus;
  summary: string;
  onClick?: () => void;
}

export function StepBar({ config, status, summary, onClick }: StepBarProps) {
  const isClickable = status === "completed" || status === "skipped";
  const isPending = status === "pending";
  const isRefused = summary === COMMON.refused;

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={isPending}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors",
        "bg-card",
        status === "completed" && !isRefused && [
          "border-border hover:border-muted-foreground/50 hover:bg-accent/50",
          "cursor-pointer",
        ],
        status === "completed" && isRefused && [
          "border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/50 dark:hover:bg-amber-950/50",
          "cursor-pointer",
        ],
        status === "skipped" && [
          "border-muted hover:border-muted-foreground/30 hover:bg-muted/50",
          "cursor-pointer opacity-75",
        ],
        status === "pending" && ["border-muted bg-muted/30", "cursor-not-allowed opacity-50"]
      )}
    >
      <Badge
        variant={status === "completed" && !isRefused ? "default" : "secondary"}
        className={cn(
          "shrink-0",
          status === "skipped" && "opacity-75",
          isRefused && "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700"
        )}
      >
        {config.badge}
      </Badge>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-medium text-sm truncate",
              status === "skipped" && "text-muted-foreground",
              isRefused && "text-amber-800 dark:text-amber-200"
            )}
          >
            {config.title}
          </span>
          {status === "skipped" && (
            <span className="text-xs text-muted-foreground">(Übersprungen)</span>
          )}
        </div>
      </div>

      {isRefused ? (
        <Badge
          variant="outline"
          className="shrink-0 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700"
          title={COMMON.refusedTooltip}
        >
          {COMMON.refused}
        </Badge>
      ) : (
        <span
          className={cn(
            "text-sm shrink-0",
            status === "completed" && "text-foreground",
            (status === "skipped" || status === "pending") && "text-muted-foreground"
          )}
        >
          {summary}
        </span>
      )}

      {isClickable && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
    </button>
  );
}
