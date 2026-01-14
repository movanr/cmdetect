export const SIDES = {
  RIGHT: "right",
  LEFT: "left",
} as const;

export type Side = (typeof SIDES)[keyof typeof SIDES];
