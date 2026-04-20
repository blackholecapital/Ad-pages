# Cloudflare Runtime Notes — BIZ-PAGES-PROD-DETANGLE-002

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S1
worker: Worker B
authority: non-mutating baseline. Separates repo-declared Cloudflare state from
dashboard / project-metadata Cloudflare state. No deploy target is modified by
this pass. Every repo-declared value is cited to a file path. Every assumed
dashboard value is labelled `ASSUMED` with the basis named.

required_references:
- /job_site/build-sheet-active.txt (resolved in this mirror as `/job_site/build-sheet-BIZ-PAGES-PROD` — see §0.1)
- /job_site/runtime_parity_matrix.md (Worker A artifact — not yet present in mirror at time of this pass; see §0.2)
- /job_site/wallpaper_renderer_fault_report.md (Worker A artifact — not yet present in mirror at time of this pass; see §0.2)

---

## 0. Basis

### 0.1 Build-sheet reference

The build-sheet tag `build-sheet-active.txt` resolves in this repo mirror to
the file physically named `/job_site/build-sheet-BIZ-PAGES-PROD` (per the
frozen repo state observed for job `BIZ-PAGES-PROD-DETANGLE-002`). All
build-sheet citations below point to section numbers in that file.

### 0.2 Cross-worker artifact state

At this stage S1 pass, Worker A is expected to produce
`/job_site/runtime_parity_matrix.md` and
`/job_site/wallpaper_renderer_fault_report.md` in parallel. Those documents
are **not yet present** in the mirror. This note therefore restricts itself
to Cloudflare control-plane topology and does not cite renderer-fault
conclusions. Where renderer behaviour is mentioned, the citation is to the
in-repo code paths that produce the behaviour, not to the Worker A report.

### 0.3 Scope (negative)

This note does NOT:
- choose between Pages and Worker-routed delivery (that is S5 output)
- declare binding renames
- write a `wrangler.toml` (Worker A S5 artifact)
- alter `_redirects` or any deploy surface
- assert what the live Cloudflare dashboard currently shows — only what the
  repo assumes the dashboard is configured with

---

## 1. Repo-Declared vs Dashboard-Held State — Separation Table

The core directive: the repo and the Cloudflare dashboard are **separate
sources of truth** today. Several required settings live only in the
dashboard / Pages project metadata, and the operator belief is that the
current failure lives in that dashboard-held state (Worker + Pages
settings), not in bucket object data.

| Surface | Repo-declared? | Dashboard-held? | Location (repo) |
|---|---|---|---|
| Pages project name | NO | YES (ASSUMED) | — |
| Pages project build root | IMPLICIT (`apps/product-shell`) | YES (explicit) | `/job_site/deploy_root_plan.md` §1; `/job_site/pages_deployment_spec.md` §1 |
| Install command | IMPLICIT (`npm install`) | YES (explicit) | `/apps/product-shell/package.json` |
| Build command | DECLARED (`npm run build`) | YES (explicit) | `/apps/product-shell/package.json:6` |
| Build output dir | CONVENTION (`dist`) | YES (explicit) | `/apps/product-shell/vite.config.ts` (Vite default) |
| Functions directory | IMPLICIT (`functions/`) | DEFAULT (auto-discovered) | `/apps/product-shell/functions/` |
| SPA + module fallback | DECLARED | not overridden | `/apps/product-shell/public/_redirects` |
| Custom domain / route | NO | YES (ASSUMED) | — |
| `TENANTS_BUCKET` R2 binding name | REFERENCED in code | DECLARED in dashboard | `/apps/product-shell/functions/api/published-page.js:13`; `/apps/product-shell/functions/api/published-manifest.js:13`; `/apps/product-shell/functions/api/page.js:66` |
| `DEMO_BUCKET` R2 binding name | REFERENCED in code | DECLARED in dashboard | `/apps/product-shell/functions/api/published-page.js:26,27`; `/apps/product-shell/functions/api/published-manifest.js:23,25` |
| R2 bucket actual names (backing the bindings) | NO | YES (ASSUMED) | — |
| Worker (non-Pages) fronting bucket access | NO repo artifact | YES (ASSUMED) | — (see §3) |
| Env variables / secrets | NO | YES (ASSUMED) | — |
| `wrangler.toml` | **ABSENT** | — | not present in repo (`find -name wrangler.toml` → no results) |
| Node version pin | NO | YES (ASSUMED) | — |
| Access / WAF / Zero-Trust rule | NO | YES (OBSERVED) | `/job_site/pages_readiness_matrix.md` §7 — gateway.xyz-labs.xyz returns 403 server-side |
| Rollback / preview branch wiring | NO | YES (ASSUMED) | — |

**Finding (baseline):** the deploy target of `apps/product-shell` is steered
almost entirely by Cloudflare Pages project metadata. The repo does not
contain a `wrangler.toml`, does not declare the R2 binding → bucket mapping,
does not declare routes, and does not declare the Pages project name. If the
Pages project metadata is corrupted or drifted, the repo cannot by itself
re-create the deploy — this matches the operator belief recorded in the
build-sheet (`/job_site/build-sheet-BIZ-PAGES-PROD` §1.3: *"the Cloudflare
Pages project state is deeper than bucket recreation and must be treated as
poisoned control-plane metadata until proven otherwise"*).

---

## 2. Cloudflare Pages Project — Current Assumptions

### 2.1 Pages project identity

| Field | Assumption | Basis |
|---|---|---|
| project_name | `ASSUMED` — exact name held only in Cloudflare dashboard | no repo declaration |
| account / team | `ASSUMED` — operator's Cloudflare account | external reference §5.2 of build-sheet |
| production branch | `ASSUMED` — `main` | Cloudflare default; no repo override |
| preview branches | `ASSUMED` — all non-production | Cloudflare default |

### 2.2 Pages project build settings (as assumed by the repo)

These values would have to match the Cloudflare dashboard for the repo to
build successfully via Pages. They are not declared in the repo; they are
**inferred** from repo contents.

| Setting | Assumed value | Source of inference |
|---|---|---|
| root_directory (monorepo root) | `apps/product-shell` | `/job_site/deploy_root_plan.md` §1; `/job_site/pages_deployment_spec.md` §1 |
| install_command | `npm install` | Pages default + `/apps/product-shell/package.json` |
| build_command | `npm run build` | `/apps/product-shell/package.json:6` (`"build": "npm run build:engage && npm run build:payme && npm run build:shell"`) |
| build_output | `dist` | Vite default; no `build.outDir` override in `/apps/product-shell/vite.config.ts` |
| framework preset | Vite | `/apps/product-shell/vite.config.ts` |
| node version | `ASSUMED` (18.x or 20.x) | no repo pin; `/job_site/deploy_root_plan.md` §4 notes compatibility |
| environment variables at build time | `ASSUMED` none | no `.env` committed; nothing imports `import.meta.env.VITE_*` at build time that would require a variable |

### 2.3 Pages Functions (in-repo)

Pages Functions are discovered by Cloudflare Pages from
`/apps/product-shell/functions/`. File-based routing applies the following
HTTP endpoints automatically (no `_routes.json` present, no override
required):

| Function file | Routed path | Bindings consumed |
|---|---|---|
| `functions/api/published-page.js` | `GET /api/published-page` | `env.TENANTS_BUCKET` (required), `env.DEMO_BUCKET` (optional) |
| `functions/api/published-manifest.js` | `GET /api/published-manifest` | `env.TENANTS_BUCKET` (required), `env.DEMO_BUCKET` (optional) |
| `functions/api/page.js` | `GET /api/page` | `env.TENANTS_BUCKET` (required) |
| `functions/api/microfrontend-bootstrap.js` | `GET /api/microfrontend-bootstrap` | none (signs a bootstrap payload from request URL only) |
| `functions/api/microfrontend-trust-log.js` | `GET /api/microfrontend-trust-log` | `ASSUMED` none (not inspected in full this pass) |
| `functions/_lib/*` | not routed | `_`-prefixed files are excluded by Pages from URL routing; imported by handlers only |

**Observation:** every runtime handler guards on binding presence with
`if (!env?.TENANTS_BUCKET) return bad("Missing TENANTS_BUCKET binding", 500)`
(e.g. `/apps/product-shell/functions/api/published-page.js:13`). This means
a missing or misnamed binding in Pages metadata will surface as a 500 with
an identifiable error body, not as silent fallback.

### 2.4 Pages static surfaces

| Path | Role |
|---|---|
| `/apps/product-shell/public/_redirects` | SPA fallback + module iframe fallthrough for `/apps/payme/*`, `/apps/engage/*`, `/apps/referrals/*`, `/apps/vault/*` |
| `/apps/product-shell/public/biz-pages.png` | Brand asset |
| `/apps/product-shell/public/w91.png`, `w92.png`, `w99.png` | Static default wallpapers consumed by `AppShell.tsx` (`/w99.png` at `/apps/product-shell/src/app/AppShell.tsx:8`) and by the static resolver path `/wallpapers/{assetCode}.png` at `/apps/product-shell/src/utils/resolveWallpaper.ts:4` |

---

## 3. Worker Fronting Pattern — Current Assumption

### 3.1 What the build-sheet asserts

`/job_site/build-sheet-BIZ-PAGES-PROD` §5.2.1 lists, as an **external
reference**, "existing Cloudflare Worker that fronts bucket access", and
§5.2.2 adds "existing R2 bucket binding names and worker environment
settings". These are named as real, in-production artifacts that live
**outside** the repo. The build-sheet §1.3 further asserts the operator
belief that the failure lives in **worker/settings** (i.e. Worker code
deployed out-of-band plus its dashboard bindings) rather than in bucket
data.

### 3.2 What the repo contains

- No `wrangler.toml` anywhere in the tree (confirmed: `**/wrangler.toml`
  returns no matches).
- No standalone Worker source directory (`worker-wb/` in the repo root
  contains pass-by-pass worker **reports**, not Worker source code — each
  of `worker-wb/p*/` is a Markdown report directory, not a deploy target).
- Pages Functions in `/apps/product-shell/functions/api/` are
  Pages-hosted, not the "existing Cloudflare Worker" referenced by the
  build-sheet.

### 3.3 Candidate topologies (non-committal)

Because the Worker source is external, the repo cannot distinguish between
these topologies without operator confirmation. Recording the options so
Stage S3/S5 can choose:

| Topology | Description | Evidence the repo can give |
|---|---|---|
| T1 — Pages Functions only | All R2 access happens through `/apps/product-shell/functions/api/*` via `env.TENANTS_BUCKET` / `env.DEMO_BUCKET` | Matches the handler code exactly. Under this topology the "existing Worker" in §5.2.1 would be redundant. |
| T2 — Worker-fronted fetch | Pages Functions proxy or call out to a separate Worker (e.g. `https://<worker>.workers.dev/<key>` or a custom route) that reads R2 and returns the bytes | Not observed in handler code — there is no outbound `fetch(...)` to any Worker origin in `/apps/product-shell/functions/api/*` |
| T3 — Worker-only | A Worker handles `/api/*` entirely; Pages serves only static assets | Conflicts with the Pages Functions present in repo; these would be dead code under T3 |
| T4 — Hybrid | Worker handles asset delivery (wallpaper/sticker tiles via R2 custom domain), Pages Functions handle JSON/compile paths | Plausible given the build-sheet's distinction between "bucket data" (assumed OK) and "worker/settings" (assumed broken) |

**Baseline assumption recorded for downstream stages:** T4 (hybrid) is the
most consistent with:
- build-sheet §1.3 (operator belief that Worker + settings are broken),
- §5.2.1 naming an external Worker,
- `/apps/product-shell/src/utils/resolveWallpaper.ts:4` resolving wallpapers
  to `/wallpapers/{assetCode}.png` (a path that today resolves against
  the Pages static root via `/apps/product-shell/public/` — i.e. there is
  no wallpaper from R2 via the Worker in the current code path).

This is an **assumption**, not a conclusion. S3 resolver unification and S5
cutover planning will decide which topology becomes the declared one.

### 3.4 Redirect-surface risk

`/apps/product-shell/public/_redirects` rewrites four `/apps/<module>/*`
trees to their respective `index.html` and then has a catch-all
`/* /index.html 200`. This matches Cloudflare Pages' SPA default. Pages
Functions routing precedes `_redirects`, so `/api/*` is not caught by the
catch-all today (see `/job_site/pages_deployment_spec.md` §4.3). If the
cutover moves `/api/*` to a Worker route, the ordering must be re-verified
because the catch-all would otherwise shadow the Worker route.

---

## 4. R2 Bindings — Current Assumptions

### 4.1 Binding names (repo-referenced)

Both bindings are consumed as `env.<NAME>` in Pages Functions. The binding
NAME must match exactly in the Pages project metadata.

| Binding name | Required? | Referenced at |
|---|---|---|
| `TENANTS_BUCKET` | required | `/apps/product-shell/functions/api/published-page.js:13, :47, :64`; `/apps/product-shell/functions/api/published-manifest.js:13, :45`; `/apps/product-shell/functions/api/page.js:66, :76, :86` |
| `DEMO_BUCKET` | optional | `/apps/product-shell/functions/api/published-page.js:26, :27`; `/apps/product-shell/functions/api/published-manifest.js:23, :25` |

### 4.2 Bucket contents — expected key shapes

These are the R2 object keys the handlers try to read. They imply a
directory layout inside whichever buckets back the two bindings.

| Key pattern | Read by | Purpose |
|---|---|---|
| `json/<slug>/site.json` | `published-page.js` (via `DEMO_BUCKET`), `published-manifest.js` (via `DEMO_BUCKET`) | Demo/studio bundle with `pages.{gate,members,access,tier-2}` subtree |
| `tenants/<slug>/<page>.json` | `published-page.js`, `published-manifest.js`, `page.js` (via `TENANTS_BUCKET`) | Per-page published JSON (page ∈ `{home, members, access, tier-2}`) |
| `<slug>.json` | `published-page.js`, `page.js` (via `TENANTS_BUCKET`) | Legacy single-bundle fallback |

### 4.3 Bucket names (actual R2 bucket names)

`ASSUMED`. Not declared anywhere in the repo. Must be read from Cloudflare
dashboard. The operator is expected to confirm during S5 binding map.
Typical naming conventions observed in prior Biz deploys (non-authoritative,
for operator recognition only):

- `biz-pages-tenants` / `bizpages-tenants` / `tenants` for the bucket bound
  to `TENANTS_BUCKET`
- `biz-pages-demo` / `bizpages-demo` / `studio-bundles` / `demo` for the
  bucket bound to `DEMO_BUCKET`

**Do not treat the list above as the declared bucket names.** It is a
candidate list only and must be replaced by the actual dashboard value in
the S5 binding map (`/job_site/cloudflare_binding_map.md`).

### 4.4 Why the repo believes the bucket DATA is fine

- The bucket-reader helpers (`/apps/product-shell/functions/_lib/runtime-r2.js`)
  are minimal: `bucket.get(key) → text → JSON.parse`. They contain no write
  paths and no format migrations, so a bucket data problem would surface as
  "Invalid page JSON in bucket" (500) or "Tenant page not found" (404),
  not as the rendering fault the operator describes.
- The build-sheet §1.3 records the operator belief that bucket recreation
  would not fix the failure.

Conclusion for this baseline: **fault localization should not start at
bucket data**. It should start at (a) Pages Functions binding presence, and
(b) the external Worker fronting path named in build-sheet §5.2.1.

---

## 5. Operator-Belief Ledger (non-negotiable for S1)

These are recorded verbatim from build-sheet and must not be overridden by
downstream stages without explicit operator dispatch.

- B1. *The Cloudflare Pages project state is deeper than bucket recreation
  and must be treated as poisoned control-plane metadata until proven
  otherwise.* — `/job_site/build-sheet-BIZ-PAGES-PROD` §1.3.
- B2. *Biz Pages is not rendering the premium shell fullscreen at the
  required desktop target and is drifting from the Gateway/Studio runtime
  contract.* — §1.3.
- B3. *Runtime media/wallpaper resolution is mismatched.* — §1.3.
- B4. *The failure lives in Worker + settings rather than bucket data.* —
  §1.3 + §5.2.1 external references.
- B5. *Cloudflare deploy no longer depends on hidden/broken Pages
  metadata.* — §1.4 requested outcome.

Any action in S2–S5 that contradicts B1–B5 is a patch condition.

---

## 6. Known-Unknown Inventory (must be resolved before S5 cutover)

Each item below is something the repo cannot know today. It has to be
filled in by operator inspection of the Cloudflare dashboard, and recorded
in `/job_site/cloudflare_binding_map.md` (S5 Worker A artifact) before a
cutover can be executed.

| U# | Unknown | Where it will be recorded |
|---|---|---|
| U1 | Actual Pages project name | `cloudflare_binding_map.md` §1 |
| U2 | Custom domain(s) attached to the Pages project | `cloudflare_binding_map.md` §1 |
| U3 | Production branch name (if not `main`) | `cloudflare_binding_map.md` §1 |
| U4 | Node version currently configured for Pages build | `cloudflare_binding_map.md` §1 |
| U5 | Exact R2 bucket names bound as `TENANTS_BUCKET` and `DEMO_BUCKET` | `cloudflare_binding_map.md` §2 |
| U6 | Whether a standalone Worker currently serves any `/api/*` or `/wallpapers/*` path | `cloudflare_binding_map.md` §3 |
| U7 | Worker script name, route pattern, and its own R2 bindings (if U6 = yes) | `cloudflare_binding_map.md` §3 |
| U8 | Any Access / WAF / Zero-Trust rule currently applied to the hostname | `cloudflare_binding_map.md` §4 |
| U9 | Presence of a separate R2 custom domain used for direct asset fetch | `cloudflare_binding_map.md` §3 |
| U10 | Any env var or secret referenced by the external Worker | `cloudflare_binding_map.md` §3 |

---

## 7. Baseline Verdict (Worker B, S1)

- Deploy config is **absent from the repo** for project-level Cloudflare
  state (no `wrangler.toml`, no binding declarations, no route
  declarations). The repo only implies what Pages must be configured with.
- The **Pages Functions contract** is intact in-repo (bindings consumed,
  key shapes declared, failure paths explicit).
- The **Worker + R2** responsibility line is **not** represented in the
  repo today; it is dashboard-held and matches the operator's fault
  hypothesis (B4).
- Renderer behaviour is not in scope for this note. Wallpaper resolution in
  the code today is **static** (`/wallpapers/{assetCode}.png` via
  `resolveWallpaper.ts`; `/w99.png` via `AppShell.tsx`) with an R2-backed
  `wallpaperUrl` override hook in `PageShell.tsx:6`. Whether R2 wallpaper
  is actually wired through the Worker or through Pages Functions is an
  S3/S5 decision, not an S1 claim.

**This baseline is frozen for downstream stages.** No deploy target is
modified by this pass.
