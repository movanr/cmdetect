// Model primitives and nodes
export { E4_REGIONS, getPainQuestions, SIDES, type E4Region, type Side } from "./model/contexts";
export {
  E9_MUSCLE_GROUPS,
  E9_PAIN_QUESTIONS,
  E9_PALPATION_SITES as E9_PALPATION_SITES,
  E9_SITE_CONFIG,
  getE9PalpationQuestions,
  type E9MuscleGroup,
  type E9PainQuestion,
  type E9PalpationSite as E9PalpationSite,
} from "./model/e9-contexts";
export {
  M,
  type GroupNode,
  type InferModelType,
  type ModelNode,
  type QuestionNode,
} from "./model/nodes";
export { Q, type AnyPrimitive } from "./model/primitives";
export { bilateralPainInterview, spreadChildren } from "./model/builders";

// Sections
export { E4_MODEL, E4_STEPS } from "./sections/e4.model";
export { E9_MODEL, E9_STEPS } from "./sections/e9.model";
export {
  SECTION_REGISTRY,
  SECTION_IDS,
  getSection,
  type SectionId,
  type SectionConfig,
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
  useExaminationForm,
  type ExaminationStepId,
  type FormValues,
} from "./form/use-examination-form";
export { createStepValidator, getStepPaths } from "./form/use-step-validation";

// Components
export { E4Section } from "./components/E4Section";
export { E9Section } from "./components/E9Section";
export { ExaminationForm } from "./components/ExaminationForm";
export { MeasurementField, MeasurementInput, YesNoField, YesNoInput } from "./components/inputs";
export { QuestionField } from "./components/QuestionField";

// Labels
export {
  getLabel,
  getMuscleGroupLabel,
  getPainTypeLabel,
  getPalpationSiteLabel,
  getRegionLabel,
  getSideLabel,
} from "./labels";
