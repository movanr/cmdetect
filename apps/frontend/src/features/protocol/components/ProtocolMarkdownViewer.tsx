import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { getHeadingId } from "@/lib/slugify";
import type { Components } from "react-markdown";

import { parseFigureReference } from "../lib/figures";
import { FigureEmbed, MultiFigureEmbed } from "./FigureEmbed";
import { processChildren } from "./SectionLink";

interface ProtocolMarkdownViewerProps {
  content: string;
  className?: string;
}

export function ProtocolMarkdownViewer({ content, className }: ProtocolMarkdownViewerProps) {
  const components: Components = {
    // Add IDs to headings for ToC links and cross-reference anchors
    h1: ({ children }) => {
      const text = String(children);
      const id = getHeadingId(text);
      return (
        <h1 id={id} className="scroll-mt-4">
          {children}
        </h1>
      );
    },
    h2: ({ children }) => {
      const text = String(children);
      const id = getHeadingId(text);
      return (
        <h2 id={id} className="scroll-mt-4">
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const text = String(children);
      const id = getHeadingId(text);
      return (
        <h3 id={id} className="scroll-mt-4">
          {children}
        </h3>
      );
    },
    h4: ({ children }) => {
      const text = String(children);
      const id = getHeadingId(text);
      return (
        <h4 id={id} className="scroll-mt-4">
          {children}
        </h4>
      );
    },
    // Handle emphasis (italics) for _Abbildung X_ or _Abbildungen X & Y_
    em: ({ children }) => {
      const text = children?.toString() || "";
      const figureIds = parseFigureReference(text);
      if (figureIds) {
        if (figureIds.length === 1) {
          return <FigureEmbed figureId={figureIds[0]} />;
        } else {
          return <MultiFigureEmbed figureIds={figureIds} />;
        }
      }
      return <em>{children}</em>;
    },
    // Handle strong (bold) for **Abbildung X:** patterns in translated sections
    strong: ({ children }) => {
      const text = children?.toString() || "";
      // Match "Abbildung X:" or "Abbildungen X & Y:" at the start
      const figureWithColonMatch = text.match(/^(Abbildungen?\s+[\d\w]+(?:\s*[&,]\s*[\d\w]+)*):/i);
      if (figureWithColonMatch) {
        const figureText = figureWithColonMatch[1];
        const figureIds = parseFigureReference(figureText);
        if (figureIds) {
          if (figureIds.length === 1) {
            return <FigureEmbed figureId={figureIds[0]} />;
          } else {
            return <MultiFigureEmbed figureIds={figureIds} />;
          }
        }
      }
      return <strong>{children}</strong>;
    },
    // Handle paragraphs with cross-references
    p: ({ children }) => {
      return <p>{processChildren(children)}</p>;
    },
    // Handle list items with cross-references (e.g., "6.2.1: Description")
    li: ({ children }) => {
      return <li>{processChildren(children)}</li>;
    },
    // Handle blockquotes with cross-references
    blockquote: ({ children }) => {
      return <blockquote>{children}</blockquote>;
    },
  };

  return (
    <article
      className={cn(
        "prose prose-slate dark:prose-invert max-w-none",
        // Table styling
        "prose-table:border-collapse prose-table:border",
        "prose-th:border prose-th:p-2 prose-th:bg-muted",
        "prose-td:border prose-td:p-2",
        // Heading scroll margin
        "prose-headings:scroll-mt-4",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </article>
  );
}
