import type { GroupNode, ModelNode } from "../model/nodes";
import type { StepDefinition } from "../projections/to-instances";
import { E1_MODEL, E1_STEPS } from "./e1.model";
import { E2_MODEL, E2_STEPS } from "./e2.model";
import { E3_MODEL, E3_STEPS } from "./e3.model";
import { E4_MODEL, E4_STEPS } from "./e4.model";
import { E9_MODEL, E9_STEPS } from "./e9.model";

export type SectionId = "e1" | "e2" | "e3" | "e4" | "e5" | "e6" | "e7" | "e8" | "e9" | "e10";

export interface SectionConfig {
  id: SectionId;
  label: string;
  model: GroupNode & { __children: Record<string, ModelNode> };
  steps: Record<string, StepDefinition>;
}

// Section registry - single source of truth for all examination sections
export const SECTION_REGISTRY: SectionConfig[] = [
  {
    id: "e1",
    label: "U1: Schmerzlokalisation",
    model: E1_MODEL,
    steps: E1_STEPS,
  },
  {
    id: "e2",
    label: "U2: Schneidezahnbeziehungen",
    model: E2_MODEL,
    steps: E2_STEPS,
  },
  {
    id: "e3",
    label: "U3: Öffnungsmuster",
    model: E3_MODEL,
    steps: E3_STEPS,
  },
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
