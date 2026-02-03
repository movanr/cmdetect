/**
 * HeadDiagramPalpation - Interactive SVG head diagram for palpation sites (E9).
 *
 * Features:
 * - 8 palpation sites with clickable circles (3 per temporalis/masseter area, 2 for TMJ)
 * - Visual feedback based on site status (pending, pain positive, no pain)
 * - Selected state with darker shades of clinical colors
 * - Stripe pattern overlay for incomplete/validation error sites
 * - Mirrored for left/right sides (patient's right displayed on left)
 */

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";
import { getPalpationSiteLabel, getSideLabel } from "../../labels";
import type { PalpationSite, Side, SiteDetailMode } from "../../model/regions";
import { PALPATION_SITE_KEYS, SITES_BY_GROUP } from "../../model/regions";
import HeadSvg from "./head-diagram-palpation.svg?react";
import {
  ALL_PALPATION_CIRCLE_IDS,
  EMPTY_SITE_STATUS,
  getCirclePalpationSite,
  PALPATION_CIRCLE_GROUPS,
  REGION_STATE_COLORS,
  REGION_STATE_COLORS_SELECTED,
  REGION_STROKE_WIDTH,
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
  /** Whether to show grouped or detailed sites */
  siteDetailMode: SiteDetailMode;
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
  siteDetailMode,
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

  // Counter-transform text labels when mirrored (left side)
  // This keeps labels readable while the head shape is mirrored
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const textElements = svg.querySelectorAll("text");
    textElements.forEach((text) => {
      if (side === "left") {
        // Get the text bounding box to calculate proper flip point
        const bbox = text.getBBox();
        const centerX = bbox.x + bbox.width / 2;
        // Flip around the text's center point
        text.setAttribute("transform", `translate(${2 * centerX}, 0) scale(-1, 1)`);
      } else {
        text.removeAttribute("transform");
      }
    });
  }, [side]);

  // Apply styles to palpation site circles
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    for (const site of PALPATION_SITE_KEYS) {
      const circleIds = PALPATION_CIRCLE_GROUPS[site];
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
        strokeDasharray = "0.2 0.1"; // dashed (scaled for circle size)
      } else if (isSelected) {
        fill = REGION_STATE_COLORS_SELECTED[visualState].fill;
        stroke = REGION_STATE_COLORS_SELECTED[visualState].stroke;
      } else {
        fill = REGION_STATE_COLORS[visualState].fill;
        stroke = REGION_STATE_COLORS[visualState].stroke;
      }

      // Apply styles to all circles in this site's group
      for (const circleId of circleIds) {
        const circle = svg.querySelector(`#${circleId}`) as SVGElement | null;
        if (!circle) continue;

        circle.style.fill = fill;
        circle.style.stroke = stroke;
        // Scale stroke width for circles (they're much smaller than region paths)
        circle.style.strokeWidth = isSelected
          ? "0.25"
          : REGION_STROKE_WIDTH.default === "0.5"
            ? "0.15"
            : "0.15";
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
      const circleId = target.id;

      // Check if this is a palpation circle
      if (!ALL_PALPATION_CIRCLE_IDS.includes(circleId)) return;

      const site = getCirclePalpationSite(circleId);
      if (!site) return;

      // In grouped mode, clicking any site in a region should select
      // a representative site (the first one in that region's group)
      if (siteDetailMode === "grouped") {
        // Find which region this site belongs to
        for (const [, sites] of Object.entries(SITES_BY_GROUP)) {
          if ((sites as readonly PalpationSite[]).includes(site)) {
            // Use the first site of the region as representative
            const firstSite = sites[0];
            if (firstSite) {
              onSiteClick(firstSite);
            }
            return;
          }
        }
      }

      onSiteClick(site);
    },
    [disabled, onSiteClick, siteDetailMode]
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
        aria-label={`Palpation diagram for ${getSideLabel(side)}`}
        onClick={handleClick}
      />
    </div>
  );
}
