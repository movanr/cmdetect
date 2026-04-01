import { FormSheetProvider } from "./FormSheetContext";
import { FormSheetHeader } from "./FormSheetHeader";
import { FsE1 } from "./sections/FsE1";
import { FsE2 } from "./sections/FsE2";
import { FsE3 } from "./sections/FsE3";
import { FsE4 } from "./sections/FsE4";
import { FsE5 } from "./sections/FsE5";
import { FsE6 } from "./sections/FsE6";
import { FsE7 } from "./sections/FsE7";
import { FsE8 } from "./sections/FsE8";
import { FsE9 } from "./sections/FsE9";
import { FsE10 } from "./sections/FsE10";
import { FsE11 } from "./sections/FsE11";

export interface DCTMDFormSheetProps {
  readOnly?: boolean;
  patientName?: string;
  patientDob?: string;
  clinicInternalId?: string;
  examDate?: string;
  examinerName?: string;
}

export function DCTMDFormSheet({
  readOnly = false,
  patientName,
  patientDob,
  clinicInternalId,
  examDate,
  examinerName,
}: DCTMDFormSheetProps) {
  const displayDate =
    examDate ??
    new Date().toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <FormSheetProvider readOnly={readOnly}>
      <div className="max-w-4xl mx-auto print:max-w-none">
        <FormSheetHeader
          patientName={patientName}
          patientDob={patientDob}
          clinicInternalId={clinicInternalId}
          examDate={displayDate}
          examinerName={examinerName}
        />

        <div className="bg-white border border-t-0 border-slate-200 rounded-b-md p-3 print:border-0 print:p-0 print:rounded-none">
          <FsE1 />
          <FsE2 />
          <FsE3 />
          <FsE4 />
          <FsE5 />

          {/* Print page break between page 1 (E1-E5) and page 2 (E6-E11) */}
          <div className="hidden print:block print:break-before-page" />

          <FsE6 />
          <FsE7 />
          <FsE8 />
          <FsE9 />
          <FsE10 />
          <FsE11 />
        </div>

        {/* Copyright footer */}
        <div className="text-center mt-3 space-y-0.5 print:mt-1">
          <p className="text-[10px] text-slate-400 print:text-[5pt]">
            Copyright International RDC/TMD Consortium Network.
          </p>
          <p className="text-[10px] text-slate-400 print:text-[5pt]">
            Deutsche Übersetzung: Asendorf A, Eberhard L, Universitätsklinikum Heidelberg &
            Schierz O, Universitätsmedizin Leipzig. Version 12/2018.
          </p>
        </div>
      </div>
    </FormSheetProvider>
  );
}
