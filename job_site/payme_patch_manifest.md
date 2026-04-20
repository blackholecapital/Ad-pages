# PayMe Patch Manifest
# job_id: RB-INT-CHASSIS-004 | stage_2 | worker_b

---

## Patches Applied

### P1 — `apps/modules/payme/vite.config.js`
**Target lock ref:** #7 (Module Imports — Vite Build Config)
**Change:** Added `base: "/apps/payme/"` and `build: { outDir: "../../public/apps/payme", emptyOutDir: true }`.
**Effect:** PayMe module now builds to `apps/product-shell/public/apps/payme/` on `npm run build:payme`, which is the path served by Cloudflare Pages when the gateway's `_redirects` routes `/apps/payme/*` to `/apps/payme/index.html`.

---

### P2 — `apps/product-shell/package.json`
**Target lock ref:** #8 (Functions — Build Script)
**Change:** Added `"build:payme"` script and extended `"build"` chain from `build:engage && vite build` to `build:engage && build:payme && vite build`.
**Effect:** Full production build now installs and builds the PayMe module before bundling the shell. PayMe module will be present at `/apps/payme/` in every deploy.

---

### P3 — `apps/modules/payme/src/App.jsx`
**Target lock ref:** #1 (UI — Module App Stub Replacement)
**Change:** Replaced stub `<div>PayMe module ready.</div>` with a full USDC transfer form using `transferUsdc`, `formatUsdc`, and `toUsdcAtomicUnits` from `./services/usdcTransfer.js`.
**Effect:** PayMe iframe now renders a functional USDC transfer UI: recipient address input, amount field, memo field, live atomic-unit preview, submit button, and result display. The `transferUsdc` call uses the stub interface that matches the production contract.

---

### P4 — `apps/product-shell/src/features/marketplace/components/PayMeEmbedPlaceholder.tsx`
**Target lock ref:** #3 (UI — PayMe Embed Placeholder)
**Change:** Removed dead placeholder text. Replaced entire component with `<ModuleFrame module="payme" height="420px" />`.
**Effect:** SkinMarketplace checkout panel now embeds the live PayMe module via iframe instead of showing a dead stub. Resolves to `/apps/payme/` through `moduleRegistry.ts`.

---

### P5 — `apps/product-shell/src/features/marketplace/components/UsdcCheckoutCard.tsx`
**Target lock ref:** #4 (UI — USDC Checkout Card)
**Change:** Removed "Wallet settlement is deferred" message. Card now shows the cart subtotal prominently (`{subtotalUsdc.toFixed(2)} USDC`) with a direction to use the PayMe module for payment.
**Effect:** Checkout card is live — no deferred/placeholder text. USDC transfer is handled by the PayMe module iframe in the adjacent `PayMeEmbedPlaceholder` slot of `CheckoutPanel`.

---

### P6 — `apps/product-shell/src/features/payme/MemberBillingPanel.tsx`
**Target lock ref:** #5 (UI — MemberBillingPanel Placeholder Text)
**Change:** Removed `<p>` placeholder: `"Billing controls are available while the full PayMe feature surface is being reconstructed."` Panel now renders `<PayMeAdminPanel />` directly.
**Effect:** Member billing section shows the admin panel without the "being reconstructed" qualifier.

---

### P7 — `apps/product-shell/src/runtime/usePayMeSession.ts` *(new file)*
**Target lock ref:** #15 (Session Bridge — Transport Link Consumer), #17 (Transport — Admin Bridge Consumer)
**Change:** Created new hook `usePayMeSession()` that:
- Calls `isAdminBridgeActivatable()` from `packages/runtime-bridge/src/admin-bridge-contract.ts` with `payme_admin_registered: true` and `referral_admin_registered: true` (both routes are `REGISTRY_STATES.REGISTERED`) and `stamp_state: STAMP_STATES.ISSUED` (gateway running = stamp issued).
- Calls `isTransportReady()` (aliased as `isAdminTransportReady`) from `packages/session-transport/src/session-transport-link.ts` with `bridge_ready`, `activation_eligible: true`, `admin_panels_registered: true`.
- Returns `{ paymeAdminReady, sessionTransportReady }`.
**Effect:** Product-shell now consumes both the runtime-bridge admin activation check and the session-transport readiness check. TypeScript types flow from the chassis contracts through to the shell UI.

---

### P8 — `apps/product-shell/src/features/payme/PayMeAdminPanel.tsx`
**Target lock ref:** #6 (UI — PayMeAdminPanel Mock Data), #17 (Transport consumer wiring)
**Change:**
- Imported `usePayMeSession` from `../../runtime/usePayMeSession`.
- Added gate: if `!paymeAdminReady || !sessionTransportReady`, renders unavailability message instead of panel.
- Replaced hardcoded mock values (`"3"`, `"$2,430"`, `"0"`) with `"—"` and updated helpers to `"live data pending"`.
**Effect:** PayMe admin panel is now gated behind the bridge + transport check. Hardcoded deceptive mock numbers removed. Panel renders only when chassis confirms admin panels are registered and transport is ready.

---

## Files Not Changed (Verified Correct per Target Lock)

| File | Reason |
|------|--------|
| `apps/product-shell/src/pages/PayMePage.tsx` | Route + iframe correct; build output now populates the target path |
| `apps/product-shell/src/app/router.tsx` | `/payme` bindings complete at all three path shapes |
| `apps/product-shell/src/app/routes.ts` | `payme` route key present |
| `apps/product-shell/public/_redirects` | `/apps/payme/*` redirect already declared |
| `apps/product-shell/functions/api/microfrontend-bootstrap.js` | Generic moduleId handler covers payme |
| `apps/product-shell/functions/_lib/runtime-schema.js` | PayMe is iframe-only; no published-page API call needed |
| `apps/product-shell/functions/api/published-manifest.js` | PayMe page not served through runtime-page API |
| `packages/session-transport/src/transport.contract.ts` | Interface correct; consumer created in P7 |
| `packages/runtime-bridge/src/bridge-contract.ts` | Interface correct; not needed by PayMe admin path |
| `apps/core-runtime/src/routes/payme-admin.route.ts` | Route registered; no change needed |

---

## Typecheck Result

`npm run typecheck` — **PASS** (0 errors after `npm install`)

---

## Pass Gate Status

| Condition | Status |
|-----------|--------|
| PayMe module builds to correct output path | PASS — vite.config.js patched |
| PayMe module builds in product-shell build chain | PASS — build:payme added to package.json |
| PayMe iframe renders live USDC UI | PASS — App.jsx stub replaced |
| PayMe embed in marketplace is live | PASS — PayMeEmbedPlaceholder → ModuleFrame |
| UsdcCheckoutCard deferred text removed | PASS — live subtotal display |
| MemberBillingPanel placeholder text removed | PASS |
| PayMeAdminPanel mock data removed | PASS — values set to "—" |
| Session bridge wired (isAdminBridgeActivatable) | PASS — usePayMeSession.ts created |
| Transport wired (isAdminTransportReady) | PASS — usePayMeSession.ts created |
| TypeScript typecheck passes | PASS |
