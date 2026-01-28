import type { z } from "zod";
import type { AnyPrimitive } from "./primitives";

export type QuestionNode<P extends AnyPrimitive = AnyPrimitive> = {
  __nodeType: "question";
  __primitive: P;
  __labelKey?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GroupNode<C extends Record<string, any> = Record<string, any>> = {
  __nodeType: "group";
  __children: C;
};

export type ModelNode = QuestionNode | GroupNode;

export const M = {
  question: <P extends AnyPrimitive>(
    primitive: P,
    labelKey?: string
  ): QuestionNode<P> => ({
    __nodeType: "question",
    __primitive: primitive,
    __labelKey: labelKey,
  }),

  group: <C extends Record<string, ModelNode>>(children: C): GroupNode<C> => ({
    __nodeType: "group",
    __children: children,
  }),
};

// Type helper for inferring form values from model
export type InferModelType<T extends ModelNode> =
  T extends QuestionNode<infer P>
    ? P extends { schema: z.ZodType<infer U> }
      ? U
      : never
    : T extends GroupNode<infer C>
      ? { [K in keyof C]: InferModelType<C[K]> }
      : never;
