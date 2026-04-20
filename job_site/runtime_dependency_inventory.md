# Runtime Dependency Inventory — RB-INT-CHASSIS-002

job_id: RB-INT-CHASSIS-002
stage: S1
stage_name: full parity audit and deployability inventory
owner: Worker B
authority: non-authoritative — derived from build sheet declarations and chassis package graph
baseline_reference: gatweay-production-FREEZE-main.zip
current_tree_reference: gateway-fullbody-freeze repo continuation target
document_role: Declare every module dependency edge required at build time and at Cloudflare Pages runtime so that the rebuilt system behaves as an identical working copy of Gateway Production Freeze.

---

## 0. Scope Declaration

This inventory covers three classes of dependency edges:

1. **Internal edges** — imports from the deploy app into chassis packages and between chassis packages.
2. **External edges** — npm/registry dependencies the deploy app and chassis packages must declare in their `package.json` manifests.
3. **Runtime-gate edges** — request-time edges at Cloudflare Pages (Functions → chassis packages, Functions → external runtime, SPA → Functions over HTTP).

Non-runtime and non-build-time artifacts (documentation, test harnesses, proof run transcripts) are out of scope for this file.

The exact declared dependency versions are **not** frozen in S1; version pinning is resolved in S2 against the baseline archive `package.json` and lockfile. Only the edge set is declared here.

---

## 1. Edge Kinds

| Kind | Direction | Resolution point |
|---|---|---|
| INT-A | deploy app (`${DEPLOY_ROOT}/src/**`) → chassis package (`packages/<pkg>`) | Vite bundler, TypeScript, workspace resolver |
| INT-P | chassis package → chassis package | TypeScript + workspace resolver |
| INT-F | Cloudflare Pages Function (`${DEPLOY_ROOT}/functions/**`) → chassis package | Pages Functions build + workspace resolver |
| EXT-A | deploy app → external npm package | `${DEPLOY_ROOT}/package.json` dependencies/devDependencies |
| EXT-F | Cloudflare Pages Function → external npm package or platform runtime | `${DEPLOY_ROOT}/package.json` dependencies + Pages runtime |
| HTTP | deploy app → Cloudflare Pages Function over HTTP (`fetch('/api/*')`) | Cloudflare Pages routing at `_redirects` + `functions/api/` layout |

---

## 2. Internal Package Graph (existing chassis packages)

Chassis package directories that are present in the current rebuild (all of them already host `.ts` source but none currently ships a `package.json`; package manifest creation is tracked in `/job_site/deployability_inventory.md` §8):

- `packages/contracts-core/`
- `packages/schema-chassis/`
- `packages/lifecycle-chassis/`
- `packages/policy-chassis/`
- `packages/proof-chassis/`
- `packages/registry-chassis/`
- `packages/runtime-bridge/`
- `packages/session-transport/`
- `packages/validation-chassis/`

Chassis app directories present in the current rebuild:

- `apps/core-runtime/`
- `apps/local-host/`
- `apps/operator-shell/`
- `apps/web-public/`

### 2.1 Internal package → package edges (INT-P)

These edges are declared by the existing `.ts` source in the chassis package graph and must remain resolvable once `package.json` manifests are added.

| # | From | To | Evidence |
|---|---|---|---|
| 2.1.1 | `packages/schema-chassis` | `packages/contracts-core` | `packages/schema-chassis/src/*.schema.ts` re-export domain types from `contracts-core/src/chassis/*` |
| 2.1.2 | `packages/registry-chassis` | `packages/contracts-core` | `packages/registry-chassis/src/*-registry.ts` consume `MODULE_IDS`, `ROUTE_IDS`, `TRIGGER_IDS`, `EVENT_IDS` from `contracts-core/src/chassis/domain` |
| 2.1.3 | `packages/validation-chassis` | `packages/contracts-core` | validators consume domain types |
| 2.1.4 | `packages/validation-chassis` | `packages/schema-chassis` | `schema.validator.ts` consumes schema exports |
| 2.1.5 | `packages/policy-chassis` | `packages/contracts-core` | policy-chassis consumes domain types |
| 2.1.6 | `packages/lifecycle-chassis` | `packages/contracts-core` | lifecycle policies consume `MODULE_IDS` / stamp domain |
| 2.1.7 | `packages/proof-chassis` | `packages/contracts-core` | proof adapters consume domain types + `STAMP_STATES` |
| 2.1.8 | `packages/proof-chassis` | `packages/validation-chassis` | validation.adapter.ts consumes validation-chassis result contract |
| 2.1.9 | `packages/runtime-bridge` | `packages/contracts-core` | `admin-bridge-contract.ts` imports `InstallStamp` + `STAMP_STATES` |
| 2.1.10 | `packages/session-transport` | `packages/contracts-core` | transport contract consumes domain types (session/transport state shape) |

### 2.2 App → package edges (INT-P via apps/*)

| # | From | To | Evidence |
|---|---|---|---|
| 2.2.1 | `apps/core-runtime` | `packages/contracts-core` | routes, touchpoints, session modules consume domain IDs and contract interfaces |
| 2.2.2 | `apps/core-runtime` | `packages/registry-chassis` | session + proof paths consume registry lookups |
| 2.2.3 | `apps/core-runtime` | `packages/validation-chassis` | install-chain proof consumes validators |
| 2.2.4 | `apps/core-runtime` | `packages/proof-chassis` | routes/touchpoints proof consumes proof adapters |
| 2.2.5 | `apps/core-runtime` | `packages/lifecycle-chassis` | lifecycle transitions |
| 2.2.6 | `apps/core-runtime` | `packages/policy-chassis` | policy evaluation |
| 2.2.7 | `apps/operator-shell` | `packages/contracts-core` | mounts consume `TOUCHPOINT_IDS`, `SURFACE_IDS` |
| 2.2.8 | `apps/operator-shell` | `packages/proof-chassis` | mount proof |
| 2.2.9 | `apps/operator-shell` | `packages/validation-chassis` | mount + shell validators |
| 2.2.10 | `apps/web-public` | `packages/contracts-core` | mounts consume `TOUCHPOINT_IDS`, `SURFACE_IDS` |
| 2.2.11 | `apps/web-public` | `packages/proof-chassis` | mount proof |
| 2.2.12 | `apps/web-public` | `packages/validation-chassis` | mount + shell validators |
| 2.2.13 | `apps/local-host` | `packages/contracts-core` | bridge + transport consume stamp types |
| 2.2.14 | `apps/local-host` | `packages/runtime-bridge` | local-host `runtime-bridge.ts` + `admin-bridge.ts` consume runtime-bridge contract |
| 2.2.15 | `apps/local-host` | `packages/session-transport` | `transport/session-link.ts` consumes `isTransportReady`-style contract |

---

## 3. Deploy-App Dependency Graph (missing — to be declared by S3 at `${DEPLOY_ROOT}`)

The deploy app that Cloudflare Pages builds and serves does **not yet exist** at any declared deploy root. Its dependency edges are declared here as required parity targets so that S2 can freeze them and S3 can implement them.

### 3.1 Deploy-App → Chassis Package Edges (INT-A)

The deploy app MUST be able to import at least the following chassis package surfaces at build time for the rebuilt system to be an identical working copy. The required set is derived from the build-sheet objective ("Rebuilt system matches required app, module, runtime, build, and deployment behavior of Gateway Production Freeze").

| # | From (deploy app) | To (chassis package) | Required because |
|---|---|---|---|
| 3.1.1 | `${DEPLOY_ROOT}/src/app/**` | `packages/contracts-core` | surface/route/touchpoint IDs and domain types are chassis-authoritative and referenced by any UI or client code mirroring the baseline behaviors |
| 3.1.2 | `${DEPLOY_ROOT}/src/app/**` | `packages/registry-chassis` | client-side lookups mirror baseline route/touchpoint enumeration |
| 3.1.3 | `${DEPLOY_ROOT}/src/app/**` | `packages/proof-chassis` | any proof-visible surface rendered by the deploy app consumes proof adapters |
| 3.1.4 | `${DEPLOY_ROOT}/src/app/**` | `packages/validation-chassis` | client-side validation of request shapes uses chassis validators |
| 3.1.5 | `${DEPLOY_ROOT}/src/app/**` | `packages/policy-chassis` | policy-gated UI affordances mirror baseline policy evaluation |
| 3.1.6 | `${DEPLOY_ROOT}/src/app/**` | `packages/lifecycle-chassis` | lifecycle-dependent UI mirrors baseline lifecycle transitions |
| 3.1.7 | `${DEPLOY_ROOT}/src/app/**` | `packages/runtime-bridge` | admin panel readiness mirrors `isAdminBridgeActivatable` semantics |
| 3.1.8 | `${DEPLOY_ROOT}/src/app/**` | `packages/session-transport` | session transport readiness mirrors `isTransportReady` semantics |
| 3.1.9 | `${DEPLOY_ROOT}/src/app/**` | `apps/web-public/src/mounts` | web-public mount contract is the API surface binding for the deploy app |
| 3.1.10 | `${DEPLOY_ROOT}/src/app/**` | `apps/web-public/src/app/layout/shell.layout.ts` | shell layout drives the deploy app's panel composition |

The exact per-file import set is resolved in S2 `/job_site/full_parity_target_path_manifest.yaml`; only the required edge existence is declared in S1.

### 3.2 Pages-Function → Chassis Package Edges (INT-F)

Cloudflare Pages Functions under `${DEPLOY_ROOT}/functions/api/` MUST import chassis packages to honour runtime contracts.

| # | From | To | Required because |
|---|---|---|---|
| 3.2.1 | `${DEPLOY_ROOT}/functions/api/**` | `packages/contracts-core` | request/response types + domain IDs |
| 3.2.2 | `${DEPLOY_ROOT}/functions/api/**` | `packages/schema-chassis` | request body validation |
| 3.2.3 | `${DEPLOY_ROOT}/functions/api/**` | `packages/validation-chassis` | request validation + failure codes |
| 3.2.4 | `${DEPLOY_ROOT}/functions/api/**` | `packages/registry-chassis` | route and touchpoint lookups |
| 3.2.5 | `${DEPLOY_ROOT}/functions/api/**` | `packages/proof-chassis` | proof surfaces emitted by API handlers |
| 3.2.6 | `${DEPLOY_ROOT}/functions/api/**` | `packages/lifecycle-chassis` | lifecycle-aware request handling |
| 3.2.7 | `${DEPLOY_ROOT}/functions/api/**` | `packages/policy-chassis` | policy evaluation |
| 3.2.8 | `${DEPLOY_ROOT}/functions/api/**` | `packages/runtime-bridge` | bridge activation check |
| 3.2.9 | `${DEPLOY_ROOT}/functions/api/**` | `packages/session-transport` | session transport readiness |
| 3.2.10 | `${DEPLOY_ROOT}/functions/api/**` | `${DEPLOY_ROOT}/functions/_lib/**` | shared request/response helpers for handler composition parity |
| 3.2.11 | `${DEPLOY_ROOT}/functions/_lib/**` | `packages/contracts-core` | shared helpers consume domain types |
| 3.2.12 | `${DEPLOY_ROOT}/functions/_lib/**` | `packages/validation-chassis` | shared request validation helpers |

### 3.3 Deploy-App → Function HTTP Edges (HTTP)

| # | From | To | Routing authority |
|---|---|---|---|
| 3.3.1 | `${DEPLOY_ROOT}/src/app/**` client fetches | `/api/*` Pages Functions | `${DEPLOY_ROOT}/functions/api/**` + `${DEPLOY_ROOT}/public/_redirects` |
| 3.3.2 | `${DEPLOY_ROOT}/src/app/**` SPA navigation | SPA fallback routes | `${DEPLOY_ROOT}/public/_redirects` (SPA fallback rule) |

The exact fetch paths and redirect rules are frozen in S2 `/job_site/pages_deployment_spec.md` against the baseline archive.

---

## 4. External Runtime Dependencies (EXT)

Declared authoritatively by the build sheet only to the extent the build sheet names a surface that requires a specific toolchain. Version pinning is resolved in S2 against the baseline archive's `package.json`.

### 4.1 Build-sheet-declared tooling edges

| # | Edge kind | Dependency class | Build-sheet authority |
|---|---|---|---|
| 4.1.1 | EXT-A | TypeScript compiler | build sheet names `tsconfig.json` and `tsconfig.node.json` as required artifacts → TypeScript is a required devDependency |
| 4.1.2 | EXT-A | Vite bundler | build sheet names `vite.config.ts` as a required artifact → Vite is a required devDependency |
| 4.1.3 | EXT-A | React JSX runtime | build sheet names `src/main.tsx` as a required artifact → React (or a Vite-compatible JSX runtime) is a required dependency |
| 4.1.4 | EXT-F | Cloudflare Pages Functions runtime | build sheet names `functions/api/` and `functions/_lib/` as required artifacts → Pages Functions runtime types/tooling are required devDependencies at the deploy root |

### 4.2 Baseline-archive-conditional edges

The following edges MUST be declared at the deploy root only if the baseline archive `package.json` declares them. S1 does not enumerate them; S2 pins the exact set against the baseline archive.

- Router library (client-side routing)
- State management library (if any)
- HTTP client library (if any)
- UI/component libraries (if any)
- Build plugins (Vite plugin-react, others declared in baseline `vite.config.ts`)
- Lint/format tooling (devDependencies only; not runtime)
- Testing tooling (devDependencies only; not runtime)

No speculative pinning; no invented versions. S1's declared requirement is simply that every external dependency named in the baseline `package.json` MUST be present in the rebuilt deploy root `package.json` at the same version, unless S2 explicitly narrows the scope.

---

## 5. Module Resolution Requirements

For every INT-A and INT-F edge in §3 and every INT-P edge in §2 to resolve at build time, the following must hold after S3:

1. **Workspace declaration** — the repo contains exactly one workspace manifest at a declared root (npm workspaces, pnpm workspaces, or yarn workspaces) that includes `packages/*` and the deploy app's path. Exact tool and path are declared in S2 `/job_site/deploy_root_plan.md`.
2. **Package manifest per workspace member** — every `packages/<pkg>/` and every referenced `apps/<app>/` ships a `package.json` that declares `name`, `version`, `main`, `types`, and (if applicable) `exports`.
3. **TypeScript project references** — every `packages/<pkg>/` and the deploy app ship a `tsconfig.json`; the deploy app's `tsconfig.json` references or paths-maps the chassis packages.
4. **Bundler resolver alignment** — `vite.config.ts` resolver either consumes the workspace package names directly or provides explicit aliases to the chassis package source entries.
5. **Functions resolver alignment** — Cloudflare Pages Functions must be able to import chassis packages using the workspace resolver the Pages build uses.

Requirements 1–5 are enforced by S5 build verification against the declared deploy root.

---

## 6. Edge Count Summary

| Edge class | Count |
|---|---|
| INT-P edges (package → package, existing chassis) | 10 |
| INT-P edges (apps → packages, existing chassis) | 15 |
| INT-A edges (deploy app → chassis, required) | 10 |
| INT-F edges (functions → chassis / functions → _lib) | 12 |
| HTTP edges (deploy app ↔ functions) | 2 |
| EXT-A edges (build-sheet-declared) | 3 (TypeScript, Vite, React JSX runtime) |
| EXT-F edges (build-sheet-declared) | 1 (Pages Functions runtime tooling) |
| EXT edges (baseline-archive-conditional) | TBD in S2 |

---

## 7. Checksum Pointers for Foreman B (S1-CP1)

- Every edge is attributed to either an existing chassis file (INT-P existing) or a build-sheet expected-artifact declaration (INT-A, INT-F, EXT build-sheet-declared).
- No edge is invented. Baseline-archive-conditional edges are explicitly deferred to S2 without enumeration.
- The deploy app dependency graph is declared as required edges only. Implementation is reserved for S3.
- This inventory pairs with `/job_site/deployability_inventory.md`: every deploy-critical surface in that file is the resolution point for one or more edges declared here, and every edge declared here has a resolution surface in that file.
