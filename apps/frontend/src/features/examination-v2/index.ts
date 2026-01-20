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
  MOVEMENT_REGIONS,
  MUSCLE_GROUPS,
  PALPATION_PAIN_QUESTIONS,
  // Palpation sites (E9)
  PALPATION_SITES,
  // Sides
  SIDES,
  SITE_CONFIG,
  SVG_REGIONS,
  type MovementRegion,
  type MuscleGroup,
  type PalpationPainQuestion,
  type PalpationSite,
  type Side,
  type SiteConfig,
} from "./model/regions";

// Sections
export { E4_MODEL, E4_STEPS } from "./sections/e4.model";
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
export { E4Section } from "./components/sections/E4Section";
export { E9Section } from "./components/sections/E9Section";

// Labels
export {
  getLabel,
  getMuscleGroupLabel,
  getPainTypeLabel,
  getPalpationSiteLabel,
  getRegionLabel,
  getSideLabel,
} from "./labels";
