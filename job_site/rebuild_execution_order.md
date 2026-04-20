# Rebuild Execution Order — RB-INT-CHASSIS-001 | S2

job_id: RB-INT-CHASSIS-001
stage: S2
owner: Worker B
document_role: ordered execution steps for S3 chassis-native rebuild

---

## Chassis Boundary Rules

The following boundaries must not be crossed at any point during execution:

1. Package-before-app: `packages/*` must be stable before dependent `apps/*`
   files are written or modified.
2. Contract-before-registry: `packages/contracts-core` domain constants must be
   declared before any registry entry references them.
3. Registry-before-consumer: `packages/registry-chassis` entries must be present
   before app-layer consumers (routes, touchpoints, mounts) reference new IDs.
4. Domain-and-profile atomicity: any new ID added to `domain.ts` must be added to
   `FULL_BODY_PROFILE` in `compatibility-map.ts` in the same edit. Derived profiles
   (MOBILE_OPTIMIZED, PC_OPTIMIZED) must not be populated.
5. Proof additivity: proof files (`*.proof.ts`) are additive sibling files only.
   No modification to an existing source file is permitted solely to accommodate
   proof wiring.
6. Barrel last: `index.ts` barrel updates occur only after all files within the
   same package/app layer are complete.
7. No undeclared import: every import in every written file must resolve within the
   chassis package graph. If a required symbol does not exist, stop and escalate
   to Foreman A before writing the file.

---

## Pre-Execution Check

Before Phase 1 begins, confirm:

- `packages/contracts-core/src/chassis/domain.ts` is readable and current.
- `packages/contracts-core/src/profiles/compatibility-map.ts` is readable and current.
- All gateway source areas required for the scope are accessible via the comparison archive.
- Fragment allowlist (`/job_site/fragment_allowlist.md`) is loaded.
- Integration blueprint (`/job_site/integration_blueprint.md`) and target path manifest
  (`/job_site/target_path_manifest.yaml`) are loaded.

If any input is missing or unclear: STOP and return PATCH to Foreman A.

---

## Phase 1 — Domain Extension (packages/contracts-core only)

Execute BEFORE any other phase. All Phase 1 steps must complete before Phase 2 begins.

Step 1.1 — Surface ID audit
- Compare gateway surface declarations against `SURFACE_IDS` in `domain.ts`.
- If a new surface ID is required: append to `SURFACE_IDS` and add to
  `FULL_BODY_PROFILE.surfaces.allowed` in `compatibility-map.ts` in the same edit.
- If no new ID is required: mark step skipped.

Step 1.2 — Route ID audit
- Compare gateway route declarations against `ROUTE_IDS` in `domain.ts`.
- If a new route ID is required: append to `ROUTE_IDS` and add to
  `FULL_BODY_PROFILE.routes.allowed` in the same edit.
- If no new ID is required: mark step skipped.

Step 1.3 — Touchpoint ID audit
- Compare gateway touchpoint declarations against `TOUCHPOINT_IDS` in `domain.ts`.
- If a new touchpoint ID is required: append to `TOUCHPOINT_IDS` and add to
  `FULL_BODY_PROFILE.touchpoints.allowed` and `FULL_BODY_PROFILE.mounts.allowed`
  in the same edit.
- If no new ID is required: mark step skipped.

Step 1.4 — Trigger ID and Event ID audit
- Compare gateway event and trigger declarations against `TRIGGER_IDS` and
  `EVENT_IDS` in `domain.ts`.
- If new IDs are required: append to the respective constant sets.
- If no new IDs are required: mark step skipped.

Step 1.5 — Shell owner ID audit
- Compare gateway shell owner declarations against `SHELL_OWNER_IDS` in `domain.ts`.
- If a new ID is required: append to `SHELL_OWNER_IDS` and add to
  `FULL_BODY_PROFILE.shells.allowed` in the same edit.
- If no new ID is required: mark step skipped.

Phase 1 scope constraint: touches only `packages/contracts-core/src/chassis/domain.ts`
and `packages/contracts-core/src/profiles/compatibility-map.ts`. No other file may
be modified in Phase 1.

---

## Phase 2 — Registry Extension (packages/registry-chassis only)

Execute AFTER Phase 1 is complete.
Execute only if Phase 1 produced at least one new domain ID.
If no Phase 1 IDs were added, skip Phase 2 entirely.

Steps 2.1–2.4 may execute in parallel with each other.

Step 2.1 — Route registry extension (if Step 1.2 added IDs)
- File: `packages/registry-chassis/src/route-registry.ts`
- Add lookup entries for each new route ID declared in Phase 1.

Step 2.2 — Surface registry extension (if Step 1.1 added IDs)
- File: `packages/registry-chassis/src/surface-registry.ts`
- Add lookup entries for each new surface ID declared in Phase 1.

Step 2.3 — Trigger registry extension (if Step 1.4 added trigger IDs)
- File: `packages/registry-chassis/src/trigger-registry.ts`
- Add lookup entries for each new trigger ID declared in Phase 1.

Step 2.4 — Event registry extension (if Step 1.4 added event IDs)
- File: `packages/registry-chassis/src/event-registry.ts`
- Add lookup entries for each new event ID declared in Phase 1.

Phase 2 scope constraint: touches only `packages/registry-chassis/src/`. No
app-layer file may be modified in Phase 2.

---

## Phase 3 — Core Runtime Rebuilds (apps/core-runtime only)

Execute AFTER Phase 1 (and Phase 2 if applicable).
Steps 3.1 and 3.2 may execute in parallel. Step 3.3 is independent.

Step 3.1 — Route files
- Files: `apps/core-runtime/src/routes/*.route.ts`
- For each gateway behavior mapped to a route: create or extend the corresponding
  `*.route.ts` file.
- Each file must import only from `packages/contracts-core/src/chassis/domain.js`
  and `packages/contracts-core/src/chassis/route.contract.js`.
- Route constant must bind only to IDs that exist in `ROUTE_IDS` after Phase 1.
- Apply fragment allowlist §3 for copy decisions.
- Do NOT update `apps/core-runtime/src/routes/index.ts` until this step is complete
  (barrel update deferred to Phase 6).

Step 3.2 — Touchpoint files
- Files: `apps/core-runtime/src/touchpoints/*.touchpoint.ts`
- For each gateway behavior mapped to a touchpoint: create or extend the
  corresponding `*.touchpoint.ts` file.
- Each file must import only from `packages/contracts-core/src/chassis/domain.js`
  and `packages/contracts-core/src/chassis/touchpoint.contract.js`.
- Touchpoint constant must bind only to IDs that exist in `TOUCHPOINT_IDS` after Phase 1.
- Apply fragment allowlist §4 for copy decisions.
- Do NOT update the touchpoints barrel until this step is complete.

Step 3.3 — Session activation gate (conditional)
- File: `apps/core-runtime/src/session/activation-gate.ts`
- Modify only if a gateway behavior requires a change to activation gate logic
  that passes all conditions in fragment allowlist §5.
- If no change is required: skip Step 3.3.

Phase 3 scope constraint: touches only `apps/core-runtime/src/`. No shell-layer
file may be modified in Phase 3.

---

## Phase 4 — Bridge and Transport Extension

Execute AFTER Phase 3.
Steps 4.1 and 4.2 may execute in parallel.
Steps 4.3 and 4.4 execute after 4.1 and 4.2 respectively.

Step 4.1 — Runtime bridge contract (conditional)
- File: `packages/runtime-bridge/src/bridge-contract.ts`
- Modify only if gateway bridge patterns require new fields on `RuntimeBridgeState`
  or changed predicate logic that passes allowlist §5.
- If no change is required: skip Step 4.1.

Step 4.2 — Session transport contract (conditional)
- File: `packages/session-transport/src/transport-contract.ts`
- Modify only if gateway transport patterns require new fields on `TransportState`
  or changed predicate logic that passes allowlist §6.
- If no change is required: skip Step 4.2.

Step 4.3 — Local-host runtime bridge (conditional; depends on Step 4.1)
- File: `apps/local-host/src/bridge/runtime-bridge.ts`
- Modify only after Step 4.1 is complete.
- Apply allowlist §5 copy conditions.

Step 4.4 — Local-host session transport link (conditional; depends on Step 4.2)
- File: `apps/local-host/src/transport/session-link.ts`
- Modify only after Step 4.2 is complete.
- Apply allowlist §6 copy conditions.

Phase 4 scope constraint: touches only `packages/runtime-bridge/src/`,
`packages/session-transport/src/`, and `apps/local-host/src/`.

---

## Phase 5 — Shell Rebuilds (apps/operator-shell, apps/web-public)

Execute AFTER Phase 3 AND Phase 4 are complete.
Operator-shell steps (5.1, 5.2) and web-public steps (5.3, 5.4) may execute in
parallel with each other but not before Phases 3 and 4.
Within operator-shell: Step 5.2 depends on Step 5.1.
Within web-public: Step 5.4 depends on Step 5.3.

Step 5.1 — Operator-shell layout (sf.cli.factory)
- File: `apps/operator-shell/src/app/layout/shell.layout.ts`
- Rebuild from product-shell and payme-admin-minimal behaviors mapped to sf.cli.factory.
- SHELL_CONFIG must bind only to `SHELL_OWNER_IDS.FACTORY` and `SURFACE_IDS.CLI_FACTORY`.
- Apply allowlist §1 for the resolveShellSurface() copy decision.

Step 5.2 — Operator-shell mount files (depends on Step 5.1)
- Files: `apps/operator-shell/src/mounts/*.mount.ts`
- For each CLI-surface touchpoint from gateway: create or extend the corresponding
  `*.mount.ts` file.
- Each mount must bind only to touchpoint IDs and surface IDs that exist after Phase 1.
- Apply allowlist §2 for copy decisions.
- Do NOT update the mounts barrel until this step is complete.

Step 5.3 — Web-public layout (sf.api.factory)
- File: `apps/web-public/src/app/layout/shell.layout.ts`
- Rebuild from product-shell and referral-admin-minimal behaviors mapped to sf.api.factory.
- SHELL_CONFIG must bind only to `SHELL_OWNER_IDS.FACTORY` and `SURFACE_IDS.API_FACTORY`.
- Apply allowlist §1 (API variant) for the resolveShellSurface() copy decision.

Step 5.4 — Web-public mount files (depends on Step 5.3)
- Files: `apps/web-public/src/mounts/*.mount.ts`
- For each API-surface touchpoint from gateway: create or extend the corresponding
  `*.mount.ts` file.
- Each mount must bind only to declared IDs.
- Apply allowlist §2 for copy decisions.

Phase 5 scope constraint: touches only `apps/operator-shell/src/` and
`apps/web-public/src/`. No chassis package may be modified in Phase 5.

---

## Phase 6 — Barrel and Proof Updates

Execute AFTER all preceding phases for the relevant layer are complete.
Steps within this phase are sequenced by layer dependency, not parallelizable
across layers.

Step 6.1 — Barrel updates (index.ts files), in this order:
1. `packages/contracts-core/src/chassis/index.ts` (if Phase 1 added new exports)
2. `packages/contracts-core/src/index.ts` (if Step 6.1.1 changed)
3. `packages/registry-chassis/src/index.ts` (if Phase 2 added new exports)
4. `apps/core-runtime/src/routes/index.ts` (if Phase 3.1 added new files)
5. `apps/core-runtime/src/touchpoints/index.ts` (if Phase 3.2 added new files)
6. `apps/operator-shell/src/mounts/index.ts` (if Phase 5.2 added new files)
7. `apps/web-public/src/mounts/index.ts` (if Phase 5.4 added new files)

Step 6.2 — Proof file updates (additive only)
- Files: `apps/core-runtime/src/routes/proof.ts`,
  `apps/core-runtime/src/touchpoints/proof.ts`,
  `apps/operator-shell/src/mounts/proof.ts`,
  `apps/web-public/src/mounts/proof.ts`,
  `apps/core-runtime/src/session/install-chain.proof.ts`,
  `apps/operator-shell/src/app/layout/shell.layout.proof.ts`,
  `apps/web-public/src/app/layout/shell.layout.proof.ts`
- Extend only — do not modify any existing function body or existing import.
- Add proof coverage only for new routes, touchpoints, and mounts added in Phases 3–5.
- Do not add blocked items: `isTransportReady`, `isSessionLinkAvailable`,
  MOBILE_OPTIMIZED_PROFILE, PC_OPTIMIZED_PROFILE, manifest `declaration_*` fields.
- Proof-run wrappers (`shell.layout.proof-run.ts`) update only if the aggregator
  they call changes.

---

## Dependency Boundary Summary

| Phase | May depend on | Must NOT depend on |
|---|---|---|
| Phase 1 | contracts-core (existing) | Any gateway package; any app-layer file |
| Phase 2 | Phase 1 outputs; registry-chassis (existing) | Any app-layer file |
| Phase 3 | Phase 1+2 outputs; contracts-core; schema-chassis | Gateway-specific packages; shell-layer files |
| Phase 4 | Phase 3 outputs; contracts-core; runtime-bridge (existing) | Gateway-specific packages; shell-layer files |
| Phase 5 | Phase 3+4 outputs; contracts-core | Gateway-specific packages; any package not in chassis graph |
| Phase 6 | All preceding phase outputs | Nothing new |

---

## Undeclared Dependency Check (per file, before writing)

Before writing any file in Phases 3–5:
1. List every symbol the file will import.
2. Confirm each symbol exists in the chassis package graph (`packages/*` or `apps/*`).
3. Confirm each import path resolves to an existing chassis file.
4. If any required symbol does not exist: STOP — do not write the file. Escalate
   to Foreman A with the exact missing symbol and the file that would need it.

This check must be repeated for every new file, not batched across a phase.

---

## Write Sequence Within a Phase

For each file within a phase, execute in this order:
1. Load fragment allowlist — determine copy vs. chassis-native rebuild.
2. List all import dependencies — confirm all exist in chassis package graph.
3. Write or extend the file using only declared chassis symbols.
4. Confirm no new undeclared surface, route, touchpoint, event, or trigger ID
   appears in the file that was not added in Phase 1.
5. Mark step complete before moving to the next file.

Do not proceed to the next phase until all dependency-ordered steps in the
current phase are complete.
