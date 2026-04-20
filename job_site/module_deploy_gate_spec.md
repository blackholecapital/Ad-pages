# Module Deploy Gate Spec — BIZ-PAGES-PROD-DETANGLE-002

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S4
worker: Worker B
checkpoint: CP-S4-DETANGLE-CLEAN
authority: declares, per module, whether it is INCLUDED in the
`apps/product-shell` Cloudflare Pages production deploy, GATED on a build
precondition, or EXCLUDED. Pairs with `deploy_cleanup_manifest.md` §3.

required_references:
- /job_site/deploy_surface_inventory.md (S1, Worker A) — §3 build topology, §4 redirect surface
- /job_site/cloudflare_runtime_notes.md (S1, Worker B) — §2.2 Pages build settings
- /job_site/build-sheet-active.txt — §6.7.3 (S4, Worker B scope)

---

## 1. Gate states — definition

| State      | Meaning                                                                                                                                          |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| INCLUDED   | Module's build output MUST be present in the product-shell Pages deploy. A missing output is a deploy-blocking failure.                          |
| GATED      | Module's inclusion is conditional on an upstream precondition. If the precondition fails, the product-shell deploy MUST fail, not silently skip. |
| EXCLUDED   | Module MUST NOT ship in the product-shell production deploy. It may exist in the repo and be deployed independently through its own pipeline.   |

Gate decisions bind Cloudflare Pages build behaviour for the project rooted
at `apps/product-shell` only. Independent Pages projects for excluded
modules are out of scope for this spec.

---

## 2. Module gate table

| # | Module / Surface                                | Source path                         | Build output (relative to Pages root `apps/product-shell/`)       | Redirect rule                                    | Gate       | Precondition                                                                 |
|---|-------------------------------------------------|-------------------------------------|-------------------------------------------------------------------|--------------------------------------------------|------------|------------------------------------------------------------------------------|
| 1 | product-shell (SPA)                             | `apps/product-shell/src/`           | `dist/` (Vite default) + `public/` copied                         | `/*  /index.html  200` (catch-all, last)         | INCLUDED   | `npm run build:shell` succeeds; React-Router present.                        |
| 2 | engage iframe module                            | `apps/modules/engage/`              | `public/apps/engage/index.html` + hashed assets                   | `/apps/engage/*  /apps/engage/index.html  200`   | GATED      | `npm run build:engage` (from `apps/product-shell/package.json:11`) succeeds; `public/apps/engage/index.html` exists post-build. |
| 3 | payme iframe module                             | `apps/modules/payme/`               | `public/apps/payme/index.html` + hashed assets                    | `/apps/payme/*  /apps/payme/index.html  200`     | GATED      | `npm run build:payme` (from `apps/product-shell/package.json:12`) succeeds; `public/apps/payme/index.html` exists post-build. |
| 4 | referrals iframe (legacy route)                 | *(none — source absent)*            | *(n/a)*                                                           | *(removed — see deploy_cleanup_manifest.md §2.1)* | EXCLUDED   | Cannot be INCLUDED: no `apps/modules/referrals` source. Redirect rule removed. |
| 5 | vault iframe (legacy route)                     | *(none — source absent)*            | *(n/a)*                                                           | *(removed — see deploy_cleanup_manifest.md §2.2)* | EXCLUDED   | Cannot be INCLUDED: no `apps/modules/vault` source. Redirect rule removed.   |
| 6 | engagefi-admin-minimal                          | `engagefi-admin-minimal/`           | *(own `dist/` — outside Pages root)*                               | *(own `_redirects` inside its own root)*         | EXCLUDED   | Separate Pages project or not deployed. Not iframed by product-shell.         |
| 7 | referral-admin-minimal                          | `referral-admin-minimal/`           | *(own `dist/` — outside Pages root)*                               | *(own `_redirects` inside its own root)*         | EXCLUDED   | Separate Pages project or not deployed. Not iframed by product-shell.         |
| 8 | payme-admin-minimal                             | `payme-admin-minimal/`              | *(no `public/` present in tree)*                                   | *(none)*                                         | EXCLUDED   | Not wired into product-shell; not production path.                            |
| 9 | worker-wb proof reports                         | `worker-wb/`                        | *(markdown only, no build)*                                        | *(none)*                                         | EXCLUDED   | Documentation; not deployable.                                                |
| 10 | xyz-factory-system                              | `xyz-factory-system/`               | *(outside Pages root)*                                             | *(none)*                                         | EXCLUDED   | Job-site tooling; not deployable.                                             |
| 11 | core-runtime / local-host / operator-shell       | `apps/core-runtime`, `apps/local-host`, `apps/operator-shell` | *(outside Pages root; TypeScript modules consumed by non-Pages hosts)* | *(none)* | EXCLUDED | Not a Pages deploy target. See `deploy_surface_inventory.md` §6. |

---

## 3. Admin mini-apps — deployment posture

The three admin mini-apps (`engagefi-admin-minimal`, `referral-admin-minimal`,
`payme-admin-minimal`) are **not** iframed at `/apps/<name>/*` by
product-shell:

- There is no `apps/modules/referrals` vite bundle that ever wrote to
  `apps/product-shell/public/apps/referrals/`.
- `engagefi-admin-minimal/public/_redirects` is the mini-app's *own* SPA
  fallback, executed only when the mini-app is served as its own Pages
  project.
- The Pages root for product-shell is `apps/product-shell` (see
  `cloudflare_runtime_notes.md` §2.2); anything outside that tree is not
  shipped by the product-shell deploy regardless of `_redirects` content.

Operator posture for these admin surfaces:

| Surface                  | Recommended posture                                                                                                                       |
|--------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| engagefi-admin-minimal   | Separate Pages project rooted at `engagefi-admin-minimal/`. If not needed in production, leave undeployed.                                |
| referral-admin-minimal   | Separate Pages project rooted at `referral-admin-minimal/`. If not needed in production, leave undeployed.                                |
| payme-admin-minimal      | Not ready for deploy (no `public/`). Hold until a packaging decision is made.                                                             |

None of these change the `apps/product-shell/public/_redirects` file.

---

## 4. Gate enforcement — build pipeline (current) vs required

### 4.1 Current behaviour (as declared in repo)

`apps/product-shell/package.json:8`:
```
"build": "npm run build:engage && npm run build:payme && npm run build:shell"
```

Shell (`build:shell`) runs last. Any failure in `build:engage` or
`build:payme` short-circuits via `&&` — good. Cloudflare Pages picks up the
non-zero exit code and fails the deploy — good.

### 4.2 Known gap: product-shell deploy can "succeed" without iframe outputs when operators bypass `npm run build`

If an operator or CI sets the Pages build command to `npm run build:shell`
alone (skipping engage/payme builds), Pages will publish without
`public/apps/{engage,payme}/index.html`. The SPA catch-all will then serve
the product-shell HTML for `/apps/engage/*` and `/apps/payme/*` instead of
the iframe apps — the redirect-loop condition documented in
`runtime_parity_matrix.md` §6.

### 4.3 Required gate (enforced at deploy root)

1. Cloudflare Pages build command MUST be `npm run build` (the orchestrated
   script), NOT `npm run build:shell`.
   - Declared inference location: `apps/product-shell/package.json:8`.
   - Dashboard confirmation: operator responsibility; see S5
     (`cloudflare_rebuild_runbook.md`, TBD).
2. When S5 produces `apps/product-shell/wrangler.toml`, the equivalent
   `[build]` / `pages.publish` / `pages.build.command` entry MUST use the
   orchestrated build script for parity.
3. A deploy-time self-check is RECOMMENDED: a short post-build step that
   fails the build if `dist/apps/engage/index.html` or
   `dist/apps/payme/index.html` is absent. (This check is declared here but
   not implemented by S4 Worker B; it is an optional S5/S6 follow-up.)

### 4.4 Test vectors (operator, post-deploy)

| Probe                                                     | INCLUDED/GATED module's expected response                                                                                   |
|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `GET /apps/engage/`                                       | 200; body distinct from product-shell SPA (engage bundle). If SPA body, gate failure — engage did not build.                |
| `GET /apps/payme/`                                        | 200; body distinct from product-shell SPA (payme bundle). If SPA body, gate failure — payme did not build.                  |
| `GET /apps/engage/static/js/main.<hash>.js`               | 200 JS asset. Hash varies per build.                                                                                        |
| `GET /apps/payme/assets/index.<hash>.js`                  | 200 JS asset. Hash varies per build.                                                                                        |
| `GET /apps/referrals/` / `GET /apps/vault/`               | 200 product-shell SPA index (catch-all). This is the correct behaviour now — there is no iframe to serve.                   |
| `GET /api/published-page?slug=<known>&page=tier-2`        | 200 JSON. Must not be rewritten to `/index.html`; Pages Functions precede `_redirects`.                                    |

---

## 5. Adding a new iframe module — procedure

Do not edit `_redirects` in isolation. Follow this sequence to keep the gate
spec and redirect surface in lockstep:

1. Add module source under `apps/modules/<name>/` with a `vite.config.js`
   that sets `base: '/apps/<name>/'` and
   `build.outDir: '../../product-shell/public/apps/<name>'` (see existing
   `apps/modules/engage/vite.config.js`).
2. Add `build:<name>` and an orchestrated `build` entry in
   `apps/product-shell/package.json`.
3. Add one rule to `apps/product-shell/public/_redirects`, inserted
   ABOVE the catch-all:
   `/apps/<name>/*    /apps/<name>/index.html    200`
4. Update §2 of this spec with the new module row. State GATED until the
   first successful Pages deploy includes `public/apps/<name>/index.html`.
5. Update `deploy_cleanup_manifest.md` §3 if the new module has a
   sibling admin package or standalone deploy surface.
6. Re-run verification checklist from `deploy_cleanup_manifest.md` §6 plus
   the probes in §4.4 above.

Violations of this procedure are the root cause of the referrals/vault
orphan rules this stage removes.

---

## 6. Removing a module — procedure

1. Remove the iframe rule from `apps/product-shell/public/_redirects`. The
   catch-all will now serve SPA for the removed path; that is acceptable.
2. Remove the corresponding `build:<name>` orchestrator line from
   `apps/product-shell/package.json`.
3. Remove (or mark EXCLUDED) the module row in §2.
4. Decide whether to delete `apps/modules/<name>/`. Deletion is optional;
   marking EXCLUDED in this spec is sufficient for deploy hygiene.
5. Record the removal under `deploy_cleanup_manifest.md` §2.

---

## 7. Relationship to wallet-connect consolidation (S4 Worker A)

This gate spec is orthogonal to Worker A's wallet-connect unification
(`wallet_unification_manifest.md`). Gating a module IN or OUT does not
change its wallet-connect consumer wiring. If a module moves from INCLUDED
to EXCLUDED, Worker A's unified wallet-connect implementation remains the
one reference point for any mini-app that chooses to deploy separately.

---

## 8. Exit criteria (S4 pass-condition contribution)

- [x] Every rule in `apps/product-shell/public/_redirects` maps to a row in
      §2 with gate state INCLUDED or GATED.
- [x] Every EXCLUDED surface is enumerated with the reason it is not part of
      the product-shell production deploy.
- [x] Build pipeline is declared to enforce GATED modules via
      `apps/product-shell/package.json:8` orchestrated `build` script.
- [x] No gate state is ambiguous — each module is exactly one of INCLUDED,
      GATED, or EXCLUDED.
- [x] Procedures for adding (§5) and removing (§6) modules are recorded so
      future changes keep _redirects and this spec in lockstep.
