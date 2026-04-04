/**
 * Static seed routes per role. The crawler visits these first,
 * then discovers dynamic routes (like /cases/<id>/...) by following links.
 */

const SHARED_ROUTES = [
  "/cases",
  "/invites",
  "/settings/profile",
  "/settings/security",
  "/protocol",
  "/protocol/overview",
  "/protocol/section1",
  "/protocol/section2",
  "/protocol/section3",
  "/protocol/section4",
  "/protocol/section5",
  "/protocol/section6",
  "/protocol/section7",
  "/protocol/section8",
  "/protocol/e1",
  "/protocol/e2",
  "/protocol/e3",
  "/protocol/e4",
  "/protocol/e5",
  "/protocol/e6",
  "/protocol/e7",
  "/protocol/e8",
  "/protocol/e9",
  "/docs/scoring-manual",
];

const ORG_ADMIN_ROUTES = ["/team", "/settings/organization"];

const RECEPTIONIST_ROUTES = ["/invites/new"];

export function getSeedRoutes(role: string): string[] {
  switch (role) {
    case "org_admin":
      return [...SHARED_ROUTES, ...ORG_ADMIN_ROUTES];
    case "physician":
      return [...SHARED_ROUTES];
    case "receptionist":
      return [...SHARED_ROUTES, ...RECEPTIONIST_ROUTES];
    default:
      return [...SHARED_ROUTES];
  }
}
