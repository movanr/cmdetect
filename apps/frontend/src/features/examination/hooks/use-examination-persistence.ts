/**
 * Examination Persistence Orchestration Hook
 *
 * Coordinates backend persistence and localStorage draft support:
 * - Hydrates form from backend (primary) or localStorage (fallback if newer)
 * - Auto-saves to localStorage on form changes (debounced)
 * - Saves to backend on section completion
 * - Clears localStorage draft after successful backend save
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useExaminationResponse, type ExaminationStatus } from "./use-examination-response";
import { useUpsertExamination, useCompleteExamination } from "./use-save-examination";
import type { SectionId } from "../sections/registry";
import type { FormValues } from "../form/use-examination-form";

const STORAGE_KEY_PREFIX = "cmdetect_exam_draft_";
const AUTO_SAVE_DEBOUNCE_MS = 2000;

interface DraftData {
  formValues: Record<string, unknown>;
  completedSections: SectionId[];
  savedAt: string;
}

interface UseExaminationPersistenceOptions {
  patientRecordId: string;
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
  /** Current examination status */
  status: ExaminationStatus | null;
}

export function useExaminationPersistence({
  patientRecordId,
}: UseExaminationPersistenceOptions): UseExaminationPersistenceResult {
  const form = useFormContext<FormValues>();
  const [isHydrated, setIsHydrated] = useState(false);
  const [completedSections, setCompletedSections] = useState<SectionId[]>([]);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // LocalStorage for draft
  const storageKey = `${STORAGE_KEY_PREFIX}${patientRecordId}`;
  const [draft, setDraft, removeDraft] = useLocalStorage<DraftData | null>(
    storageKey,
    null
  );

  // Backend queries
  const {
    data: backendResponse,
    isFetched,
  } = useExaminationResponse(patientRecordId);

  const upsertMutation = useUpsertExamination(patientRecordId);
  const completeMutation = useCompleteExamination(patientRecordId);

  const isSaving = upsertMutation.isPending || completeMutation.isPending;

  // Hydration: backend primary, localStorage fallback if newer
  useEffect(() => {
    if (isHydrated || !isFetched) return;

    const backendData = backendResponse?.responseData;
    const backendUpdatedAt = backendResponse?.updatedAt;
    const draftSavedAt = draft?.savedAt;

    // Determine which data source to use
    let dataSource: "backend" | "draft" | "none" = "none";
    let formData: Record<string, unknown> | null = null;
    let sections: SectionId[] = [];

    if (backendData && Object.keys(backendData).length > 0) {
      // Backend has data
      if (draftSavedAt && backendUpdatedAt) {
        // Both exist - compare timestamps
        const backendTime = new Date(backendUpdatedAt).getTime();
        const draftTime = new Date(draftSavedAt).getTime();

        if (draftTime > backendTime) {
          // Draft is newer - use it
          dataSource = "draft";
          formData = draft?.formValues ?? null;
          sections = draft?.completedSections ?? [];
        } else {
          // Backend is newer or same - use it, clear draft
          dataSource = "backend";
          formData = backendData;
          sections = backendResponse?.completedSections ?? [];
          removeDraft();
        }
      } else {
        // Only backend exists
        dataSource = "backend";
        formData = backendData;
        sections = backendResponse?.completedSections ?? [];
      }
    } else if (draft?.formValues) {
      // Only draft exists
      dataSource = "draft";
      formData = draft.formValues;
      sections = draft.completedSections ?? [];
    }

    // Apply data to form
    if (formData && dataSource !== "none") {
      form.reset(formData as FormValues);
      setCompletedSections(sections);
    }

    setIsHydrated(true);
  }, [
    isFetched,
    isHydrated,
    backendResponse,
    draft,
    form,
    removeDraft,
  ]);

  // Track latest form values for save-on-unmount
  const latestValuesRef = useRef<Record<string, unknown> | null>(null);

  // Auto-save to localStorage on form changes (debounced)
  useEffect(() => {
    if (!isHydrated) return;

    const subscription = form.watch((values) => {
      // Track latest values for save-on-unmount
      latestValuesRef.current = values as Record<string, unknown>;

      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set new debounced save
      autoSaveTimerRef.current = setTimeout(() => {
        setDraft({
          formValues: values as Record<string, unknown>,
          completedSections,
          savedAt: new Date().toISOString(),
        });
        latestValuesRef.current = null; // Mark as saved
      }, AUTO_SAVE_DEBOUNCE_MS);
    });

    return () => {
      subscription.unsubscribe();
      // Cancel pending timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      // Save immediately if there are unsaved changes
      if (latestValuesRef.current) {
        // Use localStorage directly to avoid React state update during unmount
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              formValues: latestValuesRef.current,
              completedSections,
              savedAt: new Date().toISOString(),
            })
          );
        } catch (e) {
          console.error("Failed to save draft on unmount:", e);
        }
      }
    };
  }, [isHydrated, form, setDraft, completedSections, storageKey]);

  // Compute status based on completed sections
  const computeStatus = useCallback(
    (sections: SectionId[]): ExaminationStatus => {
      if (sections.length === 0) return "draft";
      return "in_progress";
    },
    []
  );

  // Save section to backend
  const saveSection = useCallback(
    async (sectionId: SectionId) => {
      const formValues = form.getValues();

      // Add section to completed list if not already there
      const newCompletedSections = completedSections.includes(sectionId)
        ? completedSections
        : [...completedSections, sectionId];

      const status = computeStatus(newCompletedSections);

      try {
        await upsertMutation.mutateAsync({
          patientRecordId,
          responseData: formValues as Record<string, unknown>,
          status,
          completedSections: newCompletedSections,
        });

        // Update local state
        setCompletedSections(newCompletedSections);

        // Clear localStorage draft after successful backend save
        removeDraft();
      } catch (error) {
        // On error, ensure draft is saved to localStorage as safety net
        setDraft({
          formValues: formValues as Record<string, unknown>,
          completedSections: newCompletedSections,
          savedAt: new Date().toISOString(),
        });
        throw error;
      }
    },
    [
      form,
      completedSections,
      computeStatus,
      upsertMutation,
      patientRecordId,
      removeDraft,
      setDraft,
    ]
  );

  // Complete examination
  const completeExaminationFn = useCallback(async () => {
    // First save the last section (e9)
    const formValues = form.getValues();
    const finalCompletedSections = completedSections.includes("e9")
      ? completedSections
      : [...completedSections, "e9" as SectionId];

    // Upsert with all data first
    const upsertResult = await upsertMutation.mutateAsync({
      patientRecordId,
      responseData: formValues as Record<string, unknown>,
      status: "in_progress",
      completedSections: finalCompletedSections,
    });

    // Get the examination ID (either from existing response or upsert result)
    const examId =
      backendResponse?.id ??
      upsertResult.insert_examination_response_one?.id;

    if (!examId) {
      throw new Error("Could not determine examination ID for completion");
    }

    // Mark as completed
    await completeMutation.mutateAsync({
      id: examId,
      completedSections: finalCompletedSections,
    });

    // Update local state
    setCompletedSections(finalCompletedSections);

    // Clear localStorage draft
    removeDraft();
  }, [
    form,
    completedSections,
    upsertMutation,
    completeMutation,
    patientRecordId,
    backendResponse,
    removeDraft,
  ]);

  return {
    saveSection,
    completeExamination: completeExaminationFn,
    isSaving,
    completedSections,
    isHydrated,
    status: backendResponse?.status ?? (completedSections.length > 0 ? "in_progress" : null),
  };
}
