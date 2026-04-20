# DEPLOY ROOT PLAN — RB-INT-CHASSIS-002

job_id: RB-INT-CHASSIS-002
stage: S2
pass: partial — deploy root definition only
worker: worker_a
authority: exact declaration of the chassis-native Cloudflare Pages deploy root
source_matrix: /job_site/missing_surface_matrix.yaml
source_manifest: /job_site/full_parity_target_path_manifest.yaml

---

## 1. DECLARED DEPLOY ROOT

```
apps/product-shell
```

absolute path (attached file system):

```
/home/user/gateway-fullbody-freeze/apps/product-shell
```

repo-relative path (from repo root `gateway-fullbody-freeze/`):

```
apps/product-shell
```

---

## 2. RATIONALE

The chassis already establishes `apps/` as the canonical application-root
directory (existing: `apps/core-runtime`, `apps/operator-shell`,
`apps/web-public`, `apps/local-host`). Placing the Gateway deploy app under
`apps/product-shell` satisfies:

- chassis-native placement — matches existing `apps/` convention
- baseline-faithful internal layout — every path beneath baseline
  `product-shell/*` maps one-for-one beneath `apps/product-shell/*`
- baseline build-script compatibility — baseline
  `product-shell/package.json` references `../modules/engage` as a relative
  path; this relative relationship is preserved when `modules/engage` is
  placed at `apps/modules/engage` (to be declared in a later S2 pass), or
  alternatively by placing `modules/` at repo root; resolution of that
  relative reference is declared in the module-package S2 pass and is
  out of scope for this pass

No chassis law is redesigned by this placement. `apps/product-shell` is an
additive sibling to the existing chassis apps.

---

## 3. CHASSIS-NATIVE PATH MAPPING RULE

For every baseline path of the form `product-shell/<rel>`, the chassis-native
target path is `apps/product-shell/<rel>` with `<rel>` preserved exactly.

Examples (scoped to this pass):

| baseline_path                                     | target_path                                                |
| ------------------------------------------------- | ---------------------------------------------------------- |
| product-shell/package.json                        | apps/product-shell/package.json                            |
| product-shell/index.html                          | apps/product-shell/index.html                              |
| product-shell/vite.config.ts                      | apps/product-shell/vite.config.ts                          |
| product-shell/tsconfig.json                       | apps/product-shell/tsconfig.json                           |
| product-shell/tsconfig.node.json                  | apps/product-shell/tsconfig.node.json                      |
| product-shell/src/main.tsx                        | apps/product-shell/src/main.tsx                            |
| product-shell/src/app/AppShell.tsx                | apps/product-shell/src/app/AppShell.tsx                    |
| product-shell/src/app/router.tsx                  | apps/product-shell/src/app/router.tsx                      |
| product-shell/src/app/routes.ts                   | apps/product-shell/src/app/routes.ts                       |
| product-shell/public/_redirects                   | apps/product-shell/public/_redirects                       |
| product-shell/functions/api/microfrontend-bootstrap.js | apps/product-shell/functions/api/microfrontend-bootstrap.js |
| product-shell/functions/api/microfrontend-trust-log.js | apps/product-shell/functions/api/microfrontend-trust-log.js |
| product-shell/functions/api/page.js               | apps/product-shell/functions/api/page.js                   |
| product-shell/functions/api/published-manifest.js | apps/product-shell/functions/api/published-manifest.js     |
| product-shell/functions/api/published-page.js     | apps/product-shell/functions/api/published-page.js         |
| product-shell/functions/_lib/runtime-compiler.js  | apps/product-shell/functions/_lib/runtime-compiler.js      |
| product-shell/functions/_lib/runtime-r2.js        | apps/product-shell/functions/_lib/runtime-r2.js            |
| product-shell/functions/_lib/runtime-schema.js    | apps/product-shell/functions/_lib/runtime-schema.js        |

---

## 4. CLOUDFLARE PAGES DEPLOY SETTINGS

Derived directly from baseline `product-shell/package.json` scripts and
Cloudflare Pages conventions.

| setting                    | value                                  |
| -------------------------- | -------------------------------------- |
| pages project deploy root  | `apps/product-shell`                   |
| framework preset           | Vite                                   |
| install command            | `npm install`                          |
| build command              | `npm run build`                        |
| build output directory     | `dist`                                 |
| root build output (repo)   | `apps/product-shell/dist`              |
| node version               | 18.x or 20.x (compatible with vite 5)  |
| functions directory        | `apps/product-shell/functions`         |
| functions routing          | Pages Functions convention (no `_routes.json` at this root — baseline product-shell has no `_routes.json`; the only baseline `_routes.json` is under `modules/vault/` which is out of scope for this pass) |
| static asset serving root  | `apps/product-shell/dist`              |
| SPA fallback               | declared via `public/_redirects` rule `/*    /index.html   200` |

Note: baseline `product-shell/package.json` defines
`build` as `"npm run build:engage && vite build"`, where `build:engage`
runs `npm --prefix ../modules/engage install && npm --prefix ../modules/engage run build`.
That relative reference (`../modules/engage`) binds the deploy root to the
co-location of a `modules/engage` directory. This pass declares only the
`apps/product-shell` deploy root; the exact placement of the `modules/engage`
sibling and any build-command adjustment (or symlink / workspace wiring)
needed to preserve the relative reference is declared in a later S2 pass.

---

## 5. DEPLOY ROOT BOUNDARY (WHAT IS AND IS NOT INSIDE apps/product-shell)

INSIDE (this pass declares target paths under `apps/product-shell/`):

- `apps/product-shell/package.json`
- `apps/product-shell/index.html`
- `apps/product-shell/vite.config.ts`
- `apps/product-shell/tsconfig.json`
- `apps/product-shell/tsconfig.node.json`
- `apps/product-shell/src/main.tsx`
- `apps/product-shell/src/app/AppShell.tsx`
- `apps/product-shell/src/app/router.tsx`
- `apps/product-shell/src/app/routes.ts`
- `apps/product-shell/public/_redirects`
- `apps/product-shell/functions/api/*` (5 Pages Functions)
- `apps/product-shell/functions/_lib/*` (3 function libs)

OUTSIDE deploy root (declared in other passes or out of scope):

- module packages — deferred (e.g., `apps/modules/engage`, or equivalent)
- standalone admin apps — deferred
- chassis packages at `packages/*` — non-deploy
- chassis apps at `apps/core-runtime`, `apps/operator-shell`,
  `apps/web-public`, `apps/local-host` — non-deploy (chassis reference layer)
- `xyz-factory-system/` — non-deploy (chassis invariants + docs)
- `worker-wb/` — non-deploy (worker reports)
- `job_site/` — non-deploy (runtime run documents)
- production support, resolver boundary, variation control,
  `_review-required` — deferred

---

## 6. DEPLOY ROOT VERIFICATION PRECONDITIONS (for S5)

The deploy root `apps/product-shell` is verifiable when:

1. `apps/product-shell/package.json` exists with the declared name
   `gateway-demo-zero`, scripts block, and dependency set.
2. `apps/product-shell/index.html` exists and points to `/src/main.tsx`.
3. `apps/product-shell/vite.config.ts`, `apps/product-shell/tsconfig.json`,
   and `apps/product-shell/tsconfig.node.json` exist with the declared content.
4. `apps/product-shell/src/main.tsx`, `src/app/AppShell.tsx`,
   `src/app/router.tsx`, and `src/app/routes.ts` exist.
5. `apps/product-shell/public/_redirects` exists with the declared SPA and
   microfrontend fallthrough rules.
6. `apps/product-shell/functions/api/*` and `apps/product-shell/functions/_lib/*`
   exist as listed.
7. `npm install && npm run build` executed from
   `/home/user/gateway-fullbody-freeze/apps/product-shell` produces a `dist/`
   directory without error (subject to the `../modules/engage` dependency
   being resolved in the later S2 module pass).

---

## 7. OUT-OF-SCOPE (for this pass only)

This pass declares only the deploy root definition and the exact target paths
for the deploy app root surfaces listed in scope_lock of
`/job_site/full_parity_target_path_manifest.yaml`. All other missing baseline
surfaces — app component tree, full public assets, tests, module packages,
admin apps, production support, resolver boundary, variation control, review
artifacts, and deploy docs — are explicitly deferred to later S2 passes and
MUST NOT be treated as resolved by this pass.
