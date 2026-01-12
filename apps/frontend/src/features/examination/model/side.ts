export const SIDES = {
  RIGHT: "right",
  LEFT: "left",
} as const;

export type Side = (typeof SIDES)[keyof typeof SIDES];

/*import type { Localized } from "./localisation";

type SideType = { id: string; label: Localized<string> };

export const SIDES = {
  right: {
    id: "right",
    label: {
      en: "Right Side",
      de: "Rechte Seite",
    },
  },
  left: {
    id: "left",
    label: {
      en: "Left Side",
      de: "Linke Seite",
    },
  },
} as const satisfies Record<string, SideType>;

export type SideId = keyof typeof SIDES;

export type PainType = (typeof SIDES)[SideId];
*/
