import React from "react";
import type { Position } from "../types";

const Polyline: React.FC<{ path: Position[], isActive: boolean }> = ({ path, isActive }) => {
  if (path.length < 2) {
    console.warn("path length less than 2");
    return <></>;
  }

  const data = path.map((pos, idx) =>
    idx === 0 ? `M ${pos.x} ${pos.y}` : `L ${pos.x} ${pos.y}`
  );

  return <path d={data.join(" ")} fill="none" stroke={isActive ? "black" : "#d1d5db"} strokeWidth="2" />;};

export default Polyline;
