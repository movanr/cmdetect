/**
 * SubStep Tabs Component
 *
 * Horizontal tabs for navigating between sub-steps within a main workflow step.
 * Uses TanStack Router Link for proper navigation and active state.
 */

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "@tanstack/react-router";
import type { SubStepDefinition } from "../types/workflow";

interface SubStepTabsProps {
  /** The case ID for routing */
  caseId: string;
  /** The parent step path (e.g., "anamnesis", "examination") */
  parentStep: string;
  /** Available sub-steps */
  subSteps: SubStepDefinition[];
  /** Optional className for customization */
  className?: string;
}

export function SubStepTabs({
  caseId,
  parentStep,
  subSteps,
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
          const separatorIdx = subStep.label.indexOf(" - ");
          const [prefix, subtitle] = separatorIdx !== -1
            ? [subStep.label.slice(0, separatorIdx), subStep.label.slice(separatorIdx + 3)]
            : [subStep.label, undefined];

          const link = (
            <Link
              to={`/cases/$id/${parentStep}/${subStep.route}` as "/cases/$id"}
              params={{ id: caseId }}
              className={cn(
                "relative px-3 xl:px-4 py-2.5 text-sm font-medium rounded-t-md transition-colors",
                "text-muted-foreground hover:text-foreground hover:bg-background/50",
                "border-b-2 border-transparent -mb-px whitespace-nowrap",
              )}
              activeProps={{
                className: "!text-primary bg-background font-semibold border-b-2 !border-primary",
              }}
            >
              {({ isActive }) => (isActive ? subStep.label : prefix)}
            </Link>
          );

          if (!subtitle) return <span key={subStep.id}>{link}</span>;

          return (
            <Tooltip key={subStep.id}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="bottom">{subtitle}</TooltipContent>
            </Tooltip>
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
