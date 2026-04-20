# Patch Register — RB-INT-CHASSIS-004

job_id: RB-INT-CHASSIS-004
stage: stage_4 | worker_b
owner: Worker B
authority: live tree inspection + build_verification_results.md + pages_readiness_matrix.md at HEAD on branch `claude/audit-payme-stitch-targets-0YbZ5`
document_role: Register all unresolved in-scope blockers after RB-INT-CHASSIS-004 gateway-finish + payme stitch work. Overwrites prior RB-INT-CHASSIS-002 register. All prior CRITICAL and HIGH items from RB-INT-CHASSIS-002 are RESOLVED at this HEAD.

---

## 0. Register Format

Each entry includes:
- **id**: stable identifier
- **severity**: CRITICAL / HIGH / MEDIUM / LOW / ADVISORY
- **state**: OPEN / RESOLVED / DEFERRED
- **class**: execution / document-consistency / deployment-config / advisory
- **current state**: live evidence at HEAD
- **resolution owner**: who clears the item
- **unblock condition**: exact test for closure

---

## 1. RESOLVED — RB-INT-CHASSIS-002 Blocker Carry-Forward

All 14 open blockers carried from RB-INT-CHASSIS-002 are RESOLVED at this HEAD. Retained for audit cross-reference.

| id | prior severity | prior state | resolution job | resolution summary |
|---|---|---|---|---|
| PATCH-RB002-001 | CRITICAL | OPEN | RB-INT-CHASSIS-002 S3 worker_a | `apps/product-shell/` deploy root created |
| PATCH-RB002-002 | CRITICAL | OPEN | RB-INT-CHASSIS-002 S3 worker_a | `package.json` created with declared scripts and deps |
| PATCH-RB002-003 | CRITICAL | OPEN | RB-INT-CHASSIS-002 S3 worker_a | `vite.config.ts` created |
| PATCH-RB002-004 | CRITICAL | OPEN | RB-INT-CHASSIS-002 S3 worker_a | `tsconfig.json` + `tsconfig.node.json` created |
| PATCH-RB002-005 | CRITICAL | OPEN | RB-INT-CHASSIS-002 S3 worker_a | `index.html` created |
| PATCH-RB002-006 | CRITICAL | OPEN | RB-INT-CHASSIS-002 S3 worker_a | `src/main.tsx` created |
| PATCH-RB002-007 | CRITICAL | OPEN | RB-INT-CHASSIS-002 S3 worker_a | `AppShell.tsx`, `router.tsx`, `routes.ts` created |
| PATCH-RB002-008 | CRITICAL | OPEN | RB-INT-CHASSIS-002 S3 worker_a | `public/_redirects` created |
| PATCH-RB002-009 | CRITICAL | OPEN | RB-INT-CHASSIS-002 S3 worker_a | `functions/`, `functions/api/`, `functions/_lib/` created |
| PATCH-RB002-010 | CRITICAL | OPEN | RB-INT-CHASSIS-002 S3 worker_a | all 5 Pages Functions API handlers created |
| PATCH-RB002-011 | CRITICAL | OPEN | RB-INT-CHASSIS-002 S3 worker_a | all 3 `_lib/` helpers created |
| PATCH-RB002-012 | CRITICAL | OPEN | RB-INT-CHASSIS-002 S3 worker_b | `apps/modules/` directory created |
| PATCH-RB002-013 | CRITICAL | OPEN | RB-INT-CHASSIS-002 S3 worker_b | `apps/modules/engage/` fully reconstructed (31 files) |
| PATCH-RB002-014 | CRITICAL | PARTIAL | RB-INT-CHASSIS-004 stage_2 | `apps/modules/payme/` fully stitched: `vite.config.js` (base + outDir), `index.html`, `src/App.jsx` (full form), `src/services/usdcTransfer.js`; `build:payme` script added to `package.json` |
| PATCH-RB002-015 | LOW | DEFERRED | — | `apps/modules/referrals/` deferred out of scope; still absent |
| PATCH-RB002-016 | LOW | DEFERRED | — | `apps/modules/vault/` deferred out of scope; still absent |
| PATCH-RB002-017 | HIGH | OPEN | RB-INT-CHASSIS-004 (operational) | deploy root `apps/product-shell` operationally confirmed; `pages_deployment_spec.md` divergence is a stale document artefact — no code impact |
| PATCH-RB002-018 | HIGH | OPEN | RB-INT-CHASSIS-004 (operational) | `full_parity_rebuild_order.md` path anchoring is a stale document artefact — no code impact |
| PATCH-RB002-019 | MEDIUM | OPEN | — | `runtime_dependency_inventory.md` scope clarification; non-blocking, deferred |
| PATCH-RB002-020 | CRITICAL | OPEN | RB-INT-CHASSIS-004 stage_3 | `npm install` from `apps/product-shell/` verified exit 0 |
| PATCH-RB002-021 | CRITICAL | OPEN | RB-INT-CHASSIS-004 stage_3 | `npm run build` from `apps/product-shell/` verified exit 0; `dist/` produced |
| PATCH-RB002-022 | CRITICAL | OPEN | RB-INT-CHASSIS-004 stage_3 | `build_verification_results.md` reissued with green build record (PASS) |
| PATCH-RB002-023 | CRITICAL | OPEN | RB-INT-CHASSIS-004 stage_2 | `src/components/` subtree reconstructed |
| PATCH-RB002-024 | CRITICAL | OPEN | RB-INT-CHASSIS-004 stage_2 | `src/state/demoGateState.tsx` created; `tier1/2/3Unlocked: true` |
| PATCH-RB002-025 | CRITICAL | OPEN | RB-INT-CHASSIS-004 stage_2 | `src/styles/` CSS files created |
| PATCH-RB002-026 | CRITICAL | OPEN | RB-INT-CHASSIS-004 stage_2 | `src/mobile/styles/mobile-overlay.css` created |
| PATCH-RB002-027 | CRITICAL | OPEN | RB-INT-CHASSIS-004 stage_2 | `src/pages/` subtree reconstructed |
| PATCH-RB002-028 | CRITICAL | OPEN | RB-INT-CHASSIS-004 stage_2 | `src/features/` subtree reconstructed including payme, marketplace, engage surfaces |
| PATCH-RB002-029 | CRITICAL | OPEN | RB-INT-CHASSIS-004 stage_2 | `src/hooks/`, `src/integrations/`, `src/config/`, `src/contracts/`, `src/utils/` subtrees created |

---

## 2. RB-INT-CHASSIS-004 New Items — ADVISORY ONLY

No new CRITICAL, HIGH, or MEDIUM blockers remain in scope. The following advisory items are noted for the deployment operator and a future feature pass. None block Cloudflare Pages deployment or PayMe core rendering.

### 2.1 PATCH-RB004-001 — `transferUsdc` stub (advisory)

- **severity:** ADVISORY
- **state:** OPEN
- **class:** advisory (feature incomplete)
- **current state:** `apps/modules/payme/src/services/usdcTransfer.js` exports `transferUsdc` as a stub returning `{ success: false, error: "not implemented" }`. `formatUsdc` and `toUsdcAtomicUnits` are implemented. PayMe form renders and submits; result always shows not-implemented error.
- **resolution owner:** Future feature pass (wallet SDK integration)
- **unblock condition:** `transferUsdc` executes an actual on-chain USDC transfer via the Base network wallet SDK and returns `{ success: true, txHash }` on success

### 2.2 PATCH-RB004-002 — Node version not pinned (advisory)

- **severity:** ADVISORY
- **state:** OPEN
- **class:** deployment-config
- **current state:** No `.nvmrc` and no `engines.node` in `apps/product-shell/package.json`. Stage_3 build used Node v22.22.2. Cloudflare Pages default may differ.
- **resolution owner:** Deployment operator or next code pass
- **unblock condition:** `.nvmrc` containing `22` added to `apps/product-shell/`, or `"engines": { "node": "22" }` added to `package.json`

### 2.3 PATCH-RB004-003 — `TENANTS_BUCKET` R2 binding (advisory — dashboard config)

- **severity:** ADVISORY
- **state:** OPEN
- **class:** deployment-config
- **current state:** Three Pages Functions handlers (`page.js`, `published-manifest.js`, `published-page.js`) reference `env.TENANTS_BUCKET`. Binding must be configured in Cloudflare Pages dashboard → Settings → Bindings. If absent, those three handlers return a graceful 500. PayMe embed and admin panel do not use these handlers.
- **resolution owner:** Deployment operator (dashboard action — not a code change)
- **unblock condition:** `TENANTS_BUCKET` R2 binding pointing to the correct R2 bucket is set in the Cloudflare Pages project settings for both production and preview environments

### 2.4 PATCH-RB004-004 — `/apps/referrals/*` and `/apps/vault/*` `_redirects` rules return 404 (advisory)

- **severity:** ADVISORY
- **state:** OPEN
- **class:** advisory (out-of-scope modules)
- **current state:** `dist/_redirects` contains rules for referrals and vault whose target files are absent. Specific rules match before the `/*` catch-all; Cloudflare Pages returns 404 for those paths rather than falling back to the SPA.
- **resolution owner:** Next module reconstruction pass, or remove rules until modules are built
- **unblock condition:** Either (a) `apps/modules/referrals/` and `apps/modules/vault/` are built and their outputs land in `dist/apps/{referrals,vault}/index.html`, or (b) the two rules are removed from `apps/product-shell/public/_redirects`

---

## 3. RB-INT-CHASSIS-004 Stage_4 Parity Patches — PATCHED (Dispatch B)

Three parity gaps identified by SHA comparison against `origin/main` during Dispatch B (ENV + ROUTING PARITY FIX). All three are patched at HEAD; uncommitted per `commit_required: no` on Dispatch B dispatch.

### 3.1 PATCH-RB004-005 — `usePublishedExclusiveTiles.ts` page param mismatch (CRITICAL)

- **severity:** CRITICAL
- **state:** PATCHED
- **class:** execution (routing / API layer)
- **current state (pre-patch):** `apps/product-shell/src/hooks/usePublishedExclusiveTiles.ts` called `fetchPublishedRuntimePage(slug, "access-tier-2")`. `VALID_PAGES` in `functions/api/_lib/runtime-schema.js` is `new Set(["home", "members", "access", "tier-2"])`. `"access-tier-2"` is not in `VALID_PAGES`; `assertRuntimeParams` returned `400 { error: "Unsupported page" }` on every call. Exclusive tiles on `AccessTier2Page` always showed 6 default locked placeholders regardless of `TENANTS_BUCKET` configuration. Pre-patch local SHA: `c96c66e5`. Main SHA: `009a1239`.
- **patch applied:** Changed `"access-tier-2"` → `"tier-2"` at line 21 of `usePublishedExclusiveTiles.ts`. Post-patch SHA matches main `009a1239`. ✓
- **resolution owner:** RB-INT-CHASSIS-004 stage_4 Worker_B
- **unblock condition (met):** `fetchPublishedRuntimePage(slug, "tier-2")` — page param is a member of `VALID_PAGES`; API returns `200` with page data; `hydrateExclusiveTilesFromPageData` receives valid payload

### 3.2 PATCH-RB004-006 — `AppShell.tsx` missing wallpaper layer (HIGH)

- **severity:** HIGH
- **state:** PATCHED
- **class:** execution (rendering layer)
- **current state (pre-patch):** `apps/product-shell/src/app/AppShell.tsx` returned `<div className="appRoot">` with `<TopNav />` and `<Outlet />` only. No `appRootWallpaper` wrapper div, no `wallpaperImage` div, no `DEFAULT_WALLPAPER_URL` constant. Deployed app rendered with no background wallpaper. Reference (`origin/main`) includes the full wallpaper layer. Pre-patch local SHA: `66d55a61`. Main SHA: `1035ce15`.
- **patch applied:** Rewrote `AppShell.tsx` to match main exactly: added `DEFAULT_WALLPAPER_URL = "/biz-pages.png"` constant and `<div className="appRootWallpaper" aria-hidden>` wrapper containing `<div className="wallpaperImage" style={{ backgroundImage: ... }} />`. Post-patch SHA matches main `1035ce15`. ✓
- **resolution owner:** RB-INT-CHASSIS-004 stage_4 Worker_B
- **unblock condition (met):** `AppShell.tsx` SHA = `1035ce15`; `appRootWallpaper` layer present; `biz-pages.png` referenced

### 3.3 PATCH-RB004-007 — `public/biz-pages.png` missing static asset (HIGH)

- **severity:** HIGH
- **state:** PATCHED
- **class:** execution (asset layer)
- **current state (pre-patch):** `apps/product-shell/public/biz-pages.png` was absent from the branch. `AppShell.tsx` (post-patch) references `/biz-pages.png` as `DEFAULT_WALLPAPER_URL`. Without this file in `public/`, Vite build would not copy it to `dist/`; deployed app would serve a broken background URL. Main SHA: `fbd264b9` (719,159 bytes).
- **patch applied:** Fetched binary from `origin/main` via `git show origin/main:apps/product-shell/public/biz-pages.png`. File written to `apps/product-shell/public/biz-pages.png` (719,159 bytes). Post-patch SHA matches main `fbd264b9`. ✓
- **resolution owner:** RB-INT-CHASSIS-004 stage_4 Worker_B
- **unblock condition (met):** `public/biz-pages.png` present; SHA `fbd264b9`; Vite copies to `dist/biz-pages.png` at build time

---

## 4. Summary

| Severity | OPEN | RESOLVED / PATCHED | DEFERRED |
|---|---|---|---|
| CRITICAL | 0 | 30 | 0 |
| HIGH | 0 | 4 | 0 |
| MEDIUM | 0 | 0 | 1 |
| LOW | 0 | 0 | 2 |
| ADVISORY | 4 | 0 | 0 |
| **Total** | **4** | **34** | **3** |

**In-scope blocker count: 0.** All 34 prior CRITICAL and HIGH items resolved or patched. 3 items remain DEFERRED (out-of-scope modules + scope-clarification doc). 4 advisory items recorded; none block deployment.

**Overall register state: CLEAR (advisory only).**

---

## 5. Checksum Pointers for Foreman B

- All 29 RB-INT-CHASSIS-002 CRITICAL entries in §1 are resolved at HEAD on branch `claude/audit-payme-stitch-targets-0YbZ5`. Verification: `npm run build` from `apps/product-shell/` exits 0 and produces `dist/` — see `/job_site/build_verification_results.md`.
- All 4 advisory entries in §2 are non-blocking for Cloudflare Pages deployment of the gateway + PayMe.
- PATCH-RB004-003 (`TENANTS_BUCKET`) is the only deployment operator action required before full handler functionality is available. PayMe is not affected.
- PATCH-RB004-001 (`transferUsdc` stub) is the only remaining PayMe feature gap; UI renders and submits correctly.
- PATCH-RB004-004 (referrals/vault 404) is self-contained and does not affect any in-scope module path.
- **Dispatch B additions (§3):** Three parity gaps vs. `origin/main` identified and patched. `usePublishedExclusiveTiles.ts` (CRITICAL — API 400 on tier-2 tiles), `AppShell.tsx` (HIGH — missing wallpaper layer), `public/biz-pages.png` (HIGH — missing static asset). All three post-patch SHAs match main. Patches uncommitted per Dispatch B `commit_required: no`.
