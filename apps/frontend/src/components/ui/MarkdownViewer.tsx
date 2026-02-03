import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  return (
    <article
      className={cn(
        "prose prose-slate dark:prose-invert max-w-none",
        // Table styling
        "prose-table:border-collapse prose-table:border",
        "prose-th:border prose-th:p-2 prose-th:bg-muted",
        "prose-td:border prose-td:p-2",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
