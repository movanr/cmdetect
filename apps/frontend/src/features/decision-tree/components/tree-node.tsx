import { Badge } from "@/components/ui/badge";
import React from "react";
import type { Position } from "../types";

/** Inline badges for data source references */
const SourceBadges: React.FC<{ sources: string[] }> = ({ sources }) => (
  <span className="inline-flex gap-0.5 ml-1">
    {sources.map((src) => (
      <Badge
        key={src}
        variant="outline"
        className="text-[10px] px-1 py-0 h-4 font-normal text-muted-foreground"
      >
        {src}
      </Badge>
    ))}
  </span>
);

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
  imagingNote?: string;
  position: Position;
  width: number;
  height: number;
}

const endNodeColors = {
  borderColor: "border-gray-400",
  bgColor: "bg-white",
  textColor: "text-gray-900",
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
  isEndNode,
  imagingNote,
  position,
  width,
  height,
}) => {
  const { borderColor: borderClass, bgColor: bgClass, textColor: textClass } =
    isEndNode ? endNodeColors : neutralColors;

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
            {label}
            {!isEndNode && sources && sources.length > 0 && (
              <SourceBadges sources={sources} />
            )}
          </div>
          {subLabel && <div className="text-xs text-gray-600 mb-1">{subLabel}</div>}
          {subItems && (
            <div className="space-y-0.5">
              {subItems.labels.map((item, idx) => (
                <div key={idx}>
                  <div className="text-xs text-gray-700">
                    {item}
                    {subItems.sources?.[idx] && subItems.sources[idx].length > 0 && (
                      <SourceBadges sources={subItems.sources[idx]} />
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
