import { getSectionTitle, SECTIONS, type SectionId } from "@cmdetect/dc-tmd";
import type { GroupNode, ModelNode } from "../model/nodes";
import type { StepDefinition } from "../projections/to-instances";
import { E1_MODEL, E1_STEPS } from "./e1.model";
import { E2_MODEL, E2_STEPS } from "./e2.model";
import { E3_MODEL, E3_STEPS } from "./e3.model";
import { E4_MODEL, E4_STEPS } from "./e4.model";
import { E5_MODEL, E5_STEPS } from "./e5.model";
import { E6_MODEL, E6_STEPS } from "./e6.model";
import { E7_MODEL, E7_STEPS } from "./e7.model";
import { E8_MODEL, E8_STEPS } from "./e8.model";
import { E9_MODEL, E9_STEPS } from "./e9.model";
import { E10_MODEL, E10_STEPS } from "./e10.model";

export type { SectionId };

export interface SectionConfig {
  id: SectionId;
  label: string;
  model: GroupNode & { __children: Record<string, ModelNode> };
  steps: Record<string, StepDefinition>;
}

// Section registry - single source of truth for all examination sections
export const SECTION_REGISTRY: SectionConfig[] = [
  {
    id: SECTIONS.e1,
    label: getSectionTitle(SECTIONS.e1),
    model: E1_MODEL,
    steps: E1_STEPS,
  },
  {
    id: SECTIONS.e2,
    label: getSectionTitle(SECTIONS.e2),
    model: E2_MODEL,
    steps: E2_STEPS,
  },
  {
    id: SECTIONS.e3,
    label: getSectionTitle(SECTIONS.e3),
    model: E3_MODEL,
    steps: E3_STEPS,
  },
  {
    id: SECTIONS.e4,
    label: getSectionTitle(SECTIONS.e4),
    model: E4_MODEL,
    steps: E4_STEPS,
  },
  {
    id: SECTIONS.e5,
    label: getSectionTitle(SECTIONS.e5),
    model: E5_MODEL,
    steps: E5_STEPS,
  },
  {
    id: SECTIONS.e6,
    label: getSectionTitle(SECTIONS.e6),
    model: E6_MODEL,
    steps: E6_STEPS,
  },
  {
    id: SECTIONS.e7,
    label: getSectionTitle(SECTIONS.e7),
    model: E7_MODEL,
    steps: E7_STEPS,
  },
  {
    id: SECTIONS.e8,
    label: getSectionTitle(SECTIONS.e8),
    model: E8_MODEL,
    steps: E8_STEPS,
  },
  {
    id: SECTIONS.e9,
    label: getSectionTitle(SECTIONS.e9),
    model: E9_MODEL,
    steps: E9_STEPS,
  },
  {
    id: SECTIONS.e10,
    label: getSectionTitle(SECTIONS.e10),
    model: E10_MODEL,
    steps: E10_STEPS,
  },
];

// Helper to get section by id
export const getSection = (id: SectionId): SectionConfig | undefined =>
  SECTION_REGISTRY.find((s) => s.id === id);

// All section IDs in order
export const SECTION_IDS = SECTION_REGISTRY.map((s) => s.id);
