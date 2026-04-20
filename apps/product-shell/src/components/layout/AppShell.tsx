/**
 * AppShell — layout-tier re-export.
 *
 * The canonical AppShell module lives at `apps/product-shell/src/app/AppShell.tsx`
 * and is mounted as the React Router root element by
 * `apps/product-shell/src/app/router.tsx`. This file is the layout-tier
 * proxy declared by BIZ-PAGES-WALLPAPER-HOTFIX-003 expected_artifacts so
 * that future layout-tier consumers can import AppShell alongside PageShell
 * from `components/layout/`.
 *
 * **Preserved (non-premium) behavior — DO NOT alter via this proxy:**
 *   - TopNav (z-index 50) renders for every route, premium and non-premium.
 *   - PayMePanel side cart is mounted for every route.
 *   - PayMeCartProvider context wraps every route.
 *   - `.appRootWallpaper` (z-index -1) renders the default `/w99.png`
 *     wallpaper for every route. On the published-premium path it is fully
 *     occluded by the receiver mount (z-index 4); on every other path it
 *     remains the visible base layer.
 *
 * **Premium-published surface ownership (BIZ-PAGES-WALLPAPER-HOTFIX-003 S5):**
 * The premium receiver (`DesktopPremiumReceiver` with `asMount`) renders a
 * `dpv1ReceiverMount` div that is `position: fixed; inset: 0; width: 100vw;
 * height: 100vh; z-index: 4`. That mount fully covers the AppShell root
 * wallpaper and the AppBody flow region. The TopNav floats above it
 * (z-index 50). For premium-published routes, AppShell intentionally
 * contributes ONLY the nav and the side cart — the premium receiver owns
 * the published surface and does not inherit any AppShell wallpaper or
 * HomePage chrome behavior.
 */
export { AppShell } from "../../app/AppShell";
