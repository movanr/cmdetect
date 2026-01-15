// Re-export pages
export { ExaminationFormPage } from "./pages/ExaminationFormPage";

// Re-export section components
export { E4OpeningSection, E9PalpationSection } from "./render/sections";

// Re-export section definitions
export {
  createE4Questions,
  E4_SECTION,
  createE9Questions,
  E9_SECTION,
} from "./definition/sections";

// Re-export model types
export type { Question, ChoiceQuestion, NumericQuestion, BooleanQuestion } from "./model/question";
export type { QuestionContext, EnableWhen } from "./model/question";
export { MOVEMENTS, type Movement } from "./model/movement";
export { PAIN_TYPES, type PainType } from "./model/pain";
export { REGIONS, type Region } from "./model/region";
export { SIDES, type Side } from "./model/side";

// Re-export form utilities
export { zodSchemaFromQuestions, zodSubmitSchemaFromQuestions } from "./form/schema/fromQuestions";
export { evaluateEnableWhen, resolveDependency, type FormValues, type FormValueGetter } from "./form/evaluateEnableWhen";

// Re-export content
export { getLabel, SECTION_LABELS, type LabelId } from "./content";
