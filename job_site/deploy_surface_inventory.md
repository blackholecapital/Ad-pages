# Deploy Surface Inventory

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S1 / Worker A

Enumerates everything in-repo that influences Cloudflare Pages / Workers /
R2 runtime behavior, and flags the gaps where deploy behavior is dictated
by out-of-repo (dashboard) state.

## 1. Pages Functions (in-repo)

| Route                          | File                                                                     | Bindings read                       |
|--------------------------------|--------------------------------------------------------------------------|-------------------------------------|
| `GET /api/page`                | `apps/product-shell/functions/api/page.js`                               | `TENANTS_BUCKET` (R2)               |
| `GET /api/published-page`      | `apps/product-shell/functions/api/published-page.js`                     | `TENANTS_BUCKET`, `DEMO_BUCKET`     |
| `GET /api/published-manifest`  | `apps/product-shell/functions/api/published-manifest.js`                 | `TENANTS_BUCKET`, `DEMO_BUCKET`     |
| `GET /api/microfrontend-bootstrap` | `apps/product-shell/functions/api/microfrontend-bootstrap.js`        | none (session token mint)           |
| `POST /api/microfrontend-trust-log` | `apps/product-shell/functions/api/microfrontend-trust-log.js`       | none (log sink)                     |

Shared helpers:
- `apps/product-shell/functions/_lib/runtime-r2.js` — R2 `get`/`objectExists` helpers.
- `apps/product-shell/functions/_lib/runtime-schema.js` — `sanitize`,
  `assertRuntimeParams`, `validateAssetCode`, `normalizePageSpec`.
- `apps/product-shell/functions/_lib/runtime-compiler.js` — `compileRuntimePage`,
  `mapLegacyBundleToPage`, `normalizePublishedPage`.

## 2. Cloudflare-shaped config files (in-repo)

| File                              | Present? | Notes                                                                |
|-----------------------------------|----------|----------------------------------------------------------------------|
| `wrangler.toml` (anywhere)        | **No**   | Zero grep hits across `apps/`, `worker-wb/`, `packages/`, repo root. |
| `wrangler.jsonc`                  | **No**   | Not present.                                                         |
| `_headers`                        | **No**   | Not present.                                                         |
| `apps/product-shell/public/_redirects` | Yes | iframe + SPA catch-all — see §4.                                     |
| `apps/modules/engage/public/_redirects` | Yes | Single `/* /index.html 200`.                                         |
| `engagefi-admin-minimal/public/_redirects` | Yes | Duplicate of modules/engage.                                     |
| `referral-admin-minimal/public/_redirects` | Yes | Single `/* /index.html 200`.                                     |

**Control-plane gap**: every CF binding (`TENANTS_BUCKET`, `DEMO_BUCKET`) is
wired on the Pages dashboard only. If that metadata is poisoned (as the
build sheet asserts), there is no repo-side truth to rebuild from.

## 3. Vite build topology

| Package                       | Build cmd                              | Output                                                   |
|-------------------------------|-----------------------------------------|----------------------------------------------------------|
| `apps/product-shell`          | `vite build` (`build:shell`)           | `apps/product-shell/dist/` (standard)                    |
| `apps/modules/engage`         | `vite build` with `base=/apps/engage/` | `apps/product-shell/public/apps/engage/` (vite config:8) |
| `apps/modules/payme`          | `vite build` with `base=/apps/payme/`  | `apps/product-shell/public/apps/payme/` (vite config:9)  |
| `payme-admin-minimal`         | `vite build`                            | default (not wired into product-shell)                   |
| `engagefi-admin-minimal`      | `vite build`                            | default (not wired into product-shell)                   |
| `referral-admin-minimal`      | `vite build`                            | default (not wired into product-shell)                   |

`apps/product-shell/package.json` declares:
```
"build": "npm run build:engage && npm run build:payme && npm run build:shell"
```
Build order is engage → payme → product-shell. This *only* works if both
modules succeed before product-shell's public asset copy stage. If engage or
payme fails, product-shell still builds, but `/apps/engage/*` and
`/apps/payme/*` iframe mounts resolve to absent directories → fallback
`/*` redirect → SPA index.html → React router 404 (infinite redirect risk).

`apps/product-shell/public/apps/` does **not exist in the working tree** —
it is created only at build time.

## 4. Redirect surface analysis

`apps/product-shell/public/_redirects`:
```
/apps/payme/*    /apps/payme/index.html    200
/apps/engage/*   /apps/engage/index.html   200
/apps/referrals/* /apps/referrals/index.html 200
/apps/vault/*    /apps/vault/index.html    200

/*    /index.html   200
```

| Rule                         | Build output target                                  | Source module             | Status              |
|------------------------------|------------------------------------------------------|---------------------------|---------------------|
| `/apps/payme/*`              | `public/apps/payme/index.html`                       | `apps/modules/payme`      | OK if build ran     |
| `/apps/engage/*`             | `public/apps/engage/index.html`                      | `apps/modules/engage`     | OK if build ran     |
| `/apps/referrals/*`          | `public/apps/referrals/index.html`                   | **missing**               | **Dead** — no `apps/modules/referrals` |
| `/apps/vault/*`              | `public/apps/vault/index.html`                       | **missing**               | **Dead** — no `apps/modules/vault`     |
| `/*`                         | `/index.html`                                        | product-shell SPA         | OK                  |

**Finding**: `/apps/referrals/*` and `/apps/vault/*` redirects are
unconditionally broken. The fallback `/* /index.html 200` then serves the
product-shell SPA, which has no `/apps/referrals/...` route — browser shows
blank or stale SPA state. Remove these two lines or produce the modules.

## 5. Static asset shipping (wallpapers)

`apps/product-shell/public/`:
- `biz-pages.png` (702 KB)
- `w91.png` (935 KB)
- `w92.png` (1303 KB)
- `w99.png` (1279 KB)
- `_redirects`

Consumed by:
- `apps/product-shell/src/app/AppShell.tsx:8` — hard-codes `/w99.png`.
- No other hard reference; all other wallpaper consumers expect a URL from
  runtime payload. See `wallpaper_renderer_fault_report.md`.

## 6. Worker-WB and core-runtime proof bundles

- `worker-wb/p4.7/retention-decision.md` — proof-run retention decision
  document (zero-edit marker).
- `apps/core-runtime/src/routes/*.route.ts` + `apps/core-runtime/src/touchpoints/*.touchpoint.ts`
  — proof / install / disable / remove / update handlers. These are **not
  Cloudflare Workers**; they are TypeScript modules consumed by
  `apps/local-host` and `apps/operator-shell` for the proof chain. No CF
  binding surface here.

## 7. Summary of repo→deploy gaps

1. **No wrangler config anywhere.** All Pages/Worker/R2 bindings live only
   on the Cloudflare dashboard. Replacement or cutover requires manual
   recreation.
2. **Two deprecated iframe redirects** (`/apps/referrals`, `/apps/vault`)
   with no corresponding source modules.
3. **Two parallel page APIs** (`/api/page` v1 and `/api/published-page` v2)
   both mounted and both binding TENANTS_BUCKET.
4. **Asset wallpaper divergence**: static `public/w99.png`, R2-coded
   `result.wallpaper` (never consumed), and receiver-only URL wallpaper —
   three separate wallpaper pathways.
5. **No build pipeline proof**: `apps/product-shell/public/apps/*` is
   generated, not committed, so a dirty deploy (build:shell only) publishes
   a product-shell where iframe redirects dangle.
