/**
 * SQInstructionBlock — Collapsible interview instructions for the SQ wizard.
 *
 * Simplified version of the examination's ProcedureFlow, without protocol
 * figure popovers or protocol routing links.
 */

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, ClipboardList, MousePointerClick } from "lucide-react";
import { useState } from "react";
import type { SQSectionInstruction } from "../../content/types";

interface SQInstructionBlockProps {
  instruction: SQSectionInstruction;
  className?: string;
}

export function SQInstructionBlock({ instruction, className }: SQInstructionBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30",
        className,
      )}
    >
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        )}
        <ClipboardList className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="min-w-0">
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {instruction.title}
          </span>
          {!isExpanded && (
            <span className="ml-2 text-xs text-blue-600/70 dark:text-blue-400/70">
              {instruction.flow.length} Schritte
            </span>
          )}
        </div>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <p className="mb-3 text-sm text-blue-800/80 dark:text-blue-200/80">
            {instruction.description}
          </p>

          {/* Step list */}
          <div className="rounded-md border border-blue-200/60 bg-white/80 p-4 dark:border-blue-800/40 dark:bg-blue-950/40">
            <div className="space-y-0">
              {instruction.flow.map((step, index) => {
                const isLast = index === instruction.flow.length - 1;
                return (
                  <div key={step.id} className="flex gap-3">
                    {/* Step number */}
                    <div className="flex flex-col items-center">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {index + 1}
                      </div>
                      {!isLast && <div className="mt-1 w-px flex-1 bg-blue-200/60 dark:bg-blue-800/40" />}
                    </div>

                    {/* Step content */}
                    <div className={cn("pb-4", isLast && "pb-0")}>
                      <span className="text-sm font-medium text-foreground">
                        {step.label}
                      </span>

                      {step.patientScript && (
                        <div className="mt-1 text-sm italic text-muted-foreground">
                          &bdquo;{step.patientScript}&ldquo;
                        </div>
                      )}

                      {step.examinerInstruction && (
                        <div className="mt-1 text-sm text-muted-foreground">
                          {step.examinerInstruction}
                        </div>
                      )}

                      {step.appAction && (
                        <div className="mt-1.5 flex items-center gap-1.5 rounded bg-muted/50 px-2 py-1 text-xs text-muted-foreground/80 w-fit">
                          <MousePointerClick className="h-3 w-3 shrink-0" />
                          <span>{step.appAction}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
