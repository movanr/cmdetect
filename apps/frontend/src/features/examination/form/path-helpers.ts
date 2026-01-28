import type { OpeningType, Side } from "@cmdetect/dc-tmd";
import type { QuestionInstance } from "../projections/to-instances";

/** Template literal type for form paths with a given root */
type FormPath<TRoot extends string> = TRoot | `${TRoot}.${string}`;

/** Opening types that have pain interview questions (excludes painFree) */
type InterviewOpeningType = Exclude<OpeningType, "painFree">;

/**
 * Creates path helper functions from question instances.
 * Provides runtime-validated path access instead of hardcoded strings.
 */
export function createPathHelpers<TRoot extends string>(
  instances: QuestionInstance[],
  _rootKey?: TRoot
) {
  type Path = FormPath<TRoot>;
  const pathSet = new Set(instances.map((i) => i.path));

  return {
    /** All valid paths */
    all: (): Path[] => instances.map((i) => i.path as Path),

    /** Get a single path, throws if invalid */
    get: <T extends string>(path: T): T & Path => {
      if (!pathSet.has(path)) {
        throw new Error(`Invalid path: ${path}`);
      }
      return path as T & Path;
    },

    /** Check if a path exists */
    has: (path: string): boolean => pathSet.has(path),

    /** Filter paths by prefix */
    byPrefix: (prefix: string): Path[] =>
      instances
        .filter((i) => i.path.startsWith(prefix))
        .map((i) => i.path as Path),

    /** Filter instances by context */
    byContext: (ctx: Partial<QuestionInstance["context"]>) =>
      instances.filter((i) =>
        Object.entries(ctx).every(([k, v]) => i.context[k] === v)
      ),

    /** Get paths for a specific side */
    bySide: (side: Side): Path[] =>
      instances
        .filter((i) => i.context.side === side)
        .map((i) => i.path as Path),

    /** Get paths for a specific region */
    byRegion: (region: string): Path[] =>
      instances
        .filter((i) => i.context.region === region)
        .map((i) => i.path as Path),

    /** Get all measurement paths */
    measurements: (): Path[] =>
      instances
        .filter((i) => i.renderType === "measurement")
        .map((i) => i.path as Path),

    /** Get all yesNo paths */
    yesNoQuestions: (): Path[] =>
      instances
        .filter((i) => i.renderType === "yesNo")
        .map((i) => i.path as Path),

    /** Get interview questions (pain questions with side context) */
    interviewQuestions: (section?: InterviewOpeningType): Path[] => {
      let filtered = instances.filter(
        (i) => i.context.side && i.context.painType
      );
      if (section) {
        filtered = filtered.filter((i) => i.path.includes(section));
      }
      return filtered.map((i) => i.path as Path);
    },
  };
}

export type PathHelpers<TRoot extends string = string> = ReturnType<
  typeof createPathHelpers<TRoot>
>;
