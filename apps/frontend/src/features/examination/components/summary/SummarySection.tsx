import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSectionBadge, getSectionCardTitle, type SectionId } from "@cmdetect/dc-tmd";
import type { ReactNode } from "react";

interface SummarySectionProps {
  sectionId: SectionId;
  children: ReactNode;
}

export function SummarySection({ sectionId, children }: SummarySectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{getSectionBadge(sectionId)}</Badge>
          <CardTitle>{getSectionCardTitle(sectionId)}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
