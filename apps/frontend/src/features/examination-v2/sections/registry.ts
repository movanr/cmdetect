import type { GroupNode, ModelNode } from "../model/nodes";
import type { StepDefinition } from "../projections/to-instances";
import { E4_MODEL, E4_STEPS } from "./e4.model";
import { E9_MODEL, E9_STEPS } from "./e9.model";

export type SectionId = "e4" | "e9";

export interface SectionConfig {
  id: SectionId;
  label: string;
  model: GroupNode & { __children: Record<string, ModelNode> };
  steps: Record<string, StepDefinition>;
}

// Section registry - single source of truth for all examination sections
export const SECTION_REGISTRY: SectionConfig[] = [
  {
    id: "e4",
    label: "U4: Mundöffnung",
    model: E4_MODEL,
    steps: E4_STEPS,
  },
  {
    id: "e9",
    label: "U9: Palpation",
    model: E9_MODEL,
    steps: E9_STEPS,
  },
];

// Helper to get section by id
export const getSection = (id: SectionId): SectionConfig | undefined =>
  SECTION_REGISTRY.find((s) => s.id === id);

// All section IDs in order
export const SECTION_IDS = SECTION_REGISTRY.map((s) => s.id);
