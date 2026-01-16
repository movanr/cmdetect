/**
 * E4StepBar - Collapsed step summary bar.
 *
 * Displays a compact representation of a completed/skipped/pending step.
 * Completed steps are clickable to revisit.
 */

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronRight, SkipForward } from "lucide-react";
import type { E4Step, StepStatus } from "./types";

interface E4StepBarProps {
  /** Step definition */
  step: E4Step;
  /** Current status */
  status: StepStatus;
  /** Summary text to display */
  summary: string;
  /** Click handler (only for completed steps) */
  onClick?: () => void;
  /** Optional className */
  className?: string;
}

/**
 * Status icon component.
 */
function StatusIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case "completed":
      return <Check className="h-4 w-4 text-green-600" />;
    case "skipped":
      return <SkipForward className="h-4 w-4 text-muted-foreground" />;
    default:
      return null;
  }
}

export function E4StepBar({
  step,
  status,
  summary,
  onClick,
  className,
}: E4StepBarProps) {
  const isClickable = status === "completed" || status === "skipped";
  const isPending = status === "pending";

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={isPending}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors",
        // Base styles
        "bg-card",
        // Status-specific styles
        status === "completed" && [
          "border-green-200 hover:border-green-300 hover:bg-green-50/50",
          "cursor-pointer",
        ],
        status === "skipped" && [
          "border-muted hover:border-muted-foreground/30 hover:bg-muted/50",
          "cursor-pointer opacity-75",
        ],
        status === "pending" && [
          "border-muted bg-muted/30",
          "cursor-not-allowed opacity-50",
        ],
        status === "active" && [
          "border-primary bg-primary/5",
          "cursor-default",
        ],
        className
      )}
    >
      {/* Step badge */}
      <Badge
        variant={status === "completed" ? "default" : "secondary"}
        className={cn(
          "shrink-0",
          status === "skipped" && "opacity-75"
        )}
      >
        {step.badge}
      </Badge>

      {/* Title and summary */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-medium text-sm truncate",
              status === "skipped" && "text-muted-foreground"
            )}
          >
            {step.shortTitle}
          </span>
          {status === "skipped" && (
            <span className="text-xs text-muted-foreground">(Übersprungen)</span>
          )}
        </div>
      </div>

      {/* Summary */}
      <span
        className={cn(
          "text-sm shrink-0",
          status === "completed" && "text-foreground",
          status === "skipped" && "text-muted-foreground",
          status === "pending" && "text-muted-foreground"
        )}
      >
        {summary}
      </span>

      {/* Status icon and chevron */}
      <div className="flex items-center gap-1 shrink-0">
        <StatusIcon status={status} />
        {isClickable && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </button>
  );
}
