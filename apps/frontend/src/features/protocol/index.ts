// Components
export { ProtocolMarkdownViewer } from "./components/ProtocolMarkdownViewer";
export { TableOfContents } from "./components/TableOfContents";
export { FigureEmbed, MultiFigureEmbed } from "./components/FigureEmbed";
export { SectionLink, processChildren, processTextWithCrossRefs } from "./components/SectionLink";

// Context
export { ProtocolContext, useProtocolContext } from "./context";

// Lib
export { getSectionRoute, getSectionAnchor } from "./lib/section-routing";
export { parseFigureReference, imageMap, typedFigureIndex } from "./lib/figures";
export type { FigureData } from "./lib/figures";
