import { createContext, useContext } from "react";

interface ExaminationViewContextValue {
  patientName?: string;
  patientDob?: string;
  clinicInternalId?: string;
  examinerName?: string;
  navigateToGuidedMode: () => void;
}

const ExaminationViewContext = createContext<ExaminationViewContextValue | null>(null);

export function ExaminationViewProvider({
  children,
  ...value
}: ExaminationViewContextValue & { children: React.ReactNode }) {
  return (
    <ExaminationViewContext.Provider value={value}>
      {children}
    </ExaminationViewContext.Provider>
  );
}

export function useExaminationView() {
  const ctx = useContext(ExaminationViewContext);
  if (!ctx) throw new Error("useExaminationView must be used within ExaminationViewProvider");
  return ctx;
}
