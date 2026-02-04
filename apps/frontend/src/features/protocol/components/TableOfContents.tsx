import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { getHeadingId } from "@/lib/slugify";

interface TocItem {
  id: string;
  text: string;
  level: number; // 2 for ##, 3 for ###
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

function parseHeadings(markdown: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: TocItem[] = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = getHeadingId(text);
    headings.push({ id, text, level });
  }
  return headings;
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const headings = useMemo(() => parseHeadings(content), [content]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <aside
      className={cn(
        "w-64 border-l bg-muted/10 hidden xl:block shrink-0",
        className
      )}
    >
      <div className="sticky top-0 h-screen overflow-auto">
        <nav className="p-4">
          <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
            Inhalt
          </h4>
          <ul className="space-y-1">
            {headings.map((h, index) => (
              <li
                key={`${h.id}-${index}`}
                style={{ paddingLeft: (h.level - 2) * 12 }}
              >
                <a
                  href={`#${h.id}`}
                  className={cn(
                    "block text-sm py-1 text-muted-foreground hover:text-foreground transition-colors",
                    "line-clamp-2"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(h.id);
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                      // Update URL hash without triggering scroll
                      window.history.pushState(null, "", `#${h.id}`);
                    }
                  }}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
