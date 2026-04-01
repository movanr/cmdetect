import { Badge } from "@/components/ui/badge";
import React from "react";
import type { Position } from "../types";

const badgeClass = "text-xs px-1.5 py-0 font-mono";

/** Inline badges for data source references (appended after label) */
const SourceBadges: React.FC<{ sources: string[] }> = ({ sources }) => (
  <span className="inline-flex gap-0.5 ml-1">
    {sources.map((src) => (
      <Badge key={src} variant="outline" className={badgeClass}>
        {src}
      </Badge>
    ))}
  </span>
);

const bracketPattern = /(\[[^\]]+\])/;

/** Parse text for `[X, Y]` patterns → replace with inline badges */
function renderWithInlineBadges(text: string): React.ReactNode {
  const parts = text.split(bracketPattern);
  if (parts.length === 1) return null; // no brackets found
  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]$/);
    if (!match) return <React.Fragment key={i}>{part}</React.Fragment>;
    const badges = match[1].split(/,\s*/);
    return (
      <span key={i} className="inline-flex gap-0.5 mx-0.5 align-baseline">
        {badges.map((b) => (
          <Badge key={b} variant="outline" className={badgeClass}>
            {b}
          </Badge>
        ))}
      </span>
    );
  });
}

interface TreeNodeProps {
  id: string;
  label: string;
  subLabel?: string;
  sources?: string[];
  subItems?: {
    labels: string[];
    connector: "UND" | "ODER";
    sources?: string[][];
  };
  color?: "blue" | "red";
  isEndNode?: boolean;
  isEntryNode?: boolean;
  imagingNote?: string;
  position: Position;
  width: number;
  height: number;
}

const blueEndColors = {
  borderColor: "border-border",
  bgColor: "bg-teal-100",
  textColor: "text-teal-900",
};

const redEndColors = {
  borderColor: "border-border",
  bgColor: "bg-red-100",
  textColor: "text-red-900",
};

const defaultEndColors = {
  borderColor: "border-border",
  bgColor: "bg-card",
  textColor: "text-foreground",
};

const entryNodeColors = {
  borderColor: "border-blue-400",
  bgColor: "bg-card",
  textColor: "text-foreground",
};

const neutralColors = {
  borderColor: "border-border",
  bgColor: "bg-card",
  textColor: "text-foreground",
};

const TreeNode: React.FC<TreeNodeProps> = ({
  label,
  subLabel,
  sources,
  subItems,
  color,
  isEndNode,
  isEntryNode,
  imagingNote,
  position,
  width,
  height,
}) => {
  const { borderColor: borderClass, bgColor: bgClass, textColor: textClass } =
    isEndNode
      ? color === "blue"
        ? blueEndColors
        : color === "red"
          ? redEndColors
          : defaultEndColors
      : isEntryNode
        ? entryNodeColors
        : neutralColors;

  return (
    <div
      className={`absolute z-20 shadow-sm border-2 rounded-lg ${borderClass} ${bgClass}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <div className="p-3 rounded-lg flex flex-col items-center justify-center h-full">
        <div className={`text-center ${textClass}`}>
          <div className="text-sm font-medium mb-1">
            {renderWithInlineBadges(label) ?? (
              <>
                {label}
                {!isEndNode && sources && sources.length > 0 && (
                  <SourceBadges sources={sources} />
                )}
              </>
            )}
          </div>
          {subLabel && <div className="text-xs text-gray-600 mb-1">{subLabel}</div>}
          {subItems && (
            <div className="space-y-0.5">
              {subItems.labels.map((item, idx) => (
                <div key={idx}>
                  <div className="text-sm font-medium">
                    {renderWithInlineBadges(item) ?? (
                      <>
                        {item}
                        {subItems.sources?.[idx] && subItems.sources[idx].length > 0 && (
                          <SourceBadges sources={subItems.sources[idx]} />
                        )}
                      </>
                    )}
                  </div>
                  {idx < subItems.labels.length - 1 && (
                    <div className="text-[10px] font-semibold text-gray-500">
                      {subItems.connector}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {imagingNote && (
          <div className="mt-1">
            <Badge
              variant="outline"
              className="text-[10px] px-1 py-0 h-4 font-normal text-amber-700 border-amber-200"
            >
              {`Durch ${imagingNote} bestätigen, wenn indiziert`}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreeNode;
