# Cloudflare Binding Map — BIZ-PAGES-PROD-DETANGLE-002

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S5
worker: Worker A
authority: declarative. Names every Cloudflare object the deploy depends on,
the binding name the runtime reads, the file/line that reads it, the source
of truth (repo file vs operator dashboard input), and whether the value is
required for cutover. Resolves the U1–U10 known-unknowns enumerated in
`/job_site/cloudflare_runtime_notes.md` §6 into rows the operator can fill
without re-reading the runtime code.

required_references:
- /job_site/cloudflare_runtime_notes.md      (Worker B, S1 — baseline)
- /job_site/deploy_cutover_spec.md           (Worker B, S1 — cutover shape)
- /job_site/deploy_cleanup_manifest.md       (Worker B, S4 — redirect/loop fix)
- /job_site/build-sheet-active.txt           (resolved as `/job_site/build-sheet-BIZ-PAGES-PROD`)
- /job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/product-shell/wrangler.toml
- /job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/product-shell/functions/api/published-page.js
- /job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/product-shell/functions/api/published-manifest.js
- /job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/product-shell/functions/api/page.js
- /job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/product-shell/functions/_lib/runtime-r2.js

---

## 0. How to read this file

- **binding name** is the literal identifier the runtime reads via
  `env.<NAME>`. Renaming a binding name requires a matching code edit at
  every cited path.
- **declared in** lists the repo artifact that pins the binding. If the
  binding is not declared in repo today, the value is `dashboard-only` and
  the cutover requires the operator to record it here.
- **operator value** is left blank until the operator fills it in. The
  cutover gate (`/job_site/deploy_cutover_spec.md` §5) does not pass until
  every required row has an operator value.
- **PLACEHOLDER** in any value column = must be replaced before deploy.

---

## 1. Pages project identity (resolves U1–U4)

| Field                | Required? | Source of truth                  | Repo declaration                                              | Operator value                       |
|----------------------|-----------|----------------------------------|---------------------------------------------------------------|--------------------------------------|
| project_name         | required  | `wrangler.toml` `name`           | `apps/product-shell/wrangler.toml` → `name = "biz-pages"`     | `biz-pages` (rename here if the Cloudflare project uses a different slug; must match the actual Pages project name) |
| account_id           | required  | Cloudflare dashboard             | dashboard-only                                                | OPERATOR FILL                        |
| production_branch    | required  | Pages project setting            | dashboard-only (default `main`)                               | OPERATOR FILL (default: `main`)      |
| preview_branches     | optional  | Pages project setting            | dashboard-only (default: all non-production)                  | OPERATOR FILL                        |
| build_root           | required  | Pages project setting            | implied by repo layout: `apps/product-shell`                  | `apps/product-shell`                 |
| install_command      | required  | Pages project setting            | implied: `npm install`                                        | `npm install`                        |
| build_command        | required  | Pages project setting            | `apps/product-shell/package.json:6` → `npm run build`         | `npm run build`                      |
| build_output         | required  | Pages project setting + wrangler | `apps/product-shell/wrangler.toml` → `pages_build_output_dir = "./dist"` | `dist`                    |
| node_version         | required  | Pages project setting            | not pinned in repo                                            | OPERATOR FILL (recommend `20`)       |
| compatibility_date   | required  | `wrangler.toml`                  | `apps/product-shell/wrangler.toml` → `2025-01-01`             | `2025-01-01`                         |
| compatibility_flags  | required  | `wrangler.toml`                  | `apps/product-shell/wrangler.toml` → `["nodejs_compat"]`      | `["nodejs_compat"]`                  |
| custom_domain(s)     | required  | Cloudflare dashboard / DNS       | dashboard-only                                                | OPERATOR FILL (e.g. `pages.xyz-labs.xyz`) |
| access / WAF rules   | optional  | Cloudflare dashboard             | dashboard-only — see `/job_site/cloudflare_runtime_notes.md` §1 row "Access / WAF / Zero-Trust" | OPERATOR FILL or `none` |

---

## 2. R2 bindings consumed by Pages Functions (resolves U5)

These are the bindings the Pages Functions in
`apps/product-shell/functions/api/*` read at runtime. Binding NAMES are
pinned to the runtime; only `bucket_name` (the actual R2 bucket) is
operator input.

| Binding name      | Required at runtime? | Declared in                                           | Bucket-name placeholder in wrangler.toml | Operator bucket name   |
|-------------------|----------------------|-------------------------------------------------------|------------------------------------------|------------------------|
| `TENANTS_BUCKET`  | required             | `apps/product-shell/wrangler.toml` `[[r2_buckets]]`   | `REPLACE_WITH_TENANTS_BUCKET_NAME`       | OPERATOR FILL          |
| `DEMO_BUCKET`     | optional (handlers guard with `env?.DEMO_BUCKET`) | `apps/product-shell/wrangler.toml` `[[r2_buckets]]` | `REPLACE_WITH_DEMO_BUCKET_NAME` | OPERATOR FILL or `OMIT` |

Operator must either:
- **fill in the actual R2 bucket name** in the `Operator bucket name`
  column AND replace the placeholder in `wrangler.toml`, or
- **mark `OMIT`** for `DEMO_BUCKET` (DEMO_BUCKET only) and delete the
  `[[r2_buckets]]` block for `DEMO_BUCKET` from `wrangler.toml`. The
  handlers will then take their no-demo-bundle branch (verified in
  `published-page.js:26` and `published-manifest.js:23`).

Candidate names recorded in `/job_site/cloudflare_runtime_notes.md` §4.3
(NOT authoritative — operator must confirm against dashboard):
- `TENANTS_BUCKET` ⇐ `biz-pages-tenants` / `bizpages-tenants` / `tenants`
- `DEMO_BUCKET`    ⇐ `biz-pages-demo` / `bizpages-demo` / `studio-bundles`

### 2.1 R2 key shapes the bindings must serve

These are the exact key shapes the Pages Functions read. They are not
operator inputs — they exist here so the operator can sanity-check that
the chosen bucket actually contains objects on these paths.

| Binding         | Key pattern                              | Read by                                                                                  |
|-----------------|------------------------------------------|------------------------------------------------------------------------------------------|
| `TENANTS_BUCKET` | `tenants/<slug>/<page>.json`            | `published-page.js:47`, `published-manifest.js:45`, `page.js:76`                          |
| `TENANTS_BUCKET` | `<slug>.json` (legacy single-bundle)    | `published-page.js:64`, `page.js:86`                                                      |
| `DEMO_BUCKET`    | `json/<slug>/site.json`                 | `published-page.js:27`, `published-manifest.js:25`                                        |

---

## 3. External Worker fronting bucket access (resolves U6, U7, U9, U10)

The build-sheet (`/job_site/build-sheet-BIZ-PAGES-PROD` §5.2.1) names an
existing Cloudflare Worker that fronts bucket access. The repo does not
contain its source today (no `worker-wb/p*` directory contains a
`wrangler.toml` — confirmed). This section is the binding map for that
Worker if the operator selects Target B at cutover, and the trace map for
its asset-host integration if the operator selects Target A.

| Field                     | Required? | Declared in                                                                                              | Operator value                                                                            |
|---------------------------|-----------|----------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| Worker exists today?      | required  | dashboard-only                                                                                           | OPERATOR FILL: `yes` / `no`                                                               |
| Worker script name        | required if `yes` | dashboard-only                                                                                  | OPERATOR FILL                                                                              |
| Worker route(s)           | required if `yes` | dashboard-only                                                                                  | OPERATOR FILL (e.g. `assets.xyz-labs.xyz/*`, or `<zone>/wallpapers/*`, `<zone>/stickers/*`) |
| Worker R2 bindings        | required if `yes` | dashboard-only (or future `apps/product-shell/worker/wrangler.toml` if Target B chosen)         | OPERATOR FILL (binding NAME → R2 bucket NAME pairs the Worker reads)                       |
| R2 custom domain          | optional  | dashboard-only                                                                                           | OPERATOR FILL or `none`                                                                    |
| Worker env vars / secrets | optional  | dashboard-only (existence recorded here per `/job_site/deploy_cutover_spec.md` §3 P4)                    | OPERATOR FILL: list NAMES only (values stay in dashboard)                                  |
| `ASSET_BASE_URL` (Pages)  | optional  | `apps/product-shell/wrangler.toml` `[vars]` AND `apps/product-shell/functions/_lib/runtime-r2.js:38`     | OPERATOR FILL — empty string keeps `/assets/*` Pages-served path; non-empty switches to worker-fronted host |

### 3.1 Target A vs Target B binding posture

Per `/job_site/deploy_cutover_spec.md` §2:

- **Target A (Pages-first)** — Pages owns `/api/*` via Pages Functions and
  the bindings in §2 above. The external Worker, if it exists, only owns
  asset paths (e.g. `/wallpapers/*`, `/stickers/*`, or
  `assets.<host>/...`). `ASSET_BASE_URL` in §3 row 7 is the bridge: when
  set to the Worker / R2-custom-domain host, `runtime-r2.js`
  composes asset URLs that hit the Worker; when empty, Pages serves them
  from the `/assets/...` static prefix and the deploy-side route (declared
  in `/job_site/deploy_cleanup_manifest.md` §3) must rewrite to R2.
- **Target B (Worker-first)** — A Worker handles `/api/*` end-to-end. The
  Pages Functions in `apps/product-shell/functions/api/*` become dead code
  for the production deploy and the `[[r2_buckets]]` blocks in
  `apps/product-shell/wrangler.toml` can be removed (Pages, if used at
  all, only ships static assets). The Worker's binding names MUST mirror
  the names in §2 (`TENANTS_BUCKET`, `DEMO_BUCKET`) so the same handler
  source can be reused without renames.

The target choice is recorded in §6 of this map (Cutover decision row)
and crystallised in `/job_site/cloudflare_rebuild_runbook.md`.

---

## 4. Pages Functions ↔ binding traceability (no operator input required)

This table is the runtime contract the binding map enforces. It is
informational here so the operator can verify that every consumed binding
in code is represented by a row in §2 or §3 and vice versa.

| Function file (relative to `apps/product-shell/`) | Routed path                       | Bindings consumed                                  | Vars consumed       |
|---------------------------------------------------|-----------------------------------|----------------------------------------------------|---------------------|
| `functions/api/published-page.js`                 | `GET /api/published-page`         | `TENANTS_BUCKET` (req.), `DEMO_BUCKET` (opt.)      | none                |
| `functions/api/published-manifest.js`             | `GET /api/published-manifest`     | `TENANTS_BUCKET` (req.), `DEMO_BUCKET` (opt.)      | none                |
| `functions/api/page.js`                           | `GET /api/page`                   | `TENANTS_BUCKET` (req.)                            | none                |
| `functions/api/microfrontend-bootstrap.js`        | `GET /api/microfrontend-bootstrap` | none                                              | none                |
| `functions/api/microfrontend-trust-log.js`        | `GET /api/microfrontend-trust-log` | none                                              | none                |
| `functions/_lib/runtime-r2.js`                    | not routed (helper)               | (none directly — receives bucket as param)         | `ASSET_BASE_URL`    |
| `functions/_lib/runtime-compiler.js`              | not routed (helper)               | none                                               | none                |
| `functions/_lib/runtime-schema.js`                | not routed (helper)               | none                                               | none                |

**Closure check:** every `env.<NAME>` reference scanned in
`apps/product-shell/functions/**` is present in §2 (`TENANTS_BUCKET`,
`DEMO_BUCKET`) or §3 (`ASSET_BASE_URL`). No undeclared runtime env access
exists.

---

## 5. Access / WAF / DNS rows (resolves U2, U8)

| Row                          | Source of truth      | Operator value                               |
|------------------------------|----------------------|----------------------------------------------|
| Custom domain → Pages project | DNS / Cloudflare    | OPERATOR FILL (e.g. `pages.xyz-labs.xyz`)   |
| Cloudflare Access policy     | Zero-Trust dashboard | OPERATOR FILL or `none` (note: `gateway.xyz-labs.xyz` 403 observed in `/job_site/pages_readiness_matrix.md` §7 — confirm whether the SAME policy applies to the Pages hostname) |
| WAF managed/custom rule       | Security dashboard   | OPERATOR FILL or `none`                     |
| Bot Fight / Super Bot Fight   | Security dashboard   | OPERATOR FILL or `none`                     |
| Rate-limit rule on `/api/*`   | Security dashboard   | OPERATOR FILL or `none`                     |

Any row left as `OPERATOR FILL` at S5 cutover is a patch condition per
`/job_site/deploy_cutover_spec.md` §5.

---

## 6. Cutover decision

| Field                       | Operator value         |
|-----------------------------|------------------------|
| Cutover target chosen       | OPERATOR FILL: `A` (Pages-first) / `B` (Worker-first) |
| Decision date               | OPERATOR FILL          |
| Decided by                  | OPERATOR FILL          |
| Old Pages project (if any)  | OPERATOR FILL: leave running for rollback window per `/job_site/deploy_cutover_spec.md` §6 step 4 |
| Rollback window             | OPERATOR FILL: e.g. 72h |
| Rollback trigger threshold  | OPERATOR FILL: see `/job_site/deploy_cutover_spec.md` §8 |

Once the target is selected, the corresponding deploy artifact set is:

- **Target A** — `apps/product-shell/wrangler.toml` (this map §1, §2, §3 row `ASSET_BASE_URL`).
- **Target B** — `apps/product-shell/worker/wrangler.toml` (NOT created in this stage; declared as a follow-on artifact in `/job_site/cloudflare_rebuild_runbook.md`) plus retention of the `apps/product-shell/wrangler.toml` shell-only block (R2 bindings removed).

---

## 7. Closure summary (S5 Worker A self-check)

- Every `env.<NAME>` reference in `apps/product-shell/functions/**` has a
  row here: `TENANTS_BUCKET`, `DEMO_BUCKET`, `ASSET_BASE_URL`.
- Every binding in `apps/product-shell/wrangler.toml` has a row here:
  `TENANTS_BUCKET`, `DEMO_BUCKET`, `ASSET_BASE_URL`.
- Every U-row in `/job_site/cloudflare_runtime_notes.md` §6 has a target
  cell here: U1→§1, U2→§1+§5, U3→§1, U4→§1, U5→§2, U6→§3, U7→§3, U8→§5,
  U9→§3, U10→§3.
- The poisoned-metadata principle (`/job_site/deploy_cutover_spec.md` §3
  P3) is satisfied: the repo (this file + `wrangler.toml`) plus operator
  fill-ins is sufficient to recreate the deploy without reading the old
  Pages dashboard.

**No deploy target is mutated by this artifact.** Operator action is
required to lift the OPERATOR FILL rows into Cloudflare.
