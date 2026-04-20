# Build Verification Results
# job_id: RB-INT-CHASSIS-004 | stage_3 | worker_b

---

## Environment

| Field | Value |
|---|---|
| Working directory | `/home/user/gateway-fullbody-freeze/apps/product-shell` |
| Node version | v22.22.2 |
| npm version | 10.9.7 |
| Global `vite` in PATH | NO — `which vite` returns not found |
| Global `npx` in PATH | YES — `/opt/node22/bin/npx` (not used by any build step) |

---

## Step 1 — Install

**Command:** `npm install`
**Working directory:** `apps/product-shell/`
**Exit code:** 0
**Result:** PASS

```
up to date, audited 72 packages in 2s
7 packages are looking for funding
2 moderate severity vulnerabilities
```

Notes:
- `node_modules/` already present from prior typecheck; install verified lockfile match in 2s
- 2 moderate audit advisories — non-blocking; not in build failure scope

---

## Step 2 — Production Build

**Command:** `npm run build`
**Working directory:** `apps/product-shell/`
**Resolved script:** `npm run build:engage && npm run build:payme && vite build`
**Exit code:** 0
**Result:** PASS

### Step 2a — build:engage

**Resolved command:** `npm --prefix ../modules/engage install --progress=false && npm --prefix ../modules/engage run build`
**Prefix path:** `apps/modules/engage/` (relative to working directory)
**Vite binary:** `apps/modules/engage/node_modules/.bin/vite` — LOCAL, no global dependency
**Exit code:** 0

Output:
```
> engagefi-questboard@0.0.0 build
> vite build

vite v5.4.21 building for production...
✓ 5569 modules transformed.
../../product-shell/public/apps/engage/index.html                  0.53 kB │ gzip: 0.33 kB
../../product-shell/public/apps/engage/assets/index-B5hRV3XR.css  4.80 kB │ gzip: 1.68 kB
../../product-shell/public/apps/engage/assets/index-DsJrFzCJ.js   559.08 kB │ gzip: 173.25 kB
✓ built in 37.66s
```

Notes:
- Large chunk warning (559 kB) — Rollup advisory, non-fatal, does not block deployment
- `/wallpaper333.png` runtime-resolved reference — non-fatal warning from engage module
- `/*#__PURE__*/` annotation warnings from wallet SDK node_modules — non-fatal, stripped by Rollup

### Step 2b — build:payme

**Resolved command:** `npm --prefix ../modules/payme install --progress=false && npm --prefix ../modules/payme run build`
**Prefix path:** `apps/modules/payme/` (relative to working directory)
**Vite binary:** `apps/modules/payme/node_modules/.bin/vite` — LOCAL, no global dependency
**Exit code:** 0

Output:
```
> usdc.xyz-labs.xyz@0.0.0 build
> vite build

vite v5.4.21 building for production...
✓ 32 modules transformed.
../../product-shell/public/apps/payme/index.html                   0.41 kB │ gzip: 0.27 kB
../../product-shell/public/apps/payme/assets/index-unt0fufI.css   0.07 kB │ gzip: 0.09 kB
../../product-shell/public/apps/payme/assets/index-ru_UmGg2.js   145.83 kB │ gzip: 47.07 kB
✓ built in 799ms
```

### Step 2c — vite build (shell)

**Vite binary:** `apps/product-shell/node_modules/.bin/vite` — LOCAL, resolved by npm via `PATH` injection into `node_modules/.bin`; no global dependency
**Exit code:** 0

Output:
```
vite v5.4.21 building for production...
✓ 86 modules transformed.
dist/index.html                   0.56 kB │ gzip: 0.33 kB
dist/assets/index-BZUyxO74.css   37.21 kB │ gzip: 7.28 kB
dist/assets/index-D8V7nGxY.js   239.20 kB │ gzip: 76.25 kB
✓ built in 1.39s
```

---

## Output Path Inventory

| File | Absolute path | Present |
|------|--------------|---------|
| Shell SPA entry | `apps/product-shell/dist/index.html` | YES |
| Shell CSS | `apps/product-shell/dist/assets/index-BZUyxO74.css` | YES |
| Shell JS | `apps/product-shell/dist/assets/index-D8V7nGxY.js` | YES |
| Routing rules | `apps/product-shell/dist/_redirects` | YES |
| Engage module entry | `apps/product-shell/dist/apps/engage/index.html` | YES |
| Engage module CSS | `apps/product-shell/dist/apps/engage/assets/index-B5hRV3XR.css` | YES |
| Engage module JS | `apps/product-shell/dist/apps/engage/assets/index-DsJrFzCJ.js` | YES |
| PayMe module entry | `apps/product-shell/dist/apps/payme/index.html` | YES |
| PayMe module CSS | `apps/product-shell/dist/apps/payme/assets/index-unt0fufI.css` | YES |
| PayMe module JS | `apps/product-shell/dist/apps/payme/assets/index-ru_UmGg2.js` | YES |

**Deploy output root:** `apps/product-shell/dist/`
**Total dist size:** ~997 kB

---

## _redirects Validation

`dist/_redirects` (verbatim):
```
/apps/payme/*    /apps/payme/index.html    200
/apps/engage/*   /apps/engage/index.html   200
/apps/referrals/* /apps/referrals/index.html 200
/apps/vault/*    /apps/vault/index.html    200

/*    /index.html   200
```

| Rule | Target in dist | Resolvable |
|------|----------------|------------|
| `/apps/payme/*` → `/apps/payme/index.html` | `dist/apps/payme/index.html` | YES |
| `/apps/engage/*` → `/apps/engage/index.html` | `dist/apps/engage/index.html` | YES |
| `/apps/referrals/*` | not present | NO — out of scope for RB-INT-CHASSIS-004 |
| `/apps/vault/*` | not present | NO — out of scope for RB-INT-CHASSIS-004 |
| `/*` → `/index.html` | `dist/index.html` | YES |

Note: `/apps/referrals/` and `/apps/vault/` rules reference out-of-scope modules. Cloudflare Pages falls through to the SPA `/*` rule for these paths. No gateway or PayMe functionality is blocked by their absence.

---

## Global Tool Dependency Check

| Tool invocation | Resolved from | Global? |
|-----------------|---------------|---------|
| `vite build` in `npm run build` (shell) | `apps/product-shell/node_modules/.bin/vite` via npm PATH injection | NO |
| `vite build` in `npm --prefix ../modules/engage run build` | `apps/modules/engage/node_modules/.bin/vite` via npm PATH injection | NO |
| `vite build` in `npm --prefix ../modules/payme run build` | `apps/modules/payme/node_modules/.bin/vite` via npm PATH injection | NO |

No bare global `vite` call exists in any build-chain command. All three vite invocations resolve from local `node_modules/.bin/` scoped to each respective package.

---

## outDir Path Correction (Applied in This Run)

**Issue identified on first build run:**
Both module vite configs originally declared `outDir: '../../public/apps/<name>'`.
From `apps/modules/<name>/`, this resolves to `apps/public/apps/<name>/` — outside
the shell's publicDir (`apps/product-shell/public/`). Module outputs were not
being copied into `dist/apps/` by the shell vite build.

**Correction applied:**

| File | Old outDir | New outDir |
|------|-----------|-----------|
| `apps/modules/payme/vite.config.js` | `../../public/apps/payme` | `../../product-shell/public/apps/payme` |
| `apps/modules/engage/vite.config.js` | `../../public/apps/engage` | `../../product-shell/public/apps/engage` |

**Corrected resolution:**
- From `apps/modules/payme/`: `../../product-shell/public/apps/payme` → `apps/product-shell/public/apps/payme/`
- Shell vite build copies `apps/product-shell/public/` → `apps/product-shell/dist/`
- Result: `dist/apps/payme/index.html` and `dist/apps/engage/index.html` are present

**Commit:** `67b2d2d` — "fix module vite outDir paths to target product-shell publicDir"

Build was re-run after correction. All outputs confirmed present.

---

## Pass Gate Status

| Condition | Status |
|-----------|--------|
| Build passes from `apps/product-shell` | PASS — `npm run build` exits 0 |
| No bare global vite dependency remains | PASS — all vite invocations local |
| Output is valid for Cloudflare Pages deploy root | PASS — `dist/` contains shell + both in-scope module bundles + `_redirects` |
| `dist/index.html` present | PASS |
| `dist/_redirects` present | PASS |
| `dist/apps/payme/index.html` present | PASS |
| `dist/apps/engage/index.html` present | PASS |

**Overall result: PASS**
