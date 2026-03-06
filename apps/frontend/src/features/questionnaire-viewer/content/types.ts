import type { ProcedureFlowStep } from "@/types/procedure-flow";
import type { SQSectionId } from "@cmdetect/questionnaires";

/** Interview instruction for a single SQ wizard section */
export interface SQSectionInstruction {
  sectionId: SQSectionId;
  title: string;
  description: string;
  flow: ProcedureFlowStep[];
}
