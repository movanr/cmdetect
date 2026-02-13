import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBackgroundPrint } from "@/hooks/use-background-print";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Pencil, Printer } from "lucide-react";
import { useExaminationPersistenceContext } from "../../contexts/ExaminationPersistenceContext";
import { E1Summary } from "./E1Summary";
import { E2Summary } from "./E2Summary";
import { E3Summary } from "./E3Summary";
import { E4Summary } from "./E4Summary";
import { E5Summary } from "./E5Summary";
import { E6Summary } from "./E6Summary";
import { E7Summary } from "./E7Summary";
import { E8Summary } from "./E8Summary";
import { E9Summary } from "./E9Summary";
import { E10Summary } from "./E10Summary";
import { E11Summary } from "./E11Summary";

interface ExaminationSummaryProps {
  caseId: string;
}

export function ExaminationSummary({ caseId }: ExaminationSummaryProps) {
  const navigate = useNavigate();
  const { print, isPrinting } = useBackgroundPrint();
  const { reopenExamination, isSaving } = useExaminationPersistenceContext();
  const [showReopenDialog, setShowReopenDialog] = useState(false);

  const handleNextStep = () => {
    navigate({ to: `/cases/${caseId}/evaluation` as string });
  };

  const handleReopenConfirm = async () => {
    await reopenExamination();
    navigate({ to: `/cases/${caseId}/examination/e1` as string });
  };

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Untersuchungsergebnisse</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowReopenDialog(true)}
            disabled={isSaving}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Bearbeiten
          </Button>
          <Button
            variant="outline"
            onClick={() => print(`/cases/${caseId}/print-examination`)}
            disabled={isPrinting}
          >
            <Printer className="mr-2 h-4 w-4" />
            {isPrinting ? "Wird gedruckt…" : "Drucken / PDF"}
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
        <E6Summary />
        <E7Summary />
        <E8Summary />
        <E9Summary />
        <E10Summary />
        <E11Summary />

        <div className="flex justify-end pt-2 border-t">
          <Button onClick={handleNextStep}>
            Weiter zur Auswertung
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>

    <AlertDialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Untersuchung bearbeiten</AlertDialogTitle>
          <AlertDialogDescription>
            Die Untersuchung wird zur Bearbeitung geöffnet. Die Auswertung wird
            gesperrt, bis die Untersuchung erneut abgeschlossen wird.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={handleReopenConfirm}>
            Bearbeiten
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
