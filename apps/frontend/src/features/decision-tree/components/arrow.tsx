import React from "react";
import type { ArrowProps, Direction, Position } from "../types";
import Arrowhead from "./arrowhead";
import Polyline from "./polyline";

const Arrow: React.FC<ArrowProps> = ({ path, direction }) => {
  const arrowHeadLength = 10;

  if (path.length < 2) {
    console.warn("arrow path length less than 2");
    return <></>;
  }

  const end = path[path.length - 1];
  const endPoint = substractArrowHead({ ...end }, direction, arrowHeadLength);
  const shortenedPath = [...path];
  shortenedPath[path.length - 1] = endPoint;

  return (
    <>
      <Polyline path={shortenedPath} />
      <Arrowhead
        end={end}
        width={5}
        length={arrowHeadLength}
        direction={direction}
      />
    </>
  );
};

export default Arrow;

const substractArrowHead = (
  position: Position,
  direction: Direction,
  length: number
): Position => {
  switch (direction) {
    case "down":
      return {
        x: position.x,
        y: position.y - length,
      };
    case "up":
      return {
        x: position.x,
        y: position.y + length,
      };
    case "right":
      return {
        x: position.x - length,
        y: position.y,
      };
    case "left":
      return {
        x: position.x + length,
        y: position.y,
      };
  }
};
