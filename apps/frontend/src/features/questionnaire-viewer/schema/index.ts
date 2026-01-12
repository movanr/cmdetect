// Legacy exports (kept for backward compatibility during migration)
export {
  validateSQReview,
  countPendingConfirmations,
} from "./sqReviewSchema";
export type { SQReviewValidationResult } from "./sqReviewSchema";

// New Zod schemas
export {
  // Base schemas per input type
  yesNoSchema,
  durationSchema,
  painFrequencySchema,
  officeUseSchema,
  // Full form schema
  sqFormSchema,
} from "./sqZodSchemas";

// Types
export type {
  YesNoValue,
  DurationValue,
  PainFrequencyValue,
  OfficeUseValue,
  SQFormValues,
  SQOfficeUseKey,
  SQQuestionKey,
  SQFieldKey,
} from "./sqZodSchemas";
