import type { ReactNode } from "react";

interface FormSheetSectionProps {
  number: string;
  title: string;
  children?: ReactNode;
}

export function FormSheetSection({ number, title, children }: FormSheetSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-sm mt-3 mb-1 print:mt-2 print:mb-0.5 print:py-1 print:rounded-none">
        <span className="font-bold text-sm print:text-[8pt]">{number}.</span>
        <span className="text-xs font-medium tracking-wide print:text-[7pt]">{title}</span>
      </div>
      {children && <div className="pl-2 py-1">{children}</div>}
    </div>
  );
}
