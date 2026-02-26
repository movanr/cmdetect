import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { getSectionRoute, getSectionAnchor } from "../lib/section-routing";

interface SectionLinkProps {
  sectionNum: string;
  children: ReactNode;
}

export function SectionLink({ sectionNum, children }: SectionLinkProps) {
  const route = getSectionRoute(sectionNum);
  if (!route) {
    return <>{children}</>;
  }

  const anchor = getSectionAnchor(sectionNum);

  // If no anchor, link goes to top of page
  if (!anchor) {
    return (
      <Link
        to="/protocol/$section"
        params={{ section: route }}
        className="text-primary hover:underline"
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      to="/protocol/$section"
      params={{ section: route }}
      hash={anchor}
      className="text-primary hover:underline"
    >
      {children}
    </Link>
  );
}

/**
 * Process text to find and linkify cross-references.
 * Pattern 1: "6.2.1: Description" at start of text (list items)
 * Pattern 2: "Abschnitt X" anywhere in text
 */
// eslint-disable-next-line react-refresh/only-export-components
export function processTextWithCrossRefs(text: string): ReactNode[] {
  const result: ReactNode[] = [];
  let lastIndex = 0;
  let keyIndex = 0;

  // Pattern for section references like "6.2.1: Description" at start
  const listRefPattern = /^(\d+(?:\.\d+)*):?\s*(.*)$/;
  const listMatch = text.match(listRefPattern);
  if (listMatch) {
    const [, sectionNum] = listMatch;
    const route = getSectionRoute(sectionNum);
    if (route) {
      return [
        <SectionLink key="ref" sectionNum={sectionNum}>
          {text}
        </SectionLink>,
      ];
    }
  }

  // Pattern for "Abschnitt X" (German) and "Section X" (English) references
  const sectionPattern = /(?:Abschnitt|Section)\s+(\d+(?:\.\d+)*)/g;
  let match;

  while ((match = sectionPattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    const sectionNum = match[1];
    const route = getSectionRoute(sectionNum);

    if (route) {
      result.push(
        <SectionLink key={`ref-${keyIndex++}`} sectionNum={sectionNum}>
          {match[0]}
        </SectionLink>
      );
    } else {
      result.push(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result.length > 0 ? result : [text];
}

/**
 * Process children recursively to handle cross-references in text nodes.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function processChildren(children: ReactNode): ReactNode {
  if (typeof children === "string") {
    const processed = processTextWithCrossRefs(children);
    return processed.length === 1 && typeof processed[0] === "string"
      ? processed[0]
      : <>{processed}</>;
  }

  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (typeof child === "string") {
        const processed = processTextWithCrossRefs(child);
        return processed.length === 1 && typeof processed[0] === "string" ? (
          processed[0]
        ) : (
          <span key={i}>{processed}</span>
        );
      }
      return child;
    });
  }

  return children;
}
