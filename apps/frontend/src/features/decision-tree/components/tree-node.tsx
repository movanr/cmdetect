import React from "react";
import { StatusBadge } from "../../evaluation/components/StatusBadge";
import type { CriterionStatus, Position } from "../types";

interface TreeNodeProps {
  id: string;
  label: string;
  negativeLabel?: string;
  subLabel?: string;
  /** Auto-generated location badge from node context (e.g. "M. temporalis · rechts") */
  contextLabel?: string;
  subItems?: {
    labels: string[];
    connector: "UND" | "ODER";
  };
  color?: "blue" | "red";
  isEndNode?: boolean;
  /** Links to another tree (makes node clickable) */
  linkedTreeId?: string;
  onLinkedNodeClick?: (treeId: string) => void;
  /** Imaging recommendation (e.g. "MRT", "CT") */
  imagingNote?: string;
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
    borderColor: "border-gray-400",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
  },
  pending: {
    borderColor: "border-yellow-400",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-900",
  },
};

const TreeNode: React.FC<TreeNodeProps> = ({
  label,
  negativeLabel,
  subLabel,
  contextLabel,
  subItems,
  color,
  isEndNode,
  linkedTreeId,
  onLinkedNodeClick,
  imagingNote,
  position,
  width,
  height,
  status,
  isActive,
}) => {
  // Inactive nodes get a uniform disabled style; active nodes show status/color
  const disabled = {
    borderColor: "border-gray-200",
    bgColor: "bg-gray-50",
    textColor: "text-gray-400",
  };
  const showNegativeLabel = negativeLabel && status === "negative";
  const active =
    color === "red"
      ? showNegativeLabel
        ? nodeColors.negative // grey when gateway criterion is not met
        : { borderColor: "border-red-400", bgColor: "bg-red-50", textColor: "text-red-900" }
      : nodeColors[status];
  const {
    borderColor: borderClass,
    bgColor: bgClass,
    textColor: textClass,
  } = isActive ? active : disabled;

  const isLinked = !!linkedTreeId;

  return (
    <div
      className={`absolute z-20 shadow-sm border-2 rounded-lg ${borderClass} ${bgClass} ${
        isLinked ? "cursor-pointer hover:ring-2 hover:ring-blue-300 transition-shadow" : ""
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      onClick={isLinked ? () => onLinkedNodeClick?.(linkedTreeId) : undefined}
    >
      <div className="p-3 rounded-lg flex flex-col items-center justify-center h-full">
        <div className={`text-center ${textClass}`}>
          <div className="text-sm font-medium mb-1">
            {negativeLabel && status === "negative" ? negativeLabel : label}
          </div>
          {contextLabel && (
            <div className="mb-1">
              <span className="inline-block text-[10px] font-medium text-gray-500 bg-gray-200/60 rounded-full px-2 py-0.5">
                {contextLabel}
              </span>
            </div>
          )}
          {subLabel && <div className="text-xs text-gray-600 mb-1">{subLabel}</div>}
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

        {imagingNote && isActive && (
          <div className="mt-1">
            <span className="inline-block text-[10px] font-medium text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
              {`Durch ${imagingNote} bestätigen`}
            </span>
          </div>
        )}

        {/* Status Badge — same component as evaluation table */}
        {!isEndNode && isActive && (
          <div className="flex justify-center mt-1">
            <StatusBadge status={status} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TreeNode;
