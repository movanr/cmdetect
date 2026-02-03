/**
 * TextSegmentRenderer - Renders styled text segments for clinical instructions.
 *
 * Supports DC-TMD protocol text conventions:
 * - Verbatim: Bold text that must be stated exactly
 * - Flexible: Normal text where intent matters
 * - Optional: Text in [brackets] that may be included
 * - Examiner-only: Instructions not spoken to patient
 */

import { cn } from "@/lib/utils";
import type { PatientScript, TextSegment } from "../../content/types";
import { isSegmentedScript } from "../../content/types";

interface TextSegmentRendererProps {
  /** Script content - either simple string or array of styled segments */
  script: PatientScript;
  /** Optional className for the container */
  className?: string;
}

/**
 * Render a single text segment with appropriate styling
 */
function renderSegment(segment: TextSegment, index: number) {
  const { text, style } = segment;

  switch (style) {
    case "verbatim":
      // Bold - must be stated exactly
      return (
        <strong key={index} className="font-semibold text-foreground">
          {text}
        </strong>
      );

    case "optional":
      // Bracketed optional text
      return (
        <span key={index} className="text-muted-foreground/80">
          [{text.replace(/^\[|\]$/g, "")}]
        </span>
      );

    case "examiner-only":
      // Not spoken to patient - distinct styling
      return (
        <span
          key={index}
          className="text-xs text-muted-foreground italic bg-muted/50 px-1 rounded"
        >
          &lt;{text.replace(/^<|>$/g, "")}&gt;
        </span>
      );

    case "flexible":
    default:
      // Normal text - intent matters, wording can vary
      return <span key={index}>{text}</span>;
  }
}

/**
 * Renders patient script with styled text segments.
 *
 * Simple strings are rendered as-is.
 * Arrays of TextSegments are rendered with appropriate styling for each segment.
 */
export function TextSegmentRenderer({ script, className }: TextSegmentRendererProps) {
  if (!isSegmentedScript(script)) {
    // Simple string - render as-is
    return <span className={className}>{script}</span>;
  }

  // Array of segments - render each with styling
  return <span className={cn("inline", className)}>{script.map(renderSegment)}</span>;
}
