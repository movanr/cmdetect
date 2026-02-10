/**
 * SubStep Tabs Component
 *
 * Horizontal tabs for navigating between sub-steps within a main workflow step.
 * Uses TanStack Router Link for proper navigation and active state.
 */

import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import type { SubStepDefinition } from "../types/workflow";

interface SubStepTabsProps {
  /** The case ID for routing */
  caseId: string;
  /** The parent step path (e.g., "anamnesis", "examination") */
  parentStep: string;
  /** Available sub-steps */
  subSteps: SubStepDefinition[];
  /** Optional set of step IDs that are diagnostically relevant. null = not loaded yet (show all normal). */
  relevantSteps?: Set<string> | null;
  /** Optional className for customization */
  className?: string;
}

export function SubStepTabs({
  caseId,
  parentStep,
  subSteps,
  relevantSteps,
  className,
}: SubStepTabsProps) {
  return (
    <div
      className={cn(
        "border-b bg-muted/30",
        className
      )}
    >
      <nav className="flex gap-1 px-4" aria-label="Sub-step navigation">
        {subSteps.map((subStep) => {
          const isRelevant =
            relevantSteps == null || relevantSteps.has(subStep.id);
          const isNonRelevant = relevantSteps != null && !isRelevant;

          return (
            <Link
              key={subStep.id}
              to={`/cases/$id/${parentStep}/${subStep.route}` as "/cases/$id"}
              params={{ id: caseId }}
              className={cn(
                "relative px-4 py-2.5 text-sm font-medium rounded-t-md transition-colors",
                "text-muted-foreground hover:text-foreground hover:bg-background/50",
                "border-b-2 border-transparent -mb-px",
                isNonRelevant && "opacity-50"
              )}
              activeProps={{
                className: cn(
                  "!text-primary bg-background font-semibold",
                  "border-b-2 !border-primary",
                  isNonRelevant && "!opacity-70"
                ),
              }}
            >
              {subStep.label}
              {relevantSteps != null && isRelevant && (
                <span className="absolute top-1.5 right-1 size-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// Compact variant for tighter spaces
interface SubStepTabsCompactProps extends Omit<SubStepTabsProps, "className"> {
  /** Optional className for customization */
  className?: string;
}

export function SubStepTabsCompact({
  caseId,
  parentStep,
  subSteps,
  className,
}: SubStepTabsCompactProps) {
  return (
    <div
      className={cn(
        "flex gap-1 p-1 bg-muted rounded-lg",
        className
      )}
    >
      {subSteps.map((subStep) => (
        <Link
          key={subStep.id}
          to={`/cases/$id/${parentStep}/${subStep.route}` as "/cases/$id"}
          params={{ id: caseId }}
          className={cn(
            "flex-1 px-3 py-1.5 text-sm font-medium rounded-md text-center transition-colors",
            "text-muted-foreground hover:text-foreground"
          )}
          activeProps={{
            className: "bg-background text-foreground shadow-sm",
          }}
        >
          {subStep.label}
        </Link>
      ))}
    </div>
  );
}
