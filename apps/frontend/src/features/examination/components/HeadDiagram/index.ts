/**
 * HeadDiagram components for anatomical visualization in examination forms.
 */

// Movement regions diagram (E4, E5)
export { HeadDiagram } from "./head-diagram";

// Palpation sites diagram (E9)
export { HeadDiagramPalpation } from "./head-diagram-palpation";

// Types and constants
export {
  ALL_PALPATION_CIRCLE_IDS,
  buildRegionId,
  buildSiteId,
  EMPTY_REGION_STATUS,
  EMPTY_SITE_STATUS,
  getCirclePalpationSite,
  getRegionVisualState,
  PALPATION_CIRCLE_GROUPS,
  parseRegionId,
  parseSiteId,
  REGION_STATE_COLORS,
  REGION_STATE_COLORS_SELECTED,
  REGION_STROKE_WIDTH,
  REGION_VISUAL_STATES,
  type RegionId,
  type RegionStatus,
  type RegionVisualState,
  type SiteId,
  type SiteStatus,
} from "./types";
