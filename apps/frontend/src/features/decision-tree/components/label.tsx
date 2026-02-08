import React from "react";
import type { Position } from "../types";
const Label: React.FC<{
  text: string;
  position: Position;
  isActive: boolean;
}> = ({ text, position, isActive }) => {
  return (
    <text
      x={position.x}
      y={position.y}
      fontSize="14"
      fill={isActive ? "black" : "gray"}
    >
      {text}
    </text>
  );
};

export default Label;
