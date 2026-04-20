# Full Parity Rebuild Order — RB-INT-CHASSIS-002

job_id: RB-INT-CHASSIS-002
stage: S2
stage_name: deployable parity blueprint freeze
owner: Worker B
pass_scope: partial — deploy app only (no module or admin surfaces in this pass)
authority: non-authoritative — derived from /job_site/build-sheet-RB-INT-CHASSIS-002.txt S3 worker_a expected_artifacts, /job_site/deployability_inventory.md, and /job_site/pages_deployment_spec.md
document_role: Declare the ordered sequence of files to rebuild the deploy app in a single Cloudflare-Pages-deployable shape, with no file preceding its declared dependencies. Exact file content is not declared here; content is the S3 execution scope.

---

## 0. Pass Scope

This rebuild order covers **only** the deploy app files under the declared deploy root `/` (repo root):

- deploy-app build configuration that is narrow-scope to this pass (`/vite.config.ts` only)
- HTML entry (`/index.html`)
- script entry (`/src/main.tsx`)
- app root directory (`/src/app/`)
- public assets directory (`/public/`)
- static routing file (`/public/_redirects`)
- functions directory scaffolding (`/functions/`, `/functions/api/`, `/functions/_lib/`)

Explicitly **out of scope** for this pass:

- `/package.json`, `/package-lock.json` (or lockfile variant) — deferred to the workspace-and-manifest pass
- `/tsconfig.json`, `/tsconfig.node.json` — deferred to the workspace-and-tsconfig pass
- `/packages/*/package.json`, `/packages/*/tsconfig.json` — deferred to the module graph pass
- `/apps/*/package.json`, `/apps/*/tsconfig.json` — deferred to the module graph pass
- Any admin, module, runtime-support, resolver-support, or proof surface — deferred to later passes
- Handler content inside `/functions/api/*` and helper content inside `/functions/_lib/*` — directory scaffolding only in this pass; handler content is a later pass
- `/src/app/*` component internals — directory and placeholder root file only in this pass; content is S3 execution
- Fragment allowlist authority — not produced in this pass

Every phase below assumes the deferred items are **declared but not yet written**. Any file in this rebuild order that imports from a deferred surface MUST treat that import as a forward reference and MUST fail-closed if the forward reference is not resolved by S3 execution time.

---

## 1. Chassis Boundary Rules (carried forward from RB-INT-CHASSIS-001 §rebuild_execution_order.md)

The following boundaries apply to every phase in this pass:

1. **Deploy-root purity** — no file may be written outside the declared deploy root `/` (repo root) by this pass.
2. **No chassis redesign** — no file in `/packages/*` or `/apps/*` is modified by this pass.
3. **Additive only** — every file written by this pass is net-new. No existing file in the repo is modified.
4. **No undeclared import** — every import in every new file must resolve to either (a) a declared deferred surface (pinned in a later pass), (b) an existing chassis file, (c) an external dependency named by a baseline-declared tooling family (TypeScript, Vite, React JSX runtime, Pages Functions runtime).
5. **No gateway copy outside allowlist** — no verbatim gateway source file is copied. Only fragment-shaped copies are permitted, and only under the RB-INT-CHASSIS-001 `/job_site/fragment_allowlist.md` until the RB-INT-CHASSIS-002 allowlist is produced in a later pass.
6. **Forward-reference fail-closed** — if any Phase below references a deferred surface, the Phase must not silently substitute a default; the deferred surface is pinned in the later pass.

---

## 2. Pre-Execution Check (runs once before Phase 1)

Before Phase 1 begins, confirm:

- `/job_site/deployability_inventory.md` is present and readable.
- `/job_site/pages_deployment_spec.md` is present and readable.
- The declared deploy root `/` exists and is writable.
- No file named in §3–§9 below already exists at its declared path.
- The existing chassis tree (`/apps/`, `/packages/`, `/xyz-factory-system/`, `/worker-wb/`, `/job_site/`) is untouched.

If any check fails: STOP and return PATCH to Foreman A. Do not begin Phase 1 with a partial precondition.

---

## 3. Phase 1 — Vite Build Config

**Files in scope:**

- `/vite.config.ts`

**Depends on:** none.

**Must precede:** every other phase in this pass.

**Rationale:** Vite config is the single source of truth for `build.outDir`, plugin set, resolver aliases, and public directory location. All subsequent phases (HTML entry, script entry, public assets, functions) reference values that are ultimately materialized by Vite. Declaring `vite.config.ts` first pins those values for every downstream phase.

**Write constraints:**

- MUST declare `root = '.'` (repo root) explicitly or rely on the Vite default when CWD is the repo root.
- MUST declare `build.outDir = 'dist'` consistent with `/job_site/pages_deployment_spec.md` §3.
- MUST declare `publicDir = 'public'` consistent with `/job_site/pages_deployment_spec.md` §4.1.
- MUST NOT declare any plugin beyond what is required by the React JSX runtime and TypeScript declared in `/job_site/runtime_dependency_inventory.md` §4.1 (plugins beyond that set are deferred).
- MUST NOT declare resolver aliases to `/packages/*` or `/apps/*` in this pass — chassis module graph resolution is deferred to the workspace-and-manifest pass.
- `tsconfig.json` and `tsconfig.node.json` are deferred; `vite.config.ts` MAY run in this pass via `.ts` loading only if the deferred tsconfigs are pinned first in a subsequent pass. If S3 execution of this Phase requires tsconfigs to be present, Phase 1 is blocked and the block is reported as a PATCH back to Foreman A.

**Forward-reference pins declared here:**

- `build.outDir = 'dist'`
- `publicDir = 'public'`
- `base = '/'` (default, declared for clarity)

**Handoff at end of Phase 1:** `vite.config.ts` exists at `/vite.config.ts` and declares the three pins above.

---

## 4. Phase 2 — HTML Entry

**Files in scope:**

- `/index.html`

**Depends on:** Phase 1 (`build.outDir`, `publicDir`, `base` declared).

**Must precede:** Phase 3 (script entry), Phase 4 (app root), Phase 5 (public assets consumed by HTML references).

**Write constraints:**

- MUST include a `<script type="module" src="/src/main.tsx"></script>` reference (Vite script entry convention).
- MUST NOT inline any JavaScript. All JavaScript is loaded from `/src/main.tsx`.
- MUST NOT reference any asset path that is not produced by Vite or by `/public/`.
- MUST contain a single root element `<div id="root"></div>` that `/src/main.tsx` will mount into.
- MUST NOT declare `<link>` imports for any CSS framework that is not declared in baseline — CSS stack declarations are deferred to a later pass.
- MUST NOT reference `/functions/*` by URL. Any API calls the app makes are declared in `/src/app/*` code in Phase 4, not in `/index.html`.

**Handoff at end of Phase 2:** `/index.html` exists, references `/src/main.tsx`, mounts into `#root`.

---

## 5. Phase 3 — Script Entry

**Files in scope:**

- `/src/main.tsx`

**Depends on:** Phase 1 (Vite config), Phase 2 (HTML `#root` element), Phase 4 declaration of `/src/app/` directory (forward — `main.tsx` imports the app root component whose file is created in Phase 4).

**Must precede:** Phase 4 file writes (but not Phase 4 directory declaration).

**Sequencing note:** Phase 3 and Phase 4 are tightly coupled. The correct execution order is:

1. Declare and create the `/src/app/` directory (empty shell).
2. Write the Phase 4 app root placeholder file.
3. Write Phase 3 `/src/main.tsx` importing the Phase 4 placeholder.

The directory creation in step 1 is a Phase 4 side effect; it is listed here only to make the coupling explicit.

**Write constraints:**

- MUST import the React JSX runtime using the module specifier declared by the React dependency family in `/job_site/runtime_dependency_inventory.md` §4.1.3.
- MUST mount into `document.getElementById('root')` (the element declared in Phase 2).
- MUST import the Phase 4 app root from `./app/<app-root-file>` (exact file name declared in Phase 4).
- MUST NOT import from `/packages/*` directly. Chassis imports are deferred to the module graph pass; this pass declares a root-only SPA skeleton.
- MUST NOT import from `/functions/*` — SPA source and Functions source are disjoint per `/job_site/pages_deployment_spec.md` §5.2.

**Handoff at end of Phase 3:** `/src/main.tsx` exists, imports the Phase 4 app root, and mounts a minimal React tree into `#root`.

---

## 6. Phase 4 — App Root Directory

**Files in scope:**

- `/src/app/` directory
- `/src/app/<app-root-file>` placeholder — exact file name selected in Phase 4 execution (default candidate: `App.tsx`)

**Depends on:** Phase 1 (Vite resolver; tsx/jsx support).

**Must precede:** Phase 3 write (Phase 3 imports this file).

**Write constraints:**

- `/src/app/` MUST be created as a directory, not as a file.
- A single placeholder component file is written inside `/src/app/` whose shape is:
  - default-exports or named-exports a React component (name `App` by convention).
  - returns a minimal JSX tree (e.g., a single root element).
- No router, layout, providers, or chassis imports are declared in this pass. The placeholder is a syntactic shell only; router and chassis wiring are deferred to the module graph pass and to the router pass.
- The placeholder file's name MUST match the import specifier used in `/src/main.tsx`. If the placeholder is renamed, `/src/main.tsx` MUST be updated in the same S3 execution step.

**Out-of-scope in Phase 4:**

- Router bootstrap (`/src/app/router.tsx` or equivalent) — deferred.
- Layout composition (`/src/app/layout/*`) — deferred.
- Provider composition (state, query, theme providers) — deferred.
- Any import from `/packages/*` or `/apps/*` — deferred.

**Handoff at end of Phase 4:** `/src/app/` exists as a directory with exactly one placeholder component file that `/src/main.tsx` imports successfully.

---

## 7. Phase 5 — Public Assets Directory

**Files in scope:**

- `/public/` directory
- `/public/_redirects`

**Depends on:** Phase 1 (`publicDir` declaration pin).

**Must precede:** Phase 6 may proceed in parallel.

**Write constraints for `/public/`:**

- `/public/` MUST be created as a directory.
- No static asset files (`favicon.ico`, images, fonts, etc.) are written in this pass. Asset population is deferred to the baseline-pin pass.

**Write constraints for `/public/_redirects`:**

- Content MUST be exactly the canonical rule declared in `/job_site/pages_deployment_spec.md` §4.2:
  ```
  /*    /index.html   200
  ```
- MUST NOT include any rule beyond the canonical line above. Additional rules require baseline-archive evidence and are deferred.
- MUST NOT match or rewrite `/api/*`. Functions routing is authoritative for that namespace per `/job_site/pages_deployment_spec.md` §4.3.
- MUST NOT match or rewrite `/assets/*`. Static asset paths are served as real files.
- File is UTF-8, LF line endings, no BOM.

**Handoff at end of Phase 5:** `/public/` exists as a directory with exactly `/public/_redirects` containing the canonical SPA fallback rule.

---

## 8. Phase 6 — Functions Directory Scaffolding

**Files in scope:**

- `/functions/` directory
- `/functions/api/` directory
- `/functions/_lib/` directory

**Depends on:** Phase 1 (for `build.outDir` pin so that no handler is accidentally emitted into `/dist/`).

**Must NOT precede:** Phase 5 is not strictly required to precede Phase 6; Phases 5 and 6 may proceed in parallel once Phase 1 is complete.

**Write constraints:**

- Each directory MUST be created as a directory, not as a file.
- No handler file is written under `/functions/api/` in this pass. Handler content is a later pass.
- No helper file is written under `/functions/_lib/` in this pass. Helper content is a later pass.
- Directories MUST NOT contain a gitkeep, README, or placeholder file unless the Pages Functions runtime requires a marker file to recognize the directory. If a marker is required by Pages Functions, the marker file is an empty (0-byte) `.gitkeep` or equivalent and is the only file permitted inside the directory in this pass.
- No file in `/functions/` may import from `/src/*` or vice versa.

**Handoff at end of Phase 6:** `/functions/`, `/functions/api/`, and `/functions/_lib/` exist as empty directories (or contain only the minimal marker file per Pages requirements).

---

## 9. Phase 7 — Deploy App Closure Check

**Files in scope:** none written; verification only.

**Depends on:** Phases 1–6 complete.

**Verification steps:**

1. Confirm every path in `/job_site/pages_deployment_spec.md` §1.2 exists at the declared absolute location.
2. Confirm `/public/_redirects` content equals the canonical rule in `/job_site/pages_deployment_spec.md` §4.2 exactly.
3. Confirm `/functions/api/` and `/functions/_lib/` exist as directories.
4. Confirm `/src/main.tsx` imports `/src/app/<app-root-file>` successfully (syntactic check — full type-checking is deferred to the tsconfig pass).
5. Confirm no file outside the declared deploy root was modified by this pass (diff the chassis tree against its pre-pass state).
6. Confirm no file inside `/packages/*` or `/apps/*` was modified by this pass.

**On pass:** Phase 7 emits a PASS handoff to the next Worker B pass (workspace + module graph).

**On fail:** Phase 7 emits a PATCH naming the exact file and exact failed check. Do not attempt remediation in Phase 7 — return to the originating phase.

---

## 10. Dependency Matrix

| Phase | Produces | Depends on | May be parallel with |
|---|---|---|---|
| 1 — Vite config | `/vite.config.ts` | nothing | — |
| 2 — HTML entry | `/index.html` | 1 | — |
| 3 — Script entry | `/src/main.tsx` | 1, 2, 4 placeholder | — |
| 4 — App root | `/src/app/`, app-root placeholder | 1 | — |
| 5 — Public assets | `/public/`, `/public/_redirects` | 1 | 6 |
| 6 — Functions dirs | `/functions/`, `/functions/api/`, `/functions/_lib/` | 1 | 5 |
| 7 — Closure check | verification only | 1–6 | — |

Sequential baseline: 1 → (4 → 3) → 2 → (5 ‖ 6) → 7. Phase 2 may begin as soon as Phase 1 is complete; Phase 3 may begin as soon as both Phase 1 and Phase 4 (placeholder) are complete. If Phase 4's placeholder file name is known in advance, Phase 3 and Phase 4 may be written in the same S3 execution block without violating dependency order.

---

## 11. Forbidden Actions During This Pass

- Creating or modifying `/package.json` at any level.
- Creating or modifying any `tsconfig*.json` at any level.
- Creating or modifying any file under `/packages/*` or `/apps/*` or `/xyz-factory-system/*` or `/worker-wb/*`.
- Writing handler content under `/functions/api/*`.
- Writing helper content under `/functions/_lib/*`.
- Writing any static asset file under `/public/*` other than `/public/_redirects`.
- Declaring a router, layout, provider, or chassis import inside `/src/app/*`.
- Copying verbatim any gateway source file.
- Declaring any Vite plugin beyond the React JSX runtime.
- Declaring any resolver alias in `/vite.config.ts`.
- Declaring any rule in `/public/_redirects` beyond the canonical SPA fallback.

Any forbidden action encountered during S3 execution MUST be flagged as a PATCH back to Foreman A, not silently applied.

---

## 12. Checksum Pointers for Foreman B

- Every file declared in §3–§8 maps to a row in `/job_site/deployability_inventory.md` §3–§6 and to a field in `/job_site/pages_deployment_spec.md` §1.2.
- Every dependency arrow in §10 is traceable to a write-constraint section above.
- Every out-of-scope item in §0 and §11 is also declared deferred in `/job_site/pages_deployment_spec.md` §1.2, §2.2, or §5.3.
- No file in this rebuild order invents a path, a plugin, or a rule that is not declared in the deployment spec or the deployability inventory.
- Module, admin, package-manifest, and runtime-support surfaces are not referenced in any Phase and are not implied by any dependency arrow.
