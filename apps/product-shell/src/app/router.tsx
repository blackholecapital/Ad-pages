import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "./AppShell";
import { HomePage } from "../pages/HomePage";
import { MembersPage } from "../pages/MembersPage";
import { ServicesPage } from "../pages/ServicesPage";
import { ExclusivePage } from "../pages/ExclusivePage";
import { CustomerPage } from "../pages/CustomerPage";
import { AdminPage } from "../pages/AdminPage";
import { StudioPage } from "../pages/StudioPage";
import { PayMePage } from "../pages/PayMePage";
import { EngagePage } from "../pages/EngagePage";
import { ReferralsPage } from "../pages/ReferralsPage";
import { SkinMarketplacePage } from "../pages/SkinMarketplacePage";
import { RequireGate } from "../components/gate/RequireGate";

const nullSurface = <div style={{ display: "none" }} />;

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/home" replace /> },
  { path: "/not-found", element: <Navigate to="/home" replace /> },
  {
    path: "/",
        element: <AppShell />,
    children: [
      { path: "home", element: <HomePage />, handle: { pageKey: "home" } },

      // Published home routes
      { path: ":slug", element: <Navigate to="./home" replace /> },
      { path: ":slug/home", element: <HomePage />, handle: { pageKey: "home" } },

      { path: ":designation/:slug", element: <Navigate to="./home" replace /> },
      { path: ":designation/:slug/home", element: <HomePage />, handle: { pageKey: "home" } },

      // Published child routes
      { path: ":slug/members", element: <MembersPage />, handle: { pageKey: "members" } },
      { path: ":slug/services", element: <ServicesPage />, handle: { pageKey: "services" } },
      { path: ":slug/exclusive", element: <ExclusivePage />, handle: { pageKey: "exclusive" } },
      { path: ":slug/customer", element: <CustomerPage />, handle: { pageKey: "customer" } },
      { path: ":slug/payme", element: <PayMePage />, handle: { pageKey: "payme" } },
      { path: ":slug/engage", element: <EngagePage />, handle: { pageKey: "engage" } },
      { path: ":slug/referrals", element: <ReferralsPage />, handle: { pageKey: "referrals" } },
      { path: ":slug/skins", element: <SkinMarketplacePage />, handle: { pageKey: "skins" } },

      { path: ":designation/:slug/members", element: <MembersPage />, handle: { pageKey: "members" } },
      { path: ":designation/:slug/services", element: <ServicesPage />, handle: { pageKey: "services" } },
      { path: ":designation/:slug/exclusive", element: <ExclusivePage />, handle: { pageKey: "exclusive" } },
      { path: ":designation/:slug/customer", element: <CustomerPage />, handle: { pageKey: "customer" } },
      { path: ":designation/:slug/payme", element: <PayMePage />, handle: { pageKey: "payme" } },
      { path: ":designation/:slug/engage", element: <EngagePage />, handle: { pageKey: "engage" } },
      { path: ":designation/:slug/referrals", element: <ReferralsPage />, handle: { pageKey: "referrals" } },
      { path: ":designation/:slug/skins", element: <SkinMarketplacePage />, handle: { pageKey: "skins" } },

      { path: "members", element: <MembersPage />, handle: { pageKey: "members" } },
      { path: "services", element: <ServicesPage />, handle: { pageKey: "services" } },
      { path: "exclusive", element: <ExclusivePage />, handle: { pageKey: "exclusive" } },
      { path: "customer", element: <CustomerPage />, handle: { pageKey: "customer" } },

      { path: "payme", element: <PayMePage />, handle: { pageKey: "payme" } },
      { path: "engage", element: <EngagePage />, handle: { pageKey: "engage" } },
      { path: "referrals", element: <ReferralsPage />, handle: { pageKey: "referrals" } },
      { path: "skins", element: <SkinMarketplacePage />, handle: { pageKey: "skins" } },

      { path: "admin", element: <AdminPage />, handle: { pageKey: "admin" } },
      { path: ":slug/admin", element: <AdminPage />, handle: { pageKey: "admin" } },
      { path: ":designation/:slug/admin", element: <AdminPage />, handle: { pageKey: "admin" } },

      // Auth-gated: studio requires RequireGate
      {
        element: <RequireGate />,
        children: [
          { path: ":slug/studio", element: <StudioPage />, handle: { pageKey: "studio" } },
          { path: ":designation/:slug/studio", element: <StudioPage />, handle: { pageKey: "studio" } },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/home" replace /> },
]);
