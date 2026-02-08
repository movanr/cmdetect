import React, { useMemo } from "react";
import { evaluate } from "@cmdetect/dc-tmd";
import type {
  CriterionStatus,
  DecisionTreeDef,
  NodeStateMap,
  Position,
  TransitionFromIds,
  TransitionProps,
  TransitionType,
  TreeNodeDef,
} from "../types";
import TreeNode from "./tree-node";
import Transition from "./transition";

interface DecisionTreeViewProps {
  tree: DecisionTreeDef;
  data: unknown;
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
      result[node.id] = status as TransitionType;
    }
  }
  return result;
}

/** Walk the tree from root following transitions based on node states */
function getCurrentPath(
  startNodeId: string,
  transitions: TransitionFromIds[],
  state: NodeStateMap
): string[] {
  const path: string[] = [];
  let currentNodeId = startNodeId;

  const transitionMap: Record<
    string,
    Record<TransitionType, string | undefined>
  > = {};

  for (const transition of transitions) {
    if (!transitionMap[transition.from]) {
      transitionMap[transition.from] = {
        positive: undefined,
        negative: undefined,
      };
    }
    transitionMap[transition.from][transition.type] = transition.to;
  }

  while (currentNodeId && state[currentNodeId]) {
    path.push(currentNodeId);
    const currentState = state[currentNodeId];
    const nextNodeId = transitionMap[currentNodeId]?.[currentState];
    if (!nextNodeId) break;
    currentNodeId = nextNodeId;
  }

  // Include the last node where we stopped (pending or end node)
  if (currentNodeId && !path.includes(currentNodeId)) {
    path.push(currentNodeId);
  }

  return path;
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
}) => {
  const { nodes, transitions } = tree;

  const nodeStateMap = useMemo(() => getNodeStateMap(nodes, data), [nodes, data]);
  const currentPath = useMemo(
    () => getCurrentPath(nodes[0].id, transitions, nodeStateMap),
    [nodes, transitions, nodeStateMap]
  );

  // Pre-compute resolved nodes (position from center)
  const resolvedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        position: resolvePosition(node),
      })),
    [nodes]
  );

  // Node statuses for rendering
  const nodeStatuses = useMemo(() => {
    const map: Record<string, CriterionStatus> = {};
    for (const node of nodes) {
      map[node.id] = evaluateNode(node, data);
    }
    return map;
  }, [nodes, data]);

  const treeDims = useMemo(() => getTreeDimensions(nodes), [nodes]);
  const centerOffset = treeDims.minX < 0 ? Math.abs(treeDims.minX) : -treeDims.minX;

  return (
    <div className="flex justify-center">
      <div
        className="relative"
        style={{
          height: `${treeDims.height}px`,
          width: `${treeDims.width}px`,
          transform: `translateX(${centerOffset}px)`,
        }}
      >
        {resolvedNodes.map((node) => (
          <TreeNode
            key={node.id}
            id={node.id}
            label={node.label}
            subLabel={node.subLabel}
            subItems={node.subItems}
            color={node.color}
            isEndNode={node.isEndNode}
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
