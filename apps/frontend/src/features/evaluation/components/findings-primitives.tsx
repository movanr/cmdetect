/**
 * Shared UI primitives for findings display in the Befundübersicht.
 *
 * - FindingRow: Badge + label + value atom
 * - InlineField: label: value span for inside bordered cards
 * - BilateralLayout: two-column Rechte/Linke Seite grid
 */

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SIDES, type Side } from "@cmdetect/dc-tmd";

/** Badge + label: value row — the repeating atom in all findings sections. */
export function FindingRow({
  badge,
  label,
  value,
  className,
}: {
  badge: string;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline gap-1.5 text-xs", className)}>
      <Badge variant="outline" className="text-xs font-mono px-1 py-0 shrink-0">
        {badge}
      </Badge>
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

/** Compact label: value span for use inside bordered cards (flex-wrap context). */
export function InlineField({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-xs">
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium">{value}</span>
    </span>
  );
}

/** Two-column grid with "Rechte Seite" / "Linke Seite" headers. */
export function BilateralLayout({
  title,
  children,
}: {
  title: string;
  children: (side: Side) => ReactNode;
}) {
  return (
    <div className="space-y-3 pt-3 border-t mt-3">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {(["right", "left"] as const).map((side) => (
          <div key={side} className="space-y-1.5">
            <div className="text-xs font-medium">{SIDES[side]}</div>
            {children(side)}
          </div>
        ))}
      </div>
    </div>
  );
}
