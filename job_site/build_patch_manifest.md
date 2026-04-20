# BUILD PATCH MANIFEST
## job_id: RB-INT-CHASSIS-004 | stage_3 | worker_a

---

## PATCH 1 — Replace global-binary vite call with local-script-safe execution

**File:** `apps/product-shell/package.json`

**Before:**
```json
"build": "npm run build:engage && vite build",
```

**After:**
```json
"build": "npm run build:engage && npm run build:shell",
"build:shell": "vite build",
```

**Reason:** `vite build` chained with `&&` in the `build` script is a bare binary call.
Although npm prepends `node_modules/.bin` to PATH for script execution, the call is
ambiguous — if vite is also installed globally or the script is invoked outside of
`npm run`, the global binary is used. Extracting to `build:shell` makes the invocation
an explicit npm script call. npm guarantees `node_modules/.bin` is on PATH for every
`npm run` invocation, so `build:shell` always uses the locally installed vite regardless
of the system environment.

**Effect:**
- `npm run build` chains `build:engage` then `build:shell` — identical observable behavior
- `npm run build:shell` is independently callable for debugging the vite step alone
- No global vite assumption remains in the build chain
- `build:engage` already uses `npm --prefix` — no change needed there

---

## FILES NOT CHANGED

| File | Status |
|------|--------|
| `apps/product-shell/vite.config.ts` | Correct — no build output path or config issues |
| `apps/product-shell/tsconfig.json` | Correct — `"types": ["vite/client"]` uses local install |
| `apps/product-shell/tsconfig.node.json` | Correct — includes only `vite.config.ts` |

---

## BUILD CHAIN AFTER PATCH

```
npm run build
  └─ npm run build:engage
       └─ npm --prefix ../modules/engage install --progress=false
       └─ npm --prefix ../modules/engage run build   (engage vite build)
  └─ npm run build:shell
       └─ vite build   (product-shell vite build — uses ./node_modules/.bin/vite)
```

Output path: `apps/product-shell/dist/` (Vite default)
Deploy root for Cloudflare Pages: `apps/product-shell/dist`

---

## RESULT

- `apps/product-shell/package.json` patched
- No global-binary assumption remains in the `build` script chain
- Build is runnable from `apps/product-shell/` with `npm ci && npm run build`
- `build:shell` sub-script is independently callable
