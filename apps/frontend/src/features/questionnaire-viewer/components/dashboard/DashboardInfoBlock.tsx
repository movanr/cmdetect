/**
 * DashboardInfoBlock — Collapsible info callout for axis introductions.
 *
 * Lighter than the SQ wizard's SQInstructionBlock: renders a title and
 * bullet points rather than numbered procedural steps. Optionally links
 * to a source document (e.g., the scoring manual).
 */

import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronDown, ChevronRight, Info } from "lucide-react";
import { useState } from "react";
import type { DashboardAxisInfo } from "../../content/dashboard-instructions";

interface DashboardInfoBlockProps {
  info: DashboardAxisInfo;
  /** Whether to start expanded (default: false) */
  defaultExpanded?: boolean;
  className?: string;
}

export function DashboardInfoBlock({
  info,
  defaultExpanded = false,
  className,
}: DashboardInfoBlockProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className={cn(
        "rounded-lg border border-muted bg-muted/30",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          {info.title}
        </span>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3">
          <ul className="pl-7 space-y-1">
            {info.items.map((item, i) => (
              <li
                key={i}
                className="text-xs text-muted-foreground list-disc"
              >
                {item}
              </li>
            ))}
          </ul>

          {info.source && (
            <div className="mt-2 pl-7">
              <Link
                to={info.source.to}
                hash={info.source.anchor}
                onClick={() => sessionStorage.setItem("docs-return-url", window.location.pathname)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                <BookOpen className="h-3 w-3" />
                <span>{info.source.label}</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
