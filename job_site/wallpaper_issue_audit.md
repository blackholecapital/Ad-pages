form_id: wallpaper_issue_audit
job_id: BIZ-PAGES-WALLPAPER-HOTFIX-003
stage: S1
produced_by: derived from direct code analysis (Worker A document; Worker A did not run before Worker B)
derives_from: /job_site/wallpaper_renderer_fault_report.md (BIZ-PAGES-PROD-DETANGLE-002 S1)

# Wallpaper Issue Audit

## 1. Issue Summary

Published Biz premium-shell pages rendered the bundled default wallpaper
(`/w99.png`) via the legacy AppShell/PageShell path instead of the tenant's
R2-backed wallpaper through the premium receiver. The `DesktopPremiumReceiver`
was only reachable through `StudioPage → Receiver Preview`, not through the live
published slug route.

## 2. Conflicting Legacy Path

**Component:** `apps/product-shell/src/components/layout/PageShell.tsx`
**Entry routes:** all slug routes in `apps/product-shell/src/app/router.tsx`
  (`/:slug`, `/:slug/gate`, `/:designation/:slug`, `/:designation/:slug/gate`, etc.)
  routed to page components which wrapped content in `<PageShell>` with no
  `runtimePage` prop.

**Pre-patch behavior:**
- `PageShell` rendered `.wallpaperLayer` + children for ALL payloads — no check
  for `shellId` or `stage` fields.
- Tenant `wallpaper` field (`e.g. "w91"`) from the runtime API payload was
  silently dropped; never threaded into `PageShell.wallpaperUrl`.
- `apps/product-shell/src/utils/assetCodeResolver.ts` returned the bare asset
  code, not a URL — R2 wallpapers would not have resolved even if threaded.
- `AppShell` hard-coded `const DEFAULT_WALLPAPER_URL = "/w99.png"` with
  `background-size: contain` causing letterboxing on non-16:9 viewports.
- `DesktopPremiumReceiver` was isolated to `StudioPage.tsx:87` (preview only).

## 3. Fault Inventory (from wallpaper_renderer_fault_report.md)

| Fault | Location | Effect |
|-------|----------|--------|
| A: `contain` fit on `.wallpaperImage` | `shell.css:62-66` | Letterboxing on non-16:9 viewports for legacy/PageShell path |
| B: hard-coded `/w99.png` in AppShell | `AppShell.tsx:8,17` | Tenant wallpaper cannot reach default fallback layer |
| C: PageShell never received `wallpaperUrl` | all page files | Runtime payload `wallpaper` field dropped before render |
| D: asset code never resolved to URL | `assetCodeResolver.ts:1-11` | Code `"w91"` not loadable by browser even if threaded |
| E: premium receiver dispatch never invoked for Biz pages | `router.tsx:35-95`, page files | End users saw default wallpaper; Studio preview did not |
| F: dual z-index layers | `shell.css:8-11`, `shell.css:55-60` | Layering conflict prevented tenant override |

## 4. Conflicting Path Removed by Patch (S2, BIZ-PAGES-PROD-DETANGLE-002)

`PageShell.tsx` was patched to dispatch to `DesktopPremiumReceiver` when the
compiled runtime payload carries `shellId === "desktop-premium-v1"` with valid
`stage` dims (see `/job_site/premium_route_contract.md` §1).

The legacy `.wallpaperLayer` + children path is now only reached when
`isPremiumRuntimePage(runtimePage)` returns false — i.e. non-premium payloads.

For premium payloads the patch eliminates:
- The silent drop of `shellId`/`stage` fields.
- The `.wallpaperImage` `contain` sizing path (Fault A) — premium receiver uses
  `background-size: cover` inside `dpv1Wallpaper` CSS.
- The `/w99.png` default wallpaper visible through the stage — `.premiumSurface`
  is `z-index: 4`, above the AppShell root wallpaper.
- Studio-preview-only isolation of `DesktopPremiumReceiver` (Fault E).

## 5. Items Outside Hotfix Scope (Preserved, Non-Conflicting)

- **Fault A (`contain`) on non-premium path** — `.wallpaperImage` still uses
  `background-size: contain` for legacy/static pages. This is intentional; only
  the premium path uses `cover`.
- **AppShell `/w99.png` default** — still present as base default for all
  non-premium routes. Does not interfere with `.premiumSurface` (z-index).
- **`assetCodeResolver.ts`** — code-to-URL resolution for non-wallpaper assets
  is outside this hotfix scope.

## 6. Verification Status

| Item | Status |
|------|--------|
| Legacy path no longer intercepts premium payloads | VERIFIED — PageShell.tsx:59 exclusive return |
| Premium receiver mounts for `shellId: "desktop-premium-v1"` payloads | VERIFIED — PageShell.tsx:59-69 |
| Non-premium pages unaffected by dispatch change | VERIFIED — `isPremiumRuntimePage` returns false for no-shellId payloads |
| Studio preview path unchanged | VERIFIED — StudioPage.tsx:87 unchanged |
| `.premiumSurface` above AppShell default wallpaper | VERIFIED — z-index:4 vs z-index:-1 |
