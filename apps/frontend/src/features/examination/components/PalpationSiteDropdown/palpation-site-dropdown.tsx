/**
 * PalpationSiteDropdown - Collapsible dropdown for pain assessment at a single palpation site.
 *
 * Features:
 * - Header row with site name, summary badge, and chevron icon
 * - Expanded content with yes/no pain questions stacked vertically
 * - Controlled expansion via isExpanded + onExpandChange props
 * - Keyboard navigation: Enter/Space toggles, Escape closes
 * - Error state styling when site has incomplete data
 * - Respects palpationMode for which questions to show
 */

import { ChevronDown } from "lucide-react";
import React, { useCallback, useRef } from "react";
import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { YesNoField } from "../inputs/YesNoField";
import { getPalpationSiteLabel, getPainTypeLabel } from "../../labels";
import {
  PALPATION_MODE_QUESTIONS,
  SITE_CONFIG,
  type PainType,
  type PalpationMode,
  type PalpationPainQuestion,
  type PalpationSite,
  type Side,
} from "../../model/regions";
import type { QuestionInstance } from "../../projections/to-instances";
import {
  computePalpationSummaryState,
  PALPATION_SUMMARY_LABELS,
  type IncompletePalpationSite,
  type PalpationSitePainValues,
} from "./types";

export interface PalpationSiteDropdownProps {
  /** The palpation site this dropdown represents */
  site: PalpationSite;
  /** Which side (left/right) */
  side: Side;
  /** Instances for this site's pain questions */
  instances: QuestionInstance[];
  /** Whether the dropdown is expanded */
  isExpanded: boolean;
  /** Callback when expansion state changes */
  onExpandChange: (expanded: boolean) => void;
  /** Whether this site has incomplete data (validation error) */
  incompleteSite?: IncompletePalpationSite;
  /** Palpation mode determines which questions are shown */
  palpationMode: PalpationMode;
  /** Optional className */
  className?: string;
}

/** Pain type display order matching getPalpationPainQuestions output */
const PAIN_TYPE_ORDER: readonly PalpationPainQuestion[] = [
  "pain",
  "familiarPain",
  "familiarHeadache",
  "spreadingPain",
  "referredPain",
];

export function PalpationSiteDropdown({
  site,
  side,
  instances,
  isExpanded,
  onExpandChange,
  incompleteSite,
  palpationMode,
  className,
}: PalpationSiteDropdownProps) {
  const { watch } = useFormContext();
  const headerRef = useRef<React.ComponentRef<"button">>(null);

  // Get the applicable pain types for this site based on palpation mode
  const siteConfig = SITE_CONFIG[site];
  const modeQuestions = PALPATION_MODE_QUESTIONS[palpationMode];

  // Filter questions that apply to this site AND are in the current palpation mode
  const applicablePainTypes = modeQuestions.filter((q) => {
    if (q === "familiarHeadache") return siteConfig.hasHeadache;
    if (q === "spreadingPain") return siteConfig.hasSpreading;
    return true;
  });

  // Build a map for quick lookup: painType → instance
  const instanceMap = new Map<string, QuestionInstance>();
  for (const inst of instances) {
    if (inst.context.painType) {
      instanceMap.set(inst.context.painType, inst);
    }
  }

  // Get current values for summary computation
  const painInstance = instanceMap.get("pain");
  const familiarPainInstance = instanceMap.get("familiarPain");
  const familiarHeadacheInstance = instanceMap.get("familiarHeadache");

  const painValue = painInstance ? watch(painInstance.path) : null;
  const familiarPainValue = familiarPainInstance ? watch(familiarPainInstance.path) : null;
  const familiarHeadacheValue = familiarHeadacheInstance
    ? watch(familiarHeadacheInstance.path)
    : undefined;

  const values: PalpationSitePainValues = {
    pain: painValue,
    familiarPain: familiarPainValue,
    familiarHeadache: siteConfig.hasHeadache ? familiarHeadacheValue : undefined,
  };

  const summaryState = computePalpationSummaryState(values);
  const summaryLabel = PALPATION_SUMMARY_LABELS[summaryState];

  // Check if familiar pain/headache and other follow-ups should be enabled (pain must be "yes")
  const isQuestionEnabled = (painType: string) => {
    if (painType === "pain") return true;
    return painValue === "yes";
  };

  // Handle header click
  const handleToggle = useCallback(() => {
    onExpandChange(!isExpanded);
  }, [isExpanded, onExpandChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggle();
      } else if (e.key === "Escape" && isExpanded) {
        e.preventDefault();
        onExpandChange(false);
        headerRef.current?.focus();
      }
    },
    [handleToggle, isExpanded, onExpandChange]
  );

  // Determine error styling
  const hasError = incompleteSite != null;
  const isIncompleteState = summaryState === "pain-only";

  // Get badge styling based on summary state
  const getBadgeStyle = (): string => {
    if (hasError || isIncompleteState) {
      return "bg-destructive/10 text-destructive border-destructive/30";
    }
    switch (summaryState) {
      case "familiar-pain":
      case "familiar-headache":
      case "both-familiar":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "no-pain":
      case "negative":
        return "bg-zinc-100 text-zinc-600 border-zinc-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div
      className={cn(
        "border rounded-md overflow-hidden transition-colors",
        hasError ? "border-destructive" : "border-border",
        className
      )}
    >
      {/* Header row */}
      <button
        ref={headerRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-left",
          "hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          hasError && "bg-destructive/5"
        )}
        aria-expanded={isExpanded}
        aria-controls={`palpation-content-${site}-${side}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-sm truncate">{getPalpationSiteLabel(site)}</span>
          {summaryLabel && (
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full border whitespace-nowrap",
                getBadgeStyle()
              )}
            >
              {summaryLabel}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded content */}
      <div
        id={`palpation-content-${site}-${side}`}
        className={cn(
          "overflow-hidden transition-all duration-200",
          isExpanded ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-3 py-2 space-y-2 border-t bg-muted/20">
          {PAIN_TYPE_ORDER.map((painType) => {
            // Check if this pain type applies to this site and mode
            if (!applicablePainTypes.includes(painType)) {
              return null;
            }

            const instance = instanceMap.get(painType);
            if (!instance) return null;

            const enabled = isQuestionEnabled(painType);
            const hasFieldError =
              incompleteSite && incompleteSite.missingQuestions.includes(painType);

            return (
              <div
                key={painType}
                className={cn(
                  "flex items-center justify-between gap-2",
                  hasFieldError && "rounded px-1 -mx-1 bg-destructive/10"
                )}
              >
                <span
                  className={cn(
                    "text-sm",
                    !enabled && "text-muted-foreground",
                    hasFieldError && "text-destructive"
                  )}
                >
                  {getPainTypeLabel(painType as PainType)}
                </span>
                <YesNoField
                  name={instance.path as FieldPath<FieldValues>}
                  disabled={!enabled}
                  className="gap-1"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
