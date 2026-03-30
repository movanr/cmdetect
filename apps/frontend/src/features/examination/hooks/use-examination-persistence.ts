/**
 * Examination Persistence Orchestration Hook
 *
 * Coordinates backend persistence via debounced auto-save:
 * - Hydrates form from backend on mount
 * - Auto-saves to backend on form changes (debounced 3s)
 * - Flushes pending save on unmount (SPA navigation keeps fetch alive)
 * - Saves immediately on section completion, examination completion, or blocker "save and leave"
 *
 * Status model: once an examination is completed, its status stays "completed".
 * Subsequent edits update the data in place without changing the status.
 * This avoids the reopen/re-complete dance and its associated race conditions.
 */

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { useFormContext } from "react-hook-form";
import type { FormValues } from "../form/use-examination-form";
import { SECTION_IDS, type SectionId } from "../sections/registry";
import { useExaminationResponse, type ExaminationStatus } from "./use-examination-response";
import { useCompleteExamination, useUpsertExamination } from "./use-save-examination";

const AUTO_SAVE_DELAY_MS = 3000;

interface UseExaminationPersistenceOptions {
  patientRecordId: string;
  examinedBy: string;
}

export interface UseExaminationPersistenceResult {
  /** Save a section to backend and mark it completed */
  saveSection: (sectionId: SectionId) => Promise<void>;
  /** Complete the entire examination */
  completeExamination: () => Promise<void>;
  /** Whether a save operation is in progress */
  isSaving: boolean;
  /** List of completed section IDs */
  completedSections: SectionId[];
  /** Whether initial hydration is complete */
  isHydrated: boolean;
  /** Ref tracking whether there are unsaved backend changes */
  hasUnsavedBackendChangesRef: MutableRefObject<boolean>;
  /** Current examination status */
  status: ExaminationStatus | null;
}

export function useExaminationPersistence({
  patientRecordId,
  examinedBy,
}: UseExaminationPersistenceOptions): UseExaminationPersistenceResult {
  const form = useFormContext<FormValues>();
  const [isHydrated, setIsHydrated] = useState(false);
  const [completedSections, setCompletedSections] = useState<SectionId[]>([]);
  const hasUnsavedBackendChangesRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref mirrors to avoid stale closures in watch/timer callbacks
  const completedSectionsRef = useRef<SectionId[]>([]);
  const backendStatusRef = useRef<ExaminationStatus | null>(null);

  // Backend queries
  const { data: backendResponse, isFetched } = useExaminationResponse(patientRecordId);

  const upsertMutation = useUpsertExamination(patientRecordId);
  const completeMutation = useCompleteExamination(patientRecordId);

  const isSaving = upsertMutation.isPending || completeMutation.isPending;

  // Hydration: load form data from backend (one-time initialization)
  useEffect(() => {
    if (isHydrated || !isFetched) return;

    if (backendResponse?.responseData) {
      form.reset(backendResponse.responseData);
      const sections = backendResponse.completedSections;
      setCompletedSections(sections); // eslint-disable-line react-hooks/set-state-in-effect -- one-time hydration
      completedSectionsRef.current = sections;
    }

    setIsHydrated(true);
  }, [isFetched, isHydrated, backendResponse, form]);

  // Build upsert params from current state, preserving backend status
  const buildUpsertParams = useCallback(() => {
    const formValues = form.getValues();
    const sections = completedSectionsRef.current;
    // Preserve backend status (e.g. "completed") — only compute if no backend record yet
    const status: ExaminationStatus =
      backendStatusRef.current ?? (sections.length === 0 ? "draft" : "in_progress");
    return {
      patientRecordId,
      examinedBy,
      responseData: formValues,
      status,
      completedSections: sections,
    };
  }, [form, patientRecordId, examinedBy]);

  // Cancel any pending debounce timer
  const cancelDebounce = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  // Refs for latest values — lets the auto-save effect access current
  // callbacks without re-subscribing on every cache update.
  const buildUpsertParamsRef = useRef(buildUpsertParams);
  const upsertMutationRef = useRef(upsertMutation);
  const examinedByRef = useRef(examinedBy);

  // Sync refs in effect (react-hooks/rules-of-hooks forbids ref writes during render)
  useEffect(() => {
    backendStatusRef.current = backendResponse?.status ?? null;
    buildUpsertParamsRef.current = buildUpsertParams;
    upsertMutationRef.current = upsertMutation;
    examinedByRef.current = examinedBy;
  }, [backendResponse?.status, buildUpsertParams, upsertMutation, examinedBy]);

  // Save immediately when Behandler changes (not debounced)
  const prevExaminedByRef = useRef(examinedBy);
  useEffect(() => {
    if (!isHydrated || !examinedBy) return;
    if (prevExaminedByRef.current === examinedBy) return;
    prevExaminedByRef.current = examinedBy;

    cancelDebounce();
    upsertMutationRef.current.mutate(buildUpsertParamsRef.current());
    hasUnsavedBackendChangesRef.current = false;
  }, [examinedBy, isHydrated, cancelDebounce]);

  // Auto-save to backend on form changes (debounced).
  // Effect only re-runs when isHydrated changes (once), not on cache updates.
  useEffect(() => {
    if (!isHydrated) return;

    const subscription = form.watch(() => {
      hasUnsavedBackendChangesRef.current = true;

      cancelDebounce();

      debounceTimerRef.current = setTimeout(async () => {
        // Skip save if no Behandler selected (required field)
        if (!examinedByRef.current) return;
        try {
          await upsertMutationRef.current.mutateAsync(buildUpsertParamsRef.current());
          hasUnsavedBackendChangesRef.current = false;
        } catch (error) {
          console.warn("Auto-save failed:", error);
        }
      }, AUTO_SAVE_DELAY_MS);
    });

    return () => {
      subscription.unsubscribe();
      cancelDebounce();
      // Flush: if there are unsaved changes, fire an immediate save.
      // SPA navigation keeps the fetch alive so this reliably completes.
      if (hasUnsavedBackendChangesRef.current && examinedByRef.current) {
        upsertMutationRef.current.mutate(buildUpsertParamsRef.current());
      }
    };
  }, [isHydrated, form, cancelDebounce]);

  // Save section to backend and mark it completed
  const saveSection = useCallback(
    async (sectionId: SectionId) => {
      cancelDebounce();

      const formValues = form.getValues();
      const newCompletedSections = completedSections.includes(sectionId)
        ? completedSections
        : [...completedSections, sectionId];

      // Preserve backend status (e.g. "completed")
      const status: ExaminationStatus =
        backendStatusRef.current ?? (newCompletedSections.length === 0 ? "draft" : "in_progress");

      await upsertMutation.mutateAsync({
        patientRecordId,
        examinedBy,
        responseData: formValues,
        status,
        completedSections: newCompletedSections,
      });

      setCompletedSections(newCompletedSections);
      completedSectionsRef.current = newCompletedSections;
      hasUnsavedBackendChangesRef.current = false;
    },
    [form, completedSections, upsertMutation, patientRecordId, examinedBy, cancelDebounce]
  );

  // Complete the entire examination
  const completeExaminationFn = useCallback(async () => {
    cancelDebounce();

    const formValues = form.getValues();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lastSectionId = SECTION_IDS.at(-1)!;
    const finalCompletedSections = completedSections.includes(lastSectionId)
      ? completedSections
      : [...completedSections, lastSectionId];

    // Upsert with all data first
    const upsertResult = await upsertMutation.mutateAsync({
      patientRecordId,
      examinedBy,
      responseData: formValues,
      status: "in_progress",
      completedSections: finalCompletedSections,
    });

    // Get the examination ID
    const examId = backendResponse?.id ?? upsertResult.insert_examination_response_one?.id;

    if (!examId) {
      throw new Error("Could not determine examination ID for completion");
    }

    // Mark as completed (sets status="completed" and completed_at)
    await completeMutation.mutateAsync({
      id: examId,
      completedSections: finalCompletedSections,
    });

    setCompletedSections(finalCompletedSections);
    completedSectionsRef.current = finalCompletedSections;
    hasUnsavedBackendChangesRef.current = false;
  }, [
    form,
    completedSections,
    upsertMutation,
    completeMutation,
    patientRecordId,
    examinedBy,
    backendResponse,
    cancelDebounce,
  ]);

  return {
    saveSection,
    completeExamination: completeExaminationFn,
    isSaving,
    completedSections,
    isHydrated,
    hasUnsavedBackendChangesRef,
    status: backendResponse?.status ?? (completedSections.length > 0 ? "in_progress" : null),
  };
}
