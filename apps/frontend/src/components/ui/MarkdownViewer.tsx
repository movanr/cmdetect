import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/slugify";
import type { Components } from "react-markdown";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

/**
 * A simple markdown viewer component for general use.
 * For protocol-specific features (figures, cross-references), use ProtocolMarkdownViewer instead.
 */
export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  const components: Components = {
    // Add IDs to headings for anchor links
    h1: ({ children }) => {
      const text = String(children);
      const id = slugify(text);
      return (
        <h1 id={id} className="scroll-mt-4">
          {children}
        </h1>
      );
    },
    h2: ({ children }) => {
      const text = String(children);
      const id = slugify(text);
      return (
        <h2 id={id} className="scroll-mt-4">
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const text = String(children);
      const id = slugify(text);
      return (
        <h3 id={id} className="scroll-mt-4">
          {children}
        </h3>
      );
    },
    h4: ({ children }) => {
      const text = String(children);
      const id = slugify(text);
      return (
        <h4 id={id} className="scroll-mt-4">
          {children}
        </h4>
      );
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
