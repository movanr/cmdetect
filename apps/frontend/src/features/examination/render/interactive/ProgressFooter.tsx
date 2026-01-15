/**
 * ProgressFooter - Shows completion button for the examination.
 */

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface ProgressFooterProps {
  /** Callback when completion button is clicked */
  onComplete: () => void;
  /** Optional className */
  className?: string;
}

export function ProgressFooter({
  onComplete,
  className,
}: ProgressFooterProps) {
  return (
    <div className={cn("", className)}>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onComplete}
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Keine weiteren Schmerzregionen
      </Button>
    </div>
  );
}
