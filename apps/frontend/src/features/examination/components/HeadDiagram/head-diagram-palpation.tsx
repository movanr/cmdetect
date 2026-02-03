/**
 * HeadDiagramPalpation - Interactive SVG head diagram for palpation sites (E9).
 *
 * Features:
 * - 6 palpation sites with clickable circles (3 per temporalis/masseter area)
 * - TMJ sites are NOT in the diagram - they are selected via dropdowns only
 * - Visual feedback based on site status (pending, pain positive, no pain)
 * - Selected state with green highlight and black border
 * - Stripe pattern overlay for incomplete/validation error sites
 * - Mirrored for left/right sides (patient's right displayed on left)
 */

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";
import { getPalpationSiteLabel, getSideLabel } from "../../labels";
import type { PalpationSite, Side } from "../../model/regions";
import HeadSvg from "./head-diagram.svg?react";
import {
  ALL_CLICKABLE_REGION_IDS,
  ALL_PALPATION_CIRCLE_IDS,
  CLICKABLE_REGION_IDS,
  DIAGRAM_PALPATION_SITES,
  EMPTY_SITE_STATUS,
  getCirclePalpationSite,
  getRegionPalpationSite,
  PALPATION_CIRCLE_GROUPS,
  // REGION_STATE_COLORS not used - using site-specific styles instead
  REGION_STATE_COLORS_SELECTED,
  getRegionVisualState,
  type SiteStatus,
} from "./types";

interface IncompleteSite {
  site: PalpationSite;
}

interface HeadDiagramPalpationProps {
  /** Which side this diagram represents */
  side: Side;
  /** Status for each palpation site */
  siteStatuses: Partial<Record<PalpationSite, SiteStatus>>;
  /** Currently selected site (if any) */
  selectedSite?: PalpationSite | null;
  /** Callback when a site is clicked */
  onSiteClick: (site: PalpationSite) => void;
  /** Optional className */
  className?: string;
  /** Whether interactions are disabled */
  disabled?: boolean;
  /** Sites with validation errors */
  incompleteSites?: IncompleteSite[];
}

/** Stripe pattern ID for incomplete sites */
const INCOMPLETE_PATTERN_ID = "incomplete-stripe-pattern-palpation";

export function HeadDiagramPalpation({
  side,
  siteStatuses,
  selectedSite,
  onSiteClick,
  className,
  disabled = false,
  incompleteSites = [],
}: HeadDiagramPalpationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Helper to get status for a site
  const getStatus = useCallback(
    (site: PalpationSite): SiteStatus => siteStatuses[site] ?? EMPTY_SITE_STATUS,
    [siteStatuses]
  );

  // Inject stripe pattern into SVG defs for incomplete sites
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

  // Hide E4-specific region paths and clip paths (not needed for palpation)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Hide E4 regions (tmj, nonMast - only needed for movement regions)
    const e4Regions = ["tmj", "nonMast"];
    for (const regionId of e4Regions) {
      const region = svg.querySelector(`#${regionId}`) as SVGElement | null;
      if (region) {
        region.style.display = "none";
      }
    }

    // Make clip path shapes invisible (but keep in DOM for clip-path references)
    const clipShapes = ["temporalis-clip", "masseter-clip"];
    for (const clipId of clipShapes) {
      const clip = svg.querySelector(`#${clipId}`) as SVGElement | null;
      if (clip) {
        clip.style.fill = "none";
        clip.style.stroke = "none";
      }
    }

    // Style base temporalis/masseter paths (keep original thick strokes)
    // Set pointer-events: none so clicks pass through to clickable regions underneath
    const baseRegions = ["temporalis", "masseter"];
    for (const regionId of baseRegions) {
      const region = svg.querySelector(`#${regionId}`) as SVGElement | null;
      if (region) {
        region.style.fill = "rgba(200, 200, 200, 0.15)";
        region.style.stroke = "rgba(136, 136, 136, 0.4)";
        region.style.strokeWidth = "10";
        region.style.pointerEvents = "none";
      }
    }
  }, []);

  // Apply styles to clickable region paths (only for diagram sites, excludes TMJ)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    for (const site of DIAGRAM_PALPATION_SITES) {
      const regionId = CLICKABLE_REGION_IDS[site];
      if (!regionId) continue;
      const region = svg.querySelector(`#${regionId}`) as SVGElement | null;
      if (!region) continue;

      const status = getStatus(site);
      const isSelected = selectedSite === site;
      const visualState = getRegionVisualState(status);
      const isIncomplete = incompleteSites.some((s) => s.site === site);

      // Determine fill/stroke based on selection and validation state
      let fill: string;
      let stroke: string;

      if (isIncomplete) {
        fill = "rgba(239, 68, 68, 0.1)"; // red-500 10%
        stroke = "#ef4444"; // red-500
      } else if (isSelected) {
        fill = REGION_STATE_COLORS_SELECTED[visualState].fill;
        stroke = REGION_STATE_COLORS_SELECTED[visualState].stroke;
      } else {
        // Transparent fill for non-selected regions (clickable but invisible)
        fill = "transparent";
        stroke = "none";
      }

      region.style.fill = fill;
      region.style.stroke = stroke;
      region.style.strokeWidth = isSelected ? "2" : "1";
      region.style.cursor = disabled ? "default" : "pointer";
      region.style.transition = "fill 0.2s ease, stroke 0.2s ease";

      // Add tooltip
      const titleId = `${regionId}-title`;
      let titleEl = region.querySelector(`#${titleId}`) as SVGTitleElement | null;
      if (!titleEl) {
        titleEl = document.createElementNS("http://www.w3.org/2000/svg", "title");
        titleEl.setAttribute("id", titleId);
        region.insertBefore(titleEl, region.firstChild);
      }
      titleEl.textContent = getPalpationSiteLabel(site);
    }
  }, [siteStatuses, selectedSite, disabled, getStatus, incompleteSites]);

  // Apply styles to palpation site circles (only for diagram sites, excludes TMJ)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    for (const site of DIAGRAM_PALPATION_SITES) {
      const circleIds = PALPATION_CIRCLE_GROUPS[site];
      if (!circleIds) continue;
      const status = getStatus(site);
      const isSelected = selectedSite === site;
      const visualState = getRegionVisualState(status);
      const isIncomplete = incompleteSites.some((s) => s.site === site);

      // Determine fill/stroke based on selection and validation state
      let fill: string;
      let stroke: string;
      let strokeDasharray: string = "none";

      if (isIncomplete) {
        // Validation error: light gray fill + red dashed border
        fill = "#f4f4f5"; // zinc-100
        stroke = "#ef4444"; // red-500
        strokeDasharray = "2 1"; // dashed (scaled for flattened SVG)
      } else if (isSelected) {
        // Selected: green highlight with black border
        fill = "#4ade80"; // green-400
        stroke = "#000000"; // black
      } else {
        // Unselected circles: use solid colors for better visibility
        // (REGION_STATE_COLORS are too transparent for small circles)
        if (visualState === "pending" || visualState === "undefined") {
          fill = "#d4d4d8"; // zinc-300
          stroke = "#71717a"; // zinc-500
        } else if (visualState === "negative") {
          fill = "#a1a1aa"; // zinc-400
          stroke = "#52525b"; // zinc-600
        } else {
          // positive
          fill = "#93c5fd"; // blue-300
          stroke = "#3b82f6"; // blue-500
        }
      }

      // Apply styles to all circles in this site's group
      for (const circleId of circleIds) {
        const circle = svg.querySelector(`#${circleId}`) as SVGElement | null;
        if (!circle) continue;

        circle.style.fill = fill;
        circle.style.stroke = stroke;
        // Stroke width for circles (SVG is flattened, no scale transform)
        circle.style.strokeWidth = isSelected ? "2.5" : "1.5";
        circle.style.strokeDasharray = strokeDasharray;
        circle.style.cursor = disabled ? "default" : "pointer";
        circle.style.transition = "fill 0.2s ease, stroke 0.2s ease";

        // Add tooltip via SVG <title> element
        const titleId = `${circleId}-title`;
        let titleEl = circle.querySelector(`#${titleId}`) as SVGTitleElement | null;
        if (!titleEl) {
          titleEl = document.createElementNS("http://www.w3.org/2000/svg", "title");
          titleEl.setAttribute("id", titleId);
          circle.insertBefore(titleEl, circle.firstChild);
        }
        titleEl.textContent = getPalpationSiteLabel(site);
      }
    }
  }, [siteStatuses, selectedSite, disabled, getStatus, incompleteSites]);

  // Handle click events via delegation
  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (disabled) return;
      const target = e.target as SVGElement;
      const elementId = target.id;

      // First check if this is a clickable region path
      if (ALL_CLICKABLE_REGION_IDS.includes(elementId)) {
        const site = getRegionPalpationSite(elementId);
        if (site) {
          onSiteClick(site);
          return;
        }
      }

      // Then check if this is a palpation circle
      if (ALL_PALPATION_CIRCLE_IDS.includes(elementId)) {
        const site = getCirclePalpationSite(elementId);
        if (site) {
          onSiteClick(site);
        }
      }
    },
    [disabled, onSiteClick]
  );

  // Mirror transform for left side (patient's left displayed on right of screen)
  // The SVG is drawn with nose pointing right, so left side needs mirroring
  const containerStyle: React.CSSProperties = side === "left" ? { transform: "scaleX(-1)" } : {};

  return (
    <div className={cn("w-[280px] sm:w-[320px] h-auto shrink-0", className)} style={containerStyle}>
      <HeadSvg
        ref={svgRef}
        className="w-full h-auto"
        role="img"
        aria-label={`Palpation diagram for ${getSideLabel(side)}`}
        onClick={handleClick}
      />
    </div>
  );
}
