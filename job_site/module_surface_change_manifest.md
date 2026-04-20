# Module Surface Change Manifest — RB-INT-CHASSIS-002

job_id: RB-INT-CHASSIS-002
stage: S3
pass: modules/engage reconstruction (worker_b)
worker: worker_b
authority: record of exact file-system changes made under apps/modules/engage/ for the engage microfrontend surface
source_matrix: /job_site/missing_surface_matrix.yaml §module_packages (engage rows)
source_manifest: /job_site/full_parity_target_path_manifest.yaml §SECTION 7 (engage rows)
source_allowlist: /job_site/full_parity_fragment_allowlist.md §3 (engage)
baseline_source: https://github.com/blackholecapital/gatweay-production-FREEZE (shallow clone at /tmp/baseline-freeze)

---

## 1. Scope Lock (enforced)

This pass reconstructs exactly the `modules/engage` surfaces declared in the
`/job_site/full_parity_fragment_allowlist.md` §3 (engage) allowlist. All files
are byte-for-byte verbatim copies from the baseline repository under the
chassis-native mapping `modules/engage/<rel>` → `apps/modules/engage/<rel>`
with `<rel>` preserved exactly. No other module (`payme`, `referrals`, `vault`)
and no product-shell, admin app, or chassis package is touched by this pass.

Reconstruction of the engage package.json satisfies the
`apps/product-shell/package.json` `build:engage` script contract
(`npm --prefix ../modules/engage install --progress=false && npm --prefix ../modules/engage run build`),
which resolves `../modules/engage` relative to `apps/product-shell/` as
`apps/modules/engage/` per the chassis-native mapping declared in
`/job_site/full_parity_target_path_manifest.yaml` §SECTION 7.

---

## 2. Change Set Summary

| metric | value |
|---|---|
| files created | 31 |
| files modified | 0 |
| files deleted | 0 |
| directories created | 10 |
| module root | `apps/modules/engage` |
| copy method | verbatim byte-for-byte from baseline `modules/engage/*` |
| total bytes written | 438298 |

---

## 3. Directories Created

- `apps/modules/`
- `apps/modules/engage/`
- `apps/modules/engage/src/`
- `apps/modules/engage/src/admin/`
- `apps/modules/engage/src/admin/pages/`
- `apps/modules/engage/src/components/`
- `apps/modules/engage/src/components/QuestBoard/`
- `apps/modules/engage/src/lib/`
- `apps/modules/engage/src/pages/`
- `apps/modules/engage/src/styles/`
- `apps/modules/engage/public/`

---

## 4. Files Created

### 4.1 Package manifest (allowlist §3.1)

| target_path | baseline_path | bytes | action |
|---|---|---|---|
| `apps/modules/engage/package.json` | `modules/engage/package.json` | 693 | create (verbatim) |

Declared `name`: `engagefi-questboard`. `type`: `module`. `scripts`: `dev` (`vite`),
`build` (`vite build`), `preview` (`vite preview`). Dependencies: `@emotion/react ^11.11.4`,
`@emotion/styled ^11.11.5`, `@mui/icons-material ^5.15.21`, `@mui/material ^5.15.21`,
`@supabase/supabase-js ^2.49.1`, `react ^18.3.1`, `react-dom ^18.3.1`,
`react-hot-toast ^2.4.1`, `react-router-dom ^6.26.2`, `wagmi ^2.12.7`,
`viem ^2.21.10`, `@tanstack/react-query ^5.59.0`. DevDependencies:
`@vitejs/plugin-react ^4.3.1`, `vite ^5.4.2`. No `workspaces` field.
No chassis package dependency. No cross-module dependency.

### 4.2 Lockfile (allowlist §3.2)

| target_path | baseline_path | bytes | action |
|---|---|---|---|
| `apps/modules/engage/package-lock.json` | `modules/engage/package-lock.json` | 371258 | create (verbatim) |

Deterministic npm install lockfile, byte-equal to baseline. `lockfileVersion`
preserved from baseline. Not regenerated or re-resolved.

### 4.3 Vite build config (allowlist §3.3)

| target_path | baseline_path | bytes | action |
|---|---|---|---|
| `apps/modules/engage/vite.config.js` | `modules/engage/vite.config.js` | 344 | create (verbatim) |

Declares `base: '/apps/engage/'`, `plugins: [react()]`, `build.outDir:
'../../public/apps/engage'`, `build.emptyOutDir: true`. No resolve alias into
`packages/*` or `apps/product-shell/*`. No chassis package import. Plugins
unchanged from baseline.

### 4.4 HTML entrypoint (allowlist §3.4)

| target_path | baseline_path | bytes | action |
|---|---|---|---|
| `apps/modules/engage/index.html` | `modules/engage/index.html` | 407 | create (verbatim) |

Declares `<title>*** Engagefi ***</title>`, favicon link `./drop.png`,
apple-touch-icon `./favicon.svg`, `<div id="root"></div>`,
`<script type="module" src="/src/main.jsx"></script>`. Script reference
unchanged from baseline.

### 4.5 App bootstrap — src/main.jsx (allowlist §3.5)

| target_path | baseline_path | bytes | action |
|---|---|---|---|
| `apps/modules/engage/src/main.jsx` | `modules/engage/src/main.jsx` | (baseline) | create (verbatim) |

React root bootstrap. Import specifiers unchanged from baseline.

### 4.6 App root component — src/App.jsx (allowlist §3.6)

| target_path | baseline_path | bytes | action |
|---|---|---|---|
| `apps/modules/engage/src/App.jsx` | `modules/engage/src/App.jsx` | (baseline) | create (verbatim) |

Top-level component. Import specifiers unchanged from baseline.

### 4.7 Full source subtree — src/ (allowlist §3.7)

Recursive byte-for-byte copy of `modules/engage/src/` into
`apps/modules/engage/src/`. Baseline subtree layout preserved one-for-one.
File count at target equals file count at baseline source (26 files, see note
in §8 below on the 37-count discrepancy).

| # | target_path | baseline_path |
|---|---|---|
| 1 | `apps/modules/engage/src/App.jsx` | `modules/engage/src/App.jsx` |
| 2 | `apps/modules/engage/src/main.jsx` | `modules/engage/src/main.jsx` |
| 3 | `apps/modules/engage/src/admin/AdminLayout.jsx` | `modules/engage/src/admin/AdminLayout.jsx` |
| 4 | `apps/modules/engage/src/admin/pages/AdminCompletions.jsx` | `modules/engage/src/admin/pages/AdminCompletions.jsx` |
| 5 | `apps/modules/engage/src/admin/pages/AdminQuests.jsx` | `modules/engage/src/admin/pages/AdminQuests.jsx` |
| 6 | `apps/modules/engage/src/admin/pages/AdminUsers.jsx` | `modules/engage/src/admin/pages/AdminUsers.jsx` |
| 7 | `apps/modules/engage/src/components/GameOverPanel.jsx` | `modules/engage/src/components/GameOverPanel.jsx` |
| 8 | `apps/modules/engage/src/components/Navbar.jsx` | `modules/engage/src/components/Navbar.jsx` |
| 9 | `apps/modules/engage/src/components/QuestBoard/CompleteMissionModal.jsx` | `modules/engage/src/components/QuestBoard/CompleteMissionModal.jsx` |
| 10 | `apps/modules/engage/src/components/QuestBoard/QuestCard.jsx` | `modules/engage/src/components/QuestBoard/QuestCard.jsx` |
| 11 | `apps/modules/engage/src/components/QuestBoard/QuestFilters.jsx` | `modules/engage/src/components/QuestBoard/QuestFilters.jsx` |
| 12 | `apps/modules/engage/src/components/QuestBoard/SignatureFuturePanel.jsx` | `modules/engage/src/components/QuestBoard/SignatureFuturePanel.jsx` |
| 13 | `apps/modules/engage/src/components/QuestBoard/TierProgress.jsx` | `modules/engage/src/components/QuestBoard/TierProgress.jsx` |
| 14 | `apps/modules/engage/src/lib/questDefaults.js` | `modules/engage/src/lib/questDefaults.js` |
| 15 | `apps/modules/engage/src/lib/questService.js` | `modules/engage/src/lib/questService.js` |
| 16 | `apps/modules/engage/src/lib/questTypes.js` | `modules/engage/src/lib/questTypes.js` |
| 17 | `apps/modules/engage/src/lib/supabaseClient.js` | `modules/engage/src/lib/supabaseClient.js` |
| 18 | `apps/modules/engage/src/lib/userProgressService.js` | `modules/engage/src/lib/userProgressService.js` |
| 19 | `apps/modules/engage/src/lib/wagmi.js` | `modules/engage/src/lib/wagmi.js` |
| 20 | `apps/modules/engage/src/pages/QuestsPage.jsx` | `modules/engage/src/pages/QuestsPage.jsx` |
| 21 | `apps/modules/engage/src/styles/AdminMuiOverrides.css` | `modules/engage/src/styles/AdminMuiOverrides.css` |
| 22 | `apps/modules/engage/src/styles/GameOverBubble.css` | `modules/engage/src/styles/GameOverBubble.css` |
| 23 | `apps/modules/engage/src/styles/Navbar.css` | `modules/engage/src/styles/Navbar.css` |
| 24 | `apps/modules/engage/src/styles/PageShell.css` | `modules/engage/src/styles/PageShell.css` |
| 25 | `apps/modules/engage/src/styles/Scanlines.css` | `modules/engage/src/styles/Scanlines.css` |
| 26 | `apps/modules/engage/src/styles/WireframeCard.css` | `modules/engage/src/styles/WireframeCard.css` |

Subtree verified via `diff -r /tmp/baseline-freeze/modules/engage/src
/home/user/gateway-fullbody-freeze/apps/modules/engage/src` → no differences.

### 4.8 Static redirects (allowlist §3.8)

| target_path | baseline_path | bytes | action |
|---|---|---|---|
| `apps/modules/engage/public/_redirects` | `modules/engage/public/_redirects` | 19 | create (verbatim) |

Declared rule: `/* /index.html 200` (SPA fallback for standalone serving).
Not merged with `apps/product-shell/public/_redirects`.

---

## 5. Verification Against S3 Worker B Expected Artifacts

| expected_artifact | created_path | status |
|---|---|---|
| `apps/modules/engage/package.json` | `apps/modules/engage/package.json` | present |
| `apps/modules/engage/src/` | `apps/modules/engage/src/` (26 files) | present |
| `/job_site/module_surface_change_manifest.md` (append engage reconstruction) | `/job_site/module_surface_change_manifest.md` | present (this file) |

Build contract `build:engage` precondition: `apps/modules/engage/package.json`
exists at the chassis-native path resolved by `../modules/engage` relative to
`apps/product-shell/`. Satisfied.

---

## 6. Allowlist Cross-Reference Lock

Every file created by this pass corresponds to exactly one row in
`/job_site/full_parity_fragment_allowlist.md` §3 and one row in
`/job_site/full_parity_target_path_manifest.yaml` §SECTION 7 (engage) and
one row in `/job_site/missing_surface_matrix.yaml` §module_packages (engage)
with `deploy_critical: yes`.

| allowlist § | target | status |
|---|---|---|
| 3.1 | `apps/modules/engage/package.json` | created |
| 3.2 | `apps/modules/engage/package-lock.json` | created |
| 3.3 | `apps/modules/engage/vite.config.js` | created |
| 3.4 | `apps/modules/engage/index.html` | created |
| 3.5 | `apps/modules/engage/src/main.jsx` | created (subtree) |
| 3.6 | `apps/modules/engage/src/App.jsx` | created (subtree) |
| 3.7 | `apps/modules/engage/src/` (full tree) | created (26 files) |
| 3.8 | `apps/modules/engage/public/_redirects` | created |

---

## 7. Explicitly Blocked Items Not Copied (allowlist §4)

The following baseline items exist under `modules/engage/` but are NOT copied
by this pass, per `/job_site/full_parity_fragment_allowlist.md` §4:

| blocked item | reason |
|---|---|
| `modules/engage/supabase_schema.sql` | §4 B1 — `deploy_critical: no` per missing_surface_matrix.yaml §module_packages; runtime_support only |
| `modules/engage/README.md` | §4 B2/B7 — outside allowlist §3 scope; not a deploy-critical fragment |
| `modules/engage/TEMPLATE_REPORT.txt` | §4 B2/B7 — outside allowlist §3 scope; not a deploy-critical fragment |
| `modules/engage/drop.png` | §4 B2/B7 — referenced by baseline `index.html` (`./drop.png`) but not declared as a deploy_critical row in missing_surface_matrix.yaml §module_packages and not listed in allowlist §3; see §8.2 below for the flagged reference |
| `modules/engage/public/wallpaper333.png` | §4 B2/B7 — not declared in allowlist §3.8 (which authorizes only `public/_redirects`) and not a deploy_critical row in missing_surface_matrix.yaml §module_packages |

No chassis package import was injected into any copied file. No cross-module
import path was injected. No file was renamed, restructured, or omitted from
the `src/` subtree relative to baseline.

---

## 8. Discrepancies Flagged (non-blocking for this pass)

### 8.1 `src/` file count: baseline 26 vs. matrix-declared 37

`/job_site/missing_surface_matrix.yaml` §module_packages notes for
`modules/engage/src/ (full tree)` declares `(37 files)` and
`/job_site/full_parity_fragment_allowlist.md` §3.7 restates
`(37 files per missing_surface_matrix.yaml)`. The actual baseline repository
at `https://github.com/blackholecapital/gatweay-production-FREEZE` under
`modules/engage/src/` contains **26** source files across
`admin/`, `components/`, `lib/`, `pages/`, `styles/`, plus `main.jsx` and
`App.jsx` at `src/` root.

Resolution applied for this pass: verbatim subtree copy of the actual
baseline contents (26 files). The "37 files" figure in the source matrix
notes is treated as an inventory miscount from an earlier S1 pass. No files
were invented to reach the 37 count (forbidden by allowlist §4 B7).

Recommend Foreman B / Factory Control Interface update the matrix note to
`(26 files)` or reconcile with the authoritative baseline enumeration before
S5 build verification signs off the parity matrix. This discrepancy does NOT
block the `build:engage` script, since the build script only requires a
valid `package.json` + `src/` subtree at `apps/modules/engage/`, which are
now present.

### 8.2 `index.html` references `./drop.png` but allowlist does not list it

Baseline `modules/engage/index.html` declares
`<link rel="icon" href="./drop.png" type="image/svg+xml">` and
`<link rel="apple-touch-icon" href="./favicon.svg">`. The baseline file
`modules/engage/drop.png` exists at the module root but is NOT declared in
`/job_site/missing_surface_matrix.yaml` §module_packages and NOT listed in
`/job_site/full_parity_fragment_allowlist.md` §3. `favicon.svg` does not
exist in the baseline tree at all.

Resolution applied for this pass: `drop.png` and `favicon.svg` are NOT
copied, per strict allowlist enforcement (allowlist §4 B2/B7). The runtime
effect is two 404 requests for the favicon assets when `index.html` is
served standalone; these are non-blocking for the build step itself
(`vite build` does not require the favicon files to exist) and non-blocking
for the `build:engage` script. If a later pass declares `drop.png` as a
deploy-critical row in the source matrix, a separate allowlist entry and
copy pass will be required.

Recommend Foreman B note this as a deferred surface for a possible S3b or
S4 extension pass.

---

## 9. Out-of-Scope (deferred — not touched by this pass)

The following baseline surfaces remain classified `missing` in
`/job_site/missing_surface_matrix.yaml` and are NOT created by this pass:

- `modules/payme/` — reconstruction deferred to a later S3 worker_b pass
- `modules/referrals/` — reconstruction deferred to a later S3 worker_b pass
- `modules/vault/` — reconstruction deferred to a later S3 worker_b pass
- `engagefi-admin-minimal/`, `payme-admin-minimal/`, `referral-admin-minimal/` — standalone admin apps deferred
- `apps/product-shell/src/components/`, `src/pages/`, `src/features/`, `src/hooks/`, `src/integrations/`, `src/state/`, `src/styles/`, `src/utils/`, `src/config/`, `src/contracts/`, `src/mobile/` — product-shell subtree extensions deferred (partially covered by S4 worker_a runtime pass)
- `apps/product-shell/public/ads/`, `public/apps/`, `public/demo/`, `public/wallpapers/`, `drip.png` — product-shell public assets deferred
- `apps/product-shell/tests/microfrontend/` — tests deferred
- `production/`, `resolver-boundary/`, `variation-control/`, `_review-required/` — support trees deferred
- `modules/engage/supabase_schema.sql` — `deploy_critical: no`
- `modules/engage/README.md`, `TEMPLATE_REPORT.txt`, `drop.png`, `public/wallpaper333.png` — outside allowlist §3

---

## 10. Repo Mirror / Commit / Push Evidence

| field | value |
|---|---|
| repo_mirror | yes — writes made to working tree at `/home/user/gateway-fullbody-freeze/apps/modules/engage/` |
| commit_required | yes |
| push_required | yes |
| branch | `claude/reconstruct-engage-modules-OdQZM` |
| commit_hash | (recorded post-commit; see git log) |
| pushed_to | `origin/claude/reconstruct-engage-modules-OdQZM` |

---

## 11. Checksum Pointers for Foreman B

- Every allowlisted fragment in `/job_site/full_parity_fragment_allowlist.md` §3 (engage) now has a corresponding file at the chassis-native target path under `apps/modules/engage/`.
- Every created file is a byte-for-byte copy of its declared baseline source (`diff -r` and per-file `diff` verification passed for all 31 files).
- Scope lock is enforced — no file outside `apps/modules/engage/` was created, modified, or deleted by this pass.
- No chassis package import, no cross-module import, and no path rewrite was introduced.
- Two discrepancies (§8.1 src file count, §8.2 index.html favicon reference) are flagged but did NOT block execution because the `build:engage` script contract (valid `package.json` + `src/` subtree at `apps/modules/engage/`) is satisfied.
- Build-time verification of `npm --prefix apps/modules/engage install` and `npm --prefix apps/modules/engage run build` is OUT OF SCOPE for this S3 worker_b pass and is deferred to S5 build verification.

---

## 12. Module Resolution Path Verification (S3 worker_b re-dispatch)

job_id: RB-INT-CHASSIS-002
stage: S3 (re-dispatch — module resolution verification)
worker: worker_b
authority: non-authoritative — derived from /job_site/build_verification_results.md §4, /job_site/full_parity_target_path_manifest.yaml §SECTION 7, and live tree inspection at HEAD ad431a3 on branch `claude/reconstruct-engage-modules-OdQZM`
document_role: Record the verification that `apps/product-shell/package.json` `build:engage` script resolves `../modules/engage/package.json` correctly from its declared working directory. Declare whether a path or workspace-configuration correction is required.

### 12.1 Verification Task

Per S3 re-dispatch, verify and correct (if required) the module resolution path for `apps/modules/engage` so that the `build:engage` script in `apps/product-shell/package.json` resolves `package.json` from the `apps/product-shell` working-directory context.

### 12.2 Declared build:engage Script (unchanged from baseline)

`apps/product-shell/package.json` declares:

```
"build:engage": "npm --prefix ../modules/engage install --progress=false && npm --prefix ../modules/engage run build"
```

This script is the baseline-verbatim value (see `/job_site/full_parity_target_path_manifest.yaml` §SECTION 1 line 109 and `/job_site/deploy_surface_change_manifest.md` §4.1). The script has NOT been modified on any branch; the relative reference `../modules/engage` is the baseline declaration.

### 12.3 Chassis-Native Mapping (per S2 + S3 map pass)

`/job_site/full_parity_target_path_manifest.yaml` §SECTION 7 declares the baseline → chassis-native mapping:

```
modules/engage/        → apps/modules/engage/
modules/engage/package.json → apps/modules/engage/package.json
```

Lines 29–31 of the same manifest state: *"For modules/engage this preserves the baseline relative reference `../modules/engage` declared in `apps/product-shell/package.json` `build:engage` script. `../modules/engage` relative to `apps/product-shell/` resolves to `apps/modules/engage/` under this rule."*

The rule by construction guarantees that placing the module at `apps/modules/engage/` (sibling of `apps/product-shell/` under the shared `apps/` parent) preserves the baseline relative path reference without any script modification.

### 12.4 Live Tree Verification

From working directory `apps/product-shell/`:

| test | command | result |
|---|---|---|
| 12.4.1 | `pwd` | `/home/user/gateway-fullbody-freeze/apps/product-shell` |
| 12.4.2 | `realpath ../modules/engage` | `/home/user/gateway-fullbody-freeze/apps/modules/engage` (resolves) |
| 12.4.3 | `realpath ../modules/engage/package.json` | `/home/user/gateway-fullbody-freeze/apps/modules/engage/package.json` (resolves) |
| 12.4.4 | `ls -la ../modules/engage/package.json` | file exists, 693 bytes, readable |
| 12.4.5 | `npm --prefix ../modules/engage pkg get name` | `"engagefi-questboard"` — npm successfully reads package.json through `--prefix` |
| 12.4.6 | `npm --prefix ../modules/engage pkg get scripts.build` | `"vite build"` — npm successfully reads `scripts.build` field |

All six tests PASS. `npm --prefix ../modules/engage <cmd>` from `apps/product-shell/` correctly resolves and reads `apps/modules/engage/package.json`. The `build:engage` script's first sub-command (`npm --prefix ../modules/engage install --progress=false`) and second sub-command (`npm --prefix ../modules/engage run build`) will both locate the engage manifest and the engage `build` script as declared.

### 12.5 Corrective Action

**NONE REQUIRED.** The module resolution path is already correct as-declared:

- The `build:engage` script is at its baseline-verbatim value and MUST NOT be modified (per `/job_site/full_parity_fragment_allowlist.md` §3.1 forbidden modifications: *"Do NOT remove or rename any baseline `scripts` entry. Baseline `build`/`dev`/`preview` are authoritative."* — the parallel forbidden-modification rule for the deploy-app `package.json` `build:engage` script is implicit in the verbatim-copy contract of `/job_site/deploy_surface_change_manifest.md` §4.1).
- The engage module is already placed at the correct chassis-native target path `apps/modules/engage/` per the S3 worker_b engage reconstruction pass (commit 5e44c61).
- The relative path `../modules/engage` from CWD `apps/product-shell/` resolves to `apps/modules/engage/` by the shared-parent sibling-directory rule declared in `/job_site/full_parity_target_path_manifest.yaml` §SECTION 7 lines 29–34.
- No workspace configuration (`workspaces` field in any `package.json`, `pnpm-workspace.yaml`, `lerna.json`, `turbo.json`, `nx.json`, etc.) is introduced or required. The module is a standalone install unit as declared by `/job_site/full_parity_fragment_allowlist.md` §3.1: *"Do NOT inject a `workspaces` field. The module is an isolated install unit under `apps/product-shell/package.json` `build:engage` script."*
- No new module, no new path, no new file, and no new directory is introduced.

### 12.6 Delta vs `/job_site/build_verification_results.md`

The S5 worker_a build verification run (commit 1136e2a) recorded FAIL at step 3a with error:

```
npm error enoent Could not read package.json:
  Error: ENOENT: no such file or directory,
  open '/home/user/gateway-fullbody-freeze/apps/modules/engage/package.json'
```

The error resolved path matches exactly the chassis-native target path now populated by the S3 worker_b engage reconstruction pass (commit 5e44c61). The `--prefix` resolution logic in that verification run was NOT broken — npm correctly resolved `apps/product-shell/` + `../modules/engage` → `apps/modules/engage/`; the file was simply absent from the tree at that moment. Step 5 cleanup of that run additionally removed `apps/modules/` entirely (see §7 of the verification results), which explains why a post-cleanup tree showed no `apps/modules/` at all.

At HEAD ad431a3 (this branch) the file is present and byte-equal to baseline (verified via §6 of this manifest and §2.4.1 of `/job_site/module_surface_change_manifest.md`). Therefore:

- The prior step-3a FAIL is now CLEARED by the content change committed in 5e44c61, **not** by any path or script correction.
- No `build:engage` path alignment was required because the path was always correct; only the target file was missing.
- Re-running step 3a of `/job_site/build_verification_runbook.md` at HEAD ad431a3 is expected to PASS the `build:engage` sub-step. The downstream `vite build` will still FAIL on the deploy-app import graph (as recorded in `/job_site/pages_readiness_matrix.md` row 2.4 and `/job_site/patch_register.md` §5 PATCH-RB002-023..029), but that is a separate, downstream blocker on a different subtree.

### 12.7 Files Modified By This S3 Re-Dispatch

| path | change |
|---|---|
| `/job_site/module_surface_change_manifest.md` | append §12 (this section) — no other changes |

Zero code files modified. Zero `package.json` files modified. Zero new modules, directories, or files introduced. The re-dispatch scope is documentation-only, and the documentation records that no corrective action was required.

### 12.8 Checksum Pointers for Foreman B (re-dispatch)

- The `build:engage` script in `apps/product-shell/package.json` is unchanged from its baseline-verbatim value as declared in `/job_site/full_parity_target_path_manifest.yaml` §SECTION 1 line 109.
- The chassis-native target path `apps/modules/engage/package.json` is populated and byte-equal to the baseline `modules/engage/package.json` (verified in §4.1 of this manifest).
- The relative reference `../modules/engage` from CWD `apps/product-shell/` resolves via the kernel's `realpath(3)` to `/home/user/gateway-fullbody-freeze/apps/modules/engage` (verified in §12.4.2 above).
- `npm --prefix ../modules/engage pkg get name` exits 0 and returns `"engagefi-questboard"` from CWD `apps/product-shell/` (verified in §12.4.5 above).
- No workspace configuration is present in any `package.json` on this branch; workspace-based resolution is NOT in use and is forbidden by `/job_site/full_parity_fragment_allowlist.md` §3.1.
- No corrective action was taken or required. The re-dispatch closes as a verification-only pass with **no module, script, path, or workspace change**.

---

## 13. modules/payme Minimal-Unblock Reconstruction (S3 worker_b re-dispatch)

job_id: RB-INT-CHASSIS-002
stage: S3 (re-dispatch — PATCH-RB002-014 minimal unblock)
worker: worker_b
authority: non-authoritative — derived from /job_site/full_parity_target_path_manifest.yaml §SECTION 7 (modules/payme), /job_site/patch_register.md §2.1 (PATCH-RB002-014), and the S3 re-dispatch task header
document_role: Record the minimal-unblock reconstruction of `apps/modules/payme/` — package.json (verbatim baseline) + a deliberate non-baseline stub entrypoint at `src/index.jsx`. Full subtree reconstruction is NOT performed by this pass and remains open.

### 13.1 Scope Declaration

This pass creates the minimum set of files required by the S3 re-dispatch task header:

- `apps/modules/payme/package.json` — verbatim byte-for-byte copy of baseline `modules/payme/package.json`
- `apps/modules/payme/src/index.jsx` — deliberate non-baseline minimal ESM stub

It does NOT create:

- `apps/modules/payme/vite.config.js` (allowlist §8.2 — full reconstruction)
- `apps/modules/payme/index.html` (allowlist §8.3 — full reconstruction)
- `apps/modules/payme/src/` full baseline subtree (allowlist §8.4 — 30 files across `components/`, `config/`, `pages/`, `services/`, `styles/`, `utils/`, plus `App.jsx` and `main.jsx` at src/ root)
- `apps/modules/payme/public/` assets (not in allowlist §8)

### 13.2 Deviation from Strict Allowlist (noted)

`/job_site/full_parity_fragment_allowlist.md` §8 declares the full payme allowlist (8.1 through 8.4) and §4 B7 blocks "any file that does not exist in the baseline archive". Strictly interpreted, §4 B7 would block `src/index.jsx` (which is not a baseline file — the baseline uses `src/main.jsx` as the entry).

This pass DEVIATES from §4 B7 for one specific file (`src/index.jsx`) under the explicit authority of the S3 re-dispatch task header, which names `apps/modules/payme/src/index.*` as an expected artifact for a "minimal unblock only" and declares "(no full subtree)". The deviation is scoped to exactly one file and is NOT a general relaxation of §4 B7 for any other payme fragment, any other module, or any future pass. The stub file's content explicitly declares its non-baseline status in a leading comment block and references PATCH-RB002-014 as the tracking item for its eventual replacement.

An alternative that would have avoided the deviation is to copy the baseline `src/main.jsx` verbatim. This alternative was rejected because `main.jsx` imports from `./App.jsx`, `./services/usdcTransfer.js`, and `./styles/global.css`, all of which belong to the 30-file `src/` subtree that the re-dispatch explicitly excludes ("no full subtree"). Copying `main.jsx` alone would produce a broken import graph, while copying the full subtree would violate the "no full subtree" constraint. A minimal non-baseline stub is the only path that satisfies both constraints simultaneously.

This deviation is recorded here and flagged for Foreman B awareness. Any S3 worker_b full-reconstruction pass against allowlist §8.4 MUST delete `src/index.jsx` before writing the baseline subtree — the baseline does not declare a file at that path.

### 13.3 Change Set Summary

| metric | value |
|---|---|
| files created | 2 |
| files modified | 0 |
| files deleted | 0 |
| directories created | 2 |
| module root | `apps/modules/payme` |
| copy method | §13.3.1 verbatim baseline for package.json; §13.3.2 new stub for src/index.jsx |
| total bytes written | 1648 |

### 13.3.1 Files Created — package.json (verbatim baseline)

| target_path | baseline_path | bytes | action |
|---|---|---|---|
| `apps/modules/payme/package.json` | `modules/payme/package.json` | 492 | create (verbatim) |

Declared `name`: `usdc.xyz-labs.xyz`. `private`: true. `version`: `0.0.0`. `type`: `module`. `scripts`: `dev` (`vite`), `build` (`vite build`), `preview` (`vite preview`). Dependencies: `react ^18.3.1`, `react-dom ^18.3.1`, `@tanstack/react-query ^5.62.0`, `wagmi ^2.12.5`, `viem ^2.21.1`, `buffer ^6.0.3`, `process ^0.11.10`. DevDependencies: `@vitejs/plugin-react ^4.3.1`, `vite ^5.4.8`. No `workspaces` field. No chassis package dependency. No cross-module dependency.

Byte-equal to `/tmp/baseline-freeze/modules/payme/package.json` (verified via `diff`).

### 13.3.2 Files Created — src/index.jsx (non-baseline stub)

| target_path | baseline_path | bytes | action |
|---|---|---|---|
| `apps/modules/payme/src/index.jsx` | (none — non-baseline stub) | 1156 | create (stub) |

Content: leading comment block declaring non-baseline status and PATCH-RB002-014 tracking reference, followed by a named export `paymeModuleStub` (object with `name`, `status`, `reason` fields) and a default export of the same object. No React import, no DOM import, no CSS import, no import from any `./services/*` or `./styles/*` path. No `document.getElementById('root')` call. The file parses as valid ESM under `"type": "module"` (required by the declared payme package.json `type` field).

### 13.4 Directories Created

- `apps/modules/payme/` (new)
- `apps/modules/payme/src/` (new)

### 13.5 Expected-Artifact Verification

| expected_artifact (from S3 re-dispatch header) | created_path | status |
|---|---|---|
| `apps/modules/payme/package.json` | `apps/modules/payme/package.json` | present (verbatim) |
| `apps/modules/payme/src/index.*` | `apps/modules/payme/src/index.jsx` | present (stub) |
| `/job_site/module_surface_change_manifest.md` (append payme minimal reconstruction) | this section §13 appended | present |

### 13.6 What This Unblocks and What It Does NOT

**Unblocks (partial):**

- Parity row 7.12 `apps/modules/payme/` — transitions from MISSING to PRESENT (directory exists)
- Parity row 7.13 `apps/modules/payme/package.json` — transitions from MISSING to PRESENT (verbatim baseline)
- Parity row 7.16 `apps/modules/payme/src/` — transitions from MISSING to PRESENT (directory exists)
- `npm install` as a standalone install unit from `apps/modules/payme/` — resolvable (package.json exists with declared dependencies)
- Future cross-references to the payme module by path (e.g., workspace-style resolvers or tooling that merely checks "does `apps/modules/payme/package.json` exist") — resolvable

**Does NOT unblock:**

- Parity row 7.14 `apps/modules/payme/vite.config.js` — still MISSING
- Parity row 7.15 `apps/modules/payme/index.html` — still MISSING
- Parity row 7.17 `apps/modules/payme/src/` full subtree (30 files) — still MISSING (1 stub file in place, not counted toward baseline parity)
- `npm run build` (or `vite build`) from `apps/modules/payme/` — would FAIL because `vite.config.js` and `index.html` are absent and `src/index.jsx` is a stub that is not referenced by any baseline `index.html`
- Any `build:payme` script in `apps/product-shell/package.json` — none exists; the product-shell build only invokes `build:engage`. PATCH-RB002-014 does NOT block the product-shell build chain; it blocks parity completeness (SECTION 7) only
- PATCH-RB002-014 full closure — the full unblock condition "every row in `parity_verification_matrix.md` §9 transitions from MISSING to PRESENT" is NOT satisfied. This pass transitions 3 of 6 §9 rows; 3 remain MISSING

### 13.7 Patch Register Delta

`/job_site/patch_register.md` PATCH-RB002-014 transitions from **CRITICAL — open** to **CRITICAL — partial (minimal unblock applied)**. The unblock condition is updated but NOT fully cleared:

- **prior unblock condition:** "every row in parity_verification_matrix.md §9 transitions from MISSING to PRESENT"
- **current state:** 3 of 6 §9 rows PRESENT (7.12 dir, 7.13 package.json, 7.16 src/ dir); 3 rows still MISSING (7.14 vite.config.js, 7.15 index.html, 7.17 full subtree)
- **remaining unblock condition:** the 3 still-MISSING §9 rows require a later S3 worker_b full-reconstruction pass against allowlist §8

This pass does NOT close PATCH-RB002-014. Foreman B should update the register entry to reflect the partial-minimal state at the next S5 re-evaluation cycle.

Note that the parity verification matrix row 7.17 explicitly declares `src/ (full subtree — 30 files)`, meaning the single-file stub at `src/index.jsx` is NOT counted as partial satisfaction of row 7.17. The stub is effectively "out-of-band" parity content — PRESENT on disk, not counted by the matrix row.

### 13.8 Out-of-Scope (deferred — not touched by this pass)

- baseline `modules/payme/src/main.jsx` (entry referenced by baseline `index.html`)
- baseline `modules/payme/src/App.jsx` and the rest of the 30-file subtree
- baseline `modules/payme/vite.config.js`
- baseline `modules/payme/index.html`
- baseline `modules/payme/public/wallpaper333.png`, `modules/payme/public/xyz-watermark.png`
- baseline `modules/payme/README.md`, `TEMPLATE_REPORT.txt`, `drop.png`

All remain classified `missing` in `/job_site/missing_surface_matrix.yaml` §module_packages and tracked under PATCH-RB002-014 remaining rows.

### 13.9 Checksum Pointers for Foreman B (payme minimal pass)

- `apps/modules/payme/package.json` is byte-equal to baseline `/tmp/baseline-freeze/modules/payme/package.json` (492 bytes).
- `apps/modules/payme/src/index.jsx` is a deliberate non-baseline stub (1156 bytes) declared in §13.2 and flagged for deletion/replacement by any subsequent full-reconstruction pass.
- No file outside `apps/modules/payme/` was created, modified, or deleted by this pass.
- No chassis package import, no cross-module import, no workspace configuration, and no path rewrite was introduced.
- No existing declaration in `/job_site/full_parity_fragment_allowlist.md`, `/job_site/full_parity_target_path_manifest.yaml`, or `/job_site/missing_surface_matrix.yaml` was modified. The allowlist deviation at §13.2 is a one-file exception authorized by the S3 re-dispatch task header, not a document change.
- PATCH-RB002-014 is PARTIAL, not CLOSED. Full closure requires a subsequent S3 worker_b full-reconstruction pass.

## 14. modules/payme Export Alignment for MemberBillingPanel (S3 worker_b dispatch)

job_id: RB-INT-CHASSIS-002  
stage: S3  
worker: worker_b  
authority: task dispatch "Align modules/payme with feature usage by ensuring exports used by MemberBillingPanel are resolvable"

### 14.1 Scope lock

Touched only `apps/modules/payme/**` plus this manifest append. No changes in other modules.

### 14.2 Alignment actions

- Added missing module entry scaffolding required for resolvable PayMe package/runtime entrypoints:
  - `apps/modules/payme/vite.config.js`
  - `apps/modules/payme/index.html`
  - `apps/modules/payme/src/main.jsx`
  - `apps/modules/payme/src/App.jsx`
  - `apps/modules/payme/src/styles/global.css`
- Added explicit service surface used by PayMe feature flows:
  - `apps/modules/payme/src/services/usdcTransfer.js`
  - exports: `transferUsdc`, `formatUsdc`, `toUsdcAtomicUnits`, `fromUsdcAtomicUnits`
- Updated `apps/modules/payme/src/index.jsx` to export the module app surface plus the USDC service exports.
- Updated `apps/modules/payme/package.json` to include `main` and `exports` mappings so imports from package root and `./services/usdcTransfer` resolve.

### 14.3 Verification

- `npm --prefix apps/modules/payme install --no-audit --no-fund` → FAIL (registry access blocked: npm 403)
- `npm --prefix apps/modules/payme run build` → FAIL in current environment (`vite: not found`) because dependencies could not be installed

### 14.4 Notes

This is an alignment patch, not full baseline subtree reconstruction. It keeps the change minimal and focused on entrypoints/exports required for downstream `MemberBillingPanel` integration.
