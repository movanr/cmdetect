import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { CircleCheck } from "lucide-react";
import React from "react";
import type { PractitionerDecision } from "../../evaluation/types";
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
  /** DC/TMD diagnosis ID for blue end nodes */
  diagnosisId?: string;
  /** Practitioner decision for this end node's diagnosis */
  practitionerDecision?: PractitionerDecision;
  /** Popover content rendered by parent (EndNodePopover) */
  popoverContent?: React.ReactNode;
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

const confirmedColors = {
  borderColor: "border-green-500",
  bgColor: "bg-green-50",
  textColor: "text-green-900",
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
  diagnosisId,
  practitionerDecision,
  popoverContent,
  position,
  width,
  height,
  status,
  isActive,
}) => {
  const isConfirmed = practitionerDecision === "confirmed";

  const showNegativeLabel = negativeLabel && status === "negative";

  const endNodeColors = {
    borderColor: "border-gray-400",
    bgColor: "bg-white",
    textColor: "text-gray-900",
  };

  // Confirmed end nodes override to green; all other end nodes use uniform style
  const active =
    isEndNode && isConfirmed
      ? confirmedColors
      : isEndNode
        ? endNodeColors
        : color === "red" && showNegativeLabel
          ? nodeColors.negative
          : nodeColors[status];

  const { borderColor: borderClass, bgColor: bgClass, textColor: textClass } = active;

  const isLinked = !!linkedTreeId;
  const isClickableEndNode = !!diagnosisId && !!popoverContent;

  const nodeContent = (
    <div
      className={`absolute z-20 shadow-sm border-2 rounded-lg ${borderClass} ${bgClass} ${
        isLinked
          ? "cursor-pointer hover:ring-2 hover:ring-blue-300 transition-shadow"
          : isClickableEndNode
            ? "cursor-pointer hover:ring-2 hover:ring-blue-300 transition-shadow"
            : ""
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

        {/* Befund label for criterion nodes */}
        {!isEndNode && (
          <div className="flex justify-center mt-1">
            <span
              className={`inline-block text-[10px] font-medium rounded-full px-2 py-0.5 ${
                status === "positive"
                  ? "text-blue-700 bg-blue-100"
                  : status === "negative"
                    ? "text-gray-600 bg-gray-200"
                    : "text-yellow-700 bg-yellow-100"
              }`}
            >
              {status === "positive"
                ? "Positiver Befund (Ja)"
                : status === "negative"
                  ? "Negativer Befund (Nein)"
                  : "Kein Befund (nicht vollständig untersucht)"}
            </span>
          </div>
        )}

        {imagingNote && isActive && (
          <div className="mt-1">
            <span className="inline-block text-[10px] font-medium text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
              {`Durch ${imagingNote} bestätigen`}
            </span>
          </div>
        )}

        {/* Confirmed checkmark for diagnosis end nodes */}
        {isConfirmed && (
          <div className="flex justify-center mt-1">
            <CircleCheck className="h-4 w-4 text-green-600" />
          </div>
        )}
      </div>
    </div>
  );

  // Wrap blue end nodes with Popover
  if (isClickableEndNode) {
    return (
      <Popover>
        <PopoverTrigger asChild>{nodeContent}</PopoverTrigger>
        {popoverContent}
      </Popover>
    );
  }

  return nodeContent;
};

export default TreeNode;
