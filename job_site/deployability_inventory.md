# Deployability Inventory — RB-INT-CHASSIS-002

job_id: RB-INT-CHASSIS-002
stage: S1
stage_name: full parity audit and deployability inventory
owner: Worker B (checksum-facing inventory)
authority: non-authoritative — derived from build sheet declarations and attached baseline archive
baseline_reference: gatweay-production-FREEZE-main.zip
current_tree_reference: gateway-fullbody-freeze repo continuation target (apps/, packages/, worker-wb/, xyz-factory-system/, job_site/)
deploy_target: Cloudflare Pages
document_role: Declare every deploy-critical surface that must exist at a chassis-native path in order for the rebuilt system to build and deploy on Cloudflare Pages as an identical working copy of Gateway Production Freeze.

---

## 0. Scope Declaration

This inventory covers **only** the surfaces that are required for Cloudflare Pages to:

1. resolve a deploy root,
2. install dependencies at the deploy root,
3. run the declared build command,
4. emit a static output directory,
5. serve static routing redirects,
6. mount Cloudflare Pages Functions at `functions/`,
7. import the chassis module graph referenced by the deploy app at build time.

Surfaces that are runtime-support-only, resolver-boundary-only, or proof-surface-only are **not** listed here. They are covered by `/job_site/runtime_dependency_inventory.md` and by Worker A S1 parity matrix (`/job_site/missing_surface_matrix.yaml`).

The exact **deploy root path** is not resolved in S1. It is deferred to S2 `/job_site/deploy_root_plan.md`. Every path below is declared relative to the deploy root placeholder `${DEPLOY_ROOT}` unless explicitly tagged as a repo-absolute path.

---

## 1. Status Legend

| Status | Meaning |
|---|---|
| PRESENT | file exists in current rebuild at the declared chassis-native target path |
| REBUILT_ELSEWHERE | baseline behavior is satisfied by a different chassis-native file that already exists |
| MISSING | baseline declares this surface and it is absent from the current rebuild |
| DEFERRED_S2 | exact target path is declared by build sheet but resolved in S2 deploy_root_plan |
| OUT_OF_SCOPE | baseline declares this surface but build sheet excludes it from the rebuild parity scope |

---

## 2. Deploy Root Surface

| # | Baseline surface | Target path (chassis-native) | Build-sheet authority | CF Pages role | Current status |
|---|---|---|---|---|---|
| 2.1 | deploy app root directory | `${DEPLOY_ROOT}/` | S2 `/job_site/deploy_root_plan.md`; S3 worker_a expected_artifacts — "declared deploy app root from /job_site/deploy_root_plan.md" | Pages project root (working directory for install and build commands) | DEFERRED_S2 — no deploy root currently exists anywhere in the tree |

---

## 3. Build Configuration Surfaces

| # | Baseline surface | Target path (chassis-native) | Build-sheet authority | CF Pages role | Current status |
|---|---|---|---|---|---|
| 3.1 | package manifest | `${DEPLOY_ROOT}/package.json` | S3 worker_a expected_artifacts — `package.json` | declares `name`, `scripts.build`, `scripts.dev`, runtime dependencies, devDependencies; consumed by Cloudflare Pages `npm install` / `npm run build` | MISSING — no `package.json` exists at any depth under repo root |
| 3.2 | lockfile | `${DEPLOY_ROOT}/package-lock.json` OR `${DEPLOY_ROOT}/pnpm-lock.yaml` OR `${DEPLOY_ROOT}/yarn.lock` (exact variant declared in S2) | implicit by package manifest declaration; baseline archive lockfile is the authoritative variant | required by Cloudflare Pages for deterministic install; MUST match baseline variant | MISSING — no lockfile variant exists in the tree |
| 3.3 | Vite build config | `${DEPLOY_ROOT}/vite.config.ts` | S3 worker_a expected_artifacts — `vite.config.ts` | bundler entry; declares `root`, `build.outDir`, `plugins`, `server`; drives the `build` script consumed by Pages | MISSING |
| 3.4 | app tsconfig | `${DEPLOY_ROOT}/tsconfig.json` | S3 worker_a expected_artifacts — `tsconfig.json` | TypeScript build config for app sources; referenced by Vite and editor tooling | MISSING |
| 3.5 | node/tooling tsconfig | `${DEPLOY_ROOT}/tsconfig.node.json` | S3 worker_a expected_artifacts — `tsconfig.node.json` | TypeScript build config for Node-side (vite.config.ts) tooling; required when vite.config.ts is TS | MISSING |
| 3.6 | env typing declarations | `${DEPLOY_ROOT}/src/vite-env.d.ts` (if declared by baseline) | implicit by Vite+TS contract; only required if baseline archive contains it | declares ImportMeta.env types for the app | DEFERRED_S2 — include only if present in baseline archive |

---

## 4. App Bootstrap Surfaces

| # | Baseline surface | Target path (chassis-native) | Build-sheet authority | CF Pages role | Current status |
|---|---|---|---|---|---|
| 4.1 | HTML entry | `${DEPLOY_ROOT}/index.html` | S3 worker_a expected_artifacts — `index.html` | Vite entry point; loads `src/main.tsx`; bundled into Pages output directory | MISSING |
| 4.2 | script entry | `${DEPLOY_ROOT}/src/main.tsx` | S3 worker_a expected_artifacts — `src/main.tsx` | React root bootstrap; mounts the app into the HTML entry; imports router bootstrap and app root | MISSING |
| 4.3 | app root directory | `${DEPLOY_ROOT}/src/app/` | S3 worker_a expected_artifacts — `src/app/` | contains app-level composition (router, layout, providers, shell binding); consumed by `src/main.tsx` | MISSING — no `src/app/` directory exists under any deploy root candidate |
| 4.4 | router bootstrap | `${DEPLOY_ROOT}/src/app/router.tsx` OR equivalent declared in baseline | S3 worker_a task — "router bootstrap" | maps client-side routes to view components; required for static routing behavior parity | MISSING |
| 4.5 | app bootstrap | `${DEPLOY_ROOT}/src/app/App.tsx` OR equivalent | S3 worker_a task — "app bootstrap" | top-level composition component referenced by `src/main.tsx` | MISSING |

---

## 5. Static Routing Surfaces

| # | Baseline surface | Target path (chassis-native) | Build-sheet authority | CF Pages role | Current status |
|---|---|---|---|---|---|
| 5.1 | Cloudflare Pages redirects file | `${DEPLOY_ROOT}/public/_redirects` | S3 worker_a expected_artifacts — `public/_redirects` | Cloudflare Pages static redirect/rewrite rules; emitted into Pages output unchanged | MISSING |
| 5.2 | headers file (if baseline-declared) | `${DEPLOY_ROOT}/public/_headers` | baseline-archive conditional | Cloudflare Pages static headers declaration | DEFERRED_S2 — include only if present in baseline |
| 5.3 | public static asset directory | `${DEPLOY_ROOT}/public/` | implicit parent of 5.1/5.2; S3 task — "public assets" | Vite static directory passed through into Pages output | MISSING — no `public/` directory exists in the tree |

---

## 6. Cloudflare Pages Functions Surfaces

| # | Baseline surface | Target path (chassis-native) | Build-sheet authority | CF Pages role | Current status |
|---|---|---|---|---|---|
| 6.1 | functions directory | `${DEPLOY_ROOT}/functions/` | implicit parent of 6.2/6.3; required by Pages Functions contract | root directory Cloudflare Pages scans for Functions | MISSING |
| 6.2 | api functions | `${DEPLOY_ROOT}/functions/api/` | S3 worker_a expected_artifacts — `functions/api/` | maps request paths under `/api/*` to Pages Function handlers | MISSING |
| 6.3 | functions shared library | `${DEPLOY_ROOT}/functions/_lib/` | S3 worker_a expected_artifacts — `functions/_lib/` | shared request/response helpers consumed by `functions/api/*` handlers; required for parity with baseline handler composition | MISSING |

---

## 7. Deployment Config Surfaces (Cloudflare Pages project-level)

| # | Baseline surface | Target path | Build-sheet authority | CF Pages role | Current status |
|---|---|---|---|---|---|
| 7.1 | deploy-root declaration | `/job_site/deploy_root_plan.md` | S2 worker_a expected_artifacts | declares the exact Pages project root, build command, and output directory for the Cloudflare Pages project | DEFERRED_S2 |
| 7.2 | Pages deployment spec | `/job_site/pages_deployment_spec.md` | S2 worker_b expected_artifacts | declares Pages-level deployment inputs (root, build command, output dir, redirects, functions dir, public assets) consumed by S5 verification | DEFERRED_S2 |
| 7.3 | `wrangler.toml` (conditional) | `${DEPLOY_ROOT}/wrangler.toml` | baseline-archive conditional — only if Gateway Production Freeze ships one | only if baseline ships it; Pages Functions do not require `wrangler.toml` for the default flow | DEFERRED_S2 — include only if present in baseline archive |

---

## 8. Module Graph Surfaces Required at Build Time

Every package imported by the deploy app must be resolvable at build time from `${DEPLOY_ROOT}`. The chassis package directories exist, but **none of them currently ship a `package.json`**, which means the deploy app cannot resolve them as workspace packages.

| # | Baseline surface | Target path (chassis-native) | Required for | Current status |
|---|---|---|---|---|
| 8.1 | package manifest for each chassis package | `packages/<pkg>/package.json` for every directory in `packages/` | workspace resolution at build time; TypeScript project references; Vite alias resolution | MISSING — `packages/contracts-core/`, `packages/schema-chassis/`, `packages/lifecycle-chassis/`, `packages/policy-chassis/`, `packages/proof-chassis/`, `packages/registry-chassis/`, `packages/runtime-bridge/`, `packages/session-transport/`, `packages/validation-chassis/` all lack `package.json` |
| 8.2 | package tsconfig for each chassis package | `packages/<pkg>/tsconfig.json` | TypeScript project references and per-package type checking | MISSING across all packages |
| 8.3 | package manifest for each app | `apps/<app>/package.json` for `apps/core-runtime/`, `apps/local-host/`, `apps/operator-shell/`, `apps/web-public/` | workspace resolution and app-level build metadata | MISSING across all apps |
| 8.4 | root workspace manifest | `/package.json` at repo root (if the baseline uses a monorepo workspace) | declares `workspaces` (npm/pnpm/yarn) and root build scripts | MISSING — repo root has no `package.json` |
| 8.5 | root workspace lockfile | `/package-lock.json` OR `/pnpm-lock.yaml` OR `/yarn.lock` at repo root (conditional on 8.4) | deterministic install for root workspace | MISSING |
| 8.6 | workspace config (pnpm only) | `/pnpm-workspace.yaml` at repo root (conditional on pnpm variant) | pnpm workspace declaration | DEFERRED_S2 — include only if baseline uses pnpm |

**Interaction with Section 2 deploy root:** If S2 declares the deploy root as the repo root (`/`), then 8.4/8.5 and 3.1/3.2 collapse onto the same files. If S2 declares the deploy root as a subdirectory (e.g., `apps/web-public/`), then 8.4/8.5 are still required as separate files at repo root for workspace resolution. The decision is explicitly deferred to `/job_site/deploy_root_plan.md`.

---

## 9. Surface Summary

| Category | Count present | Count rebuilt elsewhere | Count missing | Count deferred |
|---|---|---|---|---|
| Deploy root (§2) | 0 | 0 | 0 | 1 |
| Build configuration (§3) | 0 | 0 | 5 | 1 |
| App bootstrap (§4) | 0 | 0 | 5 | 0 |
| Static routing (§5) | 0 | 0 | 2 | 1 |
| Pages functions (§6) | 0 | 0 | 3 | 0 |
| Deployment config (§7) | 0 | 0 | 0 | 3 |
| Module graph (§8) | 0 | 0 | 5 | 1 |
| **Total deploy-critical** | **0** | **0** | **20** | **7** |

**Headline:** the current chassis rebuild contains zero deploy-critical surfaces. Every deploy-critical baseline surface is either MISSING or DEFERRED_S2. No deploy-critical surface has been satisfied by a rebuilt-elsewhere path.

---

## 10. Checksum Pointers for Foreman B (S1-CP1)

- Every row above has an explicit status in {PRESENT, REBUILT_ELSEWHERE, MISSING, DEFERRED_S2, OUT_OF_SCOPE}.
- No row is left unclassified.
- Every path is either exact (absolute) or parameterized under `${DEPLOY_ROOT}` with the resolution stage declared (S2).
- Every entry ties back to a build-sheet authority cell (S2 worker_a/worker_b or S3 worker_a/worker_b expected_artifacts) or is explicitly tagged as baseline-archive conditional.
- This file contains no invented file content and no redesign of build-sheet authority. Exact paths under `${DEPLOY_ROOT}` and the resolver variant selections (lockfile form, workspace tool) are resolved in S2 per build-sheet flow.
