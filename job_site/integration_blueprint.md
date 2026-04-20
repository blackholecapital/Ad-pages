# Integration Blueprint — RB-INT-CHASSIS-001
## Stage: S2 — Integration Blueprint Freeze
## Worker: Worker A
## Authority: non-authoritative — downstream only

---

## 1. Scope Declaration

This blueprint converts the S1 parity map into exact chassis-native target paths for the following gateway behaviors:

- **product-shell** → operator-shell (CLI surface) and web-public (API surface) shell layout extension
- **payme-admin-minimal** → chassis-native payme admin module, routes, touchpoints, mounts, and transport
- **referral-admin-minimal** → chassis-native referral admin module, routes, touchpoints, mounts, and transport
- **production ledgers** → install record artifacts (already present at xyz-factory-system/stage-6-software/production/; no new paths required)
- **resolver-boundary materials** → install stamp and resolver output contracts (already present; no new contract shapes required)

All new entities land on existing chassis surfaces. No new SURFACE_IDS or SHELL_OWNER_IDS are declared. The chassis authority boundary is not redesigned.

---

## 2. Runtime Contracts

**Upstream authority**: `xyz-factory-system/invariants/chassis/`
**Target package**: `packages/contracts-core/`

### 2.1 Domain Extensions

**Target file**: `packages/contracts-core/src/chassis/domain.ts`
**Action**: EXTEND — append new ID sets only; do not remove or reorder existing entries

New entries required:

#### MODULE_IDS additions
```
PAYME_ADMIN:    "mod.payme.admin"
REFERRAL_ADMIN: "mod.referral.admin"
```

#### ROUTE_IDS additions
```
PAYME_ADMIN:    "rt.payme.admin"     — surface: sf.api.factory
REFERRAL_ADMIN: "rt.referral.admin"  — surface: sf.api.factory
```

#### TOUCHPOINT_IDS additions
```
CLI_PAYME_ADMIN:    "tp.cli.payme.admin"    — surface: sf.cli.factory (operator-shell)
CLI_REFERRAL_ADMIN: "tp.cli.referral.admin" — surface: sf.cli.factory (operator-shell)
API_PAYME_ADMIN:    "tp.api.payme.admin"    — surface: sf.api.factory (web-public)
API_REFERRAL_ADMIN: "tp.api.referral.admin" — surface: sf.api.factory (web-public)
```

#### TRIGGER_IDS additions
```
PAYME_ADMIN:    "trg.payme.admin"
REFERRAL_ADMIN: "trg.referral.admin"
```

#### EVENT_IDS additions
```
PAYME_ADMIN_REQUESTED:    "evt.payme.admin.requested"
PAYME_ADMIN_COMPLETED:    "evt.payme.admin.completed"
PAYME_ADMIN_FAILED:       "evt.payme.admin.failed"
REFERRAL_ADMIN_REQUESTED: "evt.referral.admin.requested"
REFERRAL_ADMIN_COMPLETED: "evt.referral.admin.completed"
REFERRAL_ADMIN_FAILED:    "evt.referral.admin.failed"
```

#### No new SURFACE_IDS
`sf.api.factory` (existing) is the surface for all new payme-admin and referral-admin entities.
`sf.cli.factory` (existing) is the surface for all new CLI admin mounts.

### 2.2 Profile Compatibility Coverage

**Target file**: `packages/contracts-core/src/profiles/compatibility-map.ts`
**Action**: EXTEND — add new IDs to `FULL_BODY_PROFILE` allowed buckets only

Required additions to `FULL_BODY_PROFILE`:
- `routes.allowed`: add `ROUTE_IDS.PAYME_ADMIN`, `ROUTE_IDS.REFERRAL_ADMIN`
- `touchpoints.allowed`: add all 4 new TOUCHPOINT_IDS
- `mounts.allowed`: add all 4 new TOUCHPOINT_IDS (mount eligibility keyed by touchpoint ID)

Maintenance rule applies: new IDs must enter `FULL_BODY_PROFILE.allowed` in the same commit they enter `domain.ts`.

`MOBILE_OPTIMIZED_PROFILE` and `PC_OPTIMIZED_PROFILE` remain empty (unresolved derivation; no values invented here).

### 2.3 Contract Shape Files — No Change
Existing contract interfaces (`Route`, `Surface`, `Touchpoint`, `Trigger`, `Event`, `Module`, `InstallStamp`, `ResolverOutput`) are sufficient for all new entities. No new `.contract.ts` files are required in `packages/contracts-core/src/chassis/`.

---

## 3. Registries

**Upstream authority**: `xyz-factory-system/invariants/chassis/registry/`
**Target package**: `packages/registry-chassis/src/`
**Authority reminder**: registry package provides lookup only; it does not confer registration authority

### 3.1 Module Registry

**Target file**: `packages/registry-chassis/src/module-registry.ts`
**Action**: EXTEND — add two entries to the internal `entries` array

```
{ module_id: "mod.payme.admin",    lifecycle_state: "installed", registry_state: "registered" }
{ module_id: "mod.referral.admin", lifecycle_state: "installed", registry_state: "registered" }
```

### 3.2 Route Registry

**Target file**: `packages/registry-chassis/src/route-registry.ts`
**Action**: EXTEND — add two entries to the internal `entries` array

```
{ route_id: "rt.payme.admin",    surface_id: "sf.api.factory", registry_state: "registered" }
{ route_id: "rt.referral.admin", surface_id: "sf.api.factory", registry_state: "registered" }
```

### 3.3 Trigger Registry

**Target file**: `packages/registry-chassis/src/trigger-registry.ts`
**Action**: EXTEND — add two entries to the internal `entries` array

```
{ trigger_id: "trg.payme.admin",    registry_state: "registered" }
{ trigger_id: "trg.referral.admin", registry_state: "registered" }
```

### 3.4 Event Registry

**Target file**: `packages/registry-chassis/src/event-registry.ts`
**Action**: EXTEND — add six entries to the internal `entries` array

```
{ event_id: "evt.payme.admin.requested",    registry_state: "registered" }
{ event_id: "evt.payme.admin.completed",    registry_state: "registered" }
{ event_id: "evt.payme.admin.failed",       registry_state: "registered" }
{ event_id: "evt.referral.admin.requested", registry_state: "registered" }
{ event_id: "evt.referral.admin.completed", registry_state: "registered" }
{ event_id: "evt.referral.admin.failed",    registry_state: "registered" }
```

### 3.5 Surface Registry — No Change

`sf.api.factory` and `sf.cli.factory` already cover all new entities. No new surface entries required.

### 3.6 Registry Barrel Export — No Change

**File**: `packages/registry-chassis/src/index.ts` — no new lookup functions required; existing `lookupModule`, `lookupRoute`, `lookupTrigger`, `lookupEvent` functions serve the new entries.

---

## 4. Routes

**Target app**: `apps/core-runtime/src/routes/`

### 4.1 New Route Files — CREATE

**Target file**: `apps/core-runtime/src/routes/payme-admin.route.ts`
**Action**: CREATE
**Content contract**: Export `PAYME_ADMIN_ROUTE: Route` with `route_id: ROUTE_IDS.PAYME_ADMIN`, `surface_id: SURFACE_IDS.API_FACTORY`, `registry_state: REGISTRY_STATES.REGISTERED`

**Target file**: `apps/core-runtime/src/routes/referral-admin.route.ts`
**Action**: CREATE
**Content contract**: Export `REFERRAL_ADMIN_ROUTE: Route` with `route_id: ROUTE_IDS.REFERRAL_ADMIN`, `surface_id: SURFACE_IDS.API_FACTORY`, `registry_state: REGISTRY_STATES.REGISTERED`

### 4.2 Route Barrel — EXTEND

**Target file**: `apps/core-runtime/src/routes/index.ts`
**Action**: EXTEND — add named exports for `PAYME_ADMIN_ROUTE` and `REFERRAL_ADMIN_ROUTE`

### 4.3 Route Proof Surface — EXTEND

**Target file**: `apps/core-runtime/src/routes/proof.ts`
**Action**: EXTEND — add `PAYME_ADMIN_ROUTE` and `REFERRAL_ADMIN_ROUTE` to the `ROUTES` array
**Result**: Two additional `ProofResult` pairs (validation + compatibility) per new route, emitted from `routeProofs()`
**Consumption point**: `CONSUMPTION_POINTS.ROUTE_LAYER` (unchanged)

---

## 5. Touchpoints

**Target app**: `apps/core-runtime/src/touchpoints/`

### 5.1 New Touchpoint Files — CREATE

**Target file**: `apps/core-runtime/src/touchpoints/payme-admin.touchpoint.ts`
**Action**: CREATE
**Content contract**: Export `PAYME_ADMIN_TOUCHPOINT: Touchpoint` with `touchpoint_id: TOUCHPOINT_IDS.API_PAYME_ADMIN`, `surface_id: SURFACE_IDS.API_FACTORY`. Export `PAYME_ADMIN_EVENTS: TouchpointEventRefs` referencing `EVENT_IDS.PAYME_ADMIN_REQUESTED`, `PAYME_ADMIN_COMPLETED`, `PAYME_ADMIN_FAILED`.

**Target file**: `apps/core-runtime/src/touchpoints/referral-admin.touchpoint.ts`
**Action**: CREATE
**Content contract**: Export `REFERRAL_ADMIN_TOUCHPOINT: Touchpoint` with `touchpoint_id: TOUCHPOINT_IDS.API_REFERRAL_ADMIN`, `surface_id: SURFACE_IDS.API_FACTORY`. Export `REFERRAL_ADMIN_EVENTS: TouchpointEventRefs` referencing the three referral event IDs.

### 5.2 Touchpoint Barrel — EXTEND

**Target file**: `apps/core-runtime/src/touchpoints/index.ts`
**Action**: EXTEND — add named exports for `PAYME_ADMIN_TOUCHPOINT`, `PAYME_ADMIN_EVENTS`, `REFERRAL_ADMIN_TOUCHPOINT`, `REFERRAL_ADMIN_EVENTS`

### 5.3 Touchpoint Proof Surface — EXTEND

**Target file**: `apps/core-runtime/src/touchpoints/proof.ts`
**Action**: EXTEND — add `PAYME_ADMIN_TOUCHPOINT` and `REFERRAL_ADMIN_TOUCHPOINT` to the `TOUCHPOINTS` array
**Result**: Two additional `ProofResult` pairs per new touchpoint from `touchpointProofs()`
**Consumption point**: `CONSUMPTION_POINTS.TOUCHPOINT_LAYER` (unchanged)

---

## 6. Shell Mounts

### 6.1 Operator-Shell Mounts — CLI Surface (product-shell behaviors)

**Target directory**: `apps/operator-shell/src/mounts/`

**Target file**: `apps/operator-shell/src/mounts/payme-admin.mount.ts`
**Action**: CREATE
**Content contract**: Export `PAYME_ADMIN_MOUNT: Touchpoint` with `touchpoint_id: TOUCHPOINT_IDS.CLI_PAYME_ADMIN`, `surface_id: SURFACE_IDS.CLI_FACTORY`. Export `isMountAuthorized(): boolean` returning `PAYME_ADMIN_MOUNT.surface_id === SURFACE_IDS.CLI_FACTORY`.

**Target file**: `apps/operator-shell/src/mounts/referral-admin.mount.ts`
**Action**: CREATE
**Content contract**: Export `REFERRAL_ADMIN_MOUNT: Touchpoint` with `touchpoint_id: TOUCHPOINT_IDS.CLI_REFERRAL_ADMIN`, `surface_id: SURFACE_IDS.CLI_FACTORY`. Export `isMountAuthorized(): boolean` returning `REFERRAL_ADMIN_MOUNT.surface_id === SURFACE_IDS.CLI_FACTORY`.

**Target file**: `apps/operator-shell/src/mounts/index.ts`
**Action**: EXTEND — add named exports for `PAYME_ADMIN_MOUNT` and `REFERRAL_ADMIN_MOUNT`

**Target file**: `apps/operator-shell/src/mounts/proof.ts`
**Action**: EXTEND — add `PAYME_ADMIN_MOUNT` and `REFERRAL_ADMIN_MOUNT` to the `OPERATOR_SHELL_MOUNTS` array, consuming `isMountAuthorized` from each
**Result**: Two additional `ProofResult` pairs per new mount from `operatorMountProofs()`

### 6.2 Operator-Shell Layout — EXTEND (product-shell panel reference)

**Target file**: `apps/operator-shell/src/app/layout/shell.layout.ts`
**Action**: EXTEND — add `PAYME_ADMIN_PANEL` and `REFERRAL_ADMIN_PANEL` configuration entries to the shell config object, referencing the CLI admin touchpoints; no change to `SHELL_CONFIG.shell_id` or `SHELL_CONFIG.surface_id`

### 6.3 Web-Public Mounts — API Surface (embedded admin panels)

**Target directory**: `apps/web-public/src/mounts/`

**Target file**: `apps/web-public/src/mounts/payme-admin.mount.ts`
**Action**: CREATE
**Content contract**: Export `PAYME_ADMIN_MOUNT: Touchpoint` with `touchpoint_id: TOUCHPOINT_IDS.API_PAYME_ADMIN`, `surface_id: SURFACE_IDS.API_FACTORY`. Export `isMountAuthorized(): boolean` returning `PAYME_ADMIN_MOUNT.surface_id === SURFACE_IDS.API_FACTORY`.

**Target file**: `apps/web-public/src/mounts/referral-admin.mount.ts`
**Action**: CREATE
**Content contract**: Export `REFERRAL_ADMIN_MOUNT: Touchpoint` with `touchpoint_id: TOUCHPOINT_IDS.API_REFERRAL_ADMIN`, `surface_id: SURFACE_IDS.API_FACTORY`. Export `isMountAuthorized(): boolean` returning `REFERRAL_ADMIN_MOUNT.surface_id === SURFACE_IDS.API_FACTORY`.

**Target file**: `apps/web-public/src/mounts/index.ts`
**Action**: EXTEND — add named exports for `PAYME_ADMIN_MOUNT` and `REFERRAL_ADMIN_MOUNT`

**Target file**: `apps/web-public/src/mounts/proof.ts`
**Action**: EXTEND — add `PAYME_ADMIN_MOUNT` and `REFERRAL_ADMIN_MOUNT` to the `WEB_PUBLIC_MOUNTS` array, consuming `isMountAuthorized` from each
**Result**: Two additional `ProofResult` pairs per new mount from `webPublicMountProofs()`

### 6.4 Web-Public Layout — EXTEND (embedded admin panel surface binding)

**Target file**: `apps/web-public/src/app/layout/shell.layout.ts`
**Action**: EXTEND — add `PAYME_ADMIN_PANEL` and `REFERRAL_ADMIN_PANEL` configuration entries to the shell config object, referencing the API admin touchpoints; no change to `SHELL_CONFIG.shell_id` or `SHELL_CONFIG.surface_id`

---

## 7. Transport Links

### 7.1 Session Transport Package — CREATE (new package)

**Target directory**: `packages/session-transport/src/` (new package; does not currently exist)

**Target file**: `packages/session-transport/src/transport.contract.ts`
**Action**: CREATE
**Content contract**:
- `SessionTransportState` interface: `readonly bridge_ready: boolean`, `readonly activation_eligible: boolean`, `readonly admin_panels_registered: boolean`
- `SessionTransportConfig` interface: `readonly session_id: string`, `readonly transport_state: SessionTransportState`
- Downstream status: non-authoritative — consumes declared contracts only
- No resolver authority; no install path override

**Target file**: `packages/session-transport/src/session-transport-link.ts`
**Action**: CREATE
**Content contract**:
- Import `SessionTransportConfig` from `./transport.contract.js`
- Export `isTransportReady(config: SessionTransportConfig): boolean` — returns `config.transport_state.bridge_ready && config.transport_state.activation_eligible && config.transport_state.admin_panels_registered`
- Explicit note: this check is additive to the install chain; it is NOT a gate in `INSTALL_CHAIN_GATES` and must not be added there

**Target file**: `packages/session-transport/src/index.ts`
**Action**: CREATE
**Content contract**: Barrel export — re-export `SessionTransportState`, `SessionTransportConfig` from `./transport.contract.js`; re-export `isTransportReady` from `./session-transport-link.js`

### 7.2 Runtime Bridge — Admin Bridge Contract (new file in existing package)

**Target file**: `packages/runtime-bridge/src/admin-bridge-contract.ts`
**Action**: CREATE
**Content contract**:
- Import `InstallStamp` from `../../contracts-core/src/chassis/install-stamp.contract.js`
- Import `STAMP_STATES` from `../../contracts-core/src/chassis/domain.js`
- Export `AdminBridgeState` interface: `readonly install_stamp: InstallStamp`, `readonly payme_admin_registered: boolean`, `readonly referral_admin_registered: boolean`
- Export `isAdminBridgeActivatable(state: AdminBridgeState): boolean` — returns `state.install_stamp.stamp_state === STAMP_STATES.ISSUED && state.payme_admin_registered && state.referral_admin_registered`
- Downstream status: non-authoritative — pass-through only; no resolver authority

**Target file**: `packages/runtime-bridge/src/index.ts`
**Action**: EXTEND — add exports for `AdminBridgeState` and `isAdminBridgeActivatable` from `./admin-bridge-contract.js`

### 7.3 Local-Host Admin Bridge (new file in existing app)

**Target file**: `apps/local-host/src/bridge/admin-bridge.ts`
**Action**: CREATE
**Content contract**:
- Import `InstallStamp` from `../../../../packages/contracts-core/src/chassis/install-stamp.contract.js`
- Import `STAMP_STATES` from `../../../../packages/contracts-core/src/chassis/domain.js`
- Export `AdminBridgeConfig` interface: `readonly install_stamp: InstallStamp`, `readonly production_install_verified: boolean`, `readonly payme_admin_mount_ready: boolean`, `readonly referral_admin_mount_ready: boolean`
- Export `isAdminBridgeReady(config: AdminBridgeConfig): boolean` — returns all four conditions: stamp issued, production install verified, both admin mounts ready
- Downstream status: non-authoritative — bridge only; no resolver authority

**Target file**: `apps/local-host/src/bridge/index.ts`
**Action**: EXTEND — add exports for `AdminBridgeConfig` and `isAdminBridgeReady` from `./admin-bridge.js`

### 7.4 Local-Host Transport — No Change

**File**: `apps/local-host/src/transport/session-link.ts` — `isSessionLinkAvailable` remains as-is. The new `packages/session-transport/` package is the chassis-level transport contract; `session-link.ts` is the app-level implementation and is unmodified.

---

## 8. Proof Surfaces — Summary

The proof surface additions are fully specified in the sections above. This section provides the complete listing for S4 validation reference.

### Proof files that must be extended:

| Proof file | New coverage added |
|---|---|
| `apps/core-runtime/src/routes/proof.ts` | PAYME_ADMIN_ROUTE, REFERRAL_ADMIN_ROUTE (2 pairs each) |
| `apps/core-runtime/src/touchpoints/proof.ts` | PAYME_ADMIN_TOUCHPOINT, REFERRAL_ADMIN_TOUCHPOINT (2 pairs each) |
| `apps/operator-shell/src/mounts/proof.ts` | PAYME_ADMIN_MOUNT (CLI), REFERRAL_ADMIN_MOUNT (CLI) (2 pairs each) |
| `apps/web-public/src/mounts/proof.ts` | PAYME_ADMIN_MOUNT (API), REFERRAL_ADMIN_MOUNT (API) (2 pairs each) |

### Proof coverage pattern (unchanged from existing chassis):
Each added entity emits one `adaptValidationResult` and one `adaptCompatibilityResult` ProofResult. Compatibility is checked against `FULL_BODY_PROFILE` (the only profile in scope). No new `CONSUMPTION_POINTS`, `PROOF_KINDS`, or `FAILURE_CODES` are introduced.

### Shell layout proof files — No Change Required
`apps/operator-shell/src/app/layout/shell.layout.proof.ts` and `apps/web-public/src/app/layout/shell.layout.proof.ts` require no change; the shell surface IDs are unchanged.

---

## 9. Authority Notes

- All new IDs derive authority from `xyz-factory-system/invariants/chassis/`; downstream code remains non-authoritative
- No new chassis law is created; no install path is forked or redefined
- No existing chassis ID is removed or renamed
- New admin modules use `lifecycle_state: installed` matching the existing mod.chassis.core pattern
- The `INSTALL_CHAIN_GATES` closed set is not expanded (session-transport link is outside the install chain gate sequence by design)
- Mobile-Optimized and PC-Optimized profile constraint sets remain empty; new IDs are declared in FULL_BODY_PROFILE only
- All file writes stay within chassis-native paths; no undeclared dependency is introduced
