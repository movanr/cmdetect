import React from "react";
import type { Position } from "../types";
const Label: React.FC<{
  text: string;
  position: Position;
}> = ({ text, position }) => {
  return (
    <text
      x={position.x}
      y={position.y}
      fontSize="14"
      fill="black"
    >
      {text}
    </text>
  );
};

export default Label;
