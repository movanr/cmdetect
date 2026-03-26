import React, { useMemo } from "react";
import { getCriterionLabel, getCriterionSources } from "@cmdetect/dc-tmd";
import type {
  DecisionTreeDef,
  Position,
  TransitionFromIds,
  TransitionProps,
  TreeNodeDef,
} from "../types";
import TreeNode from "./tree-node";
import Transition from "./transition";

interface DecisionTreeViewProps {
  tree: DecisionTreeDef;
}

/**
 * Derive display properties for a tree node from its criterion.
 *
 * - label: from criterion label when the node has no explicit label
 * - Simple nodes (no subItems): top-level criterion sources → title badges
 * - Composite nodes where child count matches subItems label count: per-item sources from children
 * - Mismatch: top-level criterion sources → title badges, subItems unchanged
 */
function resolveNodeDisplay(node: TreeNodeDef): {
  label?: string;
  sources?: string[];
  subItems?: TreeNodeDef["subItems"];
} {
  const { criterion, subItems } = node;

  const label = criterion ? getCriterionLabel(criterion) : undefined;

  if (!criterion) {
    return { sources: node.sources, subItems };
  }

  if (!subItems) {
    return { label, sources: getCriterionSources(criterion) };
  }

  if (
    (criterion.type === "and" || criterion.type === "or") &&
    criterion.criteria.length === subItems.labels.length
  ) {
    return {
      label,
      subItems: {
        ...subItems,
        sources: criterion.criteria.map((c) => getCriterionSources(c) ?? []),
      },
    };
  }

  // Count mismatch: show criterion's top-level sources on node title
  return { label, sources: getCriterionSources(criterion), subItems };
}

/** Compute top-left position from center */
function resolvePosition(node: TreeNodeDef): Position {
  return {
    x: node.center.x - node.width / 2,
    y: node.center.y - node.height / 2,
  };
}

/** Calculate tree bounding box dimensions */
function getTreeDimensions(nodes: TreeNodeDef[]) {
  if (nodes.length === 0) return { width: 0, height: 0, minX: 0, maxX: 0 };

  let minX = Infinity;
  let maxX = -Infinity;
  let maxHeight = 0;

  for (const node of nodes) {
    const pos = resolvePosition(node);
    const nodeLeft = pos.x;
    const nodeRight = pos.x + node.width;
    const nodeBottom = pos.y + node.height;

    minX = Math.min(minX, nodeLeft);
    maxX = Math.max(maxX, nodeRight);
    maxHeight = Math.max(maxHeight, nodeBottom);
  }

  return { width: maxX - minX, height: maxHeight, minX, maxX };
}

export const DecisionTreeView: React.FC<DecisionTreeViewProps> = ({ tree }) => {
  const { nodes, transitions } = tree;

  const treeDims = useMemo(() => getTreeDimensions(nodes), [nodes]);

  const offsetX = -treeDims.minX;

  const resolvedNodes = useMemo(
    () =>
      nodes.map((node) => {
        const pos = resolvePosition(node);
        const { label: derivedLabel, sources, subItems } = resolveNodeDisplay(node);
        return {
          ...node,
          position: { x: pos.x + offsetX, y: pos.y },
          label: node.label ?? derivedLabel ?? node.id,
          sources,
          subItems,
        };
      }),
    [nodes, offsetX],
  );

  return (
    <div className="flex justify-center">
      <div
        className="relative overflow-visible"
        style={{
          height: `${treeDims.height}px`,
          width: `${treeDims.width}px`,
        }}
      >
        {resolvedNodes.map((node) => (
          <TreeNode
            key={node.id}
            id={node.id}
            label={node.label}
            subLabel={node.subLabel}
            sources={node.sources}
            subItems={node.subItems}
            color={node.color}
            isEndNode={node.isEndNode}
            imagingNote={node.imagingNote}
            position={node.position}
            width={node.width}
            height={node.height}
          />
        ))}

        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          overflow="visible"
          style={{ zIndex: 30 }}
        >
          {transitions.map((transition, idx) => (
            <Transition key={idx} {...resolveTransition(transition, resolvedNodes)} />
          ))}
        </svg>
      </div>
    </div>
  );
};

function resolveTransition(
  transition: TransitionFromIds,
  resolvedNodes: Array<TreeNodeDef & { position: Position }>,
): TransitionProps {
  const fromNode = resolvedNodes.find((n) => n.id === transition.from);
  const toNode = resolvedNodes.find((n) => n.id === transition.to);
  if (!fromNode) throw new Error(`invalid node id: ${transition.from}`);
  if (!toNode) throw new Error(`invalid node id: ${transition.to}`);

  return {
    ...transition,
    from: { position: fromNode.position, width: fromNode.width, height: fromNode.height },
    to: { position: toNode.position, width: toNode.width, height: toNode.height },
  };
}
