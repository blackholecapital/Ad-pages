# PayMe Stitch Target Lock
# job_id: RB-INT-CHASSIS-004 | stage_1 | worker_b

---

## Audit Scope

Audit source: `apps/modules/payme/` (added PayMe filesystem)
Target roots per build-sheet:
- `apps/product-shell/src/pages/`
- `apps/product-shell/src/app/`
- `apps/product-shell/src/features/`
- `apps/product-shell/src/runtime/`
- `apps/product-shell/src/state/`
- `apps/product-shell/functions/api/`
- `apps/product-shell/functions/_lib/`
- `apps/modules/payme/src/`
- `apps/core-runtime/src/routes/`
- `packages/runtime-bridge/src/`
- `packages/session-transport/src/`

---

## PayMe Module State (Source Material)

| File | Status |
|------|--------|
| `apps/modules/payme/src/App.jsx` | Stub only — renders `"PayMe module ready."` string; no USDC UI |
| `apps/modules/payme/src/index.jsx` | Barrel export present; exports `PaymeModuleApp` + USDC utils; correct |
| `apps/modules/payme/src/main.jsx` | Standalone mount entry; correct for iframe use |
| `apps/modules/payme/src/services/usdcTransfer.js` | Utility functions present: `transferUsdc`, `formatUsdc`, `toUsdcAtomicUnits`, `fromUsdcAtomicUnits` — all stubbed but interface is correct |
| `apps/modules/payme/src/styles/global.css` | Minimal light-mode base; present |
| `apps/modules/payme/vite.config.js` | **MISSING** `base` and `build.outDir`; module cannot be built to the correct serve path |
| `apps/modules/payme/index.html` | Correct standalone HTML entry; mounts `#root` |
| `apps/modules/payme/package.json` | Name: `usdc.xyz-labs.xyz`; correct exports config; no build-step integration with product-shell |

---

## Exact Stitch Targets

### 1. UI — Module App (Stub Replacement)

**File:** `apps/modules/payme/src/App.jsx`
**Current state:** Renders `<div>PayMe module ready.</div>` — stub only
**Required patch:** Replace stub with real USDC transfer UI. Must consume `transferUsdc`, `formatUsdc`, `toUsdcAtomicUnits` from `./services/usdcTransfer.js`. This is the content rendered inside the iframe at `/apps/payme/`.
**Blocker if unpatched:** PayMePage iframe loads but displays blank stub text.

---

### 2. UI — PayMePage iframe target

**File:** `apps/product-shell/src/pages/PayMePage.tsx`
**Current state:** Renders `<ModuleFrame module="payme" height="76vh" />` — route binding and iframe call are correct.
**Required patch:** None to the page structure. The iframe resolves to `/apps/payme/` via `moduleRegistry.ts`. This path is declared in `public/_redirects` and is correct.
**Dependency:** Build output must populate `public/apps/payme/` before this renders live content.

---

### 3. UI — PayMe Embed Placeholder (Dead Stub)

**File:** `apps/product-shell/src/features/marketplace/components/PayMeEmbedPlaceholder.tsx`
**Current state:** Dead placeholder text: `"PayMe checkout embed will be enabled when module-frame integration is available."`
**Required patch:** Replace with live PayMe embed using `<ModuleFrame module="payme" />` or direct import of `PaymeModuleApp` from `apps/modules/payme/src/index.jsx`.
**Blocker if unpatched:** Checkout panel in SkinMarketplace shows dead text instead of PayMe.

---

### 4. UI — USDC Checkout Card (Deferred Wiring)

**File:** `apps/product-shell/src/features/marketplace/components/UsdcCheckoutCard.tsx`
**Current state:** Displays `"Wallet settlement is deferred until integrations are reconstructed."` — no live function calls.
**Required patch:** Import `transferUsdc` and `formatUsdc` from `apps/modules/payme/src/services/usdcTransfer.js`. Remove deferred message. Wire checkout submission to `transferUsdc({ to, amount })`.
**Import path:** `../../../../../modules/payme/src/services/usdcTransfer.js` (relative) or resolve via package name `usdc.xyz-labs.xyz` if workspace is configured.

---

### 5. UI — MemberBillingPanel (Placeholder Text)

**File:** `apps/product-shell/src/features/payme/MemberBillingPanel.tsx`
**Current state:** Contains placeholder text: `"Billing controls are available while the full PayMe feature surface is being reconstructed."`
**Required patch:** Remove placeholder `<p>` text. Let `<PayMeAdminPanel />` render directly without the "being reconstructed" qualifier.

---

### 6. UI — PayMeAdminPanel (Mock Data)

**File:** `apps/product-shell/src/features/payme/PayMeAdminPanel.tsx`
**Current state:** Hardcoded mock values: `"Active plans: 3"`, `"USDC collected: $2,430"`, `"Failed renewals: 0"`.
**Required patch:** Replace hardcoded mock values with real data source, or explicitly mark as admin display defaults. Remove deceptive static numbers if real data wiring is not in scope for stage_2.

---

### 7. Module Imports — Vite Build Config (Critical Path)

**File:** `apps/modules/payme/vite.config.js`
**Current state:**
```js
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 }
});
```
**Required patch:** Add `base` and `build.outDir` to match the engage module pattern:
```js
base: '/apps/payme/',
build: {
  outDir: '../../public/apps/payme',
  emptyOutDir: true
}
```
**Reference:** `apps/modules/engage/vite.config.js` — identical pattern already working for engage.
**Blocker if unpatched:** `npm run build:payme` will output to wrong directory; `/apps/payme/` will never resolve.

---

### 8. Functions — Build Script (PayMe Not Built)

**File:** `apps/product-shell/package.json`
**Current state:**
```json
"build": "npm run build:engage && vite build",
"build:engage": "npm --prefix ../modules/engage install --progress=false && npm --prefix ../modules/engage run build"
```
**Required patch:** Add `build:payme` script and include it in the `build` chain:
```json
"build": "npm run build:engage && npm run build:payme && vite build",
"build:payme": "npm --prefix ../modules/payme install --progress=false && npm --prefix ../modules/payme run build"
```
**Blocker if unpatched:** PayMe module is never built; `/apps/payme/` directory never created; all iframe renders are blank.

---

### 9. Route Bindings — Router (Verified Correct)

**File:** `apps/product-shell/src/app/router.tsx`
**Current state:** `/payme` route binds to `<PayMePage />` with `handle: { pageKey: "payme" }` at all three path shapes:
- `/payme`
- `/:slug/gate/payme`
- `/:designation/:slug/payme`
**Required patch:** None. Route bindings are complete and correct.

---

### 10. Route Bindings — Routes Manifest (Verified Correct)

**File:** `apps/product-shell/src/app/routes.ts`
**Current state:** `payme` route key with path `/payme` present in `AppRoute[]`.
**Required patch:** None.

---

### 11. Route Bindings — Cloudflare _redirects (Verified Present)

**File:** `apps/product-shell/public/_redirects`
**Current state:** `/apps/payme/* → /apps/payme/index.html 200` already declared.
**Required patch:** None.

---

### 12. Functions — Runtime Schema VALID_PAGES

**File:** `apps/product-shell/functions/_lib/runtime-schema.js`
**Current state:** `VALID_PAGES = new Set(["home", "members", "access", "tier-2"])` — `"payme"` is absent.
**Assessment:** `assertRuntimeParams()` will reject any `?page=payme` API request with `"Unsupported page"`.
**Required patch:** Add `"payme"` to `VALID_PAGES` if PayMe page content is served through the published-page runtime API (i.e., if stage_2 requires `/api/published-page?page=payme` to work).
**Conditional:** Only required if PayMe page uses runtime-page API; if PayMe is iframe-only (no published-page API call), no change needed. Mark as stage_2 decision point.

---

### 13. Functions — Published Manifest PAGES

**File:** `apps/product-shell/functions/api/published-manifest.js`
**Current state:** `PAGES = ["home", "members", "access", "tier-2"]` — `"payme"` absent.
**Assessment:** Manifest response will not include a `payme` page entry.
**Required patch:** Add `"payme"` to `PAGES` array if PayMe page should appear in the published manifest.
**Conditional:** Same condition as target 12. Mark as stage_2 decision point.

---

### 14. Functions — Microfrontend Bootstrap (Verified Correct)

**File:** `apps/product-shell/functions/api/microfrontend-bootstrap.js`
**Current state:** Generic `moduleId` handling — any `?moduleId=payme&frameId=...` request will produce a valid bootstrap payload.
**Required patch:** None. Generic handler already supports payme module.

---

### 15. Session Bridge — Transport Link (Defined, Not Consumed)

**File:** `packages/session-transport/src/session-transport-link.ts`
**Current state:** `isAdminTransportReady(config: SessionTransportConfig): boolean` is exported. Checks `bridge_ready && activation_eligible && admin_panels_registered`.
**Assessment:** Exported but never imported or called in product-shell or payme module.
**Required patch:** Product-shell (or PayMe feature layer) must call `isAdminTransportReady()` to determine whether PayMe admin panel session is valid. A consumer must be created that constructs `SessionTransportConfig` with `admin_panels_registered: true` and passes it to this check before rendering `PayMeAdminPanel` or `MemberBillingPanel`.
**Suggested consumer location:** `apps/product-shell/src/features/payme/MemberBillingPanel.tsx` or a new `usePayMeSession` hook under `apps/product-shell/src/runtime/`.

---

### 16. Session Bridge — Transport Contract (Defined, Not Instantiated)

**File:** `packages/session-transport/src/transport.contract.ts`
**Current state:** `SessionTransportState` and `SessionTransportConfig` interfaces are defined. `admin_panels_registered` field exists.
**Required patch:** No interface change needed. Consumer in target 15 must instantiate `SessionTransportConfig` correctly with runtime values. No file edit required to this contract file.

---

### 17. Transport — Admin Bridge Contract (Defined, Not Consumed)

**File:** `packages/runtime-bridge/src/admin-bridge-contract.ts`
**Current state:** `isAdminBridgeActivatable(state: AdminBridgeState): boolean` exported. Checks `payme_admin_registered && referral_admin_registered`.
**Assessment:** Exported but never imported or called in product-shell.
**Required patch:** Product-shell must call `isAdminBridgeActivatable()` to gate PayMe admin panel rendering. Caller must construct `AdminBridgeState` with `payme_admin_registered: true` (derives from `PAYME_ADMIN_ROUTE.registry_state === REGISTERED`).
**Suggested consumer location:** `apps/product-shell/src/features/payme/PayMeAdminPanel.tsx` or a new hook.

---

### 18. Transport — Runtime Bridge Contract (Defined, Not Consumed by PayMe)

**File:** `packages/runtime-bridge/src/bridge-contract.ts`
**Current state:** `isBridgeActivatable(state: RuntimeBridgeState): boolean` exported.
**Assessment:** Core bridge activation check. PayMe admin panel should not render if bridge is not activatable.
**Required patch:** If `isAdminBridgeActivatable()` (target 17) is wired, this may be a prerequisite. No change to the contract file itself; only consumer wiring is required.

---

### 19. Core Runtime Route (Verified Complete)

**File:** `apps/core-runtime/src/routes/payme-admin.route.ts`
**Current state:** `PAYME_ADMIN_ROUTE` defined with `ROUTE_IDS.PAYME_ADMIN`, `SURFACE_IDS.API_FACTORY`, `REGISTRY_STATES.REGISTERED`.
**Required patch:** None. Chassis route is registered.

---

## Summary Table — Must-Patch vs. Conditional

| # | File | Action | Priority |
|---|------|---------|----------|
| 7 | `apps/modules/payme/vite.config.js` | Add `base` + `build.outDir` | MUST — build critical path |
| 8 | `apps/product-shell/package.json` | Add `build:payme` to build chain | MUST — build critical path |
| 2 | `apps/modules/payme/src/App.jsx` | Replace stub with USDC UI | MUST — live content |
| 3 | `apps/product-shell/src/features/marketplace/components/PayMeEmbedPlaceholder.tsx` | Replace placeholder with live embed | MUST — dead component |
| 4 | `apps/product-shell/src/features/marketplace/components/UsdcCheckoutCard.tsx` | Wire `transferUsdc`, remove deferred text | MUST — dead component |
| 5 | `apps/product-shell/src/features/payme/MemberBillingPanel.tsx` | Remove "being reconstructed" text | MUST — live text |
| 6 | `apps/product-shell/src/features/payme/PayMeAdminPanel.tsx` | Remove or replace hardcoded mock values | MUST — mock data |
| 15 | `packages/session-transport/src/session-transport-link.ts` (consumer) | Create consumer in product-shell | MUST — session bridge wiring |
| 17 | `packages/runtime-bridge/src/admin-bridge-contract.ts` (consumer) | Create consumer in product-shell | MUST — transport wiring |
| 12 | `apps/product-shell/functions/_lib/runtime-schema.js` | Add `"payme"` to VALID_PAGES | CONDITIONAL — only if API needed |
| 13 | `apps/product-shell/functions/api/published-manifest.js` | Add `"payme"` to PAGES | CONDITIONAL — only if manifest needed |
| 1 | `apps/product-shell/src/pages/PayMePage.tsx` | No structural change; verify iframe resolves | VERIFY ONLY |
| 9 | `apps/product-shell/src/app/router.tsx` | No change needed | VERIFIED CORRECT |
| 10 | `apps/product-shell/src/app/routes.ts` | No change needed | VERIFIED CORRECT |
| 11 | `apps/product-shell/public/_redirects` | No change needed | VERIFIED CORRECT |
| 14 | `apps/product-shell/functions/api/microfrontend-bootstrap.js` | No change needed | VERIFIED CORRECT |
| 16 | `packages/session-transport/src/transport.contract.ts` | No interface change needed | VERIFIED CORRECT |
| 18 | `packages/runtime-bridge/src/bridge-contract.ts` | No change needed | VERIFIED CORRECT |
| 19 | `apps/core-runtime/src/routes/payme-admin.route.ts` | No change needed | VERIFIED CORRECT |

---

## New Files Required

| File | Purpose |
|------|---------|
| `apps/product-shell/src/runtime/usePayMeSession.ts` (suggested) | Hook that constructs `SessionTransportConfig` and calls `isAdminTransportReady()` + `isAdminBridgeActivatable()` — consumer for targets 15 and 17 |

---

## Pass Gate Verification

- [x] Every required patch path is named to exact file
- [x] No broad "fix PayMe" or "stitch payme" wording — all targets are exact
- [x] Build chain gap identified (vite config + package.json build script)
- [x] UI stubs and dead placeholders enumerated with exact file paths
- [x] Session bridge and transport wiring targets named with exact file paths
- [x] Route bindings verified correct — no guesswork needed in stage_2
- [x] Functions gaps (VALID_PAGES, manifest PAGES) explicitly conditional
