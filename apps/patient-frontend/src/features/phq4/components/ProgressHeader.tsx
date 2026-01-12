/**
 * Simple progress indicator for PHQ-4
 * Shows "Question X of 4" with progress bar
 */

import { Progress } from "@/components/ui/progress";

type ProgressHeaderProps = {
  current: number;
  total: number;
};

export function ProgressHeader({ current, total }: ProgressHeaderProps) {
  const percentage = Math.round(((current - 1) / total) * 100);

  return (
    <div className="space-y-2">
      <Progress value={percentage} className="h-2" />
      <p className="text-sm text-muted-foreground text-center">
        Frage {current} von {total}
      </p>
    </div>
  );
}
