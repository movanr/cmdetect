import React from "react";
import type { Position } from "../types";

const Polyline: React.FC<{ path: Position[] }> = ({ path }) => {
  if (path.length < 2) {
    console.warn("path length less than 2");
    return <></>;
  }

  const data = path.map((pos, idx) =>
    idx === 0 ? `M ${pos.x} ${pos.y}` : `L ${pos.x} ${pos.y}`
  );

  return <path d={data.join(" ")} fill="none" stroke="black" strokeWidth="2" />;};

export default Polyline;
