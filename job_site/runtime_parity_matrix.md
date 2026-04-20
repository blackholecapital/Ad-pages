# Runtime Parity Matrix

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S1 / Worker A
purpose: prove the exact code-path divergence that keeps Biz Pages on mixed
legacy / static and premium paths; Studio-side and Receiver-side renderers,
compiler shape, and published fetch path must be compared dimension-by-dimension.

All paths below resolve under
`/job_site/repo_mirror/Biz-Pages-FB-frozen-main/` ↔ repo root.

## 1. Shell renderer dispatch

| Surface                                | Shell component rendered                                       | Source file                                                            | Reads `shellId` from JSON? |
|----------------------------------------|----------------------------------------------------------------|------------------------------------------------------------------------|----------------------------|
| `/` (Home)                             | `PageShell` + `homeHero`                                       | `apps/product-shell/src/pages/HomePage.tsx`                             | No                         |
| `/:slug`, `/:slug/gate`                | `PageShell` + `homeHero`                                       | `apps/product-shell/src/pages/HomePage.tsx`                             | No                         |
| `/members`                             | `PageShell` + `WorkspaceTile`                                  | `apps/product-shell/src/pages/MembersPage.tsx`                          | No                         |
| `/exclusive`, `/:slug/gate/exclusive`  | `PageShell` + `WorkspaceTile` + `usePublishedExclusiveTiles`   | `apps/product-shell/src/pages/ExclusivePage.tsx:109-250`                | No                         |
| `/customer`                            | `PageShell` + `WorkspaceTile`                                  | `apps/product-shell/src/pages/CustomerPage.tsx`                         | No                         |
| `/admin`                               | `PageShell` + `AdminPanel`                                     | `apps/product-shell/src/pages/AdminPage.tsx`                            | No                         |
| `/studio` (edit)                       | `DesktopPremiumStudio` (2560×1440 stage, CSS transform scale)  | `apps/product-shell/src/pages/StudioPage.tsx:84`                        | n/a (authoring surface)    |
| `/studio` (preview)                    | **`DesktopPremiumReceiver`** (canonical premium shell)         | `apps/product-shell/src/pages/StudioPage.tsx:87`                        | n/a (consumes in-memory)   |

**Divergence**: `DesktopPremiumReceiver` is the only component that uses the
canonical 2560×1440 stage, `useStageScale`, and `cover`-fit wallpaper. It is
rendered **exclusively inside `/studio` preview mode**. Every end-user Biz
page (`/`, `/:slug`, `/members`, `/exclusive`, `/customer`, `/admin`) goes
through `PageShell` — which renders the default `appRootWallpaper` plus a
`WorkspaceTile` content frame, never dispatching on `shellId`.

## 2. Premium shellId awareness

| Layer                | File                                                                       | Function                         | Reads `shellId`?                            |
|----------------------|-----------------------------------------------------------------------------|----------------------------------|----------------------------------------------|
| Normalizer           | `apps/product-shell/functions/_lib/runtime-schema.js`                       | `normalizePageSpec` (L206)       | Yes — passes `shellId` through if `desktop-premium-v1` |
| Compiler             | `apps/product-shell/functions/_lib/runtime-compiler.js`                     | `compileRuntimePage` (L58-87)    | Yes — sets `stage: {w:2560,h:1440}` when premium |
| Runtime client       | `apps/product-shell/src/runtime/publishedClient.ts`                         | `fetchPublishedRuntimePage`      | No — returns payload opaquely                |
| Hook                 | `apps/product-shell/src/hooks/usePublishedExclusiveTiles.ts`                | `usePublishedExclusiveTiles`     | No — discards everything except `exclusiveTiles` |
| Page consumer        | `apps/product-shell/src/pages/ExclusivePage.tsx`                             | `ExclusivePage` (L62-250)        | **No** — renders through `PageShell` regardless |

**Result**: the compiler emits premium stage metadata only to have it dropped
on the client. No route in `apps/product-shell/src/app/router.tsx` dispatches
to `DesktopPremiumReceiver`. This is the hard break between the premium
contract and the rendered Biz page.

## 3. Published fetch and compile path (runtime)

```
Biz Page (ExclusivePage)
  └─ usePublishedExclusiveTiles(slug)
       └─ fetchPublishedRuntimePage(slug, "tier-2")
            GET /api/published-page?slug=<slug>&page=tier-2
              │
              ▼
     functions/api/published-page.js :: onRequestGet
       ├─ If env.DEMO_BUCKET and page ∈ {home,members,access,tier-2}
       │     key = json/<slug>/site.json      ← DEMO bucket
       │     payload = bundle.json.pages[DEMO_PAGE_KEY[page]]
       │     compileRuntimePage(page, normalizePublishedPage(page, rawDemoPage), ...)
       │
       ├─ Else try tenants/<slug>/<page>.json  ← TENANTS bucket (published-page)
       │     compileRuntimePage(page, normalizePublishedPage(page, pageFile.json), ...)
       │
       └─ Else try <slug>.json                 ← TENANTS bucket (legacy-bundle)
             mapLegacyBundleToPage(legacy.json, page)
             compileRuntimePage(page, mapped, ...)
```

Separate legacy V1 handler still exists at
`apps/product-shell/functions/api/page.js:65-99` — same TENANTS_BUCKET, no
premium awareness, no demo fallback, no `published-manifest` hookup. Nothing
currently calls `/api/page`, but it remains deployable and reintroduces
legacy behavior if any consumer is pointed at it.

## 4. Asset resolution (wallpaper + tile content)

| Stage                        | File                                                                  | Function                    | Returns                                                 |
|------------------------------|-----------------------------------------------------------------------|-----------------------------|---------------------------------------------------------|
| Wallpaper code validation    | `apps/product-shell/functions/_lib/runtime-schema.js:189`             | `normalizePageSpec`         | `validateAssetCode(wallpaper, ["w","m"])` → bare code (e.g. `"w91"`) |
| Wallpaper forwarding         | `apps/product-shell/functions/_lib/runtime-compiler.js:109`           | `compileRuntimePage`        | `result.wallpaper = "<code>"`                          |
| Wallpaper client consumption | n/a                                                                   | none                        | **No client reads `result.wallpaper`.** ExclusivePage never passes it to `PageShell`. |
| Tile asset code              | `apps/product-shell/src/runtime/exclusiveTileHydration.ts:121`        | `hydrateExclusiveTilesFromPageData` | `resolveAssetCode(tile.assetCode, slug)` |
| Asset resolver               | `apps/product-shell/src/utils/assetCodeResolver.ts:7-11`              | `resolveAssetCode`          | **returns sanitized code string, not a URL**           |

**Faults**: (a) wallpaper code never reaches the renderer; (b) asset resolver
returns e.g. `"c1234"` and that string is then stuffed into an `<img src>`
attribute at `ExclusivePage.tsx:202` — browsers resolve it against the
current page URL and 404.

## 5. Worker/R2 bindings referenced in code

| Binding         | Referenced in                                                  | Used by                                                |
|-----------------|-----------------------------------------------------------------|--------------------------------------------------------|
| `TENANTS_BUCKET` | `functions/api/page.js:66`                                     | Legacy v1 page fetch                                   |
| `TENANTS_BUCKET` | `functions/api/published-page.js:13,47,64`                     | Published v2 page fetch (primary + legacy fallback)    |
| `TENANTS_BUCKET` | `functions/api/published-manifest.js:13,45`                    | Manifest probe (objectExists per page)                 |
| `DEMO_BUCKET`    | `functions/api/published-page.js:26-27`                        | Demo tenant overlay (all pages)                        |
| `DEMO_BUCKET`    | `functions/api/published-manifest.js:23-29`                    | Manifest demo overlay                                  |

There is **no `wrangler.toml`, no `_headers`, no `[env]` block, no typed
binding declaration** anywhere under `apps/product-shell/`. The runtime
relies on Cloudflare Pages Functions auto-binding by env name, configured
entirely on the dashboard side. This is the "poisoned control-plane metadata"
risk the build sheet calls out.

## 6. Redirect files

| File                                               | Declares                                                                     |
|----------------------------------------------------|------------------------------------------------------------------------------|
| `apps/product-shell/public/_redirects`             | `/apps/payme/*`, `/apps/engage/*`, `/apps/referrals/*`, `/apps/vault/*` → iframe index.html; `/*` → `/index.html` |
| `apps/modules/engage/public/_redirects`            | `/*` → `/index.html`                                                         |
| `engagefi-admin-minimal/public/_redirects`         | `/*` → `/index.html` (duplicate of modules/engage)                           |
| `referral-admin-minimal/public/_redirects`         | `/*` → `/index.html`                                                         |

**Redirect loop risk**: product-shell declares routes `/apps/{payme,engage,
referrals,vault}/*` → `/apps/<x>/index.html`. The build target for those
iframes is `apps/product-shell/public/apps/{engage,payme}` via the module
vite.config `outDir` (`apps/modules/engage/vite.config.js:8` and
`apps/modules/payme/vite.config.js:9`). Neither folder currently exists in
the working tree, so unless the deploy pipeline runs
`npm run build:engage && npm run build:payme` every time, those routes
return index.html *of the product-shell SPA* (the fallback `/* -> /index.html`
rule wins), which then loads /apps/payme/... URLs as React-Router paths that
don't exist — redirect loop.

Additionally: `/apps/referrals/*` and `/apps/vault/*` have **no module source
at all** in `apps/modules/`; there is no `apps/modules/referrals` or
`apps/modules/vault`. Those redirect entries are dead.

## 7. Parity verdict (S1 baseline)

| Claim                                                             | Status |
|-------------------------------------------------------------------|--------|
| Premium shell renders fullscreen for end users                    | FAIL — only StudioPage preview path reaches `DesktopPremiumReceiver`. |
| Wallpaper resolves one way                                        | FAIL — `AppShell` uses `/w99.png` static; `PageShell` passes a code, never a URL; `DesktopPremiumShell` uses URL direct from layout. Three paths. |
| Published runtime fetch/compile is one path                       | PARTIAL — `published-page` handles v2 + legacy fallback, but legacy `/api/page.js` handler still exists; `published-manifest` probes per-page. |
| Worker bindings declared in repo                                  | FAIL — no wrangler config in-repo; bindings only on dashboard. |
| Redirect files point at real build outputs                        | FAIL — `/apps/referrals`, `/apps/vault` have no source; engage/payme outputs depend on build order. |
| One wallet-connect implementation                                 | FAIL — see `wallet_surface_inventory.md`. |
