import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { StatusIcon, type StepStatus } from "./StatusIcon";

export interface StepBarProps {
  config: { badge: string; title: string };
  status: StepStatus;
  summary: string;
  onClick?: () => void;
}

export function StepBar({ config, status, summary, onClick }: StepBarProps) {
  const isClickable = status === "completed" || status === "skipped";
  const isPending = status === "pending";

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={isPending}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors",
        "bg-card",
        status === "completed" && [
          "border-green-200 hover:border-green-300 hover:bg-green-50/50",
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
        variant={status === "completed" ? "default" : "secondary"}
        className={cn("shrink-0", status === "skipped" && "opacity-75")}
      >
        {config.badge}
      </Badge>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-medium text-sm truncate",
              status === "skipped" && "text-muted-foreground"
            )}
          >
            {config.title}
          </span>
          {status === "skipped" && (
            <span className="text-xs text-muted-foreground">(Übersprungen)</span>
          )}
        </div>
      </div>

      <span
        className={cn(
          "text-sm shrink-0",
          status === "completed" && "text-foreground",
          (status === "skipped" || status === "pending") && "text-muted-foreground"
        )}
      >
        {summary}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        <StatusIcon status={status} />
        {isClickable && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </div>
    </button>
  );
}
