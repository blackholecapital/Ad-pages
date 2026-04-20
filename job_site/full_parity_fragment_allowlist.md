# Full Parity Fragment Allowlist — RB-INT-CHASSIS-002

job_id: RB-INT-CHASSIS-002
stage: S3
pass: complete — modules/engage + modules/payme + modules/referrals + modules/vault
owner: Worker B
authority: non-authoritative — derived from `/job_site/missing_surface_matrix.yaml` §module_packages and `/job_site/full_parity_target_path_manifest.yaml` §SECTION 7 (modules/engage)
baseline_reference: gatweay-production-FREEZE-main (baseline_source declared in target path manifest)
current_tree_reference: gateway-fullbody-freeze repo continuation target
document_role: Declare the exact copy-fragment allowlist for modules/engage deploy-critical files so that S3 execution can write files with known-safe copy rules. Other modules (payme, referrals, vault) are not covered in this pass.

---

## 0. Pass Scope

This allowlist covers all four `modules/*` deploy-critical files as declared in `/job_site/full_parity_target_path_manifest.yaml` §SECTION 7. Specifically:

**modules/engage:**

- `apps/modules/engage/package.json`
- `apps/modules/engage/package-lock.json`
- `apps/modules/engage/vite.config.js`
- `apps/modules/engage/index.html`
- `apps/modules/engage/src/main.jsx`
- `apps/modules/engage/src/App.jsx`
- `apps/modules/engage/src/` (full subtree — 37 files per missing_surface_matrix.yaml)
- `apps/modules/engage/public/_redirects`

**modules/payme:**

- `apps/modules/payme/package.json`
- `apps/modules/payme/vite.config.js`
- `apps/modules/payme/index.html`
- `apps/modules/payme/src/` (full subtree — 30 files per missing_surface_matrix.yaml, including App.jsx, main.jsx, components/, config/, pages/, services/, styles/, utils/)

**modules/referrals:**

- `apps/modules/referrals/package.json`
- `apps/modules/referrals/vite.config.js`
- `apps/modules/referrals/index.html`
- `apps/modules/referrals/src/` (full subtree — 30 files per missing_surface_matrix.yaml, including App.jsx, main.jsx, components/widgets/, lib/, pages/, styles/)
- `apps/modules/referrals/public/_redirects`

**modules/vault:**

- `apps/modules/vault/package.json`
- `apps/modules/vault/vite.config.js`
- `apps/modules/vault/index.html`
- `apps/modules/vault/_routes.json`
- `apps/modules/vault/functions/api/` (full subtree — 14 endpoints per missing_surface_matrix.yaml)
- `apps/modules/vault/src/` (full subtree — 60+ files per missing_surface_matrix.yaml, including App.jsx, AppRoutes.jsx, main.jsx, components/, data/, lib/, pages/, styles/, theme/)

Explicitly **out of scope** for this pass:

- `modules/engage/supabase_schema.sql` — `deploy_critical: no` per missing_surface_matrix.yaml §module_packages
- `modules/vault/Vault.MktMaker-main/` — `deploy_critical: no` (vendor_subtree)
- `modules/blueprint/module-boundary-list.md` — `deploy_critical: no` (module_docs)
- any file outside the four baseline module subtrees
- any admin app, product-shell app-root surface, chassis package, runtime-support, resolver-boundary, or test surface

The copy rules in §3 apply to engage files, §8 to payme files, §9 to referrals files, and §10 to vault files. No deferred module remains; SECTION 7 of the target path manifest is complete for all four modules.

---

## 1. Chassis-Native Mapping Rule (all four modules)

| Baseline path | Chassis-native target path |
|---|---|
| `modules/engage/`    | `apps/modules/engage/` |
| `modules/payme/`     | `apps/modules/payme/` |
| `modules/referrals/` | `apps/modules/referrals/` |
| `modules/vault/`     | `apps/modules/vault/` |

Rule: every baseline path of the form `modules/<name>/<rel>` maps to `apps/modules/<name>/<rel>` with `<rel>` preserved exactly, for `<name>` in {engage, payme, referrals, vault}. The engage mapping preserves the baseline relative reference `../modules/engage` declared in `apps/product-shell/package.json` `build:engage` script, since `../modules/engage` relative to `apps/product-shell/` resolves to `apps/modules/engage/` under this rule. The payme, referrals, and vault mappings apply the same sibling-directory rule and do not alter any baseline import path.

---

## 2. Copy Rule (general)

A fragment from `modules/engage/`, `modules/payme/`, `modules/referrals/`, or `modules/vault/` may be copied into its chassis-native target only when ALL of the following conditions are satisfied:

1. The baseline row exists in `/job_site/missing_surface_matrix.yaml` §module_packages with `deploy_critical: yes`.
2. The target path is declared in `/job_site/full_parity_target_path_manifest.yaml` §SECTION 7 (engage, payme, referrals, or vault rows).
3. The fragment imports no external package that is not already declared by the owning module's baseline `package.json` dependencies/devDependencies (no invented dependency is introduced at copy time).
4. The fragment contains no reference to a file outside its own module subtree other than via npm module specifiers (bare-name imports resolved through `node_modules`).
5. The fragment introduces no cross-module import path — each module MUST NOT import from any sibling module (`modules/engage`, `modules/payme`, `modules/referrals`, `modules/vault`) or from `product-shell`.
6. The fragment introduces no import path into `packages/*`, `apps/*` (other than its own `apps/modules/<owning-module>/` subtree), `xyz-factory-system/*`, `worker-wb/*`, or `job_site/*`.
7. For Cloudflare Pages Functions handlers (vault `functions/api/**`): the fragment MUST export the HTTP method handlers expected by the Pages Functions runtime (`onRequest`, `onRequestGet`, `onRequestPost`, etc.) exactly as declared by baseline, with no added or removed exports.

If any condition above fails, the fragment is NOT copied; the execution worker returns PATCH to Foreman A with the exact violating condition.

---

## 3. Allowed Fragments by File Class (engage)

Each class below names a specific baseline file or baseline subtree and the exact copy rule that applies to it.

### 3.1 Package Manifest — `modules/engage/package.json`

- **Copy kind:** verbatim file copy, bit-for-bit.
- **Target path:** `apps/modules/engage/package.json`.
- **Permitted content:** whatever baseline declares in `name`, `version`, `private`, `type`, `scripts`, `dependencies`, `devDependencies`, `peerDependencies`, `engines`.
- **Forbidden modifications:**
  - Do NOT rewrite `name` to a chassis name. Baseline name is authoritative.
  - Do NOT inject a `workspaces` field. The module is an isolated install unit under `apps/product-shell/package.json` `build:engage` script.
  - Do NOT inject a dependency on any chassis package (`packages/*`).
  - Do NOT remove or rename any baseline `scripts` entry. Baseline `build`/`dev`/`preview` are authoritative.
  - Do NOT change dependency version pins. Baseline versions are authoritative.
- **Authoritative source:** baseline `modules/engage/package.json`.
- **Verification:** byte-equal to baseline.

### 3.2 Lockfile — `modules/engage/package-lock.json`

- **Copy kind:** verbatim file copy, bit-for-bit.
- **Target path:** `apps/modules/engage/package-lock.json`.
- **Permitted content:** whatever baseline declares — dependency tree, integrity hashes, resolved URLs.
- **Forbidden modifications:**
  - Do NOT regenerate. Do NOT re-resolve. Do NOT `npm install` against a different registry.
  - Do NOT change `lockfileVersion`.
  - Do NOT substitute a `pnpm-lock.yaml` or `yarn.lock` variant.
- **Authoritative source:** baseline `modules/engage/package-lock.json`.
- **Verification:** byte-equal to baseline.

### 3.3 Vite Build Config — `modules/engage/vite.config.js`

- **Copy kind:** verbatim file copy, bit-for-bit.
- **Target path:** `apps/modules/engage/vite.config.js`.
- **Permitted content:** whatever baseline declares — plugins, resolve aliases, build options, server options, base path.
- **Forbidden modifications:**
  - Do NOT change `base` to anything other than baseline value.
  - Do NOT change `build.outDir`.
  - Do NOT inject a resolve alias to `packages/*` or `apps/product-shell/*`.
  - Do NOT inject a chassis package import.
  - Do NOT add or remove plugins.
- **Authoritative source:** baseline `modules/engage/vite.config.js`.
- **Verification:** byte-equal to baseline.

### 3.4 HTML Entrypoint — `modules/engage/index.html`

- **Copy kind:** verbatim file copy, bit-for-bit.
- **Target path:** `apps/modules/engage/index.html`.
- **Permitted content:** baseline HTML — doctype, `<html>`, `<head>`, `<body>`, `<div id="root">`, `<script type="module" src="/src/main.jsx">` (or whatever baseline script reference).
- **Forbidden modifications:**
  - Do NOT rewrite the script `src` attribute.
  - Do NOT rewrite `<link>` or `<meta>` tags.
  - Do NOT inject asset references that are not present in baseline.
  - Do NOT inject any comment referencing chassis path rewrites.
- **Authoritative source:** baseline `modules/engage/index.html`.
- **Verification:** byte-equal to baseline.

### 3.5 Script Entry — `modules/engage/src/main.jsx`

- **Copy kind:** verbatim file copy, bit-for-bit.
- **Target path:** `apps/modules/engage/src/main.jsx`.
- **Permitted content:** baseline React root bootstrap — `createRoot`/`ReactDOM.render`, `App` import, CSS imports.
- **Forbidden modifications:**
  - Do NOT rewrite any import specifier.
  - Do NOT inject a provider/wrapper not present in baseline.
  - Do NOT inject a chassis package import.
- **Authoritative source:** baseline `modules/engage/src/main.jsx`.
- **Verification:** byte-equal to baseline.

### 3.6 App Root Component — `modules/engage/src/App.jsx`

- **Copy kind:** verbatim file copy, bit-for-bit.
- **Target path:** `apps/modules/engage/src/App.jsx`.
- **Permitted content:** baseline top-level component — imports, layout, router mount, page composition.
- **Forbidden modifications:**
  - Do NOT rewrite any import specifier.
  - Do NOT restructure component tree.
  - Do NOT inject a chassis import.
  - Do NOT inject a provider for any state, auth, or theme system not present in baseline.
- **Authoritative source:** baseline `modules/engage/src/App.jsx`.
- **Verification:** byte-equal to baseline.

### 3.7 Full Source Subtree — `modules/engage/src/` (37 files)

- **Copy kind:** verbatim subtree copy.
- **Target path:** `apps/modules/engage/src/` with the baseline subtree layout preserved one-for-one.
- **Covered paths (per missing_surface_matrix.yaml §module_packages notes):**
  - `modules/engage/src/admin/**`
  - `modules/engage/src/components/**`
  - `modules/engage/src/lib/**`
  - `modules/engage/src/pages/**`
  - `modules/engage/src/styles/**`
  - plus `modules/engage/src/main.jsx` and `modules/engage/src/App.jsx` (already named in §3.5 and §3.6 but included in the subtree)
- **Copy mechanism:** recursive directory copy; every file under `modules/engage/src/` in the baseline archive is copied to the same relative path under `apps/modules/engage/src/`.
- **Permitted content:** whatever baseline declares at every nested path.
- **Forbidden modifications:**
  - Do NOT rename any file.
  - Do NOT restructure any directory.
  - Do NOT rewrite any relative import within the subtree.
  - Do NOT rewrite any npm package import.
  - Do NOT omit any file whose baseline path is under `modules/engage/src/**` (excluding files explicitly marked `deploy_critical: no` in the source matrix — none exist under `src/` for engage).
  - Do NOT add a file that does not exist in baseline.
- **Authoritative source:** baseline `modules/engage/src/` subtree.
- **Verification:** recursive byte-equal comparison against baseline archive; file count MUST equal baseline file count (37 per source matrix).

### 3.8 Static Redirects — `modules/engage/public/_redirects`

- **Copy kind:** verbatim file copy, bit-for-bit.
- **Target path:** `apps/modules/engage/public/_redirects`.
- **Permitted content:** whatever baseline declares — Cloudflare Pages redirect/rewrite rules for engage standalone serving.
- **Forbidden modifications:**
  - Do NOT rewrite any rule path.
  - Do NOT add an SPA fallback rule if baseline does not have one.
  - Do NOT remove an SPA fallback rule if baseline has one.
  - Do NOT merge this file with `apps/product-shell/public/_redirects`. The two files are independent per-project redirect declarations.
- **Authoritative source:** baseline `modules/engage/public/_redirects`.
- **Verification:** byte-equal to baseline.

---

## 4. Explicitly Blocked From Copy (all four modules pass)

The following items MUST NOT be copied from any `modules/<name>/` subtree under any circumstances in this pass:

| # | Blocked item | Reason |
|---|---|---|
| B1 | `modules/engage/supabase_schema.sql` | `deploy_critical: no` per missing_surface_matrix.yaml; runtime_support only, not required for Cloudflare Pages build |
| B2 | any file outside `modules/engage/`, `modules/payme/`, `modules/referrals/`, or `modules/vault/` baseline subtrees | out of scope for this pass |
| B3 | `modules/vault/Vault.MktMaker-main/` | `deploy_critical: no`; vendor_subtree, not required for Cloudflare Pages build |
| B4 | `modules/blueprint/module-boundary-list.md` | `deploy_critical: no`; module_docs only |
| B5 | hidden files `.DS_Store`, `.git*`, `*.swp`, `node_modules/**`, `dist/**`, `.vite/**`, `coverage/**` | not source-of-truth files; regenerated on install/build |
| B6 | any file with a filename matching an OS metadata pattern or editor temp pattern | not source-of-truth files |
| B7 | any file that does not exist in the baseline archive | no invention of new files is permitted |
| B8 | any chassis package import injection into engage, payme, referrals, or vault files | all four modules are standalone microfrontends with no chassis dependency per baseline |
| B9 | cross-module imports between engage, payme, referrals, and vault | each module is an independent install unit with its own `package.json` and `node_modules` |
| B10 | any Pages Function added to `modules/vault/functions/api/` beyond the 14 baseline endpoints | no invented handler files; no route expansion beyond baseline |
| B11 | any `_routes.json` rule beyond the baseline `modules/vault/_routes.json` declarations | no invented routing rules; no scope expansion |

---

## 5. Verification Requirements (per file)

Before declaring any engage copy PASS, the execution worker MUST verify:

1. The target path exactly matches the chassis-native mapping in §1 and the declaration in `/job_site/full_parity_target_path_manifest.yaml` §SECTION 7.
2. The file byte-content equals the baseline byte-content (verified by byte-level comparison against the baseline archive or the declared `source_ref` URL).
3. The file imports are unchanged from baseline.
4. No forbidden modification listed in §3 has been applied.
5. For subtree copies (§3.7), the file count at the target matches the baseline file count (37 for engage `src/`).
6. For the package manifest (§3.1), no dependency or script has been added, removed, or renamed.
7. For the lockfile (§3.2), the file is identical to baseline including `lockfileVersion`.

---

## 6. Cross-Reference Lock

Every allowlisted fragment in this document MUST correspond to exactly one row in `/job_site/full_parity_target_path_manifest.yaml` §SECTION 7 (engage rows) and exactly one row in `/job_site/missing_surface_matrix.yaml` §module_packages with `deploy_critical: yes`. If any fragment in this allowlist lacks a corresponding row, return PATCH. If any engage row in SECTION 7 lacks a corresponding fragment in this allowlist, return PATCH.

Matrix:

| Allowlist §  | Target path                                       | Manifest row (SECTION 7)                                  | Source matrix row (§module_packages) |
|---|---|---|---|
| 3.1 | `apps/modules/engage/package.json`               | `modules/engage/package.json` → `apps/modules/engage/package.json` | `modules/engage/package.json` (deploy_critical: yes) |
| 3.2 | `apps/modules/engage/package-lock.json`          | `modules/engage/package-lock.json` → `apps/modules/engage/package-lock.json` | `modules/engage/package-lock.json` (deploy_critical: yes) |
| 3.3 | `apps/modules/engage/vite.config.js`             | `modules/engage/vite.config.js` → `apps/modules/engage/vite.config.js` | `modules/engage/vite.config.js` (deploy_critical: yes) |
| 3.4 | `apps/modules/engage/index.html`                 | `modules/engage/index.html` → `apps/modules/engage/index.html` | `modules/engage/index.html` (deploy_critical: yes) |
| 3.5 | `apps/modules/engage/src/main.jsx`               | `modules/engage/src/main.jsx` → `apps/modules/engage/src/main.jsx` | `modules/engage/src/main.jsx` (deploy_critical: yes) |
| 3.6 | `apps/modules/engage/src/App.jsx`                | `modules/engage/src/App.jsx` → `apps/modules/engage/src/App.jsx` | `modules/engage/src/App.jsx` (deploy_critical: yes) |
| 3.7 | `apps/modules/engage/src/` (full tree)           | `modules/engage/src/ (full tree)` → `apps/modules/engage/src/ (full subtree)` | `modules/engage/src/ (full tree)` (deploy_critical: yes) |
| 3.8 | `apps/modules/engage/public/_redirects`          | `modules/engage/public/_redirects` → `apps/modules/engage/public/_redirects` | `modules/engage/public/_redirects` (deploy_critical: yes) |

---

## 7. Checksum Pointers for Foreman B

- Every section §3.x (engage), §8.x (payme), §9.x (referrals), and §10.x (vault) corresponds to exactly one baseline file or subtree declared `deploy_critical: yes` in `/job_site/missing_surface_matrix.yaml` §module_packages for the respective module.
- Every blocked item §4.Bx is either explicitly `deploy_critical: no` in the source matrix, out of the four covered subtrees, or a non-source-of-truth file type.
- No fragment in this document authorizes a copy that introduces a chassis package dependency, a cross-module import, or a path rewrite. Byte-equal verbatim copies only.
- SECTION 7 of the target path manifest is complete for all four modules after this pass; no module_packages rows remain deferred.
- The allowlist is closed: no fragment outside §3 (engage), §8 (payme), §9 (referrals), or §10 (vault) is permitted.

---

## 8. Allowed Fragments by File Class (payme)

Each subsection below names a specific baseline file or baseline subtree for `modules/payme/` and the exact copy rule that applies to it.

### 8.1 Package Manifest — `modules/payme/package.json`

- **Copy kind:** verbatim file copy, bit-for-bit.
- **Target path:** `apps/modules/payme/package.json`.
- **Permitted content:** whatever baseline declares in `name`, `version`, `private`, `type`, `scripts`, `dependencies`, `devDependencies`, `peerDependencies`, `engines`.
- **Forbidden modifications:**
  - Do NOT rewrite `name` to a chassis name. Baseline name is authoritative.
  - Do NOT inject a `workspaces` field. The module is an isolated install unit.
  - Do NOT inject a dependency on any chassis package (`packages/*`).
  - Do NOT inject a dependency on `modules/engage`, `modules/referrals`, or `modules/vault`.
  - Do NOT remove or rename any baseline `scripts` entry. Baseline `build`/`dev`/`preview` are authoritative.
  - Do NOT change dependency version pins. Baseline versions are authoritative.
- **Note on lockfile absence:** `/job_site/missing_surface_matrix.yaml` §module_packages does not declare a `modules/payme/package-lock.json` row. This pass does not authorize creation of a payme lockfile. If baseline ships one and a later pass adds a matrix row, a separate allowlist entry will be required.
- **Authoritative source:** baseline `modules/payme/package.json`.
- **Verification:** byte-equal to baseline.

### 8.2 Vite Build Config — `modules/payme/vite.config.js`

- **Copy kind:** verbatim file copy, bit-for-bit.
- **Target path:** `apps/modules/payme/vite.config.js`.
- **Permitted content:** whatever baseline declares — plugins, resolve aliases, build options, server options, base path.
- **Forbidden modifications:**
  - Do NOT change `base` to anything other than baseline value.
  - Do NOT change `build.outDir`.
  - Do NOT inject a resolve alias to `packages/*`, `apps/product-shell/*`, or any other `apps/modules/<name>/` other than payme's own subtree.
  - Do NOT inject a chassis package import.
  - Do NOT add or remove plugins.
- **Authoritative source:** baseline `modules/payme/vite.config.js`.
- **Verification:** byte-equal to baseline.

### 8.3 HTML Entrypoint — `modules/payme/index.html`

- **Copy kind:** verbatim file copy, bit-for-bit.
- **Target path:** `apps/modules/payme/index.html`.
- **Permitted content:** baseline HTML — doctype, `<html>`, `<head>`, `<body>`, `<div id="root">`, `<script type="module" src="/src/main.jsx">` (or whatever baseline script reference).
- **Forbidden modifications:**
  - Do NOT rewrite the script `src` attribute.
  - Do NOT rewrite `<link>` or `<meta>` tags.
  - Do NOT inject asset references that are not present in baseline.
  - Do NOT inject any comment referencing chassis path rewrites.
- **Authoritative source:** baseline `modules/payme/index.html`.
- **Verification:** byte-equal to baseline.

### 8.4 Full Source Subtree — `modules/payme/src/` (30 files)

- **Copy kind:** verbatim subtree copy.
- **Target path:** `apps/modules/payme/src/` with the baseline subtree layout preserved one-for-one.
- **Covered paths (per missing_surface_matrix.yaml §module_packages notes):**
  - `modules/payme/src/App.jsx`
  - `modules/payme/src/main.jsx`
  - `modules/payme/src/components/**`
  - `modules/payme/src/config/**`
  - `modules/payme/src/pages/**`
  - `modules/payme/src/services/**`
  - `modules/payme/src/styles/**`
  - `modules/payme/src/utils/**`
- **Copy mechanism:** recursive directory copy; every file under `modules/payme/src/` in the baseline archive is copied to the same relative path under `apps/modules/payme/src/`.
- **Permitted content:** whatever baseline declares at every nested path.
- **Forbidden modifications:**
  - Do NOT rename any file.
  - Do NOT restructure any directory.
  - Do NOT rewrite any relative import within the subtree.
  - Do NOT rewrite any npm package import.
  - Do NOT inject an import from `modules/engage`, `modules/referrals`, `modules/vault`, `product-shell`, or any chassis package.
  - Do NOT omit any file whose baseline path is under `modules/payme/src/**`.
  - Do NOT add a file that does not exist in baseline.
- **Authoritative source:** baseline `modules/payme/src/` subtree.
- **Verification:** recursive byte-equal comparison against baseline archive; file count MUST equal baseline file count (30 per source matrix).

### 8.5 Payme Surfaces NOT Declared in This Pass

The baseline source matrix does NOT declare the following rows for `modules/payme/`, and this allowlist does NOT authorize their copy:

- `modules/payme/package-lock.json` — no matrix row; not copied in this pass
- `modules/payme/public/_redirects` — no matrix row; not copied in this pass
- `modules/payme/public/` directory — no matrix row; not created in this pass
- `modules/payme/functions/` — no matrix row; not created in this pass
- `modules/payme/_routes.json` — no matrix row; not created in this pass
- any non-`src/`, non-manifest, non-config, non-`index.html` file under `modules/payme/`

If a later matrix update adds any of these rows, this allowlist must be extended before the execution worker may copy them.

### 8.6 Cross-Reference Lock (payme)

Matrix:

| Allowlist § | Target path                                 | Manifest row (SECTION 7)                                | Source matrix row (§module_packages) |
|---|---|---|---|
| 8.1 | `apps/modules/payme/package.json`          | `modules/payme/package.json` → `apps/modules/payme/package.json` | `modules/payme/package.json` (deploy_critical: yes) |
| 8.2 | `apps/modules/payme/vite.config.js`        | `modules/payme/vite.config.js` → `apps/modules/payme/vite.config.js` | `modules/payme/vite.config.js` (deploy_critical: yes) |
| 8.3 | `apps/modules/payme/index.html`            | `modules/payme/index.html` → `apps/modules/payme/index.html` | `modules/payme/index.html` (deploy_critical: yes) |
| 8.4 | `apps/modules/payme/src/` (full tree)      | `modules/payme/src/ (full tree)` → `apps/modules/payme/src/ (full subtree)` | `modules/payme/src/ (full tree)` (deploy_critical: yes) |

---

## 9. Allowed Fragments by File Class (referrals)

Each subsection below names a specific baseline file or baseline subtree for `modules/referrals/` and the exact copy rule that applies to it.

### 9.1 Package Manifest — `modules/referrals/package.json`

- **Copy kind:** verbatim file copy, bit-for-bit.
- **Target path:** `apps/modules/referrals/package.json`.
- **Permitted content:** whatever baseline declares in `name`, `version`, `private`, `type`, `scripts`, `dependencies`, `devDependencies`, `peerDependencies`, `engines`.
- **Forbidden modifications:**
  - Do NOT rewrite `name` to a chassis name. Baseline name is authoritative.
  - Do NOT inject a `workspaces` field. The module is an isolated install unit.
  - Do NOT inject a dependency on any chassis package (`packages/*`).
  - Do NOT inject a dependency on `modules/engage`, `modules/payme`, or `modules/vault`.
  - Do NOT remove or rename any baseline `scripts` entry. Baseline `build`/`dev`/`preview` are authoritative.
  - Do NOT change dependency version pins. Baseline versions are authoritative.
- **Note on lockfile absence:** `/job_site/missing_surface_matrix.yaml` §module_packages does not declare a `modules/referrals/package-lock.json` row. This pass does not authorize creation of a referrals lockfile. If baseline ships one and a later pass adds a matrix row, a separate allowlist entry will be required.
- **Authoritative source:** baseline `modules/referrals/package.json`.
- **Verification:** byte-equal to baseline.

### 9.2 Vite Build Config — `modules/referrals/vite.config.js`

- **Copy kind:** verbatim file copy, bit-for-bit.
- **Target path:** `apps/modules/referrals/vite.config.js`.
- **Permitted content:** whatever baseline declares — plugins, resolve aliases, build options, server options, base path.
- **Forbidden modifications:**
  - Do NOT change `base` to anything other than baseline value.
  - Do NOT change `build.outDir`.
  - Do NOT inject a resolve alias to `packages/*`, `apps/product-shell/*`, or any other `apps/modules/<name>/` other than referrals' own subtree.
  - Do NOT inject a chassis package import.
  - Do NOT add or remove plugins.
- **Authoritative source:** baseline `modules/referrals/vite.config.js`.
- **Verification:** byte-equal to baseline.

### 9.3 HTML Entrypoint — `modules/referrals/index.html`

- **Copy kind:** verbatim file copy, bit-for-bit.
- **Target path:** `apps/modules/referrals/index.html`.
- **Permitted content:** baseline HTML — doctype, `<html>`, `<head>`, `<body>`, `<div id="root">`, `<script type="module" src="/src/main.jsx">` (or whatever baseline script reference).
- **Forbidden modifications:**
  - Do NOT rewrite the script `src` attribute.
  - Do NOT rewrite `<link>` or `<meta>` tags.
  - Do NOT inject asset references that are not present in baseline.
  - Do NOT inject any comment referencing chassis path rewrites.
- **Authoritative source:** baseline `modules/referrals/index.html`.
- **Verification:** byte-equal to baseline.

### 9.4 Full Source Subtree — `modules/referrals/src/` (30 files)

- **Copy kind:** verbatim subtree copy.
- **Target path:** `apps/modules/referrals/src/` with the baseline subtree layout preserved one-for-one.
- **Covered paths (per missing_surface_matrix.yaml §module_packages notes):**
  - `modules/referrals/src/App.jsx`
  - `modules/referrals/src/main.jsx`
  - `modules/referrals/src/components/widgets/**`
  - `modules/referrals/src/lib/**`
  - `modules/referrals/src/pages/**`
  - `modules/referrals/src/styles/**`
- **Copy mechanism:** recursive directory copy; every file under `modules/referrals/src/` in the baseline archive is copied to the same relative path under `apps/modules/referrals/src/`.
- **Permitted content:** whatever baseline declares at every nested path.
- **Forbidden modifications:**
  - Do NOT rename any file.
  - Do NOT restructure any directory.
  - Do NOT rewrite any relative import within the subtree.
  - Do NOT rewrite any npm package import.
  - Do NOT inject an import from `modules/engage`, `modules/payme`, `modules/vault`, `product-shell`, or any chassis package.
  - Do NOT omit any file whose baseline path is under `modules/referrals/src/**`.
  - Do NOT add a file that does not exist in baseline.
- **Authoritative source:** baseline `modules/referrals/src/` subtree.
- **Verification:** recursive byte-equal comparison against baseline archive; file count MUST equal baseline file count (30 per source matrix).

### 9.5 Static Redirects — `modules/referrals/public/_redirects`

- **Copy kind:** verbatim file copy, bit-for-bit.
- **Target path:** `apps/modules/referrals/public/_redirects`.
- **Permitted content:** whatever baseline declares — Cloudflare Pages redirect/rewrite rules for referrals standalone serving.
- **Forbidden modifications:**
  - Do NOT rewrite any rule path.
  - Do NOT add an SPA fallback rule if baseline does not have one.
  - Do NOT remove an SPA fallback rule if baseline has one.
  - Do NOT merge this file with `apps/product-shell/public/_redirects` or with `apps/modules/engage/public/_redirects`. The three files are independent per-project redirect declarations.
- **Authoritative source:** baseline `modules/referrals/public/_redirects`.
- **Verification:** byte-equal to baseline.

### 9.6 Referrals Surfaces NOT Declared in This Pass

The baseline source matrix does NOT declare the following rows for `modules/referrals/`, and this allowlist does NOT authorize their copy:

- `modules/referrals/package-lock.json` — no matrix row; not copied in this pass
- `modules/referrals/functions/` — no matrix row; not created in this pass
- `modules/referrals/_routes.json` — no matrix row; not created in this pass
- `modules/referrals/supabase_schema.sql` — no matrix row; not copied in this pass
- any non-`src/`, non-manifest, non-config, non-`index.html`, non-`public/_redirects` file under `modules/referrals/`

If a later matrix update adds any of these rows, this allowlist must be extended before the execution worker may copy them.

### 9.7 Cross-Reference Lock (referrals)

Matrix:

| Allowlist § | Target path                                        | Manifest row (SECTION 7)                                          | Source matrix row (§module_packages) |
|---|---|---|---|
| 9.1 | `apps/modules/referrals/package.json`             | `modules/referrals/package.json` → `apps/modules/referrals/package.json` | `modules/referrals/package.json` (deploy_critical: yes) |
| 9.2 | `apps/modules/referrals/vite.config.js`           | `modules/referrals/vite.config.js` → `apps/modules/referrals/vite.config.js` | `modules/referrals/vite.config.js` (deploy_critical: yes) |
| 9.3 | `apps/modules/referrals/index.html`               | `modules/referrals/index.html` → `apps/modules/referrals/index.html` | `modules/referrals/index.html` (deploy_critical: yes) |
| 9.4 | `apps/modules/referrals/src/` (full tree)         | `modules/referrals/src/ (full tree)` → `apps/modules/referrals/src/ (full subtree)` | `modules/referrals/src/ (full tree)` (deploy_critical: yes) |
| 9.5 | `apps/modules/referrals/public/_redirects`        | `modules/referrals/public/_redirects` → `apps/modules/referrals/public/_redirects` | `modules/referrals/public/_redirects` (deploy_critical: yes) |

---

## 10. Allowed Fragments by File Class (vault)

Each subsection below names a specific baseline file or baseline subtree for `modules/vault/` and the exact copy rule that applies to it.

### 10.1 Package Manifest — `modules/vault/package.json`

- **Copy kind:** verbatim file copy, bit-for-bit.
- **Target path:** `apps/modules/vault/package.json`.
- **Permitted content:** whatever baseline declares in `name`, `version`, `private`, `type`, `scripts`, `dependencies`, `devDependencies`, `peerDependencies`, `engines`.
- **Forbidden modifications:**
  - Do NOT rewrite `name` to a chassis name. Baseline name is authoritative.
  - Do NOT inject a `workspaces` field. The module is an isolated install unit.
  - Do NOT inject a dependency on any chassis package (`packages/*`).
  - Do NOT inject a dependency on `modules/engage`, `modules/payme`, or `modules/referrals`.
  - Do NOT remove or rename any baseline `scripts` entry. Baseline `build`/`dev`/`preview` are authoritative.
  - Do NOT change dependency version pins. Baseline versions are authoritative.
- **Note on lockfile absence:** `/job_site/missing_surface_matrix.yaml` §module_packages does not declare a `modules/vault/package-lock.json` row. This pass does not authorize creation of a vault lockfile. If baseline ships one and a later pass adds a matrix row, a separate allowlist entry will be required.
- **Authoritative source:** baseline `modules/vault/package.json`.
- **Verification:** byte-equal to baseline.

### 10.2 Vite Build Config — `modules/vault/vite.config.js`

- **Copy kind:** verbatim file copy, bit-for-bit.
- **Target path:** `apps/modules/vault/vite.config.js`.
- **Permitted content:** whatever baseline declares — plugins, resolve aliases, build options, server options, base path.
- **Forbidden modifications:**
  - Do NOT change `base` to anything other than baseline value.
  - Do NOT change `build.outDir`.
  - Do NOT inject a resolve alias to `packages/*`, `apps/product-shell/*`, or any other `apps/modules/<name>/` other than vault's own subtree.
  - Do NOT inject a chassis package import.
  - Do NOT add or remove plugins.
- **Authoritative source:** baseline `modules/vault/vite.config.js`.
- **Verification:** byte-equal to baseline.

### 10.3 HTML Entrypoint — `modules/vault/index.html`

- **Copy kind:** verbatim file copy, bit-for-bit.
- **Target path:** `apps/modules/vault/index.html`.
- **Permitted content:** baseline HTML — doctype, `<html>`, `<head>`, `<body>`, `<div id="root">`, `<script type="module" src="/src/main.jsx">` (or whatever baseline script reference).
- **Forbidden modifications:**
  - Do NOT rewrite the script `src` attribute.
  - Do NOT rewrite `<link>` or `<meta>` tags.
  - Do NOT inject asset references that are not present in baseline.
  - Do NOT inject any comment referencing chassis path rewrites.
- **Authoritative source:** baseline `modules/vault/index.html`.
- **Verification:** byte-equal to baseline.

### 10.4 Cloudflare Pages Routes Config — `modules/vault/_routes.json`

- **Copy kind:** verbatim file copy, bit-for-bit.
- **Target path:** `apps/modules/vault/_routes.json`.
- **Permitted content:** baseline JSON — `version`, `include`, `exclude` keys with baseline values declaring which paths are served by Pages Functions and which fall through to static assets.
- **Forbidden modifications:**
  - Do NOT add an entry to `include` or `exclude` beyond baseline.
  - Do NOT remove an entry from `include` or `exclude`.
  - Do NOT change the `version` field.
  - Do NOT re-serialize with different key order or whitespace unless the bit-for-bit copy is preserved (whitespace equivalence is a byte-equal requirement, not a semantic one).
- **Role:** governs which `/api/*` paths are routed to `functions/api/**` Pages Functions and which paths fall through to static assets. Pages Functions routing depends on this file being present at the deploy-root-relative path the Pages Functions runtime expects.
- **Authoritative source:** baseline `modules/vault/_routes.json`.
- **Verification:** byte-equal to baseline.

### 10.5 Pages Functions API Subtree — `modules/vault/functions/api/` (14 endpoints)

- **Copy kind:** verbatim subtree copy.
- **Target path:** `apps/modules/vault/functions/api/` with the baseline subtree layout preserved one-for-one.
- **Covered paths (per missing_surface_matrix.yaml §module_packages notes — 14 endpoints):**
  - `modules/vault/functions/api/1inch-allowance.*`
  - `modules/vault/functions/api/1inch-approve-tx.*`
  - `modules/vault/functions/api/1inch-quote.*`
  - `modules/vault/functions/api/1inch-swap-tx.*`
  - `modules/vault/functions/api/1inch-tokens.*`
  - `modules/vault/functions/api/1inch/[[path]].*`
  - `modules/vault/functions/api/1inch/1inch-balances.*`
  - `modules/vault/functions/api/balances.*`
  - `modules/vault/functions/api/quote.*`
  - plus additional baseline endpoints enumerated in the baseline subtree to reach the declared count of 14 endpoints
- **Copy mechanism:** recursive directory copy; every file under `modules/vault/functions/api/` in the baseline archive is copied to the same relative path under `apps/modules/vault/functions/api/`.
- **Permitted content:** whatever baseline declares at every nested path.
- **Handler export contract:** each handler file MUST export the HTTP method handlers expected by the Pages Functions runtime (`onRequest`, `onRequestGet`, `onRequestPost`, etc.) exactly as declared by baseline.
- **Forbidden modifications:**
  - Do NOT rename any file.
  - Do NOT restructure any directory.
  - Do NOT rewrite any import within the handler.
  - Do NOT inject or remove any handler export.
  - Do NOT inject a chassis package import.
  - Do NOT inject an import from any sibling module.
  - Do NOT omit any endpoint from baseline.
  - Do NOT add an endpoint not present in baseline (see §4.B10).
- **Route coupling with `_routes.json`:** the set of routed handler files under `functions/api/` MUST remain consistent with the `include`/`exclude` declarations in `_routes.json` (§10.4). If baseline declares route coverage for a path, the handler file for that path MUST be copied.
- **Authoritative source:** baseline `modules/vault/functions/api/` subtree.
- **Verification:** recursive byte-equal comparison against baseline archive; endpoint file count MUST equal baseline endpoint count (14 per source matrix); no orphan handlers, no missing handlers.

### 10.6 Full Source Subtree — `modules/vault/src/` (60+ files)

- **Copy kind:** verbatim subtree copy.
- **Target path:** `apps/modules/vault/src/` with the baseline subtree layout preserved one-for-one.
- **Covered paths (per missing_surface_matrix.yaml §module_packages notes):**
  - `modules/vault/src/App.jsx`
  - `modules/vault/src/AppRoutes.jsx`
  - `modules/vault/src/main.jsx`
  - `modules/vault/src/components/**`
  - `modules/vault/src/data/**`
  - `modules/vault/src/lib/**`
  - `modules/vault/src/pages/**`
  - `modules/vault/src/styles/**`
  - `modules/vault/src/theme/**`
- **Copy mechanism:** recursive directory copy; every file under `modules/vault/src/` in the baseline archive is copied to the same relative path under `apps/modules/vault/src/`.
- **Permitted content:** whatever baseline declares at every nested path.
- **Forbidden modifications:**
  - Do NOT rename any file.
  - Do NOT restructure any directory.
  - Do NOT rewrite any relative import within the subtree.
  - Do NOT rewrite any npm package import.
  - Do NOT inject an import from `modules/engage`, `modules/payme`, `modules/referrals`, `product-shell`, or any chassis package.
  - Do NOT omit any file whose baseline path is under `modules/vault/src/**`.
  - Do NOT add a file that does not exist in baseline.
- **Explicitly excluded from §10.6:** `modules/vault/Vault.MktMaker-main/` is NOT part of `modules/vault/src/` and is separately marked `deploy_critical: no` (vendor_subtree). It MUST NOT be copied under any section of this allowlist.
- **Authoritative source:** baseline `modules/vault/src/` subtree.
- **Verification:** recursive byte-equal comparison against baseline archive; file count MUST equal baseline file count (60+ per source matrix, exact value confirmed against the baseline archive).

### 10.7 Vault Surfaces NOT Declared in This Pass

The baseline source matrix does NOT declare the following rows for `modules/vault/` with `deploy_critical: yes`, and this allowlist does NOT authorize their copy:

- `modules/vault/package-lock.json` — no matrix row; not copied in this pass
- `modules/vault/public/_redirects` — no matrix row; not copied in this pass (vault uses `_routes.json` + Pages Functions for routing, not a static `_redirects` file at the public/ root)
- `modules/vault/public/` directory (beyond implicit static assets) — no matrix row; not created in this pass
- `modules/vault/Vault.MktMaker-main/` — `deploy_critical: no` (vendor_subtree); blocked by §4.B3
- any non-`src/`, non-`functions/api/`, non-manifest, non-config, non-`index.html`, non-`_routes.json` file under `modules/vault/`

If a later matrix update adds any of these rows, this allowlist must be extended before the execution worker may copy them.

### 10.8 Cross-Reference Lock (vault)

Matrix:

| Allowlist § | Target path                                              | Manifest row (SECTION 7)                                                | Source matrix row (§module_packages) |
|---|---|---|---|
| 10.1 | `apps/modules/vault/package.json`                       | `modules/vault/package.json` → `apps/modules/vault/package.json`        | `modules/vault/package.json` (deploy_critical: yes) |
| 10.2 | `apps/modules/vault/vite.config.js`                     | `modules/vault/vite.config.js` → `apps/modules/vault/vite.config.js`    | `modules/vault/vite.config.js` (deploy_critical: yes) |
| 10.3 | `apps/modules/vault/index.html`                         | `modules/vault/index.html` → `apps/modules/vault/index.html`            | `modules/vault/index.html` (deploy_critical: yes) |
| 10.4 | `apps/modules/vault/_routes.json`                       | `modules/vault/_routes.json` → `apps/modules/vault/_routes.json`        | `modules/vault/_routes.json` (deploy_critical: yes) |
| 10.5 | `apps/modules/vault/functions/api/` (14 endpoints)      | `modules/vault/functions/api/ (14 endpoints)` → `apps/modules/vault/functions/api/ (14 endpoints)` | `modules/vault/functions/api/ (14 endpoints)` (deploy_critical: yes) |
| 10.6 | `apps/modules/vault/src/` (full tree)                   | `modules/vault/src/ (full tree)` → `apps/modules/vault/src/ (full subtree)` | `modules/vault/src/ (full tree)` (deploy_critical: yes) |
