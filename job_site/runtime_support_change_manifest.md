# Runtime Support Change Manifest — RB-INT-CHASSIS-002

job_id: RB-INT-CHASSIS-002
stage: S4
pass: runtime support narrow pass
worker: worker_a
authority: record of exact file-system changes made for runtime support surfaces required by the deploy app
source_matrix: /job_site/missing_surface_matrix.yaml
source_manifest: /job_site/full_parity_target_path_manifest.yaml (mapping rule: product-shell/<rel> → apps/product-shell/<rel>)
source_dependency_inventory: /job_site/runtime_dependency_inventory.md (fetched from origin/main)
baseline_source: https://github.com/blackholecapital/gatweay-production-FREEZE (shallow clone at /tmp/baseline-freeze)

---

## 1. Scope Lock (enforced)

This pass creates exactly the runtime support surfaces that satisfy ALL of:

1. Declared `category: runtime_support` in `/job_site/missing_surface_matrix.yaml`.
2. Marked `deploy_critical: yes` in the matrix.
3. Required by the deploy app per `/job_site/runtime_dependency_inventory.md`.
4. Derivable target path under the manifest's declared mapping rule
   (baseline `product-shell/<rel>` → `apps/product-shell/<rel>`).

The single baseline surface meeting all four conditions is:

- baseline_path: `product-shell/src/runtime/` (4 files)
- target_path:   `apps/product-shell/src/runtime/`
- matrix_line:   section A, category `runtime_support`, deploy_critical yes

Everything else is explicitly deferred or out of scope (see §6).

---

## 2. Change Set Summary

| metric | value |
|---|---|
| files created | 4 |
| files modified | 0 |
| files deleted | 0 |
| directories created | 1 |
| total bytes written | 7837 |
| copy method | verbatim byte-for-byte from baseline product-shell/src/runtime/* |

---

## 3. Directory Created

- `apps/product-shell/src/runtime/`

---

## 4. Files Created

| target_path | baseline_path | bytes | action |
|---|---|---|---|
| apps/product-shell/src/runtime/exclusiveTileHydration.ts | product-shell/src/runtime/exclusiveTileHydration.ts | 4107 | create (verbatim) |
| apps/product-shell/src/runtime/publishedClient.ts | product-shell/src/runtime/publishedClient.ts | 1391 | create (verbatim) |
| apps/product-shell/src/runtime/routeContext.ts | product-shell/src/runtime/routeContext.ts | 696 | create (verbatim) |
| apps/product-shell/src/runtime/types.ts | product-shell/src/runtime/types.ts | 1643 | create (verbatim) |

---

## 5. Matrix Classification Update

The 4 files above are transitioned in the change record from `missing` to
`rebuilt` at the declared target paths. The canonical
`/job_site/missing_surface_matrix.yaml` is not rewritten by this pass (scope
lock); this manifest is the change-of-record for Foreman B checksum.

| baseline_path | previous_status | new_status | target_path |
|---|---|---|---|
| product-shell/src/runtime/ | missing | rebuilt | apps/product-shell/src/runtime/ |
| product-shell/src/runtime/exclusiveTileHydration.ts | missing | rebuilt | apps/product-shell/src/runtime/exclusiveTileHydration.ts |
| product-shell/src/runtime/publishedClient.ts | missing | rebuilt | apps/product-shell/src/runtime/publishedClient.ts |
| product-shell/src/runtime/routeContext.ts | missing | rebuilt | apps/product-shell/src/runtime/routeContext.ts |
| product-shell/src/runtime/types.ts | missing | rebuilt | apps/product-shell/src/runtime/types.ts |

---

## 6. Out-of-Scope / Deferred (this pass)

### 6.1 Runtime contracts (already present)

Per `/job_site/runtime_dependency_inventory.md` §2.1, the runtime contracts
(INT-P edges to `packages/contracts-core`, `packages/schema-chassis`,
`packages/validation-chassis`, `packages/lifecycle-chassis`,
`packages/policy-chassis`, `packages/proof-chassis`,
`packages/registry-chassis`, `packages/runtime-bridge`,
`packages/session-transport`) all resolve to chassis packages that are
ALREADY PRESENT in the current rebuild and are NOT declared missing in
`/job_site/missing_surface_matrix.yaml`. No rebuild action is required or
permitted by this pass for these packages.

### 6.2 Session transport (already present)

`packages/session-transport/` exists in the current rebuild with
`src/index.ts`, `src/session-transport-link.ts`, `src/transport-contract.ts`,
`src/transport.contract.ts`. `apps/local-host/src/transport/session-link.ts`
and `apps/local-host/src/transport/index.ts` also exist. Neither is declared
missing in the matrix. No rebuild action is required or permitted.

### 6.3 Route bindings (already handled in S3)

Baseline route bindings for the deploy app are `product-shell/src/app/routes.ts`
and `product-shell/src/app/router.tsx`. Both were recreated in S3 at
`apps/product-shell/src/app/routes.ts` and `apps/product-shell/src/app/router.tsx`
per `/job_site/deploy_surface_change_manifest.md` §4.4. No additional route-
binding work is in scope for this S4 pass.

### 6.4 Bridges (already present)

`packages/runtime-bridge/src/admin-bridge-contract.ts`,
`packages/runtime-bridge/src/bridge-contract.ts`,
`apps/local-host/src/bridge/runtime-bridge.ts`, and
`apps/local-host/src/bridge/admin-bridge.ts` all exist in the current rebuild
and are not declared missing. No rebuild action.

### 6.5 Production support files — deferred

Section F `production_support` entries in `/job_site/missing_surface_matrix.yaml`
(production/README.md, production/compatibility-decision-ledger.md,
production/decision-ledger.md, production/install/*.yaml,
production/manifests/*.yaml, production/pass-*-checkpoint.md,
production/qc/checks/*.md, production/qc/reports/*.md,
production/resolver-decision-ledger.md, production/stale-path-scan.md) are
all marked `deploy_critical: no`. None is required by the deploy app at build
time or at Cloudflare Pages runtime per
`/job_site/runtime_dependency_inventory.md`. No target paths for them are
declared in `/job_site/full_parity_target_path_manifest.yaml`. Deferred to a
later S4 production-support pass (requires a target path manifest extension
first).

### 6.6 Supabase schema SQL files — deferred

Two matrix entries exist with `category: runtime_support` and
`deploy_critical: no`:
- `modules/engage/supabase_schema.sql`
- `engagefi-admin-minimal/supabase_schema.sql`

Both belong to baseline app roots (`modules/engage/`, `engagefi-admin-minimal/`)
that are themselves declared missing and have no declared chassis-native
target path in `/job_site/full_parity_target_path_manifest.yaml`. The parent
directories must be rebuilt before the schema files can have a sensible
target. Deferred.

### 6.7 Other runtime-adjacent src trees — deferred

`product-shell/src/state/demoGateState.tsx` (category `app_state`),
`product-shell/src/runtime/*` is in scope, but sibling dirs
`src/hooks/`, `src/integrations/`, `src/contracts/`, `src/config/`,
`src/components/`, `src/features/`, `src/pages/`, `src/styles/`, `src/utils/`,
`src/mobile/` are NOT category `runtime_support` in the matrix. They are not
in scope for this S4 runtime-support dispatch. Deferred.

---

## 7. Build-Time Impact

Creating `apps/product-shell/src/runtime/*` does not by itself make
`apps/product-shell` buildable. The component tree, pages, features, hooks,
state, styles, and utils imported by `apps/product-shell/src/app/router.tsx`
and `apps/product-shell/src/app/AppShell.tsx` remain missing. The
`../modules/engage` sibling required by the `build:engage` script also remains
missing. Build verification is therefore still OUT OF SCOPE for this S4 pass
and remains deferred to S5.

---

## 8. Repo Mirror / Commit / Push Evidence

| field | value |
|---|---|
| repo_mirror | yes — writes made to working tree at `/home/user/gateway-fullbody-freeze/apps/product-shell/src/runtime/` |
| commit_required | yes |
| push_required | yes |
| branch | claude/inventory-app-structure-Ilqh1 |
| commit_hash | (recorded post-commit; see git log) |
| pushed_to | origin/claude/inventory-app-structure-Ilqh1 |

---

## 9. Checksum Pointers for Foreman B

- Scope lock is enforced: exactly 4 files created, all under the single
  derivable target path `apps/product-shell/src/runtime/`.
- Every file is a byte-for-byte copy of its declared baseline source.
- All other runtime support categories are either (a) already present in the
  current rebuild (§6.1–§6.4), (b) deferred because their target path is not
  declared (§6.5–§6.6), or (c) out of scope per category (§6.7).
- Target path is derived exclusively from the manifest's declared
  chassis_native_mapping_rule (`product-shell/<rel>` → `apps/product-shell/<rel>`).
  No target path is invented.
