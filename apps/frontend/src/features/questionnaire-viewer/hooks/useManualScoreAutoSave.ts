/**
 * One-stop state container for a manual-score scoring panel.
 *
 * Owns the per-field string state + free-text note, hydrates from the server on
 * first load, and debounces upserts back with a 3s delay (mirroring the
 * examination auto-save cadence). Flushes pending changes on unmount.
 *
 * SPA-nav and pending-save coordination now runs through TanStack Query's
 * mutation scope: concurrent autosaves serialize via `scope.id` on
 * `useUpsertManualScore`, and the anamnesis route's nav blocker awaits
 * in-flight mutations via `queryClient.isMutating({ mutationKey })`.
 *
 * Auto-save is gated on `enabled` — today, that means "the patient has submitted
 * this questionnaire". When disabled, the component still works as a local-only
 * draft, matching the pre-persistence behavior for the paper-form flow.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useManualScores } from "./useManualScores";
import { useUpsertManualScore } from "./useUpsertManualScore";

const AUTO_SAVE_DELAY_MS = 3000;

interface UseManualScoreStateParams<T extends Record<string, string>> {
  patientRecordId: string;
  questionnaireId: string;
  defaultValues: T;
  /** When false, local state works normally but nothing is persisted. */
  enabled: boolean;
}

interface UseManualScoreStateResult<T extends Record<string, string>> {
  scores: T;
  setScore: <K extends keyof T>(key: K, value: T[K]) => void;
  note: string;
  setNote: (value: string) => void;
  isHydrated: boolean;
  flush: () => Promise<void>;
}

export function useManualScoreAutoSave<T extends Record<string, string>>({
  patientRecordId,
  questionnaireId,
  defaultValues,
  enabled,
}: UseManualScoreStateParams<T>): UseManualScoreStateResult<T> {
  const { data: serverData, isLoading } = useManualScores(patientRecordId);
  const upsert = useUpsertManualScore(patientRecordId);

  const [scores, setScores] = useState<T>(defaultValues);
  const [note, setNoteInternal] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  // One-shot hydration once the server responds.
  useEffect(() => {
    if (isLoading || isHydrated) return;
    const row = serverData?.[questionnaireId];
    if (row) {
      const merged = { ...defaultValues } as T;
      for (const key of Object.keys(defaultValues) as (keyof T)[]) {
        const value = row.scores[key as string];
        if (typeof value === "string") merged[key] = value as T[keyof T];
      }
      setScores(merged);
      setNoteInternal(row.note ?? "");
    }
    setIsHydrated(true);
    // defaultValues is treated as a constant per component; keep deps minimal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isHydrated, serverData, questionnaireId]);

  // Latest values held in refs so the flush path always sees current state.
  const latestScoresRef = useRef(scores);
  const latestNoteRef = useRef(note);
  useEffect(() => {
    latestScoresRef.current = scores;
  }, [scores]);
  useEffect(() => {
    latestNoteRef.current = note;
  }, [note]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef(false);
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Mutation access via ref — avoids re-running effects when the mutation
  // object identity churns across TanStack Query cache updates.
  const upsertRef = useRef(upsert);
  useEffect(() => {
    upsertRef.current = upsert;
  }, [upsert]);

  const flushNow = useCallback(async (): Promise<void> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!pendingRef.current) return;
    if (!enabledRef.current) {
      pendingRef.current = false;
      return;
    }
    pendingRef.current = false;
    try {
      await upsertRef.current.mutateAsync({
        patientRecordId,
        questionnaireId,
        scores: latestScoresRef.current,
        note: latestNoteRef.current,
      });
    } catch {
      // useUpsertManualScore already toasts on error; mark dirty again so a
      // subsequent flush retry can pick it up.
      pendingRef.current = true;
      throw new Error("Manual score save failed");
    }
  }, [patientRecordId, questionnaireId]);

  const scheduleSave = useCallback(() => {
    if (!enabledRef.current) return;
    pendingRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      flushNow().catch(() => {
        // Already surfaced via toast in useUpsertManualScore.
      });
    }, AUTO_SAVE_DELAY_MS);
  }, [flushNow]);

  const setScore = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setScores((prev) => {
        if (prev[key] === value) return prev;
        return { ...prev, [key]: value };
      });
      scheduleSave();
    },
    [scheduleSave]
  );

  const setNote = useCallback(
    (value: string) => {
      setNoteInternal((prev) => (prev === value ? prev : value));
      scheduleSave();
    },
    [scheduleSave]
  );

  // Flush on unmount (SPA navigation keeps fetch alive, matches examination pattern).
  useEffect(() => {
    return () => {
      if (pendingRef.current && enabledRef.current) {
        upsertRef.current.mutate({
          patientRecordId,
          questionnaireId,
          scores: latestScoresRef.current,
          note: latestNoteRef.current,
        });
      }
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [patientRecordId, questionnaireId]);

  return { scores, setScore, note, setNote, isHydrated, flush: flushNow };
}
