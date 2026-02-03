/**
 * ExpandableDetails - Collapsible section for detailed examiner steps and tips.
 *
 * Implements progressive disclosure pattern:
 * - Collapsed by default to keep UI clean
 * - Expands to show detailed steps when needed
 * - Uses smooth animation for state changes
 */

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Lightbulb } from "lucide-react";
import { useState } from "react";

interface ExpandableDetailsProps {
  /** Title shown in the collapsed header */
  title: string;
  /** Detailed steps to show when expanded */
  steps?: string[];
  /** Optional tips to show at the bottom */
  tips?: string[];
  /** Whether to start expanded */
  defaultExpanded?: boolean;
  /** Optional className */
  className?: string;
}

/**
 * Collapsible details section for clinical procedure steps.
 *
 * Layout (expanded):
 * ┌─────────────────────────────────────────────────┐
 * │ ▼ Technik-Details                               │
 * │   1. First step                                 │
 * │   2. Second step                                │
 * │   💡 Tip text                                   │
 * └─────────────────────────────────────────────────┘
 */
export function ExpandableDetails({
  title,
  steps,
  tips,
  defaultExpanded = false,
  className,
}: ExpandableDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Don't render if no content
  if ((!steps || steps.length === 0) && (!tips || tips.length === 0)) {
    return null;
  }

  return (
    <div className={cn("rounded-md border border-muted", className)}>
      {/* Header - always visible, clickable */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-sm font-medium",
          "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          "transition-colors"
        )}
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0" />
        )}
        {title}
      </button>

      {/* Content - shown when expanded */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 animate-in slide-in-from-top-1 duration-150">
          {/* Steps list */}
          {steps && steps.length > 0 && (
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
              {steps.map((step, index) => (
                <li key={index} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          )}

          {/* Tips */}
          {tips && tips.length > 0 && (
            <div className="space-y-1">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                  <span className="italic">{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
