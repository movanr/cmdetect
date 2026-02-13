/**
 * Examination Persistence Context
 *
 * Provides persistence state and methods to child routes via context.
 * Needed because TanStack Router's <Outlet> cannot pass props to children.
 */

import { createContext, useContext, type ReactNode } from "react";
import { useExaminationPersistence } from "../hooks/use-examination-persistence";
import type { SectionId } from "../sections/registry";
import type { ExaminationStatus } from "../hooks/use-examination-response";

interface ExaminationPersistenceContextValue {
  /** Save a section to backend and mark it completed */
  saveSection: (sectionId: SectionId) => Promise<void>;
  /** Save current form data to backend as draft (no section completion) */
  saveDraft: () => Promise<void>;
  /** Complete the entire examination */
  completeExamination: () => Promise<void>;
  /** Whether a save operation is in progress */
  isSaving: boolean;
  /** List of completed section IDs */
  completedSections: SectionId[];
  /** Whether initial hydration is complete */
  isHydrated: boolean;
  /** Current examination status */
  status: ExaminationStatus | null;
}

const ExaminationPersistenceContext =
  createContext<ExaminationPersistenceContextValue | null>(null);

interface ExaminationPersistenceProviderProps {
  patientRecordId: string;
  children: ReactNode;
}

export function ExaminationPersistenceProvider({
  patientRecordId,
  children,
}: ExaminationPersistenceProviderProps) {
  const persistence = useExaminationPersistence({ patientRecordId });

  return (
    <ExaminationPersistenceContext.Provider value={persistence}>
      {children}
    </ExaminationPersistenceContext.Provider>
  );
}

/**
 * Hook to access examination persistence context.
 * Must be used within ExaminationPersistenceProvider.
 */
export function useExaminationPersistenceContext(): ExaminationPersistenceContextValue {
  const context = useContext(ExaminationPersistenceContext);
  if (!context) {
    throw new Error(
      "useExaminationPersistenceContext must be used within ExaminationPersistenceProvider"
    );
  }
  return context;
}
