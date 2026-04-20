# Resolver Contract Spec — Biz Pages × Gateway runtime

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S3 / Worker A
authority: declares ONE asset-resolution contract for wallpaper, skin, gif,
sticker tile, and exclusive tile content across the Biz Pages runtime
compiler, the published-page / published-manifest API, and the frontend
runtime consumption layer.

required_references:
- /job_site/build-sheet-active.txt
- /job_site/runtime_parity_matrix.md
- /job_site/cloudflare_runtime_notes.md
- /job_site/wallpaper_renderer_fault_report.md

---

## 0. Why this spec exists

Per `runtime_parity_matrix.md` §4 and `wallpaper_renderer_fault_report.md`
§3-4, the runtime today emits **asset codes** (e.g. `"w91"`, `"c1234"`) into
the published payload, and the client never converts those codes into URLs.
`resolveWallpaper.ts` synthesises a URL from a **slug**, not the wallpaper
code, and the result `/wallpapers/<slug>.png` is a static path that does not
exist for any tenant. Sticker tile codes are stuffed into `<img src>` raw
and 404 against the page URL.

The fault is therefore split across server and client: server emits a code,
client tries to invent a URL from an unrelated string. This spec eliminates
the split by making the **server** the only place that maps a code → URL,
and by replacing the slug-based static path on the client with consumption
of the URL the server already emitted.

---

## 1. Single resolver contract (normative)

### 1.1 Asset code grammar

| Prefix | Asset class      | R2 folder            | File extension |
|--------|------------------|----------------------|----------------|
| `w`    | desktop wallpaper| `wallpaper/`         | `.png`         |
| `m`    | mobile wallpaper | `mobile-wallpaper/`  | `.png`         |
| `s`    | skin             | `skin/`              | `.png`         |
| `g`    | animated gif     | `gif/`               | `.gif`         |
| `c`    | sticker / tile content | `content/`     | `.png`         |
| `x`    | premium / extra content | `extra/`      | `.png`         |

Codes are validated by `apps/product-shell/functions/_lib/runtime-schema.js::validateAssetCode`.
A valid code is `lowercase prefix + one or more digits`. Anything else
returns `""`.

### 1.2 URL resolution (server-side, single source of truth)

The compiler resolves a code to a URL using the following deterministic
rule, in order:

1. If the code is empty → emit no URL (omit field).
2. If `env.ASSET_BASE_URL` is set (the worker-fronted asset host, see
   `cloudflare_runtime_notes.md` §3.1, build-sheet §5.2.1):
   `<ASSET_BASE_URL>/<folder>/<code>.<ext>`
3. Else (Pages-only topology): `/assets/<folder>/<code>.<ext>`

`/assets/*` is the canonical Pages-served prefix that the deploy-side
Worker route will rewrite to the R2 bucket once cutover (S5) lands. Until
then it falls through to the SPA fallback and the operator sees a 404
that names the exact code — matching the failure-loud guarantee of
`runtime-r2.js` (`cloudflare_runtime_notes.md` §2.3).

### 1.3 Where `resolveAssetUrl` is implemented

- Server: `apps/product-shell/functions/_lib/runtime-r2.js` exports
  `resolveAssetUrl(code, env)`. Pure, no I/O. Called by the compiler.
- Client: `apps/product-shell/src/utils/resolveWallpaper.ts` exports
  `resolveWallpaperUrl(code, baseUrl?)`. Same algorithm, used only as a
  fallback when the runtime payload pre-dates the contract (see §4.2).

Both implementations MUST produce identical output for the same input.

---

## 2. Compiler emission (`runtime-compiler.js::compileRuntimePage`)

The compiled `PublishedRuntimePage` payload carries, per asset class, both
the bare code (preserved for back-compat / debugging) and a resolved URL:

| Field              | Source                                                | Type        |
|--------------------|--------------------------------------------------------|-------------|
| `wallpaper`        | `normalized.wallpaper` (asset code)                   | `string?`   |
| `wallpaperUrl`     | `resolveAssetUrl(normalized.wallpaper, env)`          | `string?`   |
| `skin`             | `normalized.skin`                                      | `string?`   |
| `skinUrl`          | `resolveAssetUrl(normalized.skin, env)`               | `string?`   |
| `gif`              | `normalized.gif`                                       | `string?`   |
| `gifUrl`           | `resolveAssetUrl(normalized.gif, env)`                | `string?`   |
| `exclusiveTiles[].imageUrl` | `tile.imageUrl` if present, else `resolveAssetUrl(tile.assetCode, env)` | `string\|null` |
| `assetBaseUrl`     | `env.ASSET_BASE_URL` (mirrored for client fallback)   | `string?`   |

Rules:
- A `*Url` field is emitted **only when** the corresponding code resolves
  to a non-empty URL.
- The `exclusiveTiles[].imageUrl` field, when previously null, is now
  populated from the asset code through `resolveAssetUrl`. An explicit
  `imageUrl` already on the tile (operator-supplied override) wins.
- The contract is the same for premium and non-premium pages. The only
  premium-specific server emission remains `shellId` + `stage` (per
  `runtime_parity_matrix.md` §2 and §4).

The compiler signature changes from
`compileRuntimePage(page, pageSpec, source, { slug })`
to
`compileRuntimePage(page, pageSpec, source, { slug, env })`.
The `env` object is the Pages Functions request env. Only
`env.ASSET_BASE_URL` is read.

---

## 3. Published-page and published-manifest API

### 3.1 `/api/published-page`

`apps/product-shell/functions/api/published-page.js` already runs the
compiler on every served path (demo, published, legacy). The single
change: thread `env` into every `compileRuntimePage` call so URLs resolve
on the same edge that read the bucket. No change to the slug/page param
shape, no change to error semantics, no change to the bucket key shapes
(see `cloudflare_runtime_notes.md` §4.2).

### 3.2 `/api/published-manifest`

`apps/product-shell/functions/api/published-manifest.js` already returns
per-page mode + key. To make the manifest enough to drive a probe without
a second round-trip per page, it now ALSO returns `assetBaseUrl` so
clients know which host the resolver fallback should target. No new
buckets, no new keys, no new bindings.

---

## 4. Frontend runtime consumption

### 4.1 `publishedClient.ts`

`fetchPublishedRuntimePage` and `fetchPublishedRuntimeManifest` continue
to be the **only** entry points to the published runtime. They MUST not
synthesise URLs — the payload already carries them. The published client
is updated to:

- Type-narrow the payload it returns to the `PublishedRuntimePage` shape
  including `wallpaperUrl`, `assetBaseUrl`, etc. (per §2). Existing
  callers that read `wallpaper` (the bare code) keep working.
- Expose a small `resolveAssetFromPayload(payload, code)` helper so any
  caller that needs a URL for an arbitrary code (e.g. exclusive-tile
  hydration for tiles that lack an explicit `imageUrl`) can use the
  payload's `assetBaseUrl` instead of guessing.

### 4.2 `resolveWallpaper.ts`

Replaces the slug-based static path. New surface:

```ts
export function resolveWallpaperUrl(
  code?: string | null,
  baseUrl?: string | null
): string | null;
```

Behavior:
- If `code` is missing or fails the asset-code grammar → `null`.
- Else: `<baseUrl ?? "">/assets/wallpaper/<code>.png` if `baseUrl` is set,
  or `/assets/wallpaper/<code>.png` if not.
- For `m`-prefix mobile wallpapers, the folder is `mobile-wallpaper/`.
- **Removed**: the `/wallpapers/<slug>.png` static fallback. There is no
  slug-keyed wallpaper file in the deploy surface
  (`cloudflare_runtime_notes.md` §2.4 lists only `w91.png`, `w92.png`,
  `w99.png` and they are address-by-code, not by-slug).

The helper is intentionally pure and synchronous so it composes inside
React render without effects.

### 4.3 Hook & receiver

`usePublishedExclusiveTiles` now passes the payload's `assetBaseUrl`
through to `hydrateExclusiveTilesFromPageData` so per-tile hydration
uses the contract URL when the server didn't already emit a tile-level
`imageUrl`. (The hydration path itself is outside the S3 expected-artifact
list — this spec records the dependency for S3-Worker-B fixtures.)

`PageShell` continues to receive `wallpaperUrl` from the page (or now,
directly from the runtime payload). For premium pages, the shell calls
`adaptPremiumRuntimePage(page, page.wallpaperUrl ?? null)` instead of
re-resolving the code locally.

---

## 5. Removal of divergent fallbacks (binding outcome)

The following paths are eliminated by this contract:

| Removed surface                                       | Reason                                       |
|-------------------------------------------------------|----------------------------------------------|
| `resolveWallpaper(slug)` → `/wallpapers/<slug>.png`   | Slug is not an asset key; file does not exist for tenants. Replaced by §4.2. |
| Client invention of an asset URL from a bare code     | Server now emits a URL alongside the code. Client never invents one. |
| `resolveAssetCode(code, slug)` used as `<img src>`    | Sticker tiles now read `imageUrl` from the payload (server-resolved). The string-as-src path is a 404 source. |

Left intact (defensible):
- `AppShell`'s `/w99.png` static default — that wallpaper is the *bundled
  shell* wallpaper, not a tenant asset, so it is not part of this
  contract. It is overridden the moment a runtime payload supplies a
  `wallpaperUrl`.

---

## 6. Worker-fronted preference

Per build-sheet §1.3 and §5.2.1, asset access is expected to flow through
an **existing Cloudflare Worker that fronts bucket access** (operator
belief). This spec accepts that expectation by:

1. Reading `env.ASSET_BASE_URL` at compile-time. When the worker is
   wired, the operator sets this binding to the worker host (e.g.
   `https://assets.<biz-host>` or `https://<worker>.workers.dev`).
2. Mirroring the same value to the client through the manifest payload
   so client-side fallback resolution targets the same host.
3. Defaulting to `/assets/<folder>/<code>.<ext>` when `ASSET_BASE_URL` is
   unset, so the in-repo Pages-only topology still produces a stable
   path that the deploy-side Worker route can rewrite (see S5).

No new R2 binding is introduced; the asset-fetch path is *not* the same
binding as the JSON-fetch path (`TENANTS_BUCKET` / `DEMO_BUCKET`). This
preserves the bucket separation already declared in
`cloudflare_runtime_notes.md` §4.

---

## 7. Acceptance checks (Worker B / S3 fixture targets)

These are the boolean checks the S3 regression matrix
(`/job_site/resolver_regression_matrix.md`) MUST cover:

1. `compileRuntimePage(page, spec_with_wallpaper_w91, src, { slug, env: { ASSET_BASE_URL: "https://example/assets" } })` returns
   `wallpaper === "w91"` AND `wallpaperUrl === "https://example/assets/wallpaper/w91.png"`.
2. Same as (1) with `env: {}` returns `wallpaperUrl === "/assets/wallpaper/w91.png"`.
3. Same as (1) with mobile wallpaper code `m12` returns
   `wallpaperUrl === "https://example/assets/mobile-wallpaper/m12.png"`.
4. Exclusive tile with `assetCode === "c1234"` and no `imageUrl` returns
   `imageUrl === "/assets/content/c1234.png"` after compile.
5. Exclusive tile with explicit `imageUrl: "https://x/y.png"` returns
   that URL unchanged (operator override beats resolution).
6. `/api/published-manifest?slug=<slug>` returns `assetBaseUrl` mirrored
   from `env.ASSET_BASE_URL` (or absent if unset).
7. `resolveWallpaperUrl("w91", "https://example/assets")` returns
   `"https://example/assets/wallpaper/w91.png"`.
8. `resolveWallpaperUrl(null)` returns `null` and does not throw.
9. Confirm `/wallpapers/<slug>.png` is no longer produced anywhere in
   the runtime path (grep target — fail if found).

---

## 8. Out of scope (later stages)

- **CSS coverage rule** (`background-size: contain` vs `cover`,
  fault A/F in `wallpaper_renderer_fault_report.md`). Owned by S2
  renderer patch.
- **Wrangler / binding declarations** for `ASSET_BASE_URL`. Owned by S5
  (`/job_site/cloudflare_binding_map.md`).
- **Worker source code** that backs `ASSET_BASE_URL`. External per
  build-sheet §5.2.1.
- **`apps/product-shell/functions/api/page.js`** legacy V1 path. Marked
  for removal in S4 deploy cleanup; outside this resolver contract.

---

## 9. Frozen contract summary (one paragraph)

For any compiled Biz Pages runtime payload, every asset is identified by
a `<prefix><digits>` code; the **server** maps that code to a URL via
`resolveAssetUrl(code, env)` using `<env.ASSET_BASE_URL ?? "">/assets/
<folder>/<code>.<ext>`; the **payload** carries both the code and the
URL; the **client** consumes the URL verbatim and never invents one;
the slug-based static wallpaper fallback is removed for published
premium pages; the wallpaper, skin, gif, sticker-tile, and
exclusive-tile content surfaces all share this single contract.
