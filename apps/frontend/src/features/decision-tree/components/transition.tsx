import React from "react";
import type { Direction, ResolvedNode, Position, TransitionProps } from "../types";
import Arrow from "./arrow";
import Label from "./label";

const Transition: React.FC<TransitionProps> = ({
  from,
  to,
  startDirection,
  endDirection,
  joints,
  label,
}) => {
  const path = [];
  const start = getEdgePosition(from, startDirection);

  const end = getEdgePosition(to, mirrorDirection(endDirection));

  path.push(start);
  if (joints) {
    for (const joint of joints) {
      path.push(joint);
    }
  } else {
    if (
      (startDirection === "right" || startDirection === "left") &&
      (endDirection === "down" || endDirection === "up")
    ) {
      path.push({
        x: end.x,
        y: start.y,
      });
    }
  }

  path.push(end);

  const labelPosition = getLabelPosition(path[0], startDirection);

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <Arrow path={path} direction={endDirection} />
      {label && <Label text={label} position={labelPosition} />}
    </svg>
  );
};

export default Transition;

const getLabelPosition = (start: Position, direction: Direction): Position => {
  switch (direction) {
    case "up":
      return {
        x: start.x + 4,
        y: start.y - 14,
      };
    case "down":
      return {
        x: start.x + 4,
        y: start.y + 14,
      };
    case "right":
      return {
        x: start.x + 4,
        y: start.y - 7,
      };
    case "left":
      return {
        x: start.x - 32,
        y: start.y - 7,
      };
  }
};

const getEdgePosition = (node: ResolvedNode, direction: Direction): Position => {
  switch (direction) {
    case "down":
      return {
        x: node.position.x + node.width / 2,
        y: node.position.y + node.height,
      };
    case "up":
      return {
        x: node.position.x + node.width / 2,
        y: node.position.y,
      };
    case "right":
      return {
        x: node.position.x + node.width,
        y: node.position.y + node.height / 2,
      };
    case "left":
      return {
        x: node.position.x,
        y: node.position.y + node.height / 2,
      };
    default:
      return node.position;
  }
};

const mirrorDirection = (direction: Direction): Direction => {
  switch (direction) {
    case "up":
      return "down";
    case "down":
      return "up";
    case "left":
      return "right";
    case "right":
      return "left";
  }
};
