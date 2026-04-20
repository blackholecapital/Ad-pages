# UI Change Manifest — RB-INT-CHASSIS-001
## Stage: S3 — Worker B
## Scope: operator-shell, web-public — shell mounts and layouts

---

## 1. Operator-Shell Mounts (sf.cli.factory)

### apps/operator-shell/src/mounts/payme-admin.mount.ts — CREATED
Exports `PAYME_ADMIN_MOUNT: Touchpoint` with
`touchpoint_id: TOUCHPOINT_IDS.CLI_PAYME_ADMIN` (`tp.cli.payme.admin`),
`surface_id: SURFACE_IDS.CLI_FACTORY` (`sf.cli.factory`).
Exports `isMountAuthorized(): boolean` — returns
`PAYME_ADMIN_MOUNT.surface_id === SURFACE_IDS.CLI_FACTORY`.
Downstream status: non-authoritative — no undeclared surface mounting.

### apps/operator-shell/src/mounts/referral-admin.mount.ts — CREATED
Exports `REFERRAL_ADMIN_MOUNT: Touchpoint` with
`touchpoint_id: TOUCHPOINT_IDS.CLI_REFERRAL_ADMIN` (`tp.cli.referral.admin`),
`surface_id: SURFACE_IDS.CLI_FACTORY` (`sf.cli.factory`).
Exports `isMountAuthorized(): boolean` — returns
`REFERRAL_ADMIN_MOUNT.surface_id === SURFACE_IDS.CLI_FACTORY`.
Downstream status: non-authoritative — no undeclared surface mounting.

### apps/operator-shell/src/mounts/index.ts — EXTENDED
Added barrel exports:
- `PAYME_ADMIN_MOUNT` from `./payme-admin.mount.js`
- `REFERRAL_ADMIN_MOUNT` from `./referral-admin.mount.js`
Existing exports (`INSTALL_MOUNT`, `UPDATE_MOUNT`) unchanged.

### apps/operator-shell/src/mounts/proof.ts — EXTENDED
Added imports: `PAYME_ADMIN_MOUNT` + `isMountAuthorized as isPaymeAdminMountAuthorized`
from `./payme-admin.mount.js`; `REFERRAL_ADMIN_MOUNT` +
`isMountAuthorized as isReferralAdminMountAuthorized` from `./referral-admin.mount.js`.
Added two entries to `OPERATOR_SHELL_MOUNTS` array:
- `{ label: "PAYME_ADMIN_MOUNT", touchpoint_id: ..., authorized: isPaymeAdminMountAuthorized }`
- `{ label: "REFERRAL_ADMIN_MOUNT", touchpoint_id: ..., authorized: isReferralAdminMountAuthorized }`
Result: `operatorMountProofs()` now emits 4 additional ProofResults
(2 validation + 2 compatibility) for the new CLI admin mounts.
Consumption point: TOUCHPOINT_LAYER. No new adapters or closed-set expansion.
Existing entries (`INSTALL_MOUNT`, `UPDATE_MOUNT`) and proof logic unchanged.

---

## 2. Operator-Shell Layout (sf.cli.factory)

### apps/operator-shell/src/app/layout/shell.layout.ts — EXTENDED
Added import: `TOUCHPOINT_IDS` from
`../../../../packages/contracts-core/src/chassis/domain.js`.
Added two configuration entries to `SHELL_CONFIG`:
- `PAYME_ADMIN_PANEL: TOUCHPOINT_IDS.CLI_PAYME_ADMIN`
- `REFERRAL_ADMIN_PANEL: TOUCHPOINT_IDS.CLI_REFERRAL_ADMIN`
`SHELL_CONFIG.shell_id` (`SHELL_OWNER_IDS.FACTORY`) unchanged.
`SHELL_CONFIG.surface_id` (`SURFACE_IDS.CLI_FACTORY`) unchanged.
`resolveShellSurface()` return value unchanged.

---

## 3. Web-Public Mounts (sf.api.factory)

### apps/web-public/src/mounts/payme-admin.mount.ts — CREATED
Exports `PAYME_ADMIN_MOUNT: Touchpoint` with
`touchpoint_id: TOUCHPOINT_IDS.API_PAYME_ADMIN` (`tp.api.payme.admin`),
`surface_id: SURFACE_IDS.API_FACTORY` (`sf.api.factory`).
Exports `isMountAuthorized(): boolean` — returns
`PAYME_ADMIN_MOUNT.surface_id === SURFACE_IDS.API_FACTORY`.
Downstream status: non-authoritative — no undeclared surface mounting.

### apps/web-public/src/mounts/referral-admin.mount.ts — CREATED
Exports `REFERRAL_ADMIN_MOUNT: Touchpoint` with
`touchpoint_id: TOUCHPOINT_IDS.API_REFERRAL_ADMIN` (`tp.api.referral.admin`),
`surface_id: SURFACE_IDS.API_FACTORY` (`sf.api.factory`).
Exports `isMountAuthorized(): boolean` — returns
`REFERRAL_ADMIN_MOUNT.surface_id === SURFACE_IDS.API_FACTORY`.
Downstream status: non-authoritative — no undeclared surface mounting.

### apps/web-public/src/mounts/index.ts — EXTENDED
Added barrel exports:
- `PAYME_ADMIN_MOUNT` from `./payme-admin.mount.js`
- `REFERRAL_ADMIN_MOUNT` from `./referral-admin.mount.js`
Existing exports (`DISABLE_MOUNT`, `REMOVE_MOUNT`) unchanged.

### apps/web-public/src/mounts/proof.ts — EXTENDED
Added imports: `PAYME_ADMIN_MOUNT` + `isMountAuthorized as isPaymeAdminMountAuthorized`
from `./payme-admin.mount.js`; `REFERRAL_ADMIN_MOUNT` +
`isMountAuthorized as isReferralAdminMountAuthorized` from `./referral-admin.mount.js`.
Added two entries to `WEB_PUBLIC_MOUNTS` array:
- `{ label: "PAYME_ADMIN_MOUNT", touchpoint_id: ..., authorized: isPaymeAdminMountAuthorized }`
- `{ label: "REFERRAL_ADMIN_MOUNT", touchpoint_id: ..., authorized: isReferralAdminMountAuthorized }`
Result: `webPublicMountProofs()` now emits 4 additional ProofResults
(2 validation + 2 compatibility) for the new API admin mounts.
Consumption point: TOUCHPOINT_LAYER. No new adapters or closed-set expansion.
Existing entries (`DISABLE_MOUNT`, `REMOVE_MOUNT`) and proof logic unchanged.

---

## 4. Web-Public Layout (sf.api.factory)

### apps/web-public/src/app/layout/shell.layout.ts — EXTENDED
Added import: `TOUCHPOINT_IDS` from
`../../../../packages/contracts-core/src/chassis/domain.js`.
Added two configuration entries to `SHELL_CONFIG`:
- `PAYME_ADMIN_PANEL: TOUCHPOINT_IDS.API_PAYME_ADMIN`
- `REFERRAL_ADMIN_PANEL: TOUCHPOINT_IDS.API_REFERRAL_ADMIN`
`SHELL_CONFIG.shell_id` (`SHELL_OWNER_IDS.FACTORY`) unchanged.
`SHELL_CONFIG.surface_id` (`SURFACE_IDS.API_FACTORY`) unchanged.
`resolveShellSurface()` return value unchanged.

---

## 5. Files Unchanged Within Worker B S3 Scope

- apps/operator-shell/src/mounts/install.mount.ts — NO CHANGE
- apps/operator-shell/src/mounts/update.mount.ts — NO CHANGE
- apps/operator-shell/src/app/layout/shell.layout.proof.ts — NO CHANGE
- apps/operator-shell/src/app/layout/shell.layout.proof-run.ts — NO CHANGE
- apps/web-public/src/mounts/disable.mount.ts — NO CHANGE
- apps/web-public/src/mounts/remove.mount.ts — NO CHANGE
- apps/web-public/src/app/layout/shell.layout.proof.ts — NO CHANGE
- apps/web-public/src/app/layout/shell.layout.proof-run.ts — NO CHANGE

---

## 6. Fragment Allowlist Compliance

All changes follow fragment allowlist `/job_site/fragment_allowlist.md`:
- Mount constant shapes: allowlist §2 (declared IDs only — CLI_PAYME_ADMIN,
  CLI_REFERRAL_ADMIN, API_PAYME_ADMIN, API_REFERRAL_ADMIN all declared in domain.ts).
- Shell layout pattern: allowlist §1 (resolveShellSurface() unchanged; SHELL_CONFIG
  extended with declared touchpoint ID references only).
- No gateway-specific package imports. No undeclared surface IDs. No registry
  structures. No resolver logic. No blocked items introduced.

---

## 7. Scope Boundary

Worker B S3 scope complete. All target paths declared in
`/job_site/target_path_manifest.yaml` as `assigned_worker: worker_b_s3` are
implemented. No Worker A S3 scope items were modified.
