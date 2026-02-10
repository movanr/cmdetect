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
import { execute } from "@/graphql/execute";
import { useExaminationResponse, type ExaminationStatus } from "./use-examination-response";
import { useUpsertExamination, useCompleteExamination } from "./use-save-examination";
import { SECTION_IDS, type SectionId } from "../sections/registry";
import type { FormValues } from "../form/use-examination-form";
import {
  migrateAndParseExaminationData,
  parseCompletedSections,
} from "./validate-persistence";
import { CURRENT_MODEL_VERSION } from "./model-versioning";
import { UPSERT_EXAMINATION_RESPONSE } from "../queries";

const STORAGE_KEY_PREFIX = "cmdetect_exam_draft_";
const AUTO_SAVE_DEBOUNCE_MS = 2000;
const BACKEND_PERIODIC_SAVE_MS = 30_000;

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

export function useExaminationPersistence({
  patientRecordId,
}: UseExaminationPersistenceOptions): UseExaminationPersistenceResult {
  const form = useFormContext<FormValues>();
  const [isHydrated, setIsHydrated] = useState(false);
  const [completedSections, setCompletedSections] = useState<SectionId[]>([]);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasUnsavedBackendChangesRef = useRef(false);
  const backendPeriodicTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAutoSavingRef = useRef(false);
  const saveDraftRef = useRef<() => Promise<void>>(async () => {});

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
    let formData: FormValues | null = null;
    let sections: SectionId[] = [];

    if (backendData && Object.keys(backendData).length > 0) {
      // Backend has data (already validated by useExaminationResponse)
      if (draftSavedAt && backendUpdatedAt) {
        // Both exist - compare timestamps
        const backendTime = new Date(backendUpdatedAt).getTime();
        const draftTime = new Date(draftSavedAt).getTime();

        if (draftTime > backendTime) {
          // Draft is newer — validate before using (may be stale after model changes)
          const validatedDraft = migrateAndParseExaminationData(draft?.formValues);
          if (validatedDraft) {
            dataSource = "draft";
            formData = validatedDraft;
            sections = parseCompletedSections(draft?.completedSections);
          } else {
            // Draft is invalid — discard it and use backend
            dataSource = "backend";
            formData = backendData;
            sections = backendResponse?.completedSections ?? [];
            removeDraft();
          }
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
      // Only draft exists — validate before using
      const validatedDraft = migrateAndParseExaminationData(draft.formValues);
      if (validatedDraft) {
        dataSource = "draft";
        formData = validatedDraft;
        sections = parseCompletedSections(draft.completedSections);
      } else {
        // Draft is invalid — discard it
        removeDraft();
      }
    }

    // Apply data to form
    if (formData && dataSource !== "none") {
      form.reset(formData);
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
  // RHF watch returns DeepPartial<FormValues> but since all fields have defaults
  // from the model, values are always fully populated at runtime.
  const latestValuesRef = useRef<FormValues | null>(null);

  // Auto-save to localStorage on form changes (debounced) + periodic backend save
  useEffect(() => {
    if (!isHydrated) return;

    const subscription = form.watch((values) => {
      // Track latest values for save-on-unmount
      latestValuesRef.current = values as FormValues;

      // Mark as having unsaved backend changes
      hasUnsavedBackendChangesRef.current = true;

      // Clear existing localStorage debounce timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set new debounced localStorage save
      autoSaveTimerRef.current = setTimeout(() => {
        setDraft({
          formValues: { _modelVersion: CURRENT_MODEL_VERSION, ...values as FormValues },
          completedSections,
          savedAt: new Date().toISOString(),
        });
        latestValuesRef.current = null; // Mark as saved to localStorage
      }, AUTO_SAVE_DEBOUNCE_MS);

      // Reset periodic backend save timer (fires after 30s of inactivity)
      if (backendPeriodicTimerRef.current) {
        clearTimeout(backendPeriodicTimerRef.current);
      }
      backendPeriodicTimerRef.current = setTimeout(() => {
        saveDraftRef.current();
      }, BACKEND_PERIODIC_SAVE_MS);
    });

    return () => {
      subscription.unsubscribe();
      // Cancel pending localStorage timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      // Cancel pending backend periodic timer
      if (backendPeriodicTimerRef.current) {
        clearTimeout(backendPeriodicTimerRef.current);
      }
      // Save immediately if there are unsaved changes
      if (latestValuesRef.current) {
        // Use localStorage directly to avoid React state update during unmount
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              formValues: { _modelVersion: CURRENT_MODEL_VERSION, ...latestValuesRef.current },
              completedSections,
              savedAt: new Date().toISOString(),
            } satisfies DraftData)
          );
        } catch (e) {
          console.error("Failed to save draft on unmount:", e);
        }
      }
    };
  }, [isHydrated, form, setDraft, completedSections, storageKey]);

  // Fire-and-forget backend save on unmount only.
  // Separate effect with [] deps so it doesn't fire when form.watch effect
  // re-runs due to unstable setDraft identity from useLocalStorage.
  useEffect(() => {
    return () => {
      saveDraftRef.current();
    };
  }, []);

  // Compute status based on completed sections
  const computeStatus = useCallback(
    (sections: SectionId[]): ExaminationStatus => {
      if (sections.length === 0) return "draft";
      return "in_progress";
    },
    []
  );

  // Save current form data to backend as draft (no section completion).
  // Used for auto-save on navigation, unmount, and periodic inactivity.
  const saveDraft = useCallback(async () => {
    if (
      !hasUnsavedBackendChangesRef.current ||
      upsertMutation.isPending ||
      isAutoSavingRef.current
    ) {
      return;
    }

    isAutoSavingRef.current = true;
    try {
      const formValues = form.getValues();
      const status = computeStatus(completedSections);

      await execute(UPSERT_EXAMINATION_RESPONSE, {
        patient_record_id: patientRecordId,
        response_data: { _modelVersion: CURRENT_MODEL_VERSION, ...formValues },
        status,
        completed_sections: completedSections,
      });

      removeDraft();
      hasUnsavedBackendChangesRef.current = false;
      latestValuesRef.current = null;
    } catch (error) {
      console.warn("Auto-save to backend failed:", error);
    } finally {
      isAutoSavingRef.current = false;
    }
  }, [form, completedSections, computeStatus, patientRecordId, removeDraft, upsertMutation.isPending]);

  // Keep ref in sync so timers/cleanup always call the latest version
  saveDraftRef.current = saveDraft;

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
          responseData: formValues,
          status,
          completedSections: newCompletedSections,
        });

        // Update local state
        setCompletedSections(newCompletedSections);

        // Clear localStorage draft after successful backend save
        removeDraft();

        // Clear backend auto-save tracking
        hasUnsavedBackendChangesRef.current = false;
        if (backendPeriodicTimerRef.current) {
          clearTimeout(backendPeriodicTimerRef.current);
          backendPeriodicTimerRef.current = null;
        }
      } catch (error) {
        // On error, ensure draft is saved to localStorage as safety net
        setDraft({
          formValues: { _modelVersion: CURRENT_MODEL_VERSION, ...formValues },
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
    const formValues = form.getValues();
    const lastSectionId = SECTION_IDS.at(-1)!;
    const finalCompletedSections = completedSections.includes(lastSectionId)
      ? completedSections
      : [...completedSections, lastSectionId];

    // Upsert with all data first
    const upsertResult = await upsertMutation.mutateAsync({
      patientRecordId,
      responseData: formValues,
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

    // Clear backend auto-save tracking
    hasUnsavedBackendChangesRef.current = false;
    if (backendPeriodicTimerRef.current) {
      clearTimeout(backendPeriodicTimerRef.current);
      backendPeriodicTimerRef.current = null;
    }
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
    saveDraft,
    completeExamination: completeExaminationFn,
    isSaving,
    completedSections,
    isHydrated,
    status: backendResponse?.status ?? (completedSections.length > 0 ? "in_progress" : null),
  };
}
