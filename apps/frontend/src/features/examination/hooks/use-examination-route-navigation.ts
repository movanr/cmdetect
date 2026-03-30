/**
 * Shared navigation hook for examination route files.
 *
 * Extracts duplicated navigation boilerplate (step navigation, forward/back,
 * save-and-continue) from the 10 examination route files (E1–E10) into a
 * single hook. Section ordering is derived from ROUTABLE_SECTIONS so that
 * prev/next are always consistent.
 */

import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import type { SectionId } from "@cmdetect/dc-tmd";
import { useExaminationPersistenceContext } from "../contexts/ExaminationPersistenceContext";

// ---------------------------------------------------------------------------
// Shared search schema for sections with multi-step URLs (E1, E2, E4, E5, E9)
// ---------------------------------------------------------------------------

export const examinationStepSearchSchema = z.object({
  step: z.coerce.number().min(1).optional(),
});

// ---------------------------------------------------------------------------
// Route mapping — routable examination sections in order (E11 has no route)
// ---------------------------------------------------------------------------

const ROUTABLE_SECTIONS: SectionId[] = [
  "e1",
  "e2",
  "e3",
  "e4",
  "e5",
  "e6",
  "e7",
  "e8",
  "e9",
  "e10",
];

const EXAMINATION_ROUTES: Record<string, string> = {
  e1: "/cases/$id/examination/e1",
  e2: "/cases/$id/examination/e2",
  e3: "/cases/$id/examination/e3",
  e4: "/cases/$id/examination/e4",
  e5: "/cases/$id/examination/e5",
  e6: "/cases/$id/examination/e6",
  e7: "/cases/$id/examination/e7",
  e8: "/cases/$id/examination/e8",
  e9: "/cases/$id/examination/e9",
  e10: "/cases/$id/examination/e10",
};

const FORM_SHEET_ROUTE = "/cases/$id/examination";

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface UseExaminationRouteNavigationOptions {
  /** Which section this route represents */
  section: SectionId;
  /** The case/patient record ID from route params */
  id: string;
  /** Whether this section uses multi-step URL navigation (E1, E2, E4, E5, E9) */
  hasSteps?: boolean;
  /** Skip saveSection on complete — E9 navigates without saving */
  skipSave?: boolean;
}

interface ExaminationRouteNavigation {
  /** Navigate to a step within this section. 0-indexed input → 1-indexed URL. null = summary view. */
  navigateToStep?: (stepIndex: number | null) => void;
  /** Save section (unless skipSave) and navigate back to the form sheet. */
  handleComplete: () => Promise<void>;
  /** Navigate back to the form sheet. */
  handleBack: () => void;
  /** True when this is the first routable section (E1) */
  isFirstSection: boolean;
  /** True when this is the last routable section (E10) */
  isLastSection: boolean;
}

export function useExaminationRouteNavigation({
  section,
  id,
  hasSteps = false,
  skipSave = false,
}: UseExaminationRouteNavigationOptions): ExaminationRouteNavigation {
  const navigate = useNavigate();
  const { saveSection } = useExaminationPersistenceContext();

  const currentIndex = ROUTABLE_SECTIONS.indexOf(section);
  const isFirstSection = currentIndex === 0;
  const isLastSection = currentIndex === ROUTABLE_SECTIONS.length - 1;

  // TanStack Router's navigate() expects literal route strings for full type safety.
  // Since route paths come from a runtime map, we cast the options object.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = navigate as (opts: any) => void;

  // --- navigateToStep (only for multi-step sections) ---
  const currentRoute = EXAMINATION_ROUTES[section];

  const navigateToStep = hasSteps
    ? (stepIndex: number | null) => {
        if (stepIndex === null) {
          nav({ to: currentRoute, params: { id }, search: {} });
        } else {
          nav({ to: currentRoute, params: { id }, search: { step: stepIndex + 1 } });
        }
      }
    : undefined;

  // --- handleComplete: save section and navigate to next section, or form sheet if last ---
  const handleComplete = async () => {
    if (!skipSave) {
      await saveSection(section);
    }
    if (isLastSection) {
      nav({ to: FORM_SHEET_ROUTE, params: { id } });
    } else {
      const nextSection = ROUTABLE_SECTIONS[currentIndex + 1];
      nav({ to: EXAMINATION_ROUTES[nextSection], params: { id }, search: {} });
    }
  };

  // --- handleBack: go to previous section, or form sheet if first ---
  const handleBack = () => {
    if (isFirstSection) {
      nav({ to: FORM_SHEET_ROUTE, params: { id } });
    } else {
      const prevSection = ROUTABLE_SECTIONS[currentIndex - 1];
      nav({ to: EXAMINATION_ROUTES[prevSection], params: { id }, search: {} });
    }
  };

  return {
    navigateToStep,
    handleComplete,
    handleBack,
    isFirstSection,
    isLastSection,
  };
}
