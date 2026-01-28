/**
 * HeadDiagram - Interactive SVG head diagram with clickable anatomical regions.
 *
 * Features:
 * - 4 clickable regions: temporalis, masseter, tmj, non-masticatory
 * - Visual feedback based on region status (pending, pain positive, no pain)
 * - Selected state with darker shades of clinical colors
 * - Stripe pattern overlay for incomplete/validation error regions
 * - Mirrored for left/right sides (patient's right displayed on left)
 */

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";
import type { IncompleteRegion } from "../../form/validation";
import { getLabel } from "../../labels";
import { SVG_REGIONS, type Region, type Side } from "../../model/regions";
import HeadSvg from "./head-diagram.svg?react";
import {
  EMPTY_REGION_STATUS,
  REGION_STATE_COLORS,
  REGION_STATE_COLORS_SELECTED,
  REGION_STROKE_WIDTH,
  getRegionVisualState,
  type RegionStatus,
} from "./types";

interface HeadDiagramProps {
  /** Which side this diagram represents */
  side: Side;
  /** Regions to render (only regions with SVG paths will be shown) */
  regions: readonly Region[];
  /** Status for each region */
  regionStatuses: Partial<Record<Region, RegionStatus>>;
  /** Currently selected region (if any) */
  selectedRegion?: Region | null;
  /** Callback when a region is clicked */
  onRegionClick: (region: Region) => void;
  /** Optional className */
  className?: string;
  /** Whether interactions are disabled */
  disabled?: boolean;
  /** Regions with validation errors */
  incompleteRegions?: IncompleteRegion[];
}

/** Stripe pattern ID for incomplete regions */
const INCOMPLETE_PATTERN_ID = "incomplete-stripe-pattern";

export function HeadDiagram({
  side,
  regions,
  regionStatuses,
  selectedRegion,
  onRegionClick,
  className,
  disabled = false,
  incompleteRegions = [],
}: HeadDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Helper to get status for a region
  const getStatus = useCallback(
    (region: Region): RegionStatus => regionStatuses[region] ?? EMPTY_REGION_STATUS,
    [regionStatuses]
  );

  // Inject stripe pattern into SVG defs for incomplete regions
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Check if pattern already exists
    if (svg.querySelector(`#${INCOMPLETE_PATTERN_ID}`)) return;

    // Find or create defs element
    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      svg.insertBefore(defs, svg.firstChild);
    }

    // Create stripe pattern
    const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
    pattern.setAttribute("id", INCOMPLETE_PATTERN_ID);
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    pattern.setAttribute("width", "6");
    pattern.setAttribute("height", "6");
    pattern.setAttribute("patternTransform", "rotate(45)");

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", "0");
    line.setAttribute("x2", "0");
    line.setAttribute("y2", "6");
    line.setAttribute("stroke", "rgba(239, 68, 68, 0.5)");
    line.setAttribute("stroke-width", "2");

    pattern.appendChild(line);
    defs.appendChild(pattern);
  }, []);

  // Apply styles to regions
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    for (const regionId of SVG_REGIONS) {
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
      const visualState = getRegionVisualState(status);
      const isIncomplete = incompleteRegions.some((r) => r.region === regionId);

      // Determine fill/stroke based on selection and validation state
      let fill: string;
      let stroke: string;
      let strokeDasharray: string = "none";

      if (isIncomplete) {
        // Validation error: light gray fill + red dashed border
        fill = "#f4f4f5"; // zinc-100 (light gray)
        stroke = "#ef4444"; // red-500
        strokeDasharray = "2 1"; // dashed
      } else if (isSelected) {
        fill = REGION_STATE_COLORS_SELECTED[visualState].fill;
        stroke = REGION_STATE_COLORS_SELECTED[visualState].stroke;
      } else {
        fill = REGION_STATE_COLORS[visualState].fill;
        stroke = REGION_STATE_COLORS[visualState].stroke;
      }

      // Apply styles
      element.style.fill = fill;
      element.style.stroke = stroke;
      element.style.strokeWidth = isSelected
        ? REGION_STROKE_WIDTH.selected
        : REGION_STROKE_WIDTH.default;
      element.style.strokeDasharray = strokeDasharray;
      element.style.cursor = disabled ? "default" : "pointer";
      element.style.transition = "fill 0.2s ease, stroke 0.2s ease";

      // Handle stripe pattern overlay for incomplete regions
      const patternOverlayId = `${regionId}-incomplete-overlay`;
      let overlay = svg.querySelector(`#${patternOverlayId}`) as SVGElement | null;

      if (isIncomplete) {
        // Create or update overlay with red hatched pattern
        if (!overlay) {
          overlay = document.createElementNS("http://www.w3.org/2000/svg", "use");
          overlay.setAttribute("id", patternOverlayId);
          overlay.setAttribute("href", `#${regionId}`);
          overlay.style.pointerEvents = "none";
          element.parentNode?.insertBefore(overlay, element.nextSibling);
        }
        overlay.style.fill = `url(#${INCOMPLETE_PATTERN_ID})`;
        overlay.style.stroke = "none";
        overlay.style.display = "";
      } else if (overlay) {
        // Hide overlay if region is complete
        overlay.style.display = "none";
      }
    }
  }, [regions, regionStatuses, selectedRegion, disabled, getStatus, incompleteRegions]);

  // Handle click events via delegation
  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (disabled) return;
      const target = e.target as SVGElement;
      const regionId = target.id as Region;
      if (SVG_REGIONS.includes(regionId) && regions.includes(regionId)) {
        onRegionClick(regionId);
      }
    },
    [disabled, onRegionClick, regions]
  );

  // Mirror transform for left side (patient's left displayed on right of screen)
  // The SVG is drawn with nose pointing right, so left side needs mirroring
  const containerStyle: React.CSSProperties = side === "left" ? { transform: "scaleX(-1)" } : {};

  return (
    <div className={cn("w-[200px] sm:w-[240px] h-auto shrink-0", className)} style={containerStyle}>
      <HeadSvg
        ref={svgRef}
        className="w-full h-auto"
        role="img"
        aria-label={`Head diagram for ${getLabel(side)}`}
        onClick={handleClick}
      />
    </div>
  );
}
