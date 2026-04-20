# Parity Verification Matrix — RB-INT-CHASSIS-002

job_id: RB-INT-CHASSIS-002
stage: S3 (re-evaluation — post payme minimal unblock)
owner: Worker B
authority: non-authoritative — derived from /job_site/full_parity_target_path_manifest.yaml and live tree inspection
document_role: Record per-surface PRESENT/MISSING status for every parity surface declared in the target path manifest, against the current tree state. This document overwrites the prior parity matrix and records current results only.

---

## 0. Evaluation Basis

- **Live tree:** `/home/user/gateway-fullbody-freeze` at HEAD of branch `claude/reconstruct-engage-modules-OdQZM` (commit c6d0bd5).
- **Declared parity surfaces:** `/job_site/full_parity_target_path_manifest.yaml` §SECTION 1 through §SECTION 7 + module_packages_summary.
- **Parity scope lock:** `/job_site/parity_scope_lock.md` (S1 Worker B).

Out of scope for this matrix (covered by other documents):

- resolver-boundary surfaces and production support surfaces
- app component/feature trees, src/hooks, src/state, src/utils, etc. (explicitly deferred in scope_lock.excluded)
- admin apps (engagefi-admin-minimal, payme-admin-minimal, referral-admin-minimal)

---

## 1. Status Legend

| Status | Meaning |
|---|---|
| PRESENT | declared target path exists on disk with content matching the declared shape |
| MISSING | declared target path does not exist on disk |
| SHAPE_MISMATCH | declared target path exists on disk but content does not match the declared shape |
| PARTIAL | declared target path directory exists but one or more child rows within the same section remain MISSING |
| STUB | declared target path exists with non-baseline stub content (deliberate minimal-unblock) |
| DEFERRED | declared as deferred in the manifest; not evaluated in this matrix |

---

## 2. SECTION 1 — Package Manifest (deploy app)

| # | Target path | Action | Status |
|---|---|---|---|
| 1.1 | `apps/product-shell/package.json` | create | PRESENT |

## 3. SECTION 2 — HTML Entrypoint (deploy app)

| # | Target path | Action | Status |
|---|---|---|---|
| 2.1 | `apps/product-shell/index.html` | create | PRESENT |

## 4. SECTION 3 — Build Configs (deploy app)

| # | Target path | Action | Status |
|---|---|---|---|
| 3.1 | `apps/product-shell/vite.config.ts` | create | PRESENT |
| 3.2 | `apps/product-shell/tsconfig.json` | create | PRESENT |
| 3.3 | `apps/product-shell/tsconfig.node.json` | create | PRESENT |

## 5. SECTION 4 — App Bootstrap (deploy app)

| # | Target path | Action | Status |
|---|---|---|---|
| 4.1 | `apps/product-shell/src/main.tsx` | create | PRESENT (import graph incomplete — see §13) |
| 4.2 | `apps/product-shell/src/app/` | create_directory | PRESENT |
| 4.3 | `apps/product-shell/src/app/AppShell.tsx` | create | PRESENT (imports `../components/nav/TopNav` which is MISSING) |
| 4.4 | `apps/product-shell/src/app/router.tsx` | create | PRESENT |
| 4.5 | `apps/product-shell/src/app/routes.ts` | create | PRESENT |

## 6. SECTION 5 — Public Assets (deploy app)

| # | Target path | Action | Status |
|---|---|---|---|
| 5.1 | `apps/product-shell/public/` | create_directory | PRESENT |
| 5.2 | `apps/product-shell/public/_redirects` | create | PRESENT |

## 7. SECTION 6 — Cloudflare Pages Functions (deploy app)

| # | Target path | Action | Status |
|---|---|---|---|
| 6.1 | `apps/product-shell/functions/` | create_directory | PRESENT |
| 6.2 | `apps/product-shell/functions/api/` | create_directory | PRESENT |
| 6.3 | `apps/product-shell/functions/_lib/` | create_directory | PRESENT |
| 6.4 | `apps/product-shell/functions/api/microfrontend-bootstrap.js` | create | PRESENT |
| 6.5 | `apps/product-shell/functions/api/microfrontend-trust-log.js` | create | PRESENT |
| 6.6 | `apps/product-shell/functions/api/page.js` | create | PRESENT |
| 6.7 | `apps/product-shell/functions/api/published-manifest.js` | create | PRESENT |
| 6.8 | `apps/product-shell/functions/api/published-page.js` | create | PRESENT |
| 6.9 | `apps/product-shell/functions/_lib/runtime-compiler.js` | create | PRESENT |
| 6.10 | `apps/product-shell/functions/_lib/runtime-r2.js` | create | PRESENT |
| 6.11 | `apps/product-shell/functions/_lib/runtime-schema.js` | create | PRESENT |

## 8. SECTION 7 — Module Packages (modules/engage)

| # | Target path | Action | Status |
|---|---|---|---|
| 7.1 | `apps/modules/engage/` | create_directory | PRESENT |
| 7.2 | `apps/modules/engage/package.json` | create | PRESENT |
| 7.3 | `apps/modules/engage/package-lock.json` | create | PRESENT |
| 7.4 | `apps/modules/engage/vite.config.js` | create | PRESENT |
| 7.5 | `apps/modules/engage/index.html` | create | PRESENT |
| 7.6 | `apps/modules/engage/src/` | create_directory | PRESENT |
| 7.7 | `apps/modules/engage/src/main.jsx` | create | PRESENT |
| 7.8 | `apps/modules/engage/src/App.jsx` | create | PRESENT |
| 7.9 | `apps/modules/engage/src/` (full subtree — 26 files actual, was declared 37) | create_subtree | PRESENT |
| 7.10 | `apps/modules/engage/public/` | create_directory | PRESENT |
| 7.11 | `apps/modules/engage/public/_redirects` | create | PRESENT |

## 9. SECTION 7 — Module Packages (modules/payme)

| # | Target path | Action | Status |
|---|---|---|---|
| 7.12 | `apps/modules/payme/` | create_directory | PRESENT |
| 7.13 | `apps/modules/payme/package.json` | create | PRESENT (verbatim baseline, 492 bytes; commit c6d0bd5) |
| 7.14 | `apps/modules/payme/vite.config.js` | create | MISSING |
| 7.15 | `apps/modules/payme/index.html` | create | MISSING |
| 7.16 | `apps/modules/payme/src/` | create_directory | PRESENT |
| 7.17 | `apps/modules/payme/src/` (full subtree — 30 files) | create_subtree | MISSING (see §9.a — stub present at `src/index.jsx` is not counted toward baseline parity) |

### 9.a Non-baseline stub present at `apps/modules/payme/src/index.jsx`

| # | Path | Shape | Status |
|---|---|---|---|
| 9.a.1 | `apps/modules/payme/src/index.jsx` | non-baseline ESM stub (1156 bytes) | STUB |

This file was created by the S3 worker_b payme minimal-unblock pass (commit c6d0bd5) as a deliberate non-baseline stub authorized by the S3 re-dispatch task header. It is out-of-band from the manifest row set and is NOT counted toward row 7.17 (baseline 30-file subtree). See `/job_site/module_surface_change_manifest.md` §13.2 for the allowlist deviation rationale. A subsequent full-reconstruction pass against allowlist §8 MUST delete this stub before writing the baseline subtree.

## 10. SECTION 7 — Module Packages (modules/referrals)

| # | Target path | Action | Status |
|---|---|---|---|
| 7.18 | `apps/modules/referrals/` | create_directory | DEFERRED |
| 7.19 | `apps/modules/referrals/package.json` | create | DEFERRED |
| 7.20 | `apps/modules/referrals/vite.config.js` | create | DEFERRED |
| 7.21 | `apps/modules/referrals/index.html` | create | DEFERRED |
| 7.22 | `apps/modules/referrals/src/` | create_directory | DEFERRED |
| 7.23 | `apps/modules/referrals/src/` (full subtree — 30 files) | create_subtree | DEFERRED |
| 7.24 | `apps/modules/referrals/public/` | create_directory | DEFERRED |
| 7.25 | `apps/modules/referrals/public/_redirects` | create | DEFERRED |

## 11. SECTION 7 — Module Packages (modules/vault)

| # | Target path | Action | Status |
|---|---|---|---|
| 7.26 | `apps/modules/vault/` | create_directory | DEFERRED |
| 7.27 | `apps/modules/vault/package.json` | create | DEFERRED |
| 7.28 | `apps/modules/vault/vite.config.js` | create | DEFERRED |
| 7.29 | `apps/modules/vault/index.html` | create | DEFERRED |
| 7.30 | `apps/modules/vault/_routes.json` | create | DEFERRED |
| 7.31 | `apps/modules/vault/functions/` | create_directory | DEFERRED |
| 7.32 | `apps/modules/vault/functions/api/` | create_directory | DEFERRED |
| 7.33 | `apps/modules/vault/functions/api/` (full subtree — 14 endpoints) | create_subtree | DEFERRED |
| 7.34 | `apps/modules/vault/src/` | create_directory | DEFERRED |
| 7.35 | `apps/modules/vault/src/` (full subtree — 60+ files) | create_subtree | DEFERRED |

## 12. Runtime Support (deploy app — `apps/product-shell/src/runtime/`)

| # | Target path | Action | Status |
|---|---|---|---|
| R.1 | `apps/product-shell/src/runtime/exclusiveTileHydration.ts` | create | PRESENT |
| R.2 | `apps/product-shell/src/runtime/publishedClient.ts` | create | PRESENT |
| R.3 | `apps/product-shell/src/runtime/routeContext.ts` | create | PRESENT |
| R.4 | `apps/product-shell/src/runtime/types.ts` | create | PRESENT |

Source: S4 worker_a runtime support pass (commit 363c506).

---

## 13. Declared Surfaces PRESENT But With Broken Import Graph

The following rows are PRESENT at the declared path but reference files that are themselves MISSING. This does NOT change their row status from PRESENT (the target-path declaration is satisfied), but the build-time import graph is flagged here and mirrored in `/job_site/pages_readiness_matrix.md` row 2.4.

| surface | broken import targets (all MISSING) |
|---|---|
| `apps/product-shell/src/main.tsx` | `./styles/global.css`, `./styles/shell.css`, `./styles/nav.css`, `./styles/cards.css`, `./styles/gate.css`, `./styles/admin.css`, `./styles/marketplace.css`, `./styles/published-overlay.css`, `./mobile/styles/mobile-overlay.css`, `./state/demoGateState` |
| `apps/product-shell/src/app/AppShell.tsx` | `../components/nav/TopNav` |
| `apps/product-shell/src/app/router.tsx` | presumed imports into `../pages/*`, `../features/*` — full audit deferred |

The missing import targets correspond to deploy-app-root subtrees listed `missing` + `deploy_critical: yes` in `/job_site/missing_surface_matrix.yaml` and tracked as patches PATCH-RB002-023 through PATCH-RB002-029 in `/job_site/patch_register.md` §5.

---

## 14. Deferred (not evaluated in this matrix)

| # | Deferred scope | Deferral source |
|---|---|---|
| 14.1 | `modules/engage/supabase_schema.sql` | deploy_critical: no |
| 14.2 | `modules/vault/Vault.MktMaker-main/` | deploy_critical: no |
| 14.3 | `modules/blueprint/module-boundary-list.md` | deploy_critical: no |
| 14.4 | engagefi-admin-minimal/, payme-admin-minimal/, referral-admin-minimal/ | scope_lock.excluded |
| 14.5 | full public asset trees under apps/product-shell/public/ads/, public/apps/, public/demo/, public/wallpapers/, drip.png | scope_lock.excluded |
| 14.6 | tests/ | scope_lock.excluded |
| 14.7 | production/, resolver-boundary/, variation-control/, _review-required/ | scope_lock.excluded |
| 14.8 | docs/, blueprint/, README.md | scope_lock.excluded |
| 14.9 | `apps/modules/referrals/**` + `apps/modules/vault/**` | S3 DEPLOY-CRITICAL re-evaluation rule: explicitly DEFERRED and non-blocking for S5 readiness |

### 14.a Engage allowlist-deferred fragments

Baseline fragments outside allowlist §3 and NOT evaluated in row 7.9:

- `modules/engage/README.md`, `TEMPLATE_REPORT.txt`, `drop.png`, `public/wallpaper333.png`

### 14.b Payme allowlist-deferred fragments

Baseline fragments outside allowlist §8 and NOT evaluated in rows 7.12–7.17:

- `modules/payme/README.md`, `TEMPLATE_REPORT.txt`, `drop.png`, `public/wallpaper333.png`, `public/xyz-watermark.png`

---

## 15. Summary

| Surface class | Declared rows | PRESENT | MISSING | SHAPE_MISMATCH | STUB | DEFERRED |
|---|---|---|---|---|---|---|
| SECTION 1 — package manifest (deploy app) | 1 | 1 | 0 | 0 | 0 | 0 |
| SECTION 2 — HTML entrypoint (deploy app) | 1 | 1 | 0 | 0 | 0 | 0 |
| SECTION 3 — build configs (deploy app) | 3 | 3 | 0 | 0 | 0 | 0 |
| SECTION 4 — app bootstrap (deploy app) | 5 | 5 | 0 | 0 | 0 | 0 |
| SECTION 5 — public assets (deploy app) | 2 | 2 | 0 | 0 | 0 | 0 |
| SECTION 6 — Pages Functions (deploy app) | 11 | 11 | 0 | 0 | 0 | 0 |
| SECTION 7 — modules/engage | 11 | 11 | 0 | 0 | 0 | 0 |
| SECTION 7 — modules/payme | 6 | 3 | 3 | 0 | 0 | 0 |
| SECTION 7 — modules/referrals | 8 | 0 | 0 | 0 | 0 | 8 |
| SECTION 7 — modules/vault | 10 | 0 | 0 | 0 | 0 | 10 |
| Runtime support (deploy app) | 4 | 4 | 0 | 0 | 0 | 0 |
| Out-of-band stubs (not counted above) | — | — | — | — | 1 | 0 |
| **Total evaluated** | **62** | **41** | **3** | **0** | **1 (out-of-band)** | **18** |

**Headline verdict: 41/62 declared parity surfaces PRESENT. 3/62 MISSING. 18/62 DEFERRED (referrals/vault non-blocking in DEPLOY-CRITICAL scope). 0 SHAPE_MISMATCH. 1 out-of-band STUB.**

Deploy app (SECTIONs 1–6 + runtime support) and `modules/engage` are 100% PRESENT at target-path level.

Modules delta: payme transitions from 0/6 PRESENT to 3/6 PRESENT (minimal unblock — 7.12 dir, 7.13 package.json, 7.16 src dir). Payme still has 3 MISSING rows (7.14 vite.config.js, 7.15 index.html, 7.17 full subtree). Referrals and vault are now marked DEFERRED (non-blocking for S5 readiness under DEPLOY-CRITICAL scope).

The out-of-band STUB at `apps/modules/payme/src/index.jsx` is PRESENT on disk but is NOT counted toward any §9 row, since the baseline manifest does not declare a file at that path. It is tracked separately in §9.a.

---

## 16. Delta vs Prior S3 Worker B Matrix (commit ad431a3)

| section | prior PRESENT | current PRESENT | delta | source commits |
|---|---|---|---|---|
| SECTION 1 — package manifest | 1/1 | 1/1 | 0 | unchanged |
| SECTION 2 — HTML entrypoint | 1/1 | 1/1 | 0 | unchanged |
| SECTION 3 — build configs | 3/3 | 3/3 | 0 | unchanged |
| SECTION 4 — app bootstrap | 5/5 | 5/5 | 0 | unchanged |
| SECTION 5 — public assets | 2/2 | 2/2 | 0 | unchanged |
| SECTION 6 — Pages Functions | 11/11 | 11/11 | 0 | unchanged |
| SECTION 7 — modules/engage | 11/11 | 11/11 | 0 | unchanged |
| SECTION 7 — modules/payme | 0/6 | 3/6 | +3 | c6d0bd5 (S3 worker_b — payme minimal unblock) |
| SECTION 7 — modules/referrals | 0/8 | 0/8 (DEFERRED) | 0 | status class changed MISSING → DEFERRED for DEPLOY-CRITICAL scope |
| SECTION 7 — modules/vault | 0/10 | 0/10 (DEFERRED) | 0 | status class changed MISSING → DEFERRED for DEPLOY-CRITICAL scope |
| Runtime support | 4/4 | 4/4 | 0 | unchanged |
| **Totals** | **38/62** | **41/62** | **+3** | |

Additionally 1 out-of-band STUB added (`apps/modules/payme/src/index.jsx`) — not counted toward any row.

---

## 17. Cross-Reference Lock

Every row in §2–§12 corresponds to exactly one declared row in `/job_site/full_parity_target_path_manifest.yaml` SECTIONs 1–7 or to a runtime_support row in `/job_site/missing_surface_matrix.yaml` §deploy_app_root. Every §9 row with status MISSING is listed in `/job_site/patch_register.md` as an unresolved execution blocker, while §10–§11 are now DEFERRED/non-blocking in this DEPLOY-CRITICAL pass. Every §14 deferred row has an explicit deferral source.

The payme 3 newly-PRESENT rows (7.12, 7.13, 7.16) cause PATCH-RB002-014 in `/job_site/patch_register.md` to transition from CRITICAL-open to CRITICAL-PARTIAL. The 3 remaining payme MISSING rows (7.14, 7.15, 7.17) remain open under the same patch.

The out-of-band STUB at §9.a is tracked as a non-standard entry and is flagged for deletion/replacement by any subsequent full-reconstruction pass against allowlist §8.
