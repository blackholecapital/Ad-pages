import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./AppShell";

import { HomePage } from "../pages/HomePage";
import { MembersPage } from "../pages/MembersPage";
import { ExclusivePage } from "../pages/ExclusivePage";
import { CustomerPage } from "../pages/CustomerPage";
import { PayMePage } from "../pages/PayMePage";
import { EngagePage } from "../pages/EngagePage";
import { ReferralsPage } from "../pages/ReferralsPage";
import { SkinMarketplacePage } from "../pages/SkinMarketplacePage";
import { AdminPage } from "../pages/AdminPage";
import { StudioPage } from "../pages/StudioPage";
// DEV NOTE: To re-enable the gate locking system, uncomment the import below
// and wrap the gated routes (see comment block further down) with <RequireGate />.
// import { RequireGate } from "../components/gate/RequireGate";

/*
 * ──────────────────────────────────────────────────────────────
 * DEV NOTES — quick-reference for common configuration changes
 * ──────────────────────────────────────────────────────────────
 *
 * NAV TABS (top bar): Home, Members, Exclusive, Customer, Admin.
 * PayMe is reachable only through the nav cart icon (side panel)
 * and the legacy /payme route (kept for direct links/embeds).
 *
 * Engage / Referrals / Skins remain accessible by direct path;
 * they are not present in the nav tab list.
 *
 * Legacy /access, /access/tier-1..3 paths redirect to the new
 * Exclusive / Customer / Admin surfaces.
 * ──────────────────────────────────────────────────────────────
 */

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      // Public / Gate entrypoints
      { index: true, element: <HomePage />, handle: { pageKey: "home" } },
      { path: "gate", element: <HomePage />, handle: { pageKey: "home" } },

      // Tenant slug gate entrypoints (no designation prefix)
      { path: ":slug", element: <HomePage />, handle: { pageKey: "home" } },
      { path: ":slug/gate", element: <HomePage />, handle: { pageKey: "home" } },

      // Designated gate entrypoints (skin prefix)
      { path: ":designation/:slug", element: <HomePage />, handle: { pageKey: "home" } },
      { path: ":designation/:slug/gate", element: <HomePage />, handle: { pageKey: "home" } },

      // Base pages
      { path: "members", element: <MembersPage />, handle: { pageKey: "members" } },
      { path: "exclusive", element: <ExclusivePage />, handle: { pageKey: "exclusive" } },
      { path: "customer", element: <CustomerPage />, handle: { pageKey: "customer" } },

      { path: "payme", element: <PayMePage />, handle: { pageKey: "payme" } },
      { path: "engage", element: <EngagePage />, handle: { pageKey: "engage" } },
      { path: "referrals", element: <ReferralsPage />, handle: { pageKey: "referrals" } },
      { path: "skins", element: <SkinMarketplacePage />, handle: { pageKey: "skins" } },
      { path: "admin", element: <AdminPage />, handle: { pageKey: "admin" } },
      { path: "studio", element: <StudioPage />, handle: { pageKey: "studio" } },

      // Legacy access redirects
      { path: "access", element: <Navigate to="/exclusive" replace /> },
      { path: "access/tier-1", element: <Navigate to="/customer" replace /> },
      { path: "access/tier-2", element: <Navigate to="/exclusive" replace /> },
      { path: "access/tier-3", element: <Navigate to="/admin" replace /> },

      // Tenant slug pages
      { path: ":slug/gate/members", element: <MembersPage />, handle: { pageKey: "members" } },
      { path: ":slug/gate/exclusive", element: <ExclusivePage />, handle: { pageKey: "exclusive" } },
      { path: ":slug/gate/customer", element: <CustomerPage />, handle: { pageKey: "customer" } },

      { path: ":slug/gate/payme", element: <PayMePage />, handle: { pageKey: "payme" } },
      { path: ":slug/gate/engage", element: <EngagePage />, handle: { pageKey: "engage" } },
      { path: ":slug/gate/referrals", element: <ReferralsPage />, handle: { pageKey: "referrals" } },
      { path: ":slug/gate/skins", element: <SkinMarketplacePage />, handle: { pageKey: "skins" } },
      { path: ":slug/gate/admin", element: <AdminPage />, handle: { pageKey: "admin" } },
      { path: ":slug/gate/studio", element: <StudioPage />, handle: { pageKey: "studio" } },

      // Designated pages
      { path: ":designation/:slug/members", element: <MembersPage />, handle: { pageKey: "members" } },
      { path: ":designation/:slug/exclusive", element: <ExclusivePage />, handle: { pageKey: "exclusive" } },
      { path: ":designation/:slug/customer", element: <CustomerPage />, handle: { pageKey: "customer" } },

      { path: ":designation/:slug/payme", element: <PayMePage />, handle: { pageKey: "payme" } },
      { path: ":designation/:slug/engage", element: <EngagePage />, handle: { pageKey: "engage" } },
      { path: ":designation/:slug/referrals", element: <ReferralsPage />, handle: { pageKey: "referrals" } },
      { path: ":designation/:slug/skins", element: <SkinMarketplacePage />, handle: { pageKey: "skins" } },
      { path: ":designation/:slug/admin", element: <AdminPage />, handle: { pageKey: "admin" } },
      { path: ":designation/:slug/studio", element: <StudioPage />, handle: { pageKey: "studio" } }
    ]
  }
]);
