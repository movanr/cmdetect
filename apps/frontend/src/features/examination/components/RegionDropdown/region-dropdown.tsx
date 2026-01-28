/**
 * RegionDropdown - Collapsible dropdown for pain assessment in a single anatomical region.
 *
 * Features:
 * - Header row with region name, summary badge, and chevron icon
 * - Expanded content with yes/no pain questions stacked vertically
 * - Controlled expansion via isExpanded + onExpandChange props
 * - Keyboard navigation: Enter/Space toggles, Escape closes
 * - Error state styling when region has incomplete data
 */

import { ChevronDown } from "lucide-react";
import React, { useCallback, useRef } from "react";
import { useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { YesNoField } from "../inputs/YesNoField";
import type { IncompleteRegion } from "../../form/validation";
import { getRegionLabel, getPainTypeLabel } from "../../labels";
import { getMovementPainQuestions, type PainType, type Region, type Side } from "../../model/regions";
import type { QuestionInstance } from "../../projections/to-instances";
import {
  computeSummaryState,
  SUMMARY_LABELS,
  type RegionPainValues,
} from "./types";

export interface RegionDropdownProps {
  /** The region this dropdown represents */
  region: Region;
  /** Which side (left/right) */
  side: Side;
  /** Instances for this region's pain questions */
  instances: QuestionInstance[];
  /** Whether the dropdown is expanded */
  isExpanded: boolean;
  /** Callback when expansion state changes */
  onExpandChange: (expanded: boolean) => void;
  /** Whether this region has incomplete data (validation error) */
  incompleteRegion?: IncompleteRegion;
  /** Optional className */
  className?: string;
}

/** Pain type display order matching getMovementPainQuestions output */
const PAIN_TYPE_ORDER = ["pain", "familiarPain", "familiarHeadache"] as const;

export function RegionDropdown({
  region,
  side,
  instances,
  isExpanded,
  onExpandChange,
  incompleteRegion,
  className,
}: RegionDropdownProps) {
  const { watch } = useFormContext();
  const headerRef = useRef<React.ComponentRef<"button">>(null);

  // Get the applicable pain types for this region
  const applicablePainTypes = getMovementPainQuestions(region);

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

  const values: RegionPainValues = {
    pain: painValue,
    familiarPain: familiarPainValue,
    familiarHeadache: familiarHeadacheValue,
  };

  const summaryState = computeSummaryState(values);
  const summaryLabel = SUMMARY_LABELS[summaryState];

  // Check if familiar pain/headache should be enabled (pain must be "yes")
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
  const hasError = incompleteRegion != null;
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
        aria-controls={`region-content-${region}-${side}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-sm truncate">{getRegionLabel(region)}</span>
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
        id={`region-content-${region}-${side}`}
        className={cn(
          "overflow-hidden transition-all duration-200",
          isExpanded ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-3 py-2 space-y-2 border-t bg-muted/20">
          {PAIN_TYPE_ORDER.map((painType) => {
            // Check if this pain type applies to this region
            if (!(applicablePainTypes as readonly string[]).includes(painType)) {
              return null;
            }

            const instance = instanceMap.get(painType);
            if (!instance) return null;

            const enabled = isQuestionEnabled(painType);
            const hasFieldError =
              incompleteRegion &&
              ((painType === "pain" && incompleteRegion.missingPain) ||
                (painType === "familiarPain" && incompleteRegion.missingFamiliarPain) ||
                (painType === "familiarHeadache" && incompleteRegion.missingFamiliarHeadache));

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
