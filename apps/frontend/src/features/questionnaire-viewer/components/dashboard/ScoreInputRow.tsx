import type { ReactNode } from "react";

interface ScoreInputRowProps {
  label: string;
  rangeHint?: string;
  formula?: ReactNode;
  children: ReactNode;
}

export function ScoreInputRow({ label, rangeHint, formula, children }: ScoreInputRowProps) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="flex items-baseline gap-1.5 w-32 shrink-0">
        <span className="text-sm font-medium">{label}</span>
        {rangeHint && (
          <span className="text-[11px] text-muted-foreground">({rangeHint})</span>
        )}
      </div>
      <div className="shrink-0">{children}</div>
      {formula && (
        <div className="text-[11px] text-muted-foreground min-w-0">{formula}</div>
      )}
    </div>
  );
}
