import type { ProcedureFlowStep } from "@/features/examination/content/types";
import type { SQSectionId } from "@cmdetect/questionnaires";

/** Interview instruction for a single SQ wizard section */
export interface SQSectionInstruction {
  sectionId: SQSectionId;
  title: string;
  description: string;
  flow: ProcedureFlowStep[];
}
