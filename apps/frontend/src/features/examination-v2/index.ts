// Model primitives and nodes
export { Q, type AnyPrimitive } from "./model/primitives";
export {
  M,
  type QuestionNode,
  type GroupNode,
  type ModelNode,
  type InferModelType,
} from "./model/nodes";
export {
  SIDES,
  E4_REGIONS,
  getPainQuestions,
  type Side,
  type E4Region,
} from "./model/contexts";

// Sections
export { E4_MODEL, E4_STEPS } from "./sections/e4.model";

// Projections
export { schemaFromModel, schemaWithRoot } from "./projections/to-schema";
export {
  instancesFromModel,
  defaultsFromModel,
  getStepInstances,
  type QuestionInstance,
  type StepDefinition,
} from "./projections/to-instances";

// Form hooks
export {
  useExaminationForm,
  type FormValues,
} from "./form/use-examination-form";
export {
  createStepValidator,
  getStepPaths,
} from "./form/use-step-validation";
export {
  createPathHelpers,
  type PathHelpers,
} from "./form/path-helpers";

// Components
export { E4Section } from "./components/E4Section";
export { QuestionField } from "./components/QuestionField";
export { YesNoInput, YesNoField } from "./components/inputs";
export { MeasurementInput, MeasurementField } from "./components/inputs";

// Labels
export {
  getLabel,
  getSideLabel,
  getRegionLabel,
  getPainTypeLabel,
} from "./labels";
