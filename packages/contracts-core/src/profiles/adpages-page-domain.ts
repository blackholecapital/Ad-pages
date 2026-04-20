// Ad Pages page domain — canonical page allowlist for the Ad Pages product.
// Upstream authority: ADPAGES-SKU-REDUCTION-001 (S5 stage).
// DOWNSTREAM STATUS: non-authoritative — product-constraint layer only.
//
// Defines which pages an Ad Pages tenant may decorate in Studio and which
// pages are valid in the publish-time manifest. All other pages are blocked
// for this product. This is a pure constraint-data file; no new chassis
// authority, lifecycle path, or runtime invention.

// === Ad Pages decoratable page keys ===
// Ordered: home first (default selection in Studio page picker).
export const ADPAGES_PAGE_KEYS = ["home", "members"] as const;
export type AdPagesPageKey = (typeof ADPAGES_PAGE_KEYS)[number];

// === Ad Pages Studio page entries ===
// Consumed by StudioPage.tsx page picker and any manifest builder.
// key   — matches the route page key used in published-manifest / published-page
// label — human-readable label shown in Studio UI
export const ADPAGES_STUDIO_PAGES = [
  { key: "home" as const,    label: "Home" },
  { key: "members" as const, label: "Members" },
] as const;

export type AdPagesStudioPage = (typeof ADPAGES_STUDIO_PAGES)[number];
