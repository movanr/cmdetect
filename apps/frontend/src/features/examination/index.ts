// Anatomical regions and sites (unified source of truth)
export { bilateralPainInterview, spreadChildren } from "./model/builders";
export {
  M,
  type GroupNode,
  type InferModelType,
  type ModelNode,
  type QuestionNode,
} from "./model/nodes";
export { Q, type AnyPrimitive } from "./model/primitives";
export {
  getMovementPainQuestions,
  getPalpationPainQuestions,
  // Movement regions (E4, E5)
  REGIONS,
  REGION_KEYS,
  // Palpation regions (E9) - the 3 regions with palpation sites
  PALPATION_REGIONS,
  // Pain types
  PAIN_TYPES,
  PAIN_TYPE_KEYS,
  PALPATION_PAIN_QUESTIONS,
  // Palpation sites (E9)
  PALPATION_SITES,
  PALPATION_SITE_KEYS,
  // Sides
  SIDES,
  SIDE_KEYS,
  SITE_CONFIG,
  SVG_REGIONS,
  type Region,
  type PainType,
  type PalpationPainQuestion,
  type PalpationSite,
  type Side,
  type SiteConfig,
} from "./model/regions";

// Sections
export { E1_MODEL, E1_STEPS } from "./sections/e1.model";
export { E2_MODEL, E2_STEPS } from "./sections/e2.model";
export { E3_MODEL, E3_STEPS } from "./sections/e3.model";
export { E4_MODEL, E4_STEPS } from "./sections/e4.model";
export { E5_MODEL, E5_STEPS } from "./sections/e5.model";
export { E6_MODEL, E6_STEPS } from "./sections/e6.model";
export { E7_MODEL, E7_STEPS } from "./sections/e7.model";
export { E8_MODEL, E8_STEPS } from "./sections/e8.model";
export { E9_MODEL, E9_STEPS } from "./sections/e9.model";
export {
  getSection,
  SECTION_IDS,
  SECTION_REGISTRY,
  type SectionConfig,
  type SectionId,
} from "./sections/registry";

// Projections
export {
  defaultsFromModel,
  getStepInstances,
  instancesFromModel,
  type QuestionInstance,
  type StepDefinition,
} from "./projections/to-instances";
export { schemaFromModel, schemaWithRoot } from "./projections/to-schema";

// Form hooks
export { createPathHelpers, type PathHelpers } from "./form/path-helpers";
export {
  EXAMINATION_STEPS,
  examinationFormConfig,
  useExaminationForm,
  type ExaminationStepId,
  type FormValues,
} from "./form/use-examination-form";
export { createStepValidator, getStepPaths } from "./form/use-step-validation";

// Persistence hooks and context
export {
  useExaminationResponse,
  type ExaminationResponse,
  type ExaminationStatus,
} from "./hooks/use-examination-response";
export {
  useUpsertExamination,
  useCompleteExamination,
} from "./hooks/use-save-examination";
export {
  useExaminationPersistence,
  type UseExaminationPersistenceResult,
} from "./hooks/use-examination-persistence";
export {
  ExaminationPersistenceProvider,
  useExaminationPersistenceContext,
} from "./contexts/ExaminationPersistenceContext";

// Components
export { ExaminationForm } from "./components/ExaminationForm";
export { HeadDiagram } from "./components/HeadDiagram/head-diagram";
export {
  buildRegionId,
  EMPTY_REGION_STATUS,
  getRegionVisualState,
  parseRegionId,
  REGION_STATE_COLORS,
  REGION_VISUAL_STATES,
  type RegionId,
  type RegionStatus,
  type RegionVisualState,
} from "./components/HeadDiagram/types";
export { MeasurementField, MeasurementInput, YesNoField, YesNoInput } from "./components/inputs";
export { QuestionField } from "./components/QuestionField";
export {
  RegionDropdown,
  computeSummaryState,
  SUMMARY_LABELS,
  type RegionDropdownProps,
  type RegionPainValues,
  type RegionSummaryState,
} from "./components/RegionDropdown";
export { E1Section } from "./components/sections/E1Section";
export { E2Section } from "./components/sections/E2Section";
export { E3Section } from "./components/sections/E3Section";
export { E4Section } from "./components/sections/E4Section";
export { E5Section } from "./components/sections/E5Section";
export { E6Section } from "./components/sections/E6Section";
export { E7Section } from "./components/sections/E7Section";
export { E8Section } from "./components/sections/E8Section";
export { E9Section } from "./components/sections/E9Section";
export { ExaminationSummary } from "./components/summary";
export { SectionFooter, type SectionFooterProps } from "./components/ui/SectionFooter";

// Labels
export {
  COMMON,
  getLabel,
  getPainTypeLabel,
  getPalpationSiteLabel,
  getRegionLabel,
  getSideLabel,
  SECTION_LABELS,
  STEP_LABELS,
  type StepId,
} from "./labels";
