/**
 * Data Collector Service for PDF Export
 *
 * Assembles AnamnesisExportData from questionnaire responses
 * and patient data using the questionnaires package scoring functions.
 */

import type {
  AnamnesisExportData,
  AnamnesisExportMetadata,
  AnamnesisExportPatient,
  AnamnesisExportQuestionnaires,
  PainDrawingExportData,
  PainDrawingScore,
  SQExportData,
  GCPS1MAnswers,
  JFLS8Answers,
  JFLS20Answers,
  OBCAnswers,
  SQAnswers,
} from "@cmdetect/questionnaires";
import {
  calculatePHQ4Score,
  calculateGCPS1MScore,
  calculateJFLS8Score,
  calculateJFLS20Score,
  calculateOBCScore,
  QUESTIONNAIRE_ID,
} from "@cmdetect/questionnaires";
import type { QuestionnaireResponse } from "@/features/questionnaire-viewer/hooks/useQuestionnaireResponses";
import type { PainDrawingData } from "@/features/pain-drawing-evaluation";
import { calculatePainDrawingScore } from "@/features/pain-drawing-evaluation/scoring/calculatePainScore";
import { exportPainDrawingToImages } from "./painDrawingExporter";

/**
 * Decrypted patient information
 */
export interface DecryptedPatientData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  clinicInternalId: string;
}

/**
 * Options for assembling export data
 */
export interface AssembleExportDataOptions {
  caseId: string;
  organizationName?: string;
  patientData: DecryptedPatientData;
  responses: QuestionnaireResponse[];
  /** Whether to include pain drawing images (requires DOM access for canvas rendering) */
  includePainDrawingImages?: boolean;
}

/**
 * Assembles the complete AnamnesisExportData from questionnaire responses.
 *
 * This function:
 * 1. Collects all questionnaire responses
 * 2. Calculates scores using the questionnaires package
 * 3. Exports pain drawing canvases to base64 PNG (if enabled)
 * 4. Returns the complete export data structure
 */
export async function assembleExportData(
  options: AssembleExportDataOptions
): Promise<AnamnesisExportData> {
  const {
    caseId,
    organizationName,
    patientData,
    responses,
    includePainDrawingImages = true,
  } = options;

  // Build metadata
  const metadata: AnamnesisExportMetadata = {
    exportDate: new Date().toISOString(),
    caseId,
    organizationName,
  };

  // Build patient info
  const patient: AnamnesisExportPatient = {
    firstName: patientData.firstName,
    lastName: patientData.lastName,
    dateOfBirth: patientData.dateOfBirth,
    clinicInternalId: patientData.clinicInternalId,
  };

  // Extract questionnaire responses
  const sqResponse = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.SQ);
  const painDrawingResponse = responses.find(
    (r) => r.questionnaireId === QUESTIONNAIRE_ID.PAIN_DRAWING
  );
  const phq4Response = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.PHQ4);
  const gcps1mResponse = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.GCPS_1M);
  const jfls8Response = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.JFLS8);
  const jfls20Response = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.JFLS20);
  const obcResponse = responses.find((r) => r.questionnaireId === QUESTIONNAIRE_ID.OBC);

  // Build questionnaires data with scores
  const questionnaires: AnamnesisExportQuestionnaires = {};

  // SQ
  if (sqResponse) {
    const sqAnswers = sqResponse.answers as SQAnswers;
    // Check if screening is negative (all main symptom questions answered "no")
    const screeningNegative =
      sqAnswers.SQ1 === "no" &&
      sqAnswers.SQ5 === "no" &&
      sqAnswers.SQ8 === "no" &&
      sqAnswers.SQ9 === "no" &&
      sqAnswers.SQ13 === "no";
    const sqExport: SQExportData = {
      answers: sqAnswers,
      screeningNegative,
      reviewedAt: sqResponse.reviewedAt,
    };
    questionnaires.sq = sqExport;
  }

  // PHQ-4
  if (phq4Response) {
    const phq4Answers = phq4Response.answers as Record<string, string>;
    questionnaires.phq4 = {
      score: calculatePHQ4Score(phq4Answers),
      answers: phq4Answers,
    };
  }

  // GCPS-1M
  if (gcps1mResponse) {
    const gcpsAnswers = gcps1mResponse.answers as GCPS1MAnswers;
    questionnaires.gcps1m = {
      score: calculateGCPS1MScore(gcpsAnswers),
      answers: gcpsAnswers as Record<string, string | number>,
    };
  }

  // JFLS-8
  if (jfls8Response) {
    const jflsAnswers = jfls8Response.answers as JFLS8Answers;
    questionnaires.jfls8 = {
      score: calculateJFLS8Score(jflsAnswers),
      answers: jflsAnswers as Record<string, string>,
    };
  }

  // JFLS-20
  if (jfls20Response) {
    const jflsAnswers = jfls20Response.answers as JFLS20Answers;
    questionnaires.jfls20 = {
      score: calculateJFLS20Score(jflsAnswers),
      answers: jflsAnswers as Record<string, string>,
    };
  }

  // OBC
  if (obcResponse) {
    const obcAnswers = obcResponse.answers as OBCAnswers;
    questionnaires.obc = {
      score: calculateOBCScore(obcAnswers),
      answers: obcAnswers as Record<string, string>,
    };
  }

  // Pain Drawing
  let painDrawing: PainDrawingExportData | undefined;
  if (painDrawingResponse) {
    const painDrawingData = painDrawingResponse.answers as unknown as PainDrawingData;

    // Calculate score using the frontend scoring function
    const frontendScore = calculatePainDrawingScore(painDrawingData);

    // Convert to the export schema format
    const score: PainDrawingScore = {
      regionCount: frontendScore.regionCount,
      affectedRegions: frontendScore.affectedRegions,
      elementCounts: frontendScore.elementCounts,
      totalElements: frontendScore.totalElements,
      patterns: frontendScore.patterns,
      riskLevel: frontendScore.riskLevel,
      interpretation: frontendScore.interpretation,
    };

    // Export images if enabled
    let images: Record<string, string> = {};
    if (includePainDrawingImages) {
      images = await exportPainDrawingToImages(painDrawingData);
    }

    painDrawing = {
      score,
      images,
    };
  }

  return {
    metadata,
    patient,
    questionnaires,
    painDrawing,
  };
}
