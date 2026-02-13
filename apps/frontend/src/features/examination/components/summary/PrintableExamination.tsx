/**
 * PrintableExamination - Clean print layout for examination export
 *
 * Reuses the existing E*Summary components (which read from FormContext)
 * with CSS overrides to flatten the Card/Badge UI for print output.
 * Matches the PrintableAnamnesis visual style.
 */

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

interface PrintableExaminationProps {
  patientName?: string;
  patientDob?: string;
  clinicInternalId?: string;
}

export function PrintableExamination({
  patientName,
  patientDob,
  clinicInternalId,
}: PrintableExaminationProps) {
  const exportDate = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="max-w-[210mm] mx-auto px-8 py-6 bg-white text-black print:p-0 print:max-w-none">
      {/* Header */}
      <div className="border-b-2 border-black pb-3 mb-5">
        <h1 className="text-lg font-bold mb-2">Untersuchungsergebnisse</h1>
        <div className="flex justify-between text-sm">
          <div className="space-y-0.5">
            {patientName && (
              <div>
                <span className="text-gray-500">Patient: </span>
                <span className="font-medium">{patientName}</span>
              </div>
            )}
            {clinicInternalId && (
              <div>
                <span className="text-gray-500">Patienten-ID: </span>
                <span className="font-medium">{clinicInternalId}</span>
              </div>
            )}
          </div>
          <div className="space-y-0.5 text-right">
            {patientDob && (
              <div>
                <span className="text-gray-500">Geb.-Datum: </span>
                <span className="font-medium">{patientDob}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Datum: </span>
              <span className="font-medium">{exportDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sections with CSS overrides to flatten Card/Badge UI */}
      <div
        className={[
          "space-y-4",
          // Flatten Card: remove border, shadow, rounded corners, background, padding
          "[&_[data-slot=card]]:border-0 [&_[data-slot=card]]:shadow-none [&_[data-slot=card]]:rounded-none [&_[data-slot=card]]:bg-transparent [&_[data-slot=card]]:py-0 [&_[data-slot=card]]:gap-2",
          // Flatten CardHeader: remove padding
          "[&_[data-slot=card-header]]:px-0",
          // Flatten CardContent: remove padding
          "[&_[data-slot=card-content]]:px-0",
          // Table: prevent horizontal scroll, allow text wrapping
          "[&_[data-slot=table-container]]:overflow-visible",
          "[&_[data-slot=table-head]]:whitespace-normal",
          "[&_[data-slot=table-cell]]:whitespace-normal",
        ].join(" ")}
      >
        <section className="border-b border-gray-200 pb-3">
          <E1Summary />
        </section>
        <section className="border-b border-gray-200 pb-3">
          <E2Summary />
        </section>
        <section className="border-b border-gray-200 pb-3">
          <E3Summary />
        </section>
        <section className="border-b border-gray-200 pb-3">
          <E4Summary />
        </section>
        <section className="border-b border-gray-200 pb-3">
          <E5Summary />
        </section>
        <section className="border-b border-gray-200 pb-3">
          <E6Summary />
        </section>
        <section className="border-b border-gray-200 pb-3">
          <E7Summary />
        </section>
        <section className="border-b border-gray-200 pb-3">
          <E8Summary />
        </section>
        <section className="border-b border-gray-200 pb-3">
          <E9Summary />
        </section>
        <section className="border-b border-gray-200 pb-3">
          <E10Summary />
        </section>
        <section className="pb-3">
          <E11Summary />
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-300 pt-2 mt-6 text-xs text-gray-400">
        Dieser Ausdruck dient der klinischen Dokumentation. Alle Angaben basieren auf der
        klinischen Untersuchung.
      </footer>
    </div>
  );
}
