import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import type { ReactNode } from "react";

interface Axis2DetailPanelProps {
  left: ReactNode;
  right: ReactNode;
  leftTitle?: string;
  rightTitle?: string;
  manualAnchor?: string;
}

/**
 * Split-view shell: two paper-sheet surfaces side-by-side (60/40).
 * Left sheet shows the patient's answers; right sheet shows the scoring formsheet.
 */
export function Axis2DetailPanel({
  left,
  right,
  leftTitle = "Antworten",
  rightTitle = "Bewertung",
  manualAnchor,
}: Axis2DetailPanelProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
      <section className="md:basis-3/5 md:min-w-0 bg-card border rounded-md shadow-sm p-5 rounded-tl-none">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-3">
          {leftTitle}
        </p>
        {left}
      </section>
      <section className="md:basis-2/5 md:min-w-0 bg-card border rounded-md shadow-sm p-5">
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
