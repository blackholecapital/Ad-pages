# Runtime Change Manifest — RB-INT-CHASSIS-001
## Stage: S3 — Worker A
## Scope: contracts, registries, bridges, transport, routes, touchpoints

---

## 1. Contracts Layer

### packages/contracts-core/src/chassis/domain.ts — EXTENDED

New IDs appended (no existing entries removed or modified):

**MODULE_IDS additions**:
- `PAYME_ADMIN: "mod.payme.admin"`
- `REFERRAL_ADMIN: "mod.referral.admin"`

**ROUTE_IDS additions**:
- `PAYME_ADMIN: "rt.payme.admin"` (surface: sf.api.factory)
- `REFERRAL_ADMIN: "rt.referral.admin"` (surface: sf.api.factory)

**TOUCHPOINT_IDS additions**:
- `CLI_PAYME_ADMIN: "tp.cli.payme.admin"` (surface: sf.cli.factory)
- `CLI_REFERRAL_ADMIN: "tp.cli.referral.admin"` (surface: sf.cli.factory)
- `API_PAYME_ADMIN: "tp.api.payme.admin"` (surface: sf.api.factory)
- `API_REFERRAL_ADMIN: "tp.api.referral.admin"` (surface: sf.api.factory)

**TRIGGER_IDS additions**:
- `PAYME_ADMIN: "trg.payme.admin"`
- `REFERRAL_ADMIN: "trg.referral.admin"`

**EVENT_IDS additions**:
- `PAYME_ADMIN_REQUESTED: "evt.payme.admin.requested"`
- `PAYME_ADMIN_COMPLETED: "evt.payme.admin.completed"`
- `PAYME_ADMIN_FAILED: "evt.payme.admin.failed"`
- `REFERRAL_ADMIN_REQUESTED: "evt.referral.admin.requested"`
- `REFERRAL_ADMIN_COMPLETED: "evt.referral.admin.completed"`
- `REFERRAL_ADMIN_FAILED: "evt.referral.admin.failed"`

### packages/contracts-core/src/profiles/compatibility-map.ts — EXTENDED

FULL_BODY_PROFILE allowed buckets extended:
- `routes.allowed`: added `ROUTE_IDS.PAYME_ADMIN`, `ROUTE_IDS.REFERRAL_ADMIN`
- `touchpoints.allowed`: added all 4 new TOUCHPOINT_IDS
- `mounts.allowed`: added all 4 new TOUCHPOINT_IDS (mount eligibility keyed by touchpoint id)
- MOBILE_OPTIMIZED_PROFILE and PC_OPTIMIZED_PROFILE unchanged

---

## 2. Registries

### packages/registry-chassis/src/module-registry.ts — EXTENDED
Added entries:
- `{ module_id: "mod.payme.admin", lifecycle_state: "installed", registry_state: "registered" }`
- `{ module_id: "mod.referral.admin", lifecycle_state: "installed", registry_state: "registered" }`

### packages/registry-chassis/src/route-registry.ts — EXTENDED
Added entries:
- `{ route_id: "rt.payme.admin", surface_id: "sf.api.factory", registry_state: "registered" }`
- `{ route_id: "rt.referral.admin", surface_id: "sf.api.factory", registry_state: "registered" }`

### packages/registry-chassis/src/trigger-registry.ts — EXTENDED
Added entries:
- `{ trigger_id: "trg.payme.admin", registry_state: "registered" }`
- `{ trigger_id: "trg.referral.admin", registry_state: "registered" }`

### packages/registry-chassis/src/event-registry.ts — EXTENDED
Added entries:
- `{ event_id: "evt.payme.admin.requested", registry_state: "registered" }`
- `{ event_id: "evt.payme.admin.completed", registry_state: "registered" }`
- `{ event_id: "evt.payme.admin.failed", registry_state: "registered" }`
- `{ event_id: "evt.referral.admin.requested", registry_state: "registered" }`
- `{ event_id: "evt.referral.admin.completed", registry_state: "registered" }`
- `{ event_id: "evt.referral.admin.failed", registry_state: "registered" }`

---

## 3. Transport Links

### packages/session-transport/src/transport.contract.ts — CREATED
Declares `SessionTransportState` and `SessionTransportConfig` interfaces.
Admin panel session transport contract. Non-authoritative; additive over install chain.

### packages/session-transport/src/session-transport-link.ts — CREATED
Exports `isTransportReady(config: SessionTransportConfig): boolean`.
NOT a gate in INSTALL_CHAIN_GATES; additive check for admin panel session availability only.

### packages/session-transport/src/index.ts — EXTENDED
Pre-existing exports from `transport-contract.ts` preserved unchanged.
New exports added: `SessionTransportState`, `SessionTransportConfig` from `transport.contract.ts`;
`isAdminTransportReady` (alias for `isTransportReady`) from `session-transport-link.ts`.

### packages/runtime-bridge/src/admin-bridge-contract.ts — CREATED
Declares `AdminBridgeState` interface and `isAdminBridgeActivatable()`.
Checks: install_stamp.stamp_state === ISSUED && payme_admin_registered && referral_admin_registered.

### packages/runtime-bridge/src/index.ts — EXTENDED
Added: `AdminBridgeState`, `isAdminBridgeActivatable` from `admin-bridge-contract.ts`.

### apps/local-host/src/bridge/admin-bridge.ts — CREATED
Declares `AdminBridgeConfig` interface and `isAdminBridgeReady()`.
Checks: stamp issued, production install verified, payme_admin_mount_ready, referral_admin_mount_ready.

### apps/local-host/src/bridge/index.ts — EXTENDED
Added: `AdminBridgeConfig`, `isAdminBridgeReady` from `admin-bridge.ts`.

---

## 4. Routes

### apps/core-runtime/src/routes/payme-admin.route.ts — CREATED
Exports `PAYME_ADMIN_ROUTE: Route` — route_id: rt.payme.admin, surface_id: sf.api.factory, registry_state: registered.

### apps/core-runtime/src/routes/referral-admin.route.ts — CREATED
Exports `REFERRAL_ADMIN_ROUTE: Route` — route_id: rt.referral.admin, surface_id: sf.api.factory, registry_state: registered.

### apps/core-runtime/src/routes/index.ts — EXTENDED
Added barrel exports: `PAYME_ADMIN_ROUTE`, `REFERRAL_ADMIN_ROUTE`.

### apps/core-runtime/src/routes/proof.ts — EXTENDED
Added `PAYME_ADMIN_ROUTE` and `REFERRAL_ADMIN_ROUTE` to ROUTES array.
routeProofs() now emits 2 additional ProofResult pairs per new route (validation + compatibility).
Consumption point: ROUTE_LAYER. No new adapters or closed-set expansion.

---

## 5. Touchpoints

### apps/core-runtime/src/touchpoints/payme-admin.touchpoint.ts — CREATED
Exports `PAYME_ADMIN_TOUCHPOINT: Touchpoint` (tp.api.payme.admin, sf.api.factory).
Exports `PAYME_ADMIN_EVENTS: TouchpointEventRefs` (requested/completed/failed event IDs).

### apps/core-runtime/src/touchpoints/referral-admin.touchpoint.ts — CREATED
Exports `REFERRAL_ADMIN_TOUCHPOINT: Touchpoint` (tp.api.referral.admin, sf.api.factory).
Exports `REFERRAL_ADMIN_EVENTS: TouchpointEventRefs` (requested/completed/failed event IDs).

### apps/core-runtime/src/touchpoints/index.ts — EXTENDED
Added barrel exports: `PAYME_ADMIN_TOUCHPOINT`, `PAYME_ADMIN_EVENTS`, `REFERRAL_ADMIN_TOUCHPOINT`, `REFERRAL_ADMIN_EVENTS`.

### apps/core-runtime/src/touchpoints/proof.ts — EXTENDED
Added `PAYME_ADMIN_TOUCHPOINT` and `REFERRAL_ADMIN_TOUCHPOINT` to TOUCHPOINTS array.
touchpointProofs() now emits 2 additional ProofResult pairs per new touchpoint.
Consumption point: TOUCHPOINT_LAYER. No closed-set expansion.

---

## 6. Scope Boundary

Worker A S3 scope complete. Worker B S3 scope (operator-shell, web-public mounts and layouts) is separate and not included in this manifest.

Files unchanged within Worker A scope (confirmed):
- packages/contracts-core/src/chassis/*.contract.ts — no change
- packages/contracts-core/src/chassis/index.ts — no change
- packages/contracts-core/src/profiles/profile-domain.ts — no change
- packages/contracts-core/src/profiles/index.ts — no change
- packages/contracts-core/src/index.ts — no change
- packages/registry-chassis/src/surface-registry.ts — no change
- packages/registry-chassis/src/index.ts — no change
- packages/runtime-bridge/src/bridge-contract.ts — no change
- apps/local-host/src/bridge/runtime-bridge.ts — no change
- apps/local-host/src/transport/* — no change
- apps/core-runtime/src/routes/install.route.ts — no change
- apps/core-runtime/src/routes/update.route.ts — no change
- apps/core-runtime/src/routes/disable.route.ts — no change
- apps/core-runtime/src/routes/remove.route.ts — no change
- apps/core-runtime/src/touchpoints/install.touchpoint.ts — no change
- apps/core-runtime/src/touchpoints/update.touchpoint.ts — no change
- apps/core-runtime/src/touchpoints/disable.touchpoint.ts — no change
- apps/core-runtime/src/touchpoints/remove.touchpoint.ts — no change
- apps/core-runtime/src/session/* — no change
