import type { Region } from "../../../model/regions";

/** Expanded region state per side */
export type ExpandedState = { left: Region | null; right: Region | null };
