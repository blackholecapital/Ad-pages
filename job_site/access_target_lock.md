# ACCESS TARGET LOCK
## job_id: RB-INT-CHASSIS-004 | stage_1 | worker_a

---

## SECTION 1 — /access PAGE

**File:** `apps/product-shell/src/pages/AccessPage.tsx`

Status: Functional. Renders tier-1/2/3 nav buttons. Builds dynamic `tierPath()` from
`useParams` (`designation`, `slug`). No access gate. No broken behavior.

No patch required for the access landing page itself.

---

## SECTION 2 — ROUTER

**File:** `apps/product-shell/src/app/router.tsx`

- `createBrowserRouter` with all routes nested under `AppShell` at `/`
- `RequireGate` import is **commented out** — all routes are publicly reachable
- Three route families present: base (`/access`), slug (`/:slug/gate/access`),
  designation (`/:designation/:slug/access`)
- All tier routes (`/access/tier-1`, `/access/tier-2`, `/access/tier-3`) are registered
  and flat — no element wrapping in a gate

**Patch target if gate is to be re-enabled:**
`apps/product-shell/src/app/router.tsx` — lines 67–109
Specifically: uncomment `RequireGate` import (line 17) and re-wrap gated route groups
with `{ element: <RequireGate />, children: [...] }`

**Current baseline:** gate is OFF. Build sheet outcome requires pages not be
incorrectly locked. No gate re-enable required.

---

## SECTION 3 — ROUTE GUARD (RequireGate)

**File:** `apps/product-shell/src/components/gate/RequireGate.tsx`

- Uses its own local state (`connected`, `signed`, `bypassEnabled`) via `useState`
- Does **NOT** consume `DemoGateContext` / `useDemoGate()`
- Disconnect: global tier-unlock state in `demoGateState.tsx` is not wired into the gate

**Sub-files (gate component tree):**
- `apps/product-shell/src/components/gate/DemoBypassButton.tsx` — toggle button, prop-driven
- `apps/product-shell/src/components/gate/GateStatusPill.tsx` — status label, prop-driven
- `apps/product-shell/src/components/gate/LoginModal.tsx` — modal wrapper
- `apps/product-shell/src/components/gate/SignMessageButton.tsx` — sign action, prop-driven
- `apps/product-shell/src/components/gate/WalletConnectButton.tsx` — connect action, prop-driven

**Patch target if gate reconnect is required:**
`apps/product-shell/src/components/gate/RequireGate.tsx` — replace local state with
`useDemoGate()` consumption to read `walletConnected`, `signedMessage`, `demoBypass`
from `DemoGateContext`.

---

## SECTION 4 — MEMBER UNLOCK (TIER-LEVEL GUARDS)

### Tier 1 — AccessTier1Page
**File:** `apps/product-shell/src/pages/AccessTier1Page.tsx`

- No tier-lock check present. Renders `MemberBillingPanel` directly.
- `MemberBillingPanel` (`apps/product-shell/src/features/payme/MemberBillingPanel.tsx`)
  contains placeholder text: *"Billing controls are available while the full PayMe feature
  surface is being reconstructed."*
- `PayMeAdminPanel` (`apps/product-shell/src/features/payme/PayMeAdminPanel.tsx`)
  renders three hardcoded mock stat cards (via `PayMeAdminCard`).

**Patch required:** `MemberBillingPanel` is deferred/placeholder. Stitch in real
PayMe billing surface. Exact target: `apps/product-shell/src/features/payme/MemberBillingPanel.tsx`

---

### Tier 2 — AccessTier2Page
**File:** `apps/product-shell/src/pages/AccessTier2Page.tsx`

- Reads `state.tier2Unlocked` from `useDemoGate()`
- `useEffect` redirects to `${base}/access` when `!state.tier2Unlocked`
- **Initial state in `demoGateState.tsx`: `tier2Unlocked: true`** — no redirect fires on load
- Content tiles hydrated from `usePublishedExclusiveTiles(slug)` hook
- Renders exclusive content grid + USDC pay card (floating toggle)
- USDC send: reads `state.walletConnected`, `state.signedMessage`; calls `sendUsdcOnBase`

**Patch required:** The exclusive tile hook calls `fetchPublishedRuntimePage(slug, "access-tier-2")`
but the valid page key is `"tier-2"`. See Section 7.

---

### Tier 3 — AccessTier3Page
**File:** `apps/product-shell/src/pages/AccessTier3Page.tsx`

- Reads `state.tier3Unlocked` from `useDemoGate()`
- `useEffect` redirects to `${base}/access` when `!state.tier3Unlocked`
- **Initial state in `demoGateState.tsx`: `tier3Unlocked: true`** — no redirect fires on load
- Renders `AdminPanel` from `apps/product-shell/src/components/admin/AdminPanel.tsx`

---

## SECTION 5 — PROVIDER

**File:** `apps/product-shell/src/state/demoGateState.tsx`

- `DemoGateContext` — React context with `state` and `actions`
- `DemoGateProvider` — wraps app at root; all tier-unlock and wallet state lives here
- `initialState`:
  - `walletConnected: false`
  - `signedMessage: false`
  - `demoBypass: false`
  - `tier1Unlocked: true` ← open by default
  - `tier2Unlocked: true` ← open by default
  - `tier3Unlocked: true` ← open by default
- Actions: `connectWallet`, `signMessage`, `simulateSignedMessage`, `unlockTier1/2/3`,
  `toggleTier1/2/3`, `resetDemoState`, `enableBypass`

**No patch required for initial state.** All tiers start unlocked — this aligns with
build sheet requirement that pages not be incorrectly locked.

---

## SECTION 6 — RUNTIME & STATE WIRING

**File:** `apps/product-shell/src/main.tsx`

- `DemoGateProvider` wraps `RouterProvider` — correct provider-first order
- All route-level components can access `useDemoGate()` via context

**File:** `apps/product-shell/src/app/AppShell.tsx`

- Renders `<TopNav />` + `<Outlet />` — no additional provider; clean shell

**File:** `apps/product-shell/src/runtime/routeContext.ts`

- `useRuntimeRouteContext()` — derives `pageKey`, `designation`, `slug` from `useMatches` + `useParams`
- Used by nav and overlay components

**File:** `apps/product-shell/src/app/routes.ts`

- `RouteKey` type and `routes[]` array — drives `TopNav` link rendering
- Keys: `home`, `members`, `access`, `tier-2`, `payme`, `engage`, `referrals`, `skins`, `admin`

**File:** `apps/product-shell/src/runtime/types.ts`

- `PublishedRuntimePage`, `PublishedRuntimeManifest`, `RenderedExclusiveTile`, etc.
- Source of truth for runtime payload shapes

---

## SECTION 7 — RUNTIME FETCH BUG (EXCLUSIVE TILES)

**File:** `apps/product-shell/src/hooks/usePublishedExclusiveTiles.ts` — **PATCH REQUIRED**

Line 21:
```ts
const page = await fetchPublishedRuntimePage(slug, "access-tier-2");
```

`"access-tier-2"` is not a valid page key. The API's `VALID_PAGES` set in
`apps/product-shell/functions/_lib/runtime-schema.js` is:
```js
const VALID_PAGES = new Set(["home", "members", "access", "tier-2"]);
```

The correct key is `"tier-2"`. As-is, every call to this hook returns `null` (API responds
400 "Unsupported page"), falling back to `DEFAULT_CONTENT_ITEMS` with all 6 tiles
locked and no images. The tier-2 content grid never receives real published tile data.

**Exact fix:** Change `"access-tier-2"` → `"tier-2"` at line 21 of
`apps/product-shell/src/hooks/usePublishedExclusiveTiles.ts`

---

## SECTION 8 — FUNCTIONS / API RUNTIME

**File:** `apps/product-shell/functions/api/published-page.js`

- Serves `GET /api/published-page?slug=&page=`
- Validated pages: `["home", "members", "access", "tier-2"]` (via `runtime-schema.js`)
- Two sources: `DEMO_BUCKET` (demo site JSON) then `TENANTS_BUCKET` (per-tenant files)
  then legacy bundle fallback
- `"tier-2"` key is valid and handled; returns exclusive tiles via `normalizePageSpec`

**File:** `apps/product-shell/functions/api/published-manifest.js`

- Serves `GET /api/published-manifest?slug=`
- Lists all 4 page keys with their source mode and R2 key
- No patch needed for access flow

**File:** `apps/product-shell/functions/_lib/runtime-schema.js`

- `VALID_PAGES` set — currently correct for all declared pages
- `assertRuntimeParams()` — rejects unknown page keys (source of the tier-2 hook bug)
- `normalizeExclusiveTile()` — handles tile normalization for tier-2 payload

**File:** `apps/product-shell/functions/_lib/runtime-compiler.js`

- `compileRuntimePage()` — builds `PublishedRuntimePage` response payload
- `mapLegacyBundleToPage()` — maps legacy bundle; does not handle `"tier-2"` (only `home`,
  `members`, `access` have studio key mappings). If a tenant has no per-page `tier-2.json`
  and only a legacy bundle, the page will 404.

**File:** `apps/product-shell/functions/_lib/runtime-r2.js`

- `readBucketJson()`, `objectExists()` — R2 read helpers; no patch needed

---

## SECTION 9 — LOCKED FILE LIST (EXACT PATCH TARGETS)

| # | File | Patch |
|---|------|-------|
| 1 | `apps/product-shell/src/hooks/usePublishedExclusiveTiles.ts` | Change page key `"access-tier-2"` → `"tier-2"` (line 21) |
| 2 | `apps/product-shell/src/features/payme/MemberBillingPanel.tsx` | Replace placeholder/deferred text and mock panel with real PayMe billing surface (stitch target for stage 2) |
| 3 | `apps/product-shell/src/components/gate/RequireGate.tsx` | If gate reconnect required: wire to `useDemoGate()` instead of local state |
| 4 | `apps/product-shell/src/app/router.tsx` | If gate re-enable required: uncomment `RequireGate` import and wrap gated route groups |
| 5 | `apps/product-shell/functions/_lib/runtime-compiler.js` | If tier-2 legacy fallback is needed: add `"tier-2"` → studio key mapping in `STUDIO_PAGE_KEY` |

---

## SECTION 10 — NO-TOUCH FILES (CONFIRMED CORRECT, NO PATCH)

- `apps/product-shell/src/pages/AccessPage.tsx` — working
- `apps/product-shell/src/pages/AccessTier2Page.tsx` — guard logic correct; tile hook is the bug
- `apps/product-shell/src/pages/AccessTier3Page.tsx` — guard logic correct
- `apps/product-shell/src/state/demoGateState.tsx` — initial state correct; tiers open by default
- `apps/product-shell/src/main.tsx` — provider wiring correct
- `apps/product-shell/src/app/AppShell.tsx` — clean
- `apps/product-shell/src/app/routes.ts` — correct
- `apps/product-shell/src/runtime/routeContext.ts` — correct
- `apps/product-shell/src/runtime/publishedClient.ts` — correct
- `apps/product-shell/src/runtime/exclusiveTileHydration.ts` — correct
- `apps/product-shell/src/runtime/types.ts` — correct
- `apps/product-shell/functions/api/published-page.js` — correct
- `apps/product-shell/functions/api/published-manifest.js` — correct
- `apps/product-shell/functions/_lib/runtime-schema.js` — correct
- `apps/product-shell/functions/_lib/runtime-r2.js` — correct
- All gate sub-components (`DemoBypassButton`, `GateStatusPill`, `LoginModal`,
  `SignMessageButton`, `WalletConnectButton`) — correct as prop-driven components
