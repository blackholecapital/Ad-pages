# Parity Scope Lock — RB-INT-CHASSIS-002

job_id: RB-INT-CHASSIS-002
stage: S1
stage_name: full parity audit and deployability inventory
owner: Worker B
authority: non-authoritative — derived from build sheet authority only
baseline_reference: gatweay-production-FREEZE-main.zip (Gateway Production Freeze)
current_tree_reference: gateway-fullbody-freeze repo continuation target
document_role: Freeze the exact scope of "deployable identical working copy" for this run so that no downstream stage can silently expand, narrow, or reinterpret the parity target.

---

## 0. Lock Statement

The parity target for RB-INT-CHASSIS-002 is:

> A rebuilt system that (a) matches Gateway Production Freeze in every app, module, runtime, build, and deployment surface declared required by this build sheet, and (b) is ready to build and deploy on Cloudflare Pages from a declared deploy root, on the chassis.

This lock is the authority floor for S1-CP1 and the authority ceiling for all scope decisions in S2–S6. No role may expand or narrow this scope without returning to Factory Control Interface per build sheet §on_error.

---

## 1. IN SCOPE — Parity Required

### 1.1 Deploy-critical surfaces (IN SCOPE)

Every surface listed in `/job_site/deployability_inventory.md` §2–§8 is IN SCOPE for parity. Specifically:

- **Deploy root** (§2) — declared in S2, implemented in S3.
- **Build configuration** (§3) — `package.json`, lockfile, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`.
- **App bootstrap** (§4) — `index.html`, `src/main.tsx`, `src/app/` with router bootstrap and app root.
- **Static routing** (§5) — `public/_redirects`, `public/` asset directory, `public/_headers` if baseline-declared.
- **Cloudflare Pages Functions** (§6) — `functions/api/`, `functions/_lib/`.
- **Deployment config** (§7) — `/job_site/deploy_root_plan.md`, `/job_site/pages_deployment_spec.md`, `wrangler.toml` if baseline-declared.
- **Module graph surfaces** (§8) — `package.json` and `tsconfig.json` for every workspace member (`packages/*` and `apps/*`), plus any root workspace manifest required by the declared workspace tool.

### 1.2 Runtime-critical dependency edges (IN SCOPE)

Every edge listed in `/job_site/runtime_dependency_inventory.md` §2–§4 is IN SCOPE:

- **INT-P** edges (existing chassis package → package / app → package) — must remain resolvable after `package.json` manifests are added.
- **INT-A** edges (deploy app → chassis package) — the 10 declared edges in §3.1 must all be resolvable at build time.
- **INT-F** edges (Pages Functions → chassis package / Pages Functions → `_lib`) — the 12 declared edges in §3.2 must all be resolvable at build time.
- **HTTP** edges (deploy app ↔ Pages Functions) — the 2 declared edges in §3.3 must be routed via `public/_redirects` and `functions/api/`.
- **EXT-A / EXT-F** edges — all build-sheet-declared tooling (TypeScript, Vite, React JSX runtime, Pages Functions runtime) and all baseline-archive-declared externals are IN SCOPE for S2 pinning.

### 1.3 Module and admin parity surfaces (IN SCOPE)

Carried forward from RB-INT-CHASSIS-001 where Gateway Production Freeze declares them as runtime-essential for the identical working copy:

- **payme admin module** — modules, routes, touchpoints, mounts, transport, proof surfaces.
- **referral admin module** — modules, routes, touchpoints, mounts, transport, proof surfaces.
- **product-shell** operator-shell (CLI) and web-public (API) shell layout bindings.
- **runtime-bridge** admin bridge activation contract.
- **session-transport** admin session transport contract.

Parity mechanism is per chassis law — chassis-native rebuild only. No gateway-specific IDs, registries, or resolver logic are copied in.

### 1.4 Runtime and support surfaces (IN SCOPE, per S4 boundary)

Every baseline surface that Worker A S1 matrix classifies as MISSING or REBUILT_ELSEWHERE in the runtime, production-support, or resolver-boundary categories is IN SCOPE for S4 parity closure. Exact enumeration is frozen by `/job_site/missing_surface_matrix.yaml`.

### 1.5 Build and deployment verification (IN SCOPE)

- Install succeeds from the declared deploy root.
- Build succeeds from the declared deploy root and emits the declared output directory.
- Cloudflare Pages readiness passes against the declared deploy root, build command, output directory, redirects, functions directory, and public asset directory.
- Artifacts listed in S5 required_stage_artifacts are all present.

---

## 2. OUT OF SCOPE — Parity Not Required

### 2.1 Chassis law redesign (OUT OF SCOPE)

Explicitly forbidden by build sheet §operator_notes and by `packages/contracts-core/` chassis boundary:

- No new `SURFACE_IDS` beyond those already declared in `packages/contracts-core/src/chassis/domain.ts`.
- No new `SHELL_OWNER_IDS`.
- No new install chain gate; `INSTALL_CHAIN_GATES` closed set is not expanded.
- No new `CONSUMPTION_POINTS`, `PROOF_KINDS`, or `FAILURE_CODES`.
- No fork or redefinition of any install or lifecycle path.
- No new chassis manifest authority values.
- No new resolver authority; resolver authority remains in `xyz-factory-system/` only.

### 2.2 Verbatim gateway copy (OUT OF SCOPE)

The chassis fragment allowlist in `/job_site/fragment_allowlist.md` (RB-INT-CHASSIS-001) continues to apply:

- No verbatim copy of gateway source files.
- No copy of gateway-specific IDs, registries, manifest authority values, resolver logic, lifecycle policy, component trees, profile constraint overrides, proof harnesses, or production ledger content.
- Only the allowlisted predicate and constant-shape fragments may be carried over, with exact chassis-native rebinding.

### 2.3 Non-baseline parity (OUT OF SCOPE)

- No parity against any non-baseline source.
- No inclusion of baseline surfaces Gateway Production Freeze itself marks as deprecated, vendored-third-party, or test-only unless the build sheet explicitly names them.
- No inclusion of dev-only tooling that is not required to build and deploy (IDE configs, editor settings, OS metadata, shell history, etc.).

### 2.4 Profile derivation (OUT OF SCOPE)

- `MOBILE_OPTIMIZED_PROFILE` and `PC_OPTIMIZED_PROFILE` constraint sets remain empty per WA P3.0. No values are derived from gateway content in this run.
- `FULL_BODY_PROFILE` is the only profile in scope for parity behaviors.

### 2.5 Runtime features beyond baseline (OUT OF SCOPE)

- No new routes, touchpoints, triggers, events, mounts, or modules beyond those required by the baseline parity target.
- No new UI affordances beyond those required by the baseline parity target.
- No backwards-compatibility shims for legacy gateway variants not present in the baseline archive.

### 2.6 Deployment beyond Cloudflare Pages (OUT OF SCOPE)

- Only Cloudflare Pages readiness is part of success criteria.
- Other hosting targets (Vercel, Netlify, Workers-only, static mirrors, CDN mirrors) are not in scope for this run.
- Multi-environment deployments (staging, preview branches, production) beyond what the baseline declares are out of scope.

---

## 3. CONDITIONAL — Resolved in S2

The following surfaces are declared conditional in S1 and must be resolved in S2 before S3 execution:

| # | Surface | Resolution document |
|---|---|---|
| 3.1 | Exact deploy root path (`${DEPLOY_ROOT}`) | `/job_site/deploy_root_plan.md` |
| 3.2 | Exact build command and output directory | `/job_site/deploy_root_plan.md` + `/job_site/pages_deployment_spec.md` |
| 3.3 | Lockfile variant (`package-lock.json` / `pnpm-lock.yaml` / `yarn.lock`) | `/job_site/deploy_root_plan.md` (matches baseline) |
| 3.4 | Workspace tool variant (npm / pnpm / yarn) and workspace layout | `/job_site/deploy_root_plan.md` |
| 3.5 | `wrangler.toml` inclusion (baseline-conditional) | `/job_site/pages_deployment_spec.md` |
| 3.6 | `public/_headers` inclusion (baseline-conditional) | `/job_site/pages_deployment_spec.md` |
| 3.7 | Exact external runtime dependency set and version pinning | `/job_site/full_parity_target_path_manifest.yaml` + baseline archive `package.json` |
| 3.8 | Exact SPA fallback and redirect rules | `/job_site/pages_deployment_spec.md` |
| 3.9 | Exact router library and router configuration shape | `/job_site/full_parity_target_path_manifest.yaml` |
| 3.10 | Exact `src/app/` subtree shape (router bootstrap, app bootstrap, layout composition) | `/job_site/full_parity_target_path_manifest.yaml` + `/job_site/full_parity_fragment_allowlist.md` |

Every item above is inside scope of §1 (IN SCOPE); the reference to S2 resolves only its exact form, not whether it is required.

---

## 4. Authority Order (precedence for scope disputes)

If any downstream stage encounters a scope ambiguity, resolve in this order:

1. This parity scope lock document.
2. `/job_site/build-sheet-RB-INT-CHASSIS-002.txt` — stage and artifact declarations.
3. `/job_site/deployability_inventory.md` — deploy-critical surface list.
4. `/job_site/runtime_dependency_inventory.md` — dependency edge list.
5. `/job_site/missing_surface_matrix.yaml` — Worker A parity matrix.
6. `/job_site/factory-manual-v1.11.txt` — run law.
7. `/job_site/worker-execution-manual-v1.1.txt` — worker output law.

This order matches build sheet §run_control and factory manual §20 (Precedence Law).

---

## 5. Scope Lock Assertions (for Foreman B at S1-CP1)

1. Every deploy-critical surface in `/job_site/deployability_inventory.md` has an explicit status (PRESENT, REBUILT_ELSEWHERE, MISSING, DEFERRED_S2, or OUT_OF_SCOPE).
2. Every runtime dependency edge in `/job_site/runtime_dependency_inventory.md` is attributed to either an existing chassis source file, a build-sheet expected-artifact declaration, or an explicit S2 deferral.
3. Every IN-SCOPE item in §1 of this document maps to at least one row in `/job_site/deployability_inventory.md` or one edge in `/job_site/runtime_dependency_inventory.md` or one entry in `/job_site/missing_surface_matrix.yaml`.
4. Every OUT-OF-SCOPE item in §2 is declared such by either the build sheet, the factory manual, the fragment allowlist, the chassis boundary declaration in `packages/contracts-core/`, or the WA P3.0 profile-unresolved ruling.
5. No item in §1 or §2 is asserted by narrative alone; each is traceable to a build-sheet or chassis authority.

If any assertion above cannot be satisfied on checksum review, return PATCH per build sheet §S1-CP1 patch_condition ("any baseline deploy-critical or runtime-critical surface is omitted, ambiguously mapped, or left without an exact status").

---

## 6. Lock Closure

The scope lock is frozen at the completion of S1. Any subsequent change to the declared in-scope or out-of-scope set requires return to Factory Control Interface via ERROR per factory manual §15 Failure Law. No foreman or worker may quietly expand, narrow, or reinterpret this lock during S2–S6 execution.
