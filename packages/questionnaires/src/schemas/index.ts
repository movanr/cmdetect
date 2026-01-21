/**
 * Zod Schema Exports
 *
 * All validation schemas are exported from here.
 * TypeScript types should be derived using z.infer<typeof Schema>.
 */

// Score schemas
export {
  // GCPS
  GCPSGradeSchema,
  GCPSCPILevelSchema,
  GCPSGradeInterpretationSchema,
  GCPS1MScoreSchema,
  // PHQ-4
  PHQ4SeveritySchema,
  PHQ4ScoreSchema,
  PHQ4InterpretationSchema,
  PHQ4SubscaleResultSchema,
  // JFLS-8
  JFLS8LimitationLevelSchema,
  JFLS8LimitationInterpretationSchema,
  JFLS8ScoreSchema,
  // JFLS-20
  JFLS20LimitationLevelSchema,
  JFLS20LimitationInterpretationSchema,
  JFLS20SubscaleScoreSchema,
  JFLS20ScoreSchema,
  // OBC
  OBCRiskLevelSchema,
  OBCRiskInterpretationSchema,
  OBCScoreSchema,
  // Pain Drawing
  PainDrawingImageIdSchema,
  PainDrawingRiskLevelSchema,
  PainDrawingElementCountsSchema,
  PainDrawingPatternsSchema,
  PainDrawingInterpretationSchema,
  PainDrawingScoreSchema,
} from "./scores";

// PDF Export schemas
export {
  AnamnesisExportMetadataSchema,
  AnamnesisExportPatientSchema,
  SQExportDataSchema,
  PHQ4ExportDataSchema,
  GCPS1MExportDataSchema,
  JFLS8ExportDataSchema,
  JFLS20ExportDataSchema,
  OBCExportDataSchema,
  PainDrawingExportDataSchema,
  AnamnesisExportQuestionnairesSchema,
  AnamnesisExportDataSchema,
} from "./pdf-export";
