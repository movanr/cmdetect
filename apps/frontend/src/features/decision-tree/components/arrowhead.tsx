import React from "react";
import type { Direction, Position } from "../types";

const Arrowhead: React.FC<{
  end: Position;
  length: number;
  width: number;
  direction: Direction;
}> = ({ end, length, width, direction }) => {
  switch (direction) {
    case "down":
      return (
        <polygon
          points={`${end.x - width},${end.y - length} ${end.x + width},${
            end.y - length
          } ${end.x},${end.y}`}
          fill="black"
        />
      );
    case "up":
      return (
        <polygon
          points={`${end.x - width},${end.y + length} ${end.x + width},${
            end.y + length
          } ${end.x},${end.y}`}
          fill="black"
        />
      );
    case "right":
      return (
        <polygon
          points={`${end.x - length},${end.y - width} ${end.x - length},${
            end.y + width
          } ${end.x},${end.y}`}
          fill="black"
        />
      );
    case "left":
      return (
        <polygon
          points={`${end.x + length},${end.y - width} ${end.x + length},${
            end.y + width
          } ${end.x},${end.y}`}
          fill="black"
        />
      );
  }
};

export default Arrowhead;
