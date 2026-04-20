# Pages Deployment Spec — RB-INT-CHASSIS-002

job_id: RB-INT-CHASSIS-002
stage: S2
stage_name: deployable parity blueprint freeze
owner: Worker B
scope: deploy app only — no module or admin surfaces in this pass
authority: non-authoritative — derived from /job_site/build-sheet-RB-INT-CHASSIS-002.txt S3 expected_artifacts and /job_site/deployability_inventory.md §2–§7
document_role: Declare the exact Cloudflare Pages deployment inputs for the declared deploy root: deploy root path, build command, output directory, install command, routing (`_redirects`), and functions directory. Everything else is out of scope for this pass.

---

## 0. Narrow-Scope Declaration

Per operator dispatch, this pass covers **only** the deploy app deploy surfaces:

- deploy root path
- install command
- build command
- output directory
- functions directory
- routing (`_redirects`)

Module surfaces, admin surfaces, package manifests for `packages/*` and `apps/*` (S1 §8 module graph), and runtime support surfaces are **explicitly excluded** from this document and deferred to a later Worker B pass.

This document resolves every `${DEPLOY_ROOT}`-parameterized path in `/job_site/deployability_inventory.md` §2–§7 that falls inside the narrow scope.

---

## 1. Deploy Root

| Field | Value |
|---|---|
| deploy_root_path | `/` — repo root of `gateway-fullbody-freeze` |
| chassis_relationship | repo root hosts the deploy app alongside existing `apps/`, `packages/`, `job_site/`, `worker-wb/`, `xyz-factory-system/` trees; no chassis directory is relocated, renamed, or overlaid |
| working_directory_for_pages | repo root (no `root_dir` override at Pages project level) |
| pages_project_root | repo root |

### 1.1 Rationale (non-redesign)

- The chassis already places its packages under `packages/` and its runtime apps under `apps/`. None of these directories is a Cloudflare Pages deploy surface; they are the module graph the deploy app imports from.
- Placing the deploy root at the repo root lets Cloudflare Pages treat the existing workspace root as the Pages project root with no path override, matching the Cloudflare Pages default flow.
- Build-sheet S3 worker_a expected_artifacts names `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `src/main.tsx`, `src/app/`, `public/_redirects`, `functions/api/`, `functions/_lib/` **without prefix**, which is consistent with declaring the deploy root at the repo root.
- No new directory nesting is introduced. The existing chassis tree is untouched by this declaration.

### 1.2 Absolute path resolution against S1 `${DEPLOY_ROOT}`

Every `${DEPLOY_ROOT}/<path>` in `/job_site/deployability_inventory.md` resolves to `<repo>/<path>` under this declaration. Specifically, in narrow scope:

| S1 surface | S1 path | Absolute path |
|---|---|---|
| §3.3 Vite config | `${DEPLOY_ROOT}/vite.config.ts` | `/vite.config.ts` |
| §4.1 HTML entry | `${DEPLOY_ROOT}/index.html` | `/index.html` |
| §4.2 script entry | `${DEPLOY_ROOT}/src/main.tsx` | `/src/main.tsx` |
| §4.3 app root dir | `${DEPLOY_ROOT}/src/app/` | `/src/app/` |
| §5.1 redirects | `${DEPLOY_ROOT}/public/_redirects` | `/public/_redirects` |
| §5.3 public asset dir | `${DEPLOY_ROOT}/public/` | `/public/` |
| §6.1 functions dir | `${DEPLOY_ROOT}/functions/` | `/functions/` |
| §6.2 api functions | `${DEPLOY_ROOT}/functions/api/` | `/functions/api/` |
| §6.3 functions `_lib` | `${DEPLOY_ROOT}/functions/_lib/` | `/functions/_lib/` |

Surfaces explicitly outside narrow scope for this pass:

- `/package.json`, `/tsconfig.json`, `/tsconfig.node.json` — deferred to subsequent Worker B pass covering workspace + tsconfig freeze
- `/package-lock.json` (or lockfile variant) — deferred
- `/packages/*/package.json`, `/packages/*/tsconfig.json` — deferred
- `/apps/*/package.json`, `/apps/*/tsconfig.json` — deferred
- `/public/_headers`, `/wrangler.toml` — baseline-archive-conditional; deferred

---

## 2. Install and Build Commands

| Field | Value | Source |
|---|---|---|
| install_command | `npm install` | Cloudflare Pages default; matches declared `package.json` manifest target |
| build_command | `npm run build` | Cloudflare Pages default; script name is the declared Vite build entry |
| build_script_target | `vite build` | from `/vite.config.ts` + standard Vite build contract |
| node_version | match baseline `engines.node` or Cloudflare Pages default LTS | resolved in a later pass against baseline archive |

### 2.1 Command Contract

- `install_command` MUST run from the repo root.
- `build_command` MUST run from the repo root.
- `build_command` MUST fail fast if any declared artifact in `/job_site/deployability_inventory.md` §3–§6 is missing from the tree at the moment of build.
- `build_command` MUST emit all static assets into a single deterministic directory (see §3).

### 2.2 Out-of-scope command surfaces

- Dev-only commands (`dev`, `preview`, `test`, `lint`, `format`) — not Pages-consumed; deferred.
- CI-only commands (`ci:install`, `ci:test`) — not Pages-consumed; deferred.
- Monorepo filter flags (e.g. `--filter`, `-r`) — deferred to the workspace manifest pass.

---

## 3. Output Directory

| Field | Value |
|---|---|
| output_directory | `dist` |
| absolute_path | `/dist` (repo root relative) |
| emitter | Vite — declared by `/vite.config.ts` |
| contents | SPA HTML entry, bundled JS/CSS assets, hashed chunk files, copied contents of `/public/` including `_redirects` |
| cleaned_each_build | yes — `dist` MUST be removed before each Pages build |

### 3.1 Output contract

- Cloudflare Pages MUST be configured with `output directory = dist`.
- `/public/` contents MUST be copied verbatim into `/dist/` at the end of the Vite build so that `/dist/_redirects` exists.
- No build artifact may be written outside `/dist` during a Pages build.
- Functions are **not** part of the `output_directory`; functions are served from the Pages Functions surface (see §5), not from `/dist`.

### 3.2 Output directory is declared (not chosen)

`dist` is the Vite default and is consistent with the build-sheet declaration of `vite.config.ts` as an expected artifact. No alternative output directory is chosen in this pass. If the baseline archive declares a different `build.outDir`, that value overrides `dist` in a later pinning pass.

---

## 4. Routing (`_redirects`)

| Field | Value |
|---|---|
| redirects_file_path | `/public/_redirects` |
| output_location | `/dist/_redirects` after Vite build |
| authority | S1 `/job_site/deployability_inventory.md` §5.1; S3 worker_a expected_artifacts |
| role | Cloudflare Pages static redirect/rewrite rules applied before Functions routing |

### 4.1 Declared Rule Classes

The file MUST contain exactly the following rule classes in this order:

1. **Function passthrough guard** — ensure `/api/*` requests reach Pages Functions under `/functions/api/` and are not intercepted by the SPA fallback. On Cloudflare Pages, Functions routing precedes `_redirects`, so this rule is declaration-level only: no explicit redirect line is emitted for `/api/*`, and the SPA fallback in §4.1.3 is written so it does not match `/api/*`.

2. **Static asset passthrough** — hashed chunk files, images, and other static assets emitted by Vite under `/assets/*` are served directly from `/dist/` with no redirect.

3. **SPA fallback** — any path not served by Functions or static assets is rewritten to `/index.html` with HTTP status 200 (rewrite, not redirect).

### 4.2 Canonical `_redirects` content

```
/*    /index.html   200
```

Single rule, SPA rewrite. The rule is:

- **Pattern** `/*`
- **Destination** `/index.html`
- **Status** `200` (rewrite — preserves URL, serves index)

This canonical form is sufficient because:

- Pages Functions routing precedes `_redirects`, so `/api/*` is served by `/functions/api/` without an explicit redirect line.
- Vite-hashed assets under `/assets/*` are served statically from `/dist/` and do not need a pass-through rule (they exist as real files).
- Baseline-specific exceptions (if any) are layered in a later pinning pass against the baseline archive.

### 4.3 Redirects contract

- `_redirects` MUST be committed at `/public/_redirects`, not at `/dist/_redirects` directly. Vite copies `/public/*` into `/dist/*` at build time.
- `_redirects` MUST NOT declare a rule that matches `/api/*`. Functions routing is authoritative for the `/api/*` namespace.
- `_redirects` MUST NOT declare a rule that rewrites a static asset path under `/assets/*` to any other path.
- Any rule beyond the canonical §4.2 content requires explicit baseline-archive evidence and is deferred.

---

## 5. Functions Directory

| Field | Value |
|---|---|
| functions_directory | `/functions` |
| absolute_path | `/functions` (repo root relative) |
| discovery | Cloudflare Pages default directory scan — no override required |
| required_subdirectories | `/functions/api`, `/functions/_lib` |
| authority | S1 `/job_site/deployability_inventory.md` §6; S3 worker_a expected_artifacts — `functions/api/`, `functions/_lib/` |

### 5.1 Subdirectory contract

| Subdirectory | Role | Pages routing |
|---|---|---|
| `/functions/api/` | request handlers for `/api/*` routes | Pages auto-routes each file under `/functions/api/*` to a matching HTTP path under `/api/*` using Pages Functions file-based routing |
| `/functions/_lib/` | shared request/response helpers and chassis adapters consumed by `/functions/api/*` handlers | not itself routed; imported by handlers; Pages does not serve `_lib/*` as a URL path because of the leading underscore |

### 5.2 Functions contract

- Every handler file under `/functions/api/` MUST export the HTTP method handlers expected by the Pages Functions runtime (`onRequest`, `onRequestGet`, `onRequestPost`, etc.).
- Every helper under `/functions/_lib/` MUST be importable by handlers in `/functions/api/` via relative path (`../../_lib/<name>`). Helpers MUST NOT be emitted as routed Pages Functions (the leading-underscore rule prevents routing but this must be honoured at declaration level too).
- No file in `/functions/` may write to `/dist/` or to the static assets directory. Functions are request-time only.
- No file in `/functions/` may import from `/src/` — the SPA source and the Functions source are disjoint.

### 5.3 Functions content is deferred

This spec declares the **shape** of `/functions/` — subdirectory layout, routing contract, import contract. The **handler content** (which `/api/*` routes exist, what each returns, what chassis packages are imported) is deferred to the module-and-dependency pass. No handler file is declared or written in this pass.

---

## 6. Cross-Field Consistency Contract

The six narrow-scope fields declared above MUST remain internally consistent:

1. deploy_root = `/` implies `install_command`, `build_command`, and Cloudflare Pages working directory are all rooted at `/`.
2. `build_command` = `npm run build` implies `/package.json` exists at deploy root and declares a `build` script. Declaration of `/package.json` is deferred but the implication is pinned here.
3. `output_directory` = `dist` implies `/vite.config.ts` does not override `build.outDir` to any other value, or if it does, this spec is patched to match.
4. `/public/_redirects` being the source path for `_redirects` implies that Vite's static directory resolves to `/public/` (which is the Vite default and MUST be preserved).
5. `/functions/` being the functions directory implies that Cloudflare Pages' functions directory is not overridden at the project level; the default directory scan is used.
6. `/functions/api/` and `/functions/_lib/` are the only declared subdirectories of `/functions/` in this pass. Any additional top-level functions subdirectory is out of scope.

If any of the six fields is later changed, every row in §1.2 and every rule in §4–§5 MUST be re-verified against the change.

---

## 7. Checksum Pointers for Foreman B

- Each narrow-scope field (§1–§5) has exactly one declared value, one source, and one contract section.
- Every path in §1.2 resolves to an absolute path under `/` with no placeholder remaining in narrow scope.
- Every deferred item is named explicitly in §1.2 ("out of narrow scope"), §2.2, or §5.3 and tied to a later pass.
- No redesign of build-sheet authority: every field maps directly to either `/job_site/build-sheet-RB-INT-CHASSIS-002.txt` S3 worker_a expected_artifacts or `/job_site/deployability_inventory.md` §2–§6 or a Vite/Cloudflare Pages default behavior declared in §3.2 / §5.1.
- Module, admin, package-manifest, and runtime-support surfaces are **not** declared in this document and are not implied by any field above.
