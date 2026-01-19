/**
 * HeadDiagram - Interactive SVG head diagram with clickable anatomical regions.
 *
 * Features:
 * - 4 clickable regions: temporalis, masseter, TMJ, non-masticatory
 * - Visual feedback based on region status (pending, pain positive, no pain)
 * - Hover and selected states
 * - Mirrored for left/right sides (patient's right displayed on left)
 */

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { getLabel } from "../../labels";
import type { MovementRegion, Side } from "../../model/regions";
import HeadSvg from "./head-diagram.svg?react";
import {
  EMPTY_REGION_STATUS,
  REGION_STATE_COLORS,
  getRegionVisualState,
  type RegionStatus,
} from "./types";

// Region IDs in the SVG that match MovementRegion type
const REGION_IDS: MovementRegion[] = ["temporalis", "masseter", "tmj", "nonMast"];

interface HeadDiagramProps {
  /** Which side this diagram represents */
  side: Side;
  /** Regions to render (only regions with SVG paths will be shown) */
  regions: readonly MovementRegion[];
  /** Status for each region */
  regionStatuses: Partial<Record<MovementRegion, RegionStatus>>;
  /** Currently selected region (if any) */
  selectedRegion?: MovementRegion | null;
  /** Callback when a region is clicked */
  onRegionClick: (region: MovementRegion) => void;
  /** Optional className */
  className?: string;
  /** Whether interactions are disabled */
  disabled?: boolean;
}

/** Selected state colors (SVG-compatible) */
const SELECTED_COLORS = {
  fill: "rgba(59, 130, 246, 0.3)", // blue-500 30%
  stroke: "#3b82f6", // blue-500
} as const;

/** Hover state color */
const HOVER_FILL = "rgba(59, 130, 246, 0.1)"; // blue-500 10%

export function HeadDiagram({
  side,
  regions,
  regionStatuses,
  selectedRegion,
  onRegionClick,
  className,
  disabled = false,
}: HeadDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredRegion, setHoveredRegion] = useState<MovementRegion | null>(null);

  // Helper to get status for a region
  const getStatus = useCallback(
    (region: MovementRegion): RegionStatus => regionStatuses[region] ?? EMPTY_REGION_STATUS,
    [regionStatuses]
  );

  // Apply styles to regions
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    for (const regionId of REGION_IDS) {
      const element = svg.querySelector(`#${regionId}`) as SVGElement | null;
      if (!element) continue;

      const shouldShow = regions.includes(regionId);
      if (!shouldShow) {
        element.style.display = "none";
        continue;
      }

      element.style.display = "";
      const status = getStatus(regionId);
      const isSelected = selectedRegion === regionId;
      const isHovered = hoveredRegion === regionId;
      const visualState = getRegionVisualState(status);

      // Determine fill color
      let fill: string;
      if (isSelected) {
        fill = SELECTED_COLORS.fill;
      } else if (isHovered && visualState === "pending") {
        fill = HOVER_FILL;
      } else {
        fill = REGION_STATE_COLORS[visualState].fill;
      }

      // Determine stroke color
      const stroke = isSelected ? SELECTED_COLORS.stroke : REGION_STATE_COLORS[visualState].stroke;

      // Apply styles
      element.style.fill = fill;
      element.style.stroke = stroke;
      element.style.strokeWidth = isSelected ? "2" : "1";
      element.style.cursor = disabled ? "default" : "pointer";
      element.style.transition = "fill 0.2s ease, stroke 0.2s ease";
    }
  }, [regions, regionStatuses, selectedRegion, hoveredRegion, disabled, getStatus]);

  // Handle click events via delegation
  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (disabled) return;
      const target = e.target as SVGElement;
      const regionId = target.id as MovementRegion;
      if (REGION_IDS.includes(regionId) && regions.includes(regionId)) {
        onRegionClick(regionId);
      }
    },
    [disabled, onRegionClick, regions]
  );

  // Handle mouse events for hover
  const handleMouseOver = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (disabled) return;
      const target = e.target as SVGElement;
      const regionId = target.id as MovementRegion;
      if (REGION_IDS.includes(regionId) && regions.includes(regionId)) {
        setHoveredRegion(regionId);
      }
    },
    [disabled, regions]
  );

  const handleMouseOut = useCallback(() => {
    setHoveredRegion(null);
  }, []);

  // Mirror transform for left side (patient's left displayed on right of screen)
  // The SVG is drawn with nose pointing right, so left side needs mirroring
  const containerStyle: React.CSSProperties = side === "left" ? { transform: "scaleX(-1)" } : {};

  return (
    <div className={cn("w-[280px] h-auto", className)} style={containerStyle}>
      <HeadSvg
        ref={svgRef}
        className="w-full h-auto"
        role="img"
        aria-label={`Head diagram for ${getLabel(side)}`}
        onClick={handleClick}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      />
    </div>
  );
}
