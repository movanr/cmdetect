import React from "react";
import type { CriterionStatus, Position } from "../types";
import { StatusBadge } from "../../evaluation/components/StatusBadge";

interface TreeNodeProps {
  id: string;
  label: string;
  subLabel?: string;
  /** Auto-generated location badge from node context (e.g. "M. temporalis · rechts") */
  contextLabel?: string;
  subItems?: {
    labels: string[];
    connector: "UND" | "ODER";
  };
  color?: "blue" | "red";
  isEndNode?: boolean;
  position: Position;
  width: number;
  height: number;
  status: CriterionStatus;
  isActive: boolean;
}

const nodeColors: Record<
  CriterionStatus,
  { borderColor: string; bgColor: string; textColor: string }
> = {
  positive: {
    borderColor: "border-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-900",
  },
  negative: {
    borderColor: "border-gray-300",
    bgColor: "bg-gray-50",
    textColor: "text-gray-600",
  },
  pending: {
    borderColor: "border-yellow-400",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-900",
  },
};

const TreeNode: React.FC<TreeNodeProps> = ({
  label,
  subLabel,
  contextLabel,
  subItems,
  color,
  isEndNode,
  position,
  width,
  height,
  status,
  isActive,
}) => {
  const colors = nodeColors[status];

  // "red" end nodes (e.g. "Andere Diagnosen") get fixed red styling,
  // all other nodes follow status colors
  const borderClass =
    color === "red" ? "border-red-400" : colors.borderColor;
  const bgClass =
    color === "red" ? "bg-red-50" : colors.bgColor;
  const textClass =
    color === "red" ? "text-red-900" : colors.textColor;

  return (
    <div
      className={`absolute z-20 shadow-sm border-2 rounded-lg ${borderClass} ${bgClass} ${
        isActive ? "" : "opacity-50"
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <div className="p-3 rounded-lg flex flex-col items-center justify-center h-full">
        <div className={`text-center ${textClass}`}>
          <div className="text-sm font-medium mb-1">{label}</div>
          {contextLabel && (
            <div className="mb-1">
              <span className="inline-block text-[10px] font-medium text-gray-500 bg-gray-200/60 rounded-full px-2 py-0.5">
                {contextLabel}
              </span>
            </div>
          )}
          {subLabel && (
            <div className="text-xs text-gray-600 mb-1">{subLabel}</div>
          )}
          {subItems && (
            <div className="space-y-0.5">
              {subItems.labels.map((item, idx) => (
                <div key={idx}>
                  <div className="text-xs text-gray-700">{item}</div>
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

        {/* Status Badge — same component as evaluation table */}
        {!isEndNode && (
          <div className="flex justify-center mt-1">
            <StatusBadge status={status} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TreeNode;
