/**
 * SafetyWarningBanner - Prominent warning display for safety-critical instructions.
 *
 * Two levels:
 * - caution: Amber/yellow for important but non-critical warnings
 * - critical: Red for safety-critical warnings that must not be ignored
 */

import { cn } from "@/lib/utils";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import type { SafetyWarning, WarningLevel } from "../../content/types";

interface SafetyWarningBannerProps {
  /** The warning to display */
  warning: SafetyWarning;
  /** Optional className */
  className?: string;
}

const LEVEL_STYLES: Record<WarningLevel, { container: string; icon: string }> = {
  caution: {
    container: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200",
    icon: "text-amber-600 dark:text-amber-400",
  },
  critical: {
    container: "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/50 dark:border-red-800 dark:text-red-200",
    icon: "text-red-600 dark:text-red-400",
  },
};

/**
 * Displays a prominent warning banner for safety-critical instructions.
 */
export function SafetyWarningBanner({ warning, className }: SafetyWarningBannerProps) {
  const { message, level } = warning;
  const styles = LEVEL_STYLES[level];
  const Icon = level === "critical" ? ShieldAlert : AlertTriangle;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium",
        styles.container,
        className
      )}
      role="alert"
    >
      <Icon className={cn("h-4 w-4 shrink-0", styles.icon)} />
      <span>{message}</span>
    </div>
  );
}

interface SafetyWarningsProps {
  /** Array of warnings to display */
  warnings: SafetyWarning[];
  /** Optional className for the container */
  className?: string;
}

/**
 * Renders multiple safety warnings in a stack.
 */
export function SafetyWarnings({ warnings, className }: SafetyWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {warnings.map((warning, index) => (
        <SafetyWarningBanner key={index} warning={warning} />
      ))}
    </div>
  );
}
