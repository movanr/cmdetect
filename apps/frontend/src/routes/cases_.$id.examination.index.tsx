/**
 * Examination Index Route
 *
 * Renders the form sheet as the default examination view with an optional
 * entry point into the guided step-by-step mode.
 */

import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { DCTMDFormSheet, useExaminationPersistenceContext } from "../features/examination";
import { useExaminationView } from "../features/examination/contexts/ExaminationViewContext";

export const Route = createFileRoute("/cases_/$id/examination/")({
  component: ExaminationFormSheetView,
});

function ExaminationFormSheetView() {
  const { id } = Route.useParams();
  const { patientName, patientDob, clinicInternalId, examinerName } = useExaminationView();
  const { status } = useExaminationPersistenceContext();
  const isCompleted = status === "completed";

  return (
    <div>
      {/* Guided mode entry point */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center gap-5 rounded-lg border border-primary/20 bg-primary/5 px-5 py-4 print:hidden">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-semibold">Schritt-für-Schritt-Untersuchung</p>
          <p className="text-sm text-muted-foreground">
            DC/TMD-Untersuchungsprotokoll als integrierte Anweisungen, Erläuterungen und Abbildungen
            an allen Untersuchungsschritten sowie in vollständiger Form als Nachschlagewerk.
          </p>
        </div>
        <Button
          variant={isCompleted ? "outline" : "default"}
          className="shrink-0"
          asChild
        >
          <Link to="/cases/$id/examination/e1" params={{ id }}>
            {isCompleted ? "Untersuchung erneut öffnen" : "Untersuchung starten"}
          </Link>
        </Button>
      </div>

      <DCTMDFormSheet
        patientName={patientName}
        patientDob={patientDob}
        clinicInternalId={clinicInternalId}
        examinerName={examinerName}
      />
    </div>
  );
}
