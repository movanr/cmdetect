// Anatomical regions and sites (unified source of truth)
export {
  // Sides
  SIDES,
  type Side,
  // Movement regions (E4, E5)
  MOVEMENT_REGIONS,
  SVG_REGIONS,
  getMovementPainQuestions,
  type MovementRegion,
  // Palpation sites (E9)
  PALPATION_SITES,
  MUSCLE_GROUPS,
  SITE_CONFIG,
  PALPATION_PAIN_QUESTIONS,
  getPalpationPainQuestions,
  type PalpationSite,
  type MuscleGroup,
  type PalpationPainQuestion,
  type SiteConfig,
} from "./model/regions";
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
