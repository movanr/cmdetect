interface FormSheetHeaderProps {
  patientName?: string;
  patientDob?: string;
  clinicInternalId?: string;
  examDate?: string;
}

export function FormSheetHeader({
  patientName,
  patientDob,
  clinicInternalId,
  examDate,
}: FormSheetHeaderProps) {
  return (
    <>
      {/* Title bar */}
      <div className="bg-slate-800 text-white px-4 py-2 rounded-t-md print:rounded-none print:py-1.5">
        <h2 className="text-sm font-bold text-center tracking-wide print:text-[10pt]">
          DC/TMD Untersuchungsbogen
        </h2>
      </div>

      {/* Patient info bar */}
      <div className="bg-slate-50 border border-t-0 border-slate-200 px-3 py-2 grid grid-cols-3 gap-3 text-xs print:text-[7pt] print:py-1 print:gap-2">
        <div>
          <span className="text-slate-400">Datum: </span>
          <span className="font-medium text-slate-700">{examDate ?? "–"}</span>
        </div>
        <div>
          <span className="text-slate-400">Patient: </span>
          <span className="font-medium text-slate-700">
            {patientName ?? clinicInternalId ?? "–"}
          </span>
          {patientDob && (
            <span className="text-slate-400 ml-1">(*{patientDob})</span>
          )}
        </div>
        <div>
          {clinicInternalId && patientName && (
            <>
              <span className="text-slate-400">ID: </span>
              <span className="font-medium text-slate-700">{clinicInternalId}</span>
            </>
          )}
        </div>
      </div>
    </>
  );
}
