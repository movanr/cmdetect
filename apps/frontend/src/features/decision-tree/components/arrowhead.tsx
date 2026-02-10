import React from "react";
import type { Direction, Position } from "../types";

const Arrowhead: React.FC<{
  end: Position;
  length: number;
  width: number;
  direction: Direction;
  isActive: boolean;
}> = ({ end, length, width, direction, isActive }) => {
  switch (direction) {
    case "down":
      return (
        <polygon
          points={`${end.x - width},${end.y - length} ${end.x + width},${
            end.y - length
          } ${end.x},${end.y}`}
          fill={isActive ? "black" : "#d1d5db"}
        />
      );
    case "up":
      return (
        <polygon
          points={`${end.x - width},${end.y + length} ${end.x + width},${
            end.y + length
          } ${end.x},${end.y}`}
          fill={isActive ? "black" : "#d1d5db"}
        />
      );
    case "right":
      return (
        <polygon
          points={`${end.x - length},${end.y - width} ${end.x - length},${
            end.y + width
          } ${end.x},${end.y}`}
          fill={isActive ? "black" : "#d1d5db"}
        />
      );
    case "left":
      return (
        <polygon
          points={`${end.x + length},${end.y - width} ${end.x + length},${
            end.y + width
          } ${end.x},${end.y}`}
          fill={isActive ? "black" : "#d1d5db"}
        />
      );
  }
};

export default Arrowhead;
