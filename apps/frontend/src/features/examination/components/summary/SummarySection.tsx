import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSectionCardTitle, type SectionId } from "@cmdetect/dc-tmd";
import type { ReactNode } from "react";

interface SummarySectionProps {
  sectionId: SectionId;
  children: ReactNode;
}

export function SummarySection({ sectionId, children }: SummarySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{getSectionCardTitle(sectionId)}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
