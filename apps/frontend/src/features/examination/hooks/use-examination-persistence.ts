/**
 * Examination Persistence Orchestration Hook
 *
 * Coordinates backend persistence for the examination form. The form (RHF) is
 * the user's working copy; the TanStack Query cache is the last acknowledged
 * server state. They are synced one-way: user types → debounced mutation →
 * server → cache. Hydration runs once on mount.
 *
 * Serialization across concurrent writes (debounced autosave, saveSection,
 * completeExamination, Behandler change) happens inside TanStack Query via
 * `mutationKey` + `scope.id` shared between the upsert and complete mutations.
 * No custom write queue is needed.
 *
 * Status model: once an examination is completed, its status stays "completed".
 * Subsequent edits update the data in place (`UPSERT_EXAMINATION_RESPONSE`
 * doesn't touch `status` or `completed_at` on an existing completed row — see
 * `queries.ts`). Completion itself is a single atomic mutation
 * (`UPSERT_AND_COMPLETE_EXAMINATION`) that writes data + status +
 * completed_at together.
 */

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { useFormContext } from "react-hook-form";
import type { FormValues } from "../form/use-examination-form";
import { SECTION_IDS, type SectionId } from "../sections/registry";
import { useExaminationResponse, type ExaminationStatus } from "./use-examination-response";
import { useCompleteExamination, useUpsertExamination } from "./use-save-examination";

const AUTO_SAVE_DELAY_MS = 500;

interface UseExaminationPersistenceOptions {
  patientRecordId: string;
  examinedBy: string;
}

export interface UseExaminationPersistenceResult {
  /** Save a section to backend and mark it completed */
  saveSection: (sectionId: SectionId) => Promise<void>;
  /** Complete the entire examination (atomic: data + status + completed_at) */
  completeExamination: () => Promise<void>;
  /** Flush any pending debounced write and await in-flight mutations. */
  flushSave: () => Promise<void>;
  /** Whether any write is currently in flight */
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
  // FormProvider spreads methods into a new object each parent render,
  // making the context reference unstable. A ref keeps effect deps stable.
  const formRef = useRef(form);
  formRef.current = form;

  const [isHydrated, setIsHydrated] = useState(false);
  const [completedSections, setCompletedSections] = useState<SectionId[]>([]);
  const hasUnsavedBackendChangesRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedSectionsRef = useRef<SectionId[]>([]);
  const backendStatusRef = useRef<ExaminationStatus | null>(null);
  // Incremented on every form change; an in-flight save captures this at
  // start and only clears `hasUnsavedBackendChangesRef` if it hasn't moved
  // when the mutation resolves — otherwise a keystroke during an in-flight
  // request would be silently marked "saved".
  const formChangeEpochRef = useRef(0);

  const { data: backendResponse, isFetched } = useExaminationResponse(patientRecordId);

  const upsertMutation = useUpsertExamination(patientRecordId);
  const completeMutation = useCompleteExamination(patientRecordId);

  const isSaving = upsertMutation.isPending || completeMutation.isPending;

  // Hydration: one-shot load from backend into the form. After isHydrated is
  // true, query refetches (e.g. invalidation after a save) will NOT touch the
  // form — the form is the working copy, the cache is server state, they are
  // not kept in sync after the initial mount.
  useEffect(() => {
    if (isHydrated || !isFetched) return;

    if (backendResponse?.responseData) {
      formRef.current.reset(backendResponse.responseData);
      const sections = backendResponse.completedSections;
      setCompletedSections(sections); // eslint-disable-line react-hooks/set-state-in-effect -- one-time hydration
      completedSectionsRef.current = sections;
    }

    setIsHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetched, isHydrated, backendResponse]);

  // Refs for latest values — autosave effect reads these without re-subscribing.
  const upsertMutationRef = useRef(upsertMutation);
  const completeMutationRef = useRef(completeMutation);
  const examinedByRef = useRef(examinedBy);
  const patientRecordIdRef = useRef(patientRecordId);

  useEffect(() => {
    backendStatusRef.current = backendResponse?.status ?? null;
    upsertMutationRef.current = upsertMutation;
    completeMutationRef.current = completeMutation;
    examinedByRef.current = examinedBy;
    patientRecordIdRef.current = patientRecordId;
  }, [backendResponse?.status, upsertMutation, completeMutation, examinedBy, patientRecordId]);

  const cancelDebounce = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  /**
   * Fire an autosave. Reads form state + epoch at call time; TanStack Query's
   * mutation scope serializes overlapping calls at the network layer.
   */
  const fireAutosave = useCallback(async () => {
    if (!examinedByRef.current) return;
    const sections = completedSectionsRef.current;
    const status: ExaminationStatus =
      backendStatusRef.current ?? (sections.length === 0 ? "draft" : "in_progress");
    const startedEpoch = formChangeEpochRef.current;
    await upsertMutationRef.current.mutateAsync({
      patientRecordId: patientRecordIdRef.current,
      examinedBy: examinedByRef.current,
      responseData: formRef.current.getValues(),
      status,
      completedSections: sections,
    });
    if (formChangeEpochRef.current === startedEpoch) {
      hasUnsavedBackendChangesRef.current = false;
    }
  }, []);

  // Save immediately on Behandler change (cancels debounce).
  const prevExaminedByRef = useRef(examinedBy);
  useEffect(() => {
    if (!isHydrated || !examinedBy) return;
    if (prevExaminedByRef.current === examinedBy) return;
    prevExaminedByRef.current = examinedBy;

    cancelDebounce();
    void fireAutosave();
  }, [examinedBy, isHydrated, cancelDebounce, fireAutosave]);

  // Auto-save on form changes (500ms debounce).
  useEffect(() => {
    if (!isHydrated) return;

    const subscription = formRef.current.watch(() => {
      hasUnsavedBackendChangesRef.current = true;
      formChangeEpochRef.current += 1;
      cancelDebounce();

      debounceTimerRef.current = setTimeout(() => {
        void fireAutosave();
      }, AUTO_SAVE_DELAY_MS);
    });

    return () => {
      subscription.unsubscribe();
      cancelDebounce();
      // Final attempt on unmount. The outer React Router blocker normally
      // awaits flushSave() before this runs; this is a backstop.
      if (hasUnsavedBackendChangesRef.current && examinedByRef.current) {
        void fireAutosave();
      }
    };
  }, [isHydrated, cancelDebounce, fireAutosave]);

  /**
   * Flush pending writes before navigation. Awaited by the React Router
   * blocker. If there are unsaved changes but no Behandler is selected (save
   * would fail), throw so the blocker shows the "unsaved changes" dialog.
   */
  const flushSave = useCallback(async () => {
    cancelDebounce();
    if (hasUnsavedBackendChangesRef.current) {
      if (!examinedByRef.current) {
        throw new Error(
          "Kein Behandler ausgewählt — Änderungen können nicht gespeichert werden.",
        );
      }
      await fireAutosave();
    }
  }, [cancelDebounce, fireAutosave]);

  /**
   * Save section: cancels debounce, upserts with the new completed sections
   * array. Ref + state only update after the mutation resolves so a failed
   * mutation doesn't desync local state.
   */
  const saveSection = useCallback(
    async (sectionId: SectionId) => {
      cancelDebounce();

      if (!examinedByRef.current) {
        throw new Error(
          "Kein Behandler ausgewählt — Abschnitt kann nicht gespeichert werden.",
        );
      }

      const prior = completedSectionsRef.current;
      const newCompletedSections = prior.includes(sectionId)
        ? prior
        : [...prior, sectionId];

      const status: ExaminationStatus =
        backendStatusRef.current ??
        (newCompletedSections.length === 0 ? "draft" : "in_progress");

      const startedEpoch = formChangeEpochRef.current;
      await upsertMutationRef.current.mutateAsync({
        patientRecordId: patientRecordIdRef.current,
        examinedBy: examinedByRef.current,
        responseData: formRef.current.getValues(),
        status,
        completedSections: newCompletedSections,
      });

      setCompletedSections(newCompletedSections);
      completedSectionsRef.current = newCompletedSections;
      if (formChangeEpochRef.current === startedEpoch) {
        hasUnsavedBackendChangesRef.current = false;
      }
    },
    [cancelDebounce],
  );

  /**
   * Complete: single atomic mutation. Status, data, and completed_at land
   * together.
   */
  const completeExaminationFn = useCallback(async () => {
    cancelDebounce();

    if (!examinedByRef.current) {
      throw new Error(
        "Kein Behandler ausgewählt — Untersuchung kann nicht abgeschlossen werden.",
      );
    }

    // Mark all sections completed — covers both guided mode (accumulated
    // one-by-one) and form sheet mode (no individual saveSection calls).
    const finalCompletedSections = [...SECTION_IDS];

    const startedEpoch = formChangeEpochRef.current;
    await completeMutationRef.current.mutateAsync({
      patientRecordId: patientRecordIdRef.current,
      examinedBy: examinedByRef.current,
      responseData: formRef.current.getValues(),
      completedSections: finalCompletedSections,
    });

    setCompletedSections(finalCompletedSections);
    completedSectionsRef.current = finalCompletedSections;
    backendStatusRef.current = "completed";
    if (formChangeEpochRef.current === startedEpoch) {
      hasUnsavedBackendChangesRef.current = false;
    }
  }, [cancelDebounce]);

  return {
    saveSection,
    completeExamination: completeExaminationFn,
    flushSave,
    isSaving,
    completedSections,
    isHydrated,
    hasUnsavedBackendChangesRef,
    status:
      backendResponse?.status ??
      (completedSections.length > 0 ? "in_progress" : null),
  };
}
