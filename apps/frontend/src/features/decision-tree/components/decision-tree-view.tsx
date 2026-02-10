import React, { useMemo } from "react";
import { evaluate } from "@cmdetect/dc-tmd";
import type {
  CriterionStatus,
  DecisionTreeDef,
  NodeEvaluatedState,
  NodeStateMap,
  Position,
  TransitionFromIds,
  TransitionProps,
  TreeNodeDef,
} from "../types";
import type { TemplateContext } from "@cmdetect/dc-tmd";
import TreeNode from "./tree-node";
import Transition from "./transition";

const REGION_LABELS: Record<string, string> = {
  temporalis: "M. temporalis",
  masseter: "M. masseter",
  tmj: "Kiefergelenk",
};

const SIDE_LABELS: Record<string, string> = {
  right: "rechts",
  left: "links",
};

function formatContextLabel(context?: TemplateContext): string | undefined {
  if (!context?.side && !context?.region) return undefined;
  const parts: string[] = [];
  if (context.region) parts.push(REGION_LABELS[context.region] ?? context.region);
  if (context.side) parts.push(SIDE_LABELS[context.side] ?? context.side);
  return parts.join(" · ");
}

interface DecisionTreeViewProps {
  tree: DecisionTreeDef;
  data: unknown;
  onLinkedNodeClick?: (treeId: string) => void;
}

/** Evaluate a single node's criterion against data */
function evaluateNode(
  node: TreeNodeDef,
  data: unknown
): CriterionStatus {
  if (!node.criterion) return "pending";
  const result = evaluate(node.criterion, data, node.context);
  return result.status;
}

/** Compute top-left position from center */
function resolvePosition(node: TreeNodeDef): Position {
  return {
    x: node.center.x - node.width / 2,
    y: node.center.y - node.height / 2,
  };
}

/** Build a map of nodeId → "positive" | "negative" (skipping "pending") */
function getNodeStateMap(
  nodes: TreeNodeDef[],
  data: unknown
): NodeStateMap {
  const result: NodeStateMap = {};
  for (const node of nodes) {
    const status = evaluateNode(node, data);
    if (status === "positive" || status === "negative") {
      result[node.id] = status as NodeEvaluatedState;
    }
  }
  return result;
}

/**
 * Walk the tree from root following transitions based on node states.
 * Uses BFS to support unconditional transitions that always flow regardless of state.
 */
function getCurrentPath(
  startNodeId: string,
  transitions: TransitionFromIds[],
  state: NodeStateMap
): string[] {
  // Build separate maps: conditional (positive/negative) vs unconditional
  const conditionalMap: Record<string, Record<string, string>> = {};
  const unconditionalMap: Record<string, string[]> = {};

  for (const t of transitions) {
    if (t.type === "unconditional") {
      if (!unconditionalMap[t.from]) unconditionalMap[t.from] = [];
      unconditionalMap[t.from].push(t.to);
    } else {
      if (!conditionalMap[t.from]) conditionalMap[t.from] = {};
      conditionalMap[t.from][t.type] = t.to;
    }
  }

  const visited = new Set<string>();
  const queue: string[] = [startNodeId];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    // Unconditional targets are always reachable (even from pending nodes)
    const unconditionalTargets = unconditionalMap[nodeId] ?? [];
    for (const target of unconditionalTargets) {
      queue.push(target);
    }

    // State-based (conditional) targets added only when node has evaluated state
    const nodeState = state[nodeId];
    if (nodeState) {
      const conditionalTarget = conditionalMap[nodeId]?.[nodeState];
      if (conditionalTarget) {
        queue.push(conditionalTarget);
      }
    }
  }

  return Array.from(visited);
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

export const DecisionTreeView: React.FC<DecisionTreeViewProps> = ({
  tree,
  data,
  onLinkedNodeClick,
}) => {
  const { nodes, transitions } = tree;

  const nodeStateMap = useMemo(() => getNodeStateMap(nodes, data), [nodes, data]);
  const currentPath = useMemo(
    () => getCurrentPath(nodes[0].id, transitions, nodeStateMap),
    [nodes, transitions, nodeStateMap]
  );

  const treeDims = useMemo(() => getTreeDimensions(nodes), [nodes]);

  // Offset all positions so the leftmost node starts at x=0.
  // This keeps all SVG arrow paths in non-negative coordinate space,
  // preventing clipping by the SVG viewport.
  const offsetX = -treeDims.minX;

  // Pre-compute resolved nodes (position from center, offset to non-negative x)
  const resolvedNodes = useMemo(
    () =>
      nodes.map((node) => {
        const pos = resolvePosition(node);
        return {
          ...node,
          position: { x: pos.x + offsetX, y: pos.y },
        };
      }),
    [nodes, offsetX]
  );

  // Node statuses for rendering
  const nodeStatuses = useMemo(() => {
    const map: Record<string, CriterionStatus> = {};
    for (const node of nodes) {
      map[node.id] = evaluateNode(node, data);
    }
    return map;
  }, [nodes, data]);

  return (
    <div className="flex justify-center">
      <div
        className="relative"
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
            contextLabel={formatContextLabel(node.context)}
            subItems={node.subItems}
            color={node.color}
            isEndNode={node.isEndNode}
            linkedTreeId={node.linkedTreeId}
            onLinkedNodeClick={onLinkedNodeClick}
            position={node.position}
            width={node.width}
            height={node.height}
            status={nodeStatuses[node.id]}
            isActive={currentPath.includes(node.id)}
          />
        ))}

        {transitions.map((transition, idx) => (
          <Transition
            key={idx}
            {...resolveTransition(transition, resolvedNodes, currentPath)}
          />
        ))}
      </div>
    </div>
  );
};

function resolveTransition(
  transition: TransitionFromIds,
  resolvedNodes: Array<TreeNodeDef & { position: Position }>,
  path: string[]
): TransitionProps {
  const fromNode = resolvedNodes.find((n) => n.id === transition.from);
  const toNode = resolvedNodes.find((n) => n.id === transition.to);
  if (!fromNode) throw new Error(`invalid node id: ${transition.from}`);
  if (!toNode) throw new Error(`invalid node id: ${transition.to}`);

  return {
    ...transition,
    from: { position: fromNode.position, width: fromNode.width, height: fromNode.height },
    to: { position: toNode.position, width: toNode.width, height: toNode.height },
    isActive: path.includes(transition.from) && path.includes(transition.to),
  };
}
