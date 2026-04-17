/**
 * Shared display formatter for practitioner-entered manual scores.
 *
 * Consumed by the anamnesis print view's scores overview, the Befundbericht
 * React view, and the DOCX generator so every document surfaces the same
 * human-readable line per questionnaire (value + German interpretation).
 */

import { QUESTIONNAIRE_ID } from "./ids";
import {
  GCPS_GRADE_LABELS,
  OBC_SEVERITY_LABELS,
  PAIN_DRAWING_SEVERITY_LABELS,
  PHQ4_SEVERITY_LABELS,
  resolveLabel,
} from "./manual-score-labels";
import { JFLS20_SUBSCALE_LABELS } from "./jfls20";

const SEPARATOR = " · ";

function join(fragments: Array<string | undefined | null>): string {
  return fragments.filter((s): s is string => !!s && s.length > 0).join(SEPARATOR);
}

/**
 * Compose the display line for one instrument given the practitioner-entered
 * score map. Returns an empty string when nothing has been entered.
 */
export function formatManualScoreLine(
  questionnaireId: string,
  scores: Record<string, string> | undefined
): string {
  const s = scores ?? {};

  switch (questionnaireId) {
    case QUESTIONNAIRE_ID.PAIN_DRAWING: {
      const countStr = s.regionCount
        ? `${s.regionCount} Schmerzgebiet${s.regionCount === "1" ? "" : "e"}`
        : "";
      return join([countStr, resolveLabel(PAIN_DRAWING_SEVERITY_LABELS, s.severity)]);
    }
    case QUESTIONNAIRE_ID.GCPS_1M: {
      const bp = s.bpTotal ? `BP ${s.bpTotal}` : "";
      const csiStr = s.csi ? `CSI ${s.csi}` : "";
      return join([bp, csiStr, resolveLabel(GCPS_GRADE_LABELS, s.grade)]);
    }
    case QUESTIONNAIRE_ID.PHQ4: {
      const totalStr = s.total ? `${s.total} / 12` : "";
      return join([totalStr, resolveLabel(PHQ4_SEVERITY_LABELS, s.severity)]);
    }
    case QUESTIONNAIRE_ID.JFLS8: {
      return join([s.global || undefined, s.classification || undefined]);
    }
    case QUESTIONNAIRE_ID.JFLS20: {
      const parts: string[] = [];
      if (s.global) parts.push(`Global ${s.global}`);
      if (s.mastication)
        parts.push(`${JFLS20_SUBSCALE_LABELS.mastication.label} ${s.mastication}`);
      if (s.mobility) parts.push(`${JFLS20_SUBSCALE_LABELS.mobility.label} ${s.mobility}`);
      if (s.communication)
        parts.push(`${JFLS20_SUBSCALE_LABELS.communication.label} ${s.communication}`);
      return join([parts.join(SEPARATOR), s.classification || undefined]);
    }
    case QUESTIONNAIRE_ID.OBC: {
      const totalStr = s.total ? `${s.total} / 84` : "";
      return join([totalStr, resolveLabel(OBC_SEVERITY_LABELS, s.severity)]);
    }
    default:
      return "";
  }
}
