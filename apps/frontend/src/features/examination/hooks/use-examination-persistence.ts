/**
 * Examination Persistence Orchestration Hook
 *
 * Coordinates backend persistence for the examination form.
 *
 * All writes go through a single serialized write queue (`useWriteQueue`),
 * so debounced autosave, explicit saveSection, completeExamination, and
 * Behandler changes execute strictly in order. No cross-write clobber;
 * every write reads the freshest form state at the time it runs.
 *
 * - Hydrates form from backend on mount.
 * - Autosaves on form changes (debounced 3s) via the queue.
 * - Saves immediately on section completion, Behandler change, or
 *   blocker "save and leave" (bypasses the debounce, not the queue).
 * - `flushSave()` drains the queue and is awaited by the React Router blocker.
 *
 * Status model: once an examination is completed, its status stays "completed".
 * Subsequent edits update the data in place (`UPSERT_EXAMINATION_RESPONSE`
 * doesn't touch `status` or `completed_at` on an existing completed row's
 * autosave path — see `queries.ts`). Completion itself is a single atomic
 * mutation (`UPSERT_AND_COMPLETE_EXAMINATION`) that writes data + status +
 * completed_at together.
 */

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { useFormContext } from "react-hook-form";
import type { FormValues } from "../form/use-examination-form";
import { SECTION_IDS, type SectionId } from "../sections/registry";
import { useExaminationResponse, type ExaminationStatus } from "./use-examination-response";
import { useCompleteExamination, useUpsertExamination } from "./use-save-examination";
import { useWriteQueue } from "./useWriteQueue";

const AUTO_SAVE_DELAY_MS = 3000;

interface UseExaminationPersistenceOptions {
  patientRecordId: string;
  examinedBy: string;
}

export interface UseExaminationPersistenceResult {
  /** Save a section to backend and mark it completed */
  saveSection: (sectionId: SectionId) => Promise<void>;
  /** Complete the entire examination (atomic: data + status + completed_at) */
  completeExamination: () => Promise<void>;
  /** Drain all pending writes. Awaited by the navigation blocker. */
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
  // Incremented on every form change; a save captures this at start and
  // only clears the unsaved-changes flag if it hasn't moved by the time
  // the mutation resolves — otherwise typing during the in-flight request
  // would be silently marked "saved".
  const unsavedEpochRef = useRef(0);

  const { data: backendResponse, isFetched } = useExaminationResponse(patientRecordId);

  const upsertMutation = useUpsertExamination(patientRecordId);
  const completeMutation = useCompleteExamination(patientRecordId);
  // Queue's `error` field is intentionally unused here — autosave failures
  // are already surfaced via the mutation hook's onError toast. The queue
  // primitive keeps it for other consumers (e.g. future SQ review unification).
  const { enqueue, drain } = useWriteQueue();

  const isSaving = upsertMutation.isPending || completeMutation.isPending;

  // Hydration: load form data from backend (one-time initialization)
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
  const enqueueRef = useRef(enqueue);
  const examinedByRef = useRef(examinedBy);
  const patientRecordIdRef = useRef(patientRecordId);

  useEffect(() => {
    backendStatusRef.current = backendResponse?.status ?? null;
    upsertMutationRef.current = upsertMutation;
    completeMutationRef.current = completeMutation;
    enqueueRef.current = enqueue;
    examinedByRef.current = examinedBy;
    patientRecordIdRef.current = patientRecordId;
  }, [backendResponse?.status, upsertMutation, completeMutation, enqueue, examinedBy, patientRecordId]);

  const cancelDebounce = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  /**
   * Enqueue an autosave: reads form state *inside* the queued closure so the
   * write sees the freshest values after any prior queued writes have settled.
   * Captures the unsaved-epoch before the mutation so a new edit during the
   * request doesn't get falsely marked saved when the mutation resolves.
   */
  const enqueueAutosave = useCallback(() => {
    return enqueueRef.current(async () => {
      if (!examinedByRef.current) return;
      const sections = completedSectionsRef.current;
      const status: ExaminationStatus =
        backendStatusRef.current ?? (sections.length === 0 ? "draft" : "in_progress");
      const startedEpoch = unsavedEpochRef.current;
      await upsertMutationRef.current.mutateAsync({
        patientRecordId: patientRecordIdRef.current,
        examinedBy: examinedByRef.current,
        responseData: formRef.current.getValues(),
        status,
        completedSections: sections,
      });
      // Only clear if the form hasn't been touched during the mutation.
      if (unsavedEpochRef.current === startedEpoch) {
        hasUnsavedBackendChangesRef.current = false;
      }
    });
  }, []);

  // Save immediately on Behandler change (cancels debounce, enqueues a flush).
  const prevExaminedByRef = useRef(examinedBy);
  useEffect(() => {
    if (!isHydrated || !examinedBy) return;
    if (prevExaminedByRef.current === examinedBy) return;
    prevExaminedByRef.current = examinedBy;

    cancelDebounce();
    // Don't await — the queue handles ordering; surfaced errors go through
    // the write queue's error state.
    void enqueueAutosave();
  }, [examinedBy, isHydrated, cancelDebounce, enqueueAutosave]);

  // Auto-save on form changes (debounced).
  useEffect(() => {
    if (!isHydrated) return;

    const subscription = formRef.current.watch(() => {
      hasUnsavedBackendChangesRef.current = true;
      unsavedEpochRef.current += 1;
      cancelDebounce();

      debounceTimerRef.current = setTimeout(() => {
        void enqueueAutosave();
      }, AUTO_SAVE_DELAY_MS);
    });

    return () => {
      subscription.unsubscribe();
      cancelDebounce();
      // Final flush on unmount: enqueue — NOT fire-and-forget. The write
      // queue's error state keeps the failure observable; the outer
      // React Router blocker normally drains before unmount.
      if (hasUnsavedBackendChangesRef.current && examinedByRef.current) {
        void enqueueAutosave();
      }
    };
  }, [isHydrated, cancelDebounce, enqueueAutosave]);

  /**
   * Flush pending writes before navigation. If there are unsaved changes,
   * enqueue an autosave and **await it** so a failure rejects here and the
   * navigation blocker can surface the dialog. If there are pending changes
   * but no Behandler is selected (save would be a no-op), throw so the
   * blocker shows the "unsaved changes" dialog instead of silently leaving.
   * With no pending changes, drain any other in-flight queued writes
   * (drain() itself does not throw — that's fine, we have no new work).
   */
  const flushSave = useCallback(async () => {
    cancelDebounce();
    if (hasUnsavedBackendChangesRef.current) {
      if (!examinedByRef.current) {
        throw new Error(
          "Kein Behandler ausgewählt — Änderungen können nicht gespeichert werden.",
        );
      }
      await enqueueAutosave();
      return;
    }
    await drain();
  }, [cancelDebounce, drain, enqueueAutosave]);

  /**
   * Save section: cancels debounce, enqueues an upsert with the new
   * completed sections array. Ref + state are only updated after the
   * mutation resolves, so a failed mutation doesn't desync local state.
   * Same epoch-guarded clear as autosave — typing during an in-flight save
   * must not be marked "saved".
   */
  const saveSection = useCallback(
    async (sectionId: SectionId) => {
      cancelDebounce();

      await enqueueRef.current(async () => {
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
          backendStatusRef.current ?? (newCompletedSections.length === 0 ? "draft" : "in_progress");

        const startedEpoch = unsavedEpochRef.current;
        await upsertMutationRef.current.mutateAsync({
          patientRecordId: patientRecordIdRef.current,
          examinedBy: examinedByRef.current,
          responseData: formRef.current.getValues(),
          status,
          completedSections: newCompletedSections,
        });

        setCompletedSections(newCompletedSections);
        completedSectionsRef.current = newCompletedSections;
        if (unsavedEpochRef.current === startedEpoch) {
          hasUnsavedBackendChangesRef.current = false;
        }
      });
    },
    [cancelDebounce],
  );

  /**
   * Complete: single atomic mutation. No two-call split — status, data, and
   * completed_at land together.
   */
  const completeExaminationFn = useCallback(async () => {
    cancelDebounce();

    await enqueueRef.current(async () => {
      if (!examinedByRef.current) {
        throw new Error(
          "Kein Behandler ausgewählt — Untersuchung kann nicht abgeschlossen werden.",
        );
      }

      // Mark all sections completed — covers both guided mode (accumulated
      // one-by-one) and form sheet mode (no individual saveSection calls).
      const finalCompletedSections = [...SECTION_IDS];

      const startedEpoch = unsavedEpochRef.current;
      await completeMutationRef.current.mutateAsync({
        patientRecordId: patientRecordIdRef.current,
        examinedBy: examinedByRef.current,
        responseData: formRef.current.getValues(),
        completedSections: finalCompletedSections,
      });

      setCompletedSections(finalCompletedSections);
      completedSectionsRef.current = finalCompletedSections;
      backendStatusRef.current = "completed";
      if (unsavedEpochRef.current === startedEpoch) {
        hasUnsavedBackendChangesRef.current = false;
      }
    });
  }, [cancelDebounce]);

  return {
    saveSection,
    completeExamination: completeExaminationFn,
    flushSave,
    isSaving,
    completedSections,
    isHydrated,
    hasUnsavedBackendChangesRef,
    status: backendResponse?.status ?? (completedSections.length > 0 ? "in_progress" : null),
  };
}
