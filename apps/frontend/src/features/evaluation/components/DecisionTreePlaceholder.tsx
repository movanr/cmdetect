/**
 * DecisionTreePlaceholder — Placeholder card for future decision tree visualization.
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GitBranch } from "lucide-react";

export function DecisionTreePlaceholder() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-muted-foreground" />
          Entscheidungsbaum
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Der interaktive Entscheidungsbaum zur schrittweisen Diagnoseableitung
          wird in einer zukünftigen Version verfügbar sein.
        </p>
      </CardContent>
    </Card>
  );
}
