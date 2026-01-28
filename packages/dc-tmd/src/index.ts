/**
 * @cmdetect/dc-tmd - DC/TMD IDs, types, and diagnostic criteria
 *
 * Single source of truth for DC/TMD anatomical regions, diagnostic criteria IDs,
 * and the criteria DSL for expressing diagnostic rules.
 *
 * Used by examination-v2 and the diagnostics feature.
 */

// IDs
export * from "./ids/anatomy";
export * from "./ids/diagnosis";
export * from "./ids/examination";

// Types
export * from "./types/results";

// Criteria DSL
export * from "./criteria";
