import type { Region, Side } from "@cmdetect/dc-tmd";

export type SideOrBoth = Side | "both";

export type HeadacheLocation = "temporalis" | "other";

export interface U1aFinding {
  kind: "u1a";
  primary: Array<{ region: Exclude<Region, "otherMast" | "nonMast">; side: SideOrBoth }>;
  auxiliary: Array<{ region: "otherMast" | "nonMast"; side: SideOrBoth }>;
}

export interface U1bFinding {
  kind: "u1b";
  locations: Array<{ location: HeadacheLocation; side: SideOrBoth }>;
}

export interface U2Finding {
  kind: "u2";
  horizontalOverjet: number | null;
  verticalOverlap: number | null;
  midline: { mm: number; direction: "right" | "left" } | "na" | null;
  referenceTooth: string | null;
}

export interface U3Finding {
  kind: "u3";
  pattern: "correctedDeviation" | "uncorrectedRight" | "uncorrectedLeft";
}

export interface U4Finding {
  kind: "u4";
  painFreeMm: number | null;
  maxMm: number | null;
  painStructures: Array<{ region: Region; side: SideOrBoth }>;
  withHeadache: boolean;
}

export interface U5Finding {
  kind: "u5";
  lateralRightMm: number | null;
  lateralLeftMm: number | null;
  protrusiveMm: number | null;
  painStructures: Array<{ region: Region; side: SideOrBoth }>;
}

export interface U6Finding {
  kind: "u6";
  sound: "click" | "crepitus";
  side: SideOrBoth;
  /** Movements where examiner detected the sound (ordered: open, close). Empty if examiner did not detect. */
  movements: Array<"open" | "close">;
  patient: boolean;
  /** null = not applicable (patient reported no click, so painWithClick was never asked). click only. */
  familiarPain: boolean | null;
}

export interface U7Finding {
  kind: "u7";
  sound: "click" | "crepitus";
  side: SideOrBoth;
  examiner: boolean;
  patient: boolean;
  familiarPain: boolean | null;
}

export interface U8Finding {
  kind: "u8";
  situation: "duringOpening" | "wideOpening";
  side: SideOrBoth;
  reducibility: "byPatient" | "byExaminer" | "none";
}

export interface U9MuscleFinding {
  kind: "u9.muscle";
  muscle: "temporalis" | "masseter";
  side: SideOrBoth;
  triggeredByPain: boolean;
  triggeredByHeadache: boolean;
  /** null when triggeredByPain is false (qualifier is bound to bekannter_schmerz trigger). */
  referred: boolean | null;
  spreading: boolean | null;
}

export interface U9TmjFinding {
  kind: "u9.tmj";
  side: SideOrBoth;
  /** null = not asked (e.g. palpation mode = basic → referredPain field absent). */
  referred: boolean | null;
}

export interface U10Finding {
  kind: "u10";
  site: "posteriorMandibular" | "submandibular" | "lateralPterygoid" | "temporalisTendon";
  side: SideOrBoth;
  referred: boolean;
}

export type Finding =
  | U1aFinding
  | U1bFinding
  | U2Finding
  | U3Finding
  | U4Finding
  | U5Finding
  | U6Finding
  | U7Finding
  | U8Finding
  | U9MuscleFinding
  | U9TmjFinding
  | U10Finding;

/** Findings that carry a `side` and are eligible for bilateral merging. */
export type SidedFinding = Extract<Finding, { side: SideOrBoth }>;
