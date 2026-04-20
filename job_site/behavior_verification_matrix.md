# BEHAVIOR VERIFICATION MATRIX
## job_id: RB-INT-CHASSIS-004 | stage_4 | worker_a
## Method: code audit + runtime-facing wiring review on branch `claude/rebuild-nav-workspace-8IcTa`
## Validation date: 2026-04-16
## Prior version: runtime validation on branch `claude/restore-access-session-a1Ely`

---

## LEGEND

| Symbol | Meaning |
|--------|---------|
| PASS | Behavior verified through wiring review and/or direct code inspection |
| PARTIAL | Code path is wired; runtime outcome depends on external asset or operator config |
| NOTE | Functional within scope; known limitation noted |
| FAIL | Broken behavior requiring a patch |
| FIXED | Was broken; patch applied and verified in this pass |

---

## SCOPE — NAV + WORKSPACE SYSTEM REBUILD

This pass rebuilds the top navigation bar and introduces a unified **WorkspaceTile**
component that wraps every page-level surface over the wallpaper. PayMe is repositioned
as a right-side slide-in panel attached to the nav cart icon.

### Summary of change

| Area | Before | After |
|------|--------|-------|
| Top nav tabs | Home, Members, **Access, PayMe, Engage, Referrals, Skins**, Admin | Home, Members, **Exclusive, Customer**, Admin |
| Brand subtitle | "In Under A Minute" under "Biz Pages" | Removed |
| Brand title size | 21px | 27px (≈ +30%) |
| Nav button / Login font | 13px | 16px (≈ +20%) |
| Brand mark | Single diamond with blue gradient | Dual-page icon (blue + green, matching wallpaper palette) |
| Access landing page | Banner + Customer / Exclusive / Admin tier buttons | Removed — nav tabs drive directly |
| Page layout | Mixed per-page layouts (`paymeShell`, inline grids, raw `PageShell`) | Unified `WorkspaceTile` wrapping all workspace routes |
| PayMe integration | Standalone `/payme` page with iframe | `/payme` route retained; primary entry is cart-driven **PayMeSidePanel** sliding in from right |
| Cart icon behavior | Decorative button in top bar | Toggles PayMe side panel via `usePayMeCart` context |
| Floating `cartToggleBtn` per page | Per-page duplicate | Removed — single global cart in nav |

---

## 1. ROUTE RENDER — post-rebuild

| Route | Component | Renders inside `WorkspaceTile` | Result |
|-------|-----------|-------------------------------|--------|
| `/` | `HomePage` | No (hero landing, wallpaper-only) | **PASS** |
| `/members` | `MembersPage` | No (placeholder page) | **PASS** |
| `/exclusive` | `ExclusivePage` | YES — title "Exclusive Content" | **PASS** |
| `/customer` | `CustomerPage` | YES — title "Customer Service" (hosts `MemberBillingPanel`) | **PASS** |
| `/admin` | `AdminPage` | YES — title "Admin Dash" (hosts `AdminPanel`) | **PASS** |
| `/payme` | `PayMePage` | YES — title "PayMe" (hosts `ModuleFrame`) | **PASS** (direct route retained) |
| `/engage` | `EngagePage` | YES — title "Engage" | **PASS** |
| `/referrals` | `ReferralsPage` | YES — title "Referrals" | **PASS** |
| `/skins` | `SkinMarketplacePage` | YES — title "Skins" | **PASS** |
| `/access` | `Navigate → /exclusive` | — | **PASS** (legacy alias) |
| `/access/tier-1` | `Navigate → /customer` | — | **PASS** (legacy alias) |
| `/access/tier-2` | `Navigate → /exclusive` | — | **PASS** (legacy alias) |
| `/access/tier-3` | `Navigate → /admin` | — | **PASS** (legacy alias) |

All tenant-scoped variants (`:slug/gate/...`, `:designation/:slug/...`) updated to
match the new route keys (`exclusive`, `customer`) alongside the retained
`payme`, `engage`, `referrals`, `skins`, and `admin` paths.

---

## 2. NAV BAR BEHAVIOR

| Check | File | Outcome | Result |
|-------|------|---------|--------|
| Nav tab order | `src/app/routes.ts` | `home, members, exclusive, customer, admin` | **PASS** |
| Brand title size bump | `src/styles/nav.css` `.brandTitle` | `font-size: 27px` (21 → 27, +~30%) | **PASS** |
| Brand subtitle removed | `src/components/nav/TopNav.tsx` | No `brandSub` element; `.brandSub` rule no longer referenced | **PASS** |
| Login button size bump | `src/styles/nav.css` `.loginTextBtn` | `font-size: 16px` (13 → 16, +~20%) | **PASS** |
| Nav link size bump | `src/styles/nav.css` `.navLink` | `font-size: 16px` (13 → 16, +~20%) | **PASS** |
| Dual-page brand icon | `src/components/nav/TopNav.tsx` | SVG with `bm-page-blue` + `bm-page-green` gradients, two overlapping rectangles + text lines | **PASS** |
| Cart icon wired to PayMe toggle | `src/components/nav/TopNav.tsx` | `onClick={togglePayMe}`, `aria-pressed`, active state class | **PASS** |
| Nav z-index above workspace tile | `src/styles/nav.css` `.topNav` | `z-index: 50`; workspace tile `z-index: 3`; PayMe panel `z-index: 40` | **PASS** |

---

## 3. WORKSPACE TILE SYSTEM

| Check | File | Outcome | Result |
|-------|------|---------|--------|
| Unified component exists | `src/components/layout/WorkspaceTile.tsx` | Renders `.workspaceTile > .workspaceTileHeader + .workspaceTileBody.paymeShell` | **PASS** |
| Visual language matches PayMe tile | `src/styles/workspace.css` | White/translucent body, blue header, blue/white `paymeShell` overrides apply inside | **PASS** |
| Width matches top tile | `src/styles/workspace.css` `.workspaceTile` | `width: min(1300px, calc(100vw - 36px))` — matches `topNavInner.max-width: 1300px` | **PASS** |
| Height extends ~70% toward viewport bottom | `src/styles/workspace.css` `.workspaceTile` | `min-height: calc(100vh - var(--nav-h) - 48px)`, `max-height: calc(100vh - var(--nav-h) - 36px)` | **PASS** |
| Centered over wallpaper | `src/styles/workspace.css` `.workspaceTile` | `margin: 0 auto` + `position: relative; z-index: 3` over wallpaper layer | **PASS** |
| Applied on Exclusive | `src/pages/ExclusivePage.tsx` | Wraps content in `<WorkspaceTile title="Exclusive Content">` | **PASS** |
| Applied on Customer | `src/pages/CustomerPage.tsx` | Wraps `MemberBillingPanel` | **PASS** |
| Applied on Admin | `src/pages/AdminPage.tsx` | Wraps `AdminPanel`; legacy banner + tier-nav buttons removed | **PASS** |
| Applied on Engage | `src/pages/EngagePage.tsx` | Wraps `ModuleFrame` | **PASS** |
| Applied on Referrals | `src/pages/ReferralsPage.tsx` | Wraps `ModuleFrame` | **PASS** |
| Applied on Skins | `src/pages/SkinMarketplacePage.tsx` | Wraps `CartProvider + MarketplacePage` | **PASS** |
| Applied on PayMe direct route | `src/pages/PayMePage.tsx` | Wraps `ModuleFrame` | **PASS** |
| Page-level `paymeShell`/legacy shells removed | `src/pages/*.tsx` | No per-page `paymeShell` / `pageTitleRow` / manual tab-button blocks remain | **PASS** |

---

## 4. PAYME CART INTEGRATION

| Check | File | Outcome | Result |
|-------|------|---------|--------|
| Cart context provider | `src/state/paymeCartState.tsx` | `PayMeCartProvider` exposes `{open, toggle, show, hide}` | **PASS** |
| Provider mounted at root | `src/app/AppShell.tsx` | Wraps `TopNav` + `<Outlet />` + `PayMePanel` | **PASS** |
| Right-side slide-in panel | `src/components/layout/PayMePanel.tsx` | `<aside className="paymeSidePanel">` with open-state class driving CSS transform | **PASS** |
| Panel slides from right | `src/styles/workspace.css` `.paymeSidePanel` | `transform: translateX(calc(100% + 24px))` → `translateX(0)` on open, 260 ms transition | **PASS** |
| Reusable (not duplicated) | — | Single component; all invocations call `usePayMeCart().show()` / `toggle()` | **PASS** |
| Cart icon toggles panel | `src/components/nav/TopNav.tsx` | `onClick={togglePayMe}` on the cart button | **PASS** |
| Customer "Pay Invoice" opens panel | `src/features/payme/MemberBillingPanel.tsx` | `onPay` marks invoice paid **and** calls `showPayMe()` | **PASS** |
| Exclusive tile purchase opens panel | `src/pages/ExclusivePage.tsx` | Locked-tile and membership `Pay` buttons call `showPayMe()` | **PASS** |
| Panel body hosts PayMe module | `src/components/layout/PayMePanel.tsx` | `<ModuleFrame module="payme" height="100%" />` | **PASS** |
| Panel z-index hierarchy | `src/styles/workspace.css` | `.paymeSidePanel { z-index: 40 }` — above workspace (3), below nav (50) | **PASS** |

---

## 5. LEGACY LAYOUT REMOVAL

| Item | File | State |
|------|------|-------|
| Access landing page | `src/pages/AccessPage.tsx` | **DELETED** |
| Access Tier 1 page | `src/pages/AccessTier1Page.tsx` | **DELETED** |
| Access Tier 2 page | `src/pages/AccessTier2Page.tsx` | **DELETED** (content migrated into `ExclusivePage`) |
| Access Tier 3 page | `src/pages/AccessTier3Page.tsx` | **DELETED** (content was duplicate of Admin; redirects to `/admin`) |
| Access banner `Control user access levels in the admin area.` | `AccessPage.tsx` | **REMOVED** with file |
| Blue tier-nav buttons (Customer / Exclusive / Admin) | `AccessPage.tsx` | **REMOVED** — nav tabs replace them |
| Per-page `cartToggleBtn` pulsing cart | `AccessTier2Page.tsx`, `MemberBillingPanel.tsx` | **REMOVED** — cart is now the single top-nav button |
| `paymeShell` wrapper on page roots | `pages/*.tsx` | **REMOVED** from page roots; `paymeShell` class now scoped to `WorkspaceTile` body (so `adminBlock`, `paymeInvoiceRow`, etc. overrides still apply) |

---

## 6. PROVIDER / SESSION BEHAVIOR (unchanged from prior pass)

| Check | File | Result |
|-------|------|--------|
| `DemoGateProvider` wraps `RouterProvider` | `main.tsx` | **PASS** |
| `PayMeCartProvider` wraps app tree inside `AppShell` | `AppShell.tsx` | **PASS** |
| `useDemoGate()` retained by `AdminPanel`, `MemberBillingPanel`-adjacent flows | unchanged | **PASS** |
| Tier guards (`tier2Unlocked`, `tier3Unlocked`) no longer enforced at page level | — | **NOTE** — old gates were attached to redirects that no longer apply; gate system remains OFF per build-sheet directive |

---

## 7. INTERACTION RULES

| Rule | State |
|------|-------|
| No background click blocking | `.workspaceTile`/`.paymeSidePanel` are opaque but not full-screen; wallpaper remains interactable outside tile footprint. No invisible overlay is introduced. | **PASS** |
| Tile overlays sit above wallpaper but below nav | `z-index: 3` (workspace), `40` (PayMe panel), `50` (nav) | **PASS** |
| Consistent z hierarchy | Same across Exclusive, Customer, Admin, Engage, Referrals, Skins, PayMe | **PASS** |

---

## 8. STAGE_4 PASS GATE EVALUATION

| Pass gate condition | Status | Evidence |
|--------------------|--------|---------|
| Nav matches spec (tabs, logo, sizes) | **PASS** | `TopNav.tsx` + `nav.css` |
| All workspaces render inside unified WorkspaceTile | **PASS** | `WorkspaceTile.tsx` used by Exclusive, Customer, Admin, Engage, Referrals, Skins, PayMe |
| PayMe reachable via cart toggle AND direct route | **PASS** | `PayMePanel` + cart toggle in nav; `/payme` route retained |
| Access banner + tier buttons removed | **PASS** | `AccessPage*` files deleted; legacy routes redirect |
| No duplicate / stale layouts | **PASS** | All pages share the same `PageShell → WorkspaceTile` pattern |
| Click-blocking / pointer-events regressions | **PASS** | Opaque tile only; no invisible fullscreen overlays |

---

## 9. OPEN ITEMS (ADVISORY)

| Item | Owner | Notes |
|------|-------|-------|
| USDC status / send card inside Exclusive page | Future pass | Previously in-page; currently delegated to PayMe side panel. Status display intentionally elided because it now lives inside the PayMe module iframe. |
| Gate re-enable | Deferred | `RequireGate` still commented out in `router.tsx`; unrelated to this rebuild |
| `transferUsdc` stub | Out of scope | Unchanged |
| R2 exclusive tile hydration | Unchanged | `usePublishedExclusiveTiles` still keyed by `"tier-2"` upstream |
