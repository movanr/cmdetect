import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import type { ReactNode } from "react";

interface Axis2DetailPanelProps {
  left: ReactNode;
  right: ReactNode;
  leftTitle?: string;
  rightTitle?: string;
  manualAnchor?: string;
  /** Split variant. "default" = 70/30, "balanced" = 50/50 (used for GCPS). */
  split?: "default" | "balanced";
}

const LEFT_BASIS = {
  default: "md:basis-[70%]",
  balanced: "md:basis-[60%]",
} as const;

const RIGHT_BASIS = {
  default: "md:basis-[30%]",
  balanced: "md:basis-[40%]",
} as const;

/**
 * Split-view shell: two paper-sheet surfaces side-by-side.
 * Left sheet shows the patient's answers; right sheet shows the scoring formsheet.
 * GCPS uses "balanced" (60/40) to fit its BP + CSI + Grade flow.
 */
export function Axis2DetailPanel({
  left,
  right,
  leftTitle = "Antworten",
  rightTitle = "Bewertung",
  manualAnchor,
  split = "default",
}: Axis2DetailPanelProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
      <section
        className={`${LEFT_BASIS[split]} md:min-w-0 bg-card border rounded-md shadow-sm p-5 rounded-tl-none`}
      >
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-3">
          {leftTitle}
        </p>
        {left}
      </section>
      <section
        className={`${RIGHT_BASIS[split]} md:min-w-0 bg-card border rounded-md shadow-sm p-5`}
      >
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            {rightTitle}
          </p>
          {manualAnchor && (
            <Link
              to="/docs/scoring-manual"
              hash={manualAnchor}
              onClick={() => {
                sessionStorage.setItem("docs-return-url", window.location.pathname);
              }}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary hover:underline"
            >
              <BookOpen className="h-3 w-3" />
              Scoring-Anleitung
            </Link>
          )}
        </div>
        {right}
      </section>
    </div>
  );
}
