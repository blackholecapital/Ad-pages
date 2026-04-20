# Resolver Regression Matrix — BIZ-PAGES-PROD-DETANGLE-002

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S3
worker: Worker B
companion_fixture: /job_site/known_slug_test_vector.json
required_references:
- /job_site/resolver_contract_spec.md
- /job_site/runtime_parity_matrix.md
- /job_site/cloudflare_runtime_notes.md
- /job_site/build-sheet-active.txt

---

| case_id | input_code | resolver_path | expected_url | execution_layer | notes |
|---------|------------|---------------|--------------|-----------------|-------|
| RC1-WALLPAPER-CODE | `w91` | `resolveAssetUrl("w91", env)` — `apps/product-shell/functions/_lib/runtime-r2.js:49`; emitted into payload by `compileRuntimePage` at `runtime-compiler.js:118` as `wallpaperUrl` | Pages-only (`env.ASSET_BASE_URL` unset): `/assets/wallpaper/w91.png` | server | prefix `w` → folder `wallpaper`; ext `png`; `getAssetBaseUrl(env)` returns `""` → `/assets/` prefix used; client fallback `resolveWallpaperUrl("w91", payload.assetBaseUrl)` at `src/utils/resolveWallpaper.ts:26` produces identical output |
| RC2-CONTENT-TILE-CODE | `c1734` | `resolveAssetUrl("c1734", env)` — `runtime-r2.js:49`; applied per-tile in `compileRuntimePage` at `runtime-compiler.js:137` when `tile.imageUrl` is absent; result stored as `exclusiveTiles[i].imageUrl` | Pages-only: `/assets/content/c1734.png` | server | prefix `c` → folder `content` (not `sticker-tiles`); ext `png`; tiles with an existing `imageUrl` (operator-supplied `contentUrl`) are returned unchanged — resolver is not called |
| RC3-MISSING-ASSET | `w9999` | `resolveAssetUrl("w9999", env)` — `runtime-r2.js:49`; code passes `validateAssetCode` grammar (valid prefix + digits); URL is composed; resolver performs no R2 existence check | Pages-only: `/assets/wallpaper/w9999.png` (URL produced; R2 object absent → Pages 404 or SPA mask); worker-fronted: `${ASSET_BASE_URL}/wallpaper/w9999.png` → Worker `TENANTS_BUCKET.get("wallpaper/w9999.png")` returns `null` → Worker must emit `404 { ok:false, error:"asset not found", details:{ key:"wallpaper/w9999.png" } }` | server | resolver is pure and always returns a URL for a valid-format code; missing object is a network-layer 404, not a resolver null; an empty or non-asset-code input returns `""` (server) or `null` (client) and must never reach a `<img src>` |
| RC4-WORKER-FRONTED-FETCH | `w91` | `resolveAssetUrl("w91", { ASSET_BASE_URL:"https://assets.example" })` — `runtime-r2.js:60-66`; `getAssetBaseUrl(env)` strips trailing slash; URL composed as `${base}/${folder}/${code}.${ext}`; `assetBaseUrl` mirrored into payload by `compileRuntimePage` at `runtime-compiler.js:73,81` and by manifest handler | `https://assets.example/wallpaper/w91.png`; Worker receives `GET /wallpaper/w91.png`; performs `TENANTS_BUCKET.get("wallpaper/w91.png")`; returns `200 image/png` on hit or `404 application/json` on miss | server + network | `ASSET_BASE_URL` is the worker host root — no `/r2/` prefix; R2 key is `<folder>/<code>.<ext>` only; client uses `resolveWallpaperUrl(code, payload.assetBaseUrl)` at `resolveWallpaper.ts:26` as fallback for codes the server did not pre-resolve; binding name `TENANTS_BUCKET` must match in worker dashboard metadata (cloudflare_runtime_notes.md §6 U7) |
