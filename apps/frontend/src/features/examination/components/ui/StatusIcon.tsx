import { Check, SkipForward } from "lucide-react";

export type StepStatus = "completed" | "skipped" | "pending" | "active";

export function StatusIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case "completed":
      return <Check className="h-4 w-4 text-green-600" />;
    case "skipped":
      return <SkipForward className="h-4 w-4 text-muted-foreground" />;
    default:
      return null;
  }
}
