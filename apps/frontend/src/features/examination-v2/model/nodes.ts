import type { AnyPrimitive } from "./primitives";

export type QuestionNode = {
  __nodeType: "question";
  __primitive: AnyPrimitive;
  __labelKey?: string;
};

export type GroupNode = {
  __nodeType: "group";
  __children: Record<string, ModelNode>;
};

export type ModelNode = QuestionNode | GroupNode;

export const M = {
  question: (primitive: AnyPrimitive, labelKey?: string): QuestionNode => ({
    __nodeType: "question",
    __primitive: primitive,
    __labelKey: labelKey,
  }),

  group: <T extends Record<string, ModelNode>>(
    children: T
  ): GroupNode & { __children: T } => ({
    __nodeType: "group",
    __children: children,
  }),
};

// Type helper for inferring form values from model
export type InferModelType<T extends ModelNode> = T extends QuestionNode
  ? ReturnType<T["__primitive"]["schema"]["parse"]>
  : T extends GroupNode
    ? { [K in keyof T["__children"]]: InferModelType<T["__children"][K]> }
    : never;
