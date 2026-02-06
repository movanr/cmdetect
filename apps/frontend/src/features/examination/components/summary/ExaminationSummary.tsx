import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Download } from "lucide-react";
import { E1Summary } from "./E1Summary";
import { E2Summary } from "./E2Summary";
import { E3Summary } from "./E3Summary";
import { E4Summary } from "./E4Summary";
import { E5Summary } from "./E5Summary";
import { E9Summary } from "./E9Summary";

interface ExaminationSummaryProps {
  caseId: string;
}

export function ExaminationSummary({ caseId }: ExaminationSummaryProps) {
  const navigate = useNavigate();

  const handleNextStep = () => {
    navigate({ to: `/cases/${caseId}/evaluation` as string });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Untersuchungsergebnisse</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Als PDF exportieren
          </Button>
          <Button onClick={handleNextStep}>
            Weiter zur Auswertung
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <E1Summary />
        <E2Summary />
        <E3Summary />
        <E4Summary />
        <E5Summary />
        <E9Summary />

        <div className="flex justify-end pt-2 border-t">
          <Button onClick={handleNextStep}>
            Weiter zur Auswertung
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
