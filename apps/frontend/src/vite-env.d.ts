/// <reference types="vite/client" />

declare module "*.svg?react" {
  import type { FC, SVGProps } from "react";
  const content: FC<SVGProps<SVGSVGElement>>;
  export default content;
}

declare module "*.md?raw" {
  const content: string;
  export default content;
}

// Allow importing markdown files via @docs alias with ?raw suffix
declare module "@docs/dc-tmd/examiner-protocol/german/extracted/section5_0_german.md?raw" {
  const content: string;
  export default content;
}
declare module "@docs/dc-tmd/examiner-protocol/german/extracted/section5_1_german.md?raw" {
  const content: string;
  export default content;
}
declare module "@docs/dc-tmd/examiner-protocol/german/extracted/section5_2_german.md?raw" {
  const content: string;
  export default content;
}
declare module "@docs/dc-tmd/examiner-protocol/german/extracted/section5_3_german.md?raw" {
  const content: string;
  export default content;
}
declare module "@docs/dc-tmd/examiner-protocol/german/extracted/section5_4_german.md?raw" {
  const content: string;
  export default content;
}
declare module "@docs/dc-tmd/examiner-protocol/german/extracted/section5_5_german.md?raw" {
  const content: string;
  export default content;
}
declare module "@docs/dc-tmd/examiner-protocol/german/extracted/section5_6_german.md?raw" {
  const content: string;
  export default content;
}
declare module "@docs/dc-tmd/examiner-protocol/german/extracted/section5_7_german.md?raw" {
  const content: string;
  export default content;
}
declare module "@docs/dc-tmd/examiner-protocol/german/extracted/section5_8_german.md?raw" {
  const content: string;
  export default content;
}
declare module "@docs/dc-tmd/examiner-protocol/german/extracted/section5_9_german.md?raw" {
  const content: string;
  export default content;
}
declare module "@docs/dc-tmd/examiner-protocol/german/translated/section1_german_unofficial.md?raw" {
  const content: string;
  export default content;
}
declare module "@docs/dc-tmd/examiner-protocol/german/translated/section2_german_unofficial.md?raw" {
  const content: string;
  export default content;
}
declare module "@docs/dc-tmd/examiner-protocol/german/translated/section3_german_unofficial.md?raw" {
  const content: string;
  export default content;
}
declare module "@docs/dc-tmd/examiner-protocol/german/translated/section4_german_unofficial.md?raw" {
  const content: string;
  export default content;
}
declare module "@docs/dc-tmd/examiner-protocol/german/translated/section6_german_unofficial.md?raw" {
  const content: string;
  export default content;
}
declare module "@docs/dc-tmd/examiner-protocol/german/translated/section7_german_unofficial.md?raw" {
  const content: string;
  export default content;
}
declare module "@docs/dc-tmd/examiner-protocol/german/translated/section8_german_unofficial.md?raw" {
  const content: string;
  export default content;
}

// Figure index JSON
declare module "@docs/dc-tmd/examiner-protocol/images/figure_index.json" {
  interface FigureEntry {
    description: string;
    page: number;
    images: string[];
  }
  interface MetaEntry {
    source: string;
    description: string;
    note: string;
  }
  const value: Record<string, FigureEntry | MetaEntry>;
  export default value;
}
