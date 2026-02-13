import type { Criterion, CriterionStatus, Region, Side, TemplateContext } from "@cmdetect/dc-tmd";

// ============================================================================
// GEOMETRY
// ============================================================================

export interface Position {
  x: number;
  y: number;
}

export type Direction = "right" | "left" | "up" | "down";

// ============================================================================
// TREE NODE DEFINITION
// ============================================================================

export interface TreeNodeDef {
  /** Unique node identifier */
  id: string;
  /** Display title (German) */
  label: string;
  /** Alternative label shown when the node's criterion evaluates to negative */
  negativeLabel?: string;
  /** Optional subtitle */
  subLabel?: string;
  /** Sub-criteria labels displayed with a connector (UND/ODER) */
  subItems?: {
    labels: string[];
    connector: "UND" | "ODER";
  };
  /** dc-tmd Criterion to evaluate (optional for end nodes) */
  criterion?: Criterion;
  /** Template context {side, region} for evaluation */
  context?: TemplateContext;
  /** Node color */
  color?: "blue" | "red";
  /** End node flag (no status badge) */
  isEndNode?: boolean;
  /** Links to another tree (makes node clickable) */
  linkedTreeId?: string;
  /** Imaging recommendation shown on diagnosis end nodes (e.g. "MRT", "CT") */
  imagingNote?: string;
  /** DC/TMD diagnosis ID for blue end nodes (enables practitioner selection) */
  diagnosisId?: string;
  /** Center position (converted to top-left during rendering) */
  center: Position;
  width: number;
  height: number;
}

// ============================================================================
// TREE DEFINITION
// ============================================================================

export interface DecisionTreeDef {
  /** Tree identifier (e.g., "myalgia-right-temporalis") */
  id: string;
  /** Display title */
  title: string;
  side: Side;
  region: Region;
  nodes: TreeNodeDef[];
  transitions: TransitionFromIds[];
}

// ============================================================================
// TRANSITIONS & ARROWS (unchanged from original)
// ============================================================================

export type TransitionType = "positive" | "negative" | "unconditional";

/** Evaluated state of a node (never "unconditional") */
export type NodeEvaluatedState = "positive" | "negative";

export type NodeStateMap = Record<string, NodeEvaluatedState>;

export interface TransitionFromIds {
  from: string;
  to: string;
  startDirection: Direction;
  endDirection: Direction;
  joints?: Position[];
  type: TransitionType;
  label?: string;
}

/** Resolved transition with node references for rendering */
export interface TransitionProps {
  from: ResolvedNode;
  to: ResolvedNode;
  startDirection: Direction;
  endDirection: Direction;
  type: TransitionType;
  label?: string;
  joints?: Position[];
}

/** Node with computed position (top-left corner) for rendering */
export interface ResolvedNode {
  position: Position;
  width: number;
  height: number;
}

export interface ArrowProps {
  path: Position[];
  direction: Direction;
}

/** Status of a node as evaluated by dc-tmd */
export { type CriterionStatus, type Region, type Side };
