# Fragment Allowlist — RB-INT-CHASSIS-001 | S2

job_id: RB-INT-CHASSIS-001
stage: S2
owner: Worker B
document_role: copy-minimal fragment allowlist for S3 execution

---

## Copy Rule

A fragment may be copied from the gateway freeze only when ALL of the following
conditions are satisfied:

1. The fragment contains no gateway-specific identity values (surface IDs, route
   IDs, touchpoint IDs, module IDs, shell owner IDs) OR those values map exactly
   to constants already declared in `packages/contracts-core/src/chassis/domain.ts`.
2. The fragment imports no package or module outside the chassis package graph
   (`packages/*`, `apps/*`).
3. The fragment introduces no lifecycle, resolver, or install-law logic beyond
   what the chassis already declares in `packages/lifecycle-chassis` and
   `packages/runtime-bridge`.
4. The fragment is a pure behavior pattern (predicate, shape, or binding) with
   no structural or registry authority.

If any condition above is not met: do NOT copy. Rebuild chassis-natively instead.

---

## Allowed Fragments by Source Area

### 1 — Shell surface resolution patterns
Source area: product-shell shell configuration
Allowed fragment type: `resolveShellSurface()` function body — returns a `Surface`
value using chassis-declared `SURFACE_IDS` and `SHELL_OWNER_IDS`.
Copy condition: Only if the gateway shell binds to `sf.cli.factory` or
`sf.api.factory` exactly as declared in `packages/contracts-core/src/chassis/domain.ts`.
If the gateway uses different surface ID strings, do NOT copy — rebuild chassis-natively.
Target paths (chassis-native):
- `apps/operator-shell/src/app/layout/shell.layout.ts` (sf.cli.factory)
- `apps/web-public/src/app/layout/shell.layout.ts` (sf.api.factory)
Max copy: function body only. SHELL_CONFIG object is a chassis-native declaration;
do not copy gateway config object.

### 2 — Mount authorization patterns
Source area: product-shell, payme-admin-minimal, referral-admin-minimal mount declarations
Allowed fragment type: `isMountAuthorized(): boolean` predicate — surface binding
check using chassis-declared `TOUCHPOINT_IDS` and `SURFACE_IDS`.
Copy condition: Only if the gateway mount binds to a touchpoint ID already declared
in `TOUCHPOINT_IDS` (tp.cli.install, tp.cli.update, tp.api.disable, tp.api.remove)
AND to a surface ID already declared in `SURFACE_IDS`. If gateway uses undeclared
IDs, do NOT copy.
Target paths (chassis-native):
- `apps/operator-shell/src/mounts/install.mount.ts`
- `apps/operator-shell/src/mounts/update.mount.ts`
- `apps/web-public/src/mounts/disable.mount.ts`
- `apps/web-public/src/mounts/remove.mount.ts`
Max copy: authorization predicate body only. Mount constant declarations are
chassis-native; do not copy gateway mount constant values.

### 3 — Route declaration shape patterns
Source area: gateway route declarations
Allowed fragment type: `Route` constant shape using chassis-declared `ROUTE_IDS`,
`SURFACE_IDS`, `REGISTRY_STATES`.
Copy condition: Only if the route binds to an ID already declared in `ROUTE_IDS`
(rt.chassis.install, rt.chassis.update, rt.chassis.disable, rt.chassis.remove).
Do NOT copy if gateway route uses undeclared IDs.
Target paths (chassis-native):
- `apps/core-runtime/src/routes/*.route.ts`
Max copy: constant shape only. Do not copy barrel (index.ts) or proof files.

### 4 — Touchpoint declaration shape patterns
Source area: gateway touchpoint declarations
Allowed fragment type: `Touchpoint` constant shape using chassis-declared
`TOUCHPOINT_IDS`, `SURFACE_IDS`.
Copy condition: Only declared IDs (same restriction as §3).
Target paths (chassis-native):
- `apps/core-runtime/src/touchpoints/*.touchpoint.ts`
Max copy: constant shape only.

### 5 — Bridge connection predicate patterns
Source area: resolver-boundary materials — bridge activation logic
Allowed fragment type: Pure boolean predicate checking
`stamp_state === STAMP_STATES.ISSUED` and production install record presence.
Copy condition: Predicate must use `STAMP_STATES` from
`packages/contracts-core/src/chassis/domain.ts` exactly and must reference no
gateway-specific identity. All import paths must be re-pointed to chassis packages
before the fragment is placed.
Target paths (chassis-native):
- `packages/runtime-bridge/src/bridge-contract.ts`
- `apps/local-host/src/bridge/runtime-bridge.ts`
Max copy: predicate body only. Interface field declarations are chassis-native
rebuilds.

### 6 — Transport readiness predicate patterns
Source area: resolver-boundary materials — transport readiness logic
Allowed fragment type: Pure boolean predicate for transport state check
(`bridge_activatable && activation_eligible && touchpoint_enabled` pattern).
Copy condition: Only if the equivalent fields exist in the chassis `TransportState`.
Do not copy gateway-specific field names.
Target paths (chassis-native):
- `packages/session-transport/src/transport-contract.ts`
- `apps/local-host/src/transport/session-link.ts`
Max copy: predicate body only.

---

## Explicitly Blocked From Copy

The following items must NOT be copied from the gateway freeze under any circumstances.

| # | Blocked item | Reason |
|---|---|---|
| B1 | Gateway surface ID string not equal to `sf.cli.factory` or `sf.api.factory` | Undeclared chassis surface |
| B2 | Gateway route ID string not in ROUTE_IDS | Undeclared chassis route |
| B3 | Gateway touchpoint ID string not in TOUCHPOINT_IDS | Undeclared chassis touchpoint |
| B4 | Gateway module ID or module ownership declaration | No new module IDs may be introduced by copy; chassis module authority is non-authoritative downstream |
| B5 | Gateway registry structures (route, surface, event, trigger, module) | Registries are chassis-native only; copy-in is an undeclared dependency |
| B6 | Gateway resolver logic or resolver state values | Resolver authority lives in xyz-factory-system only |
| B7 | Gateway manifest authority content (declaration_kind, declaration_state, declaration_scope values) | Unresolved domain — do not narrow or invent values (see §Unresolved Domain section below) |
| B8 | Gateway lifecycle policy that differs from lifecycle-chassis | Lifecycle is canonical; no fork permitted |
| B9 | Gateway component tree or UI hierarchy that declares new surfaces | Structural authority violation |
| B10 | Gateway proof or test harness code | Proof path is already chassis-native; do not overlay with gateway proof constructs |
| B11 | Gateway import from a package not in the chassis package graph | Undeclared dependency |
| B12 | Production ledger content | Production ledger authority stays in xyz-factory-system |
| B13 | Gateway-specific profile values or profile constraint overrides | Profile authority is WA P3.x |
| B14 | `isTransportReady` or `isSessionLinkAvailable` wired into any proof adapter | Not in INSTALL_CHAIN_GATES closed set; blocked per WB P4.prep.2 §Blocked |
| B15 | MOBILE_OPTIMIZED_PROFILE or PC_OPTIMIZED_PROFILE constraint population | Profile buckets unresolved per WA P3.0; no gateway values may fill them |

---

## Unresolved Domain — Copy Freeze

The following chassis fields remain unresolved (WA P1.1). Do not copy gateway
values for these fields even if the gateway has string values assigned to them:

- `Declaration.declaration_kind`
- `Declaration.declaration_state`
- `DeclarationEnvelope.declaration_scope`

Any gateway assignment to these fields must be discarded during the copy. The
chassis-native version retains `string` type with no value binding.

---

## Copy Volume Constraint

- No full-file verbatim copy of any gateway source file.
- Each fragment copy must be documented at the use site with a comment naming the
  source area and confirming the applicable allowlist section.
- If a fragment requires more than minor adaptation to become chassis-native, it is
  a rebuild, not a copy.
- Copy volume goal: function bodies and constant shapes only — never whole modules,
  never gateway package structures.
