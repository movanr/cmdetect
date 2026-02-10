/**
 * Examination Persistence Context
 *
 * Provides persistence state and methods to child routes via context.
 * Needed because TanStack Router's <Outlet> cannot pass props to children.
 *
 * Also computes anamnesis-based relevance: which examination sections are
 * diagnostically relevant based on SQ questionnaire answers.
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useExaminationPersistence } from "../hooks/use-examination-persistence";
import type { SectionId } from "../sections/registry";
import type { ExaminationStatus } from "../hooks/use-examination-response";
import { useQuestionnaireResponses } from "@/features/questionnaire-viewer";
import { QUESTIONNAIRE_ID } from "@cmdetect/questionnaires";
import {
  getRelevantExaminationItems,
  type AnamnesisRelevanceResult,
} from "@cmdetect/dc-tmd";
import type { SectionId as DcTmdSectionId, DiagnosisId } from "@cmdetect/dc-tmd";

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
  /** Examination sections relevant based on SQ anamnesis (null if SQ not yet loaded) */
  relevantSections: DcTmdSectionId[] | null;
  /** Diagnoses still possible after anamnesis (null if SQ not yet loaded) */
  possibleDiagnoses: DiagnosisId[] | null;
  /** Diagnoses ruled out by anamnesis (null if SQ not yet loaded) */
  ruledOutDiagnoses: DiagnosisId[] | null;
  /** Check if a section is relevant (returns true when data not yet loaded) */
  isSectionRelevant: (sectionId: DcTmdSectionId) => boolean;
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

  // Fetch questionnaire responses — shares TanStack Query cache with parent route
  const { data: responses } = useQuestionnaireResponses(patientRecordId);

  // Extract SQ answers and compute relevance
  const relevance = useMemo((): AnamnesisRelevanceResult | null => {
    if (!responses) return null;
    const sqResponse = responses.find(
      (r) => r.questionnaireId === QUESTIONNAIRE_ID.SQ
    );
    if (!sqResponse) return null;
    return getRelevantExaminationItems(sqResponse.answers);
  }, [responses]);

  const isSectionRelevant = useMemo(() => {
    if (!relevance) return () => true; // safe default when data not loaded
    const relevantSet = new Set(relevance.relevantSections);
    return (sectionId: DcTmdSectionId) => relevantSet.has(sectionId);
  }, [relevance]);

  const value = useMemo(
    (): ExaminationPersistenceContextValue => ({
      ...persistence,
      relevantSections: relevance?.relevantSections ?? null,
      possibleDiagnoses: relevance?.possibleDiagnoses ?? null,
      ruledOutDiagnoses: relevance?.ruledOutDiagnoses ?? null,
      isSectionRelevant,
    }),
    [persistence, relevance, isSectionRelevant]
  );

  return (
    <ExaminationPersistenceContext.Provider value={value}>
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
