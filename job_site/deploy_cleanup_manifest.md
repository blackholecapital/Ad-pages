# Deploy Cleanup Manifest — BIZ-PAGES-PROD-DETANGLE-002

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S4
worker: Worker B
checkpoint: CP-S4-DETANGLE-CLEAN
authority: deploy-surface cleanup. Removes redirect-loop rules and orphan
routes from the production shell path. Classifies every module/public surface
that touches the shell deploy as INCLUDED, GATED, or EXCLUDED. Non-mutating
for code behaviour; mutates only `apps/product-shell/public/_redirects`.

required_references:
- /job_site/deploy_surface_inventory.md (S1, Worker A)
- /job_site/cloudflare_runtime_notes.md (S1, Worker B)
- /job_site/build-sheet-active.txt (job control of record; resolves in the
  mirror as /job_site/build-sheet-BIZ-PAGES-PROD per cloudflare_runtime_notes §0.1)

---

## 1. Summary of change

| Surface                                               | Before S4               | After S4                   |
|-------------------------------------------------------|-------------------------|----------------------------|
| `apps/product-shell/public/_redirects`                | 4 iframe rules + catch-all | 2 iframe rules + catch-all |
| `/apps/referrals/*` redirect                          | Declared                | **Removed** (orphan)       |
| `/apps/vault/*` redirect                              | Declared                | **Removed** (orphan)       |
| `/apps/payme/*` redirect                              | Declared                | Retained (source present)  |
| `/apps/engage/*` redirect                             | Declared                | Retained (source present)  |
| `/*` SPA catch-all                                    | Declared (last)         | Retained (last)            |
| Admin mini-apps in shell deploy                       | Ambiguous               | **Excluded from shell production deploy** — see `module_deploy_gate_spec.md` |

No source code under `apps/product-shell/src/` or `apps/product-shell/functions/`
is changed by this stage. No Cloudflare dashboard state is changed by this
stage (see `cloudflare_runtime_notes.md` §0.3).

---

## 2. Redirect rules removed and why

### 2.1 `/apps/referrals/*  /apps/referrals/index.html  200`

- **Evidence of orphan**: there is no `apps/modules/referrals` in the repo
  (`ls apps/modules/` returns only `engage` and `payme`). No vite config
  produces an `apps/product-shell/public/apps/referrals/` output dir.
- **Effect while rule was live**: request to `/apps/referrals/anything`
  rewrote to `/apps/referrals/index.html`, which was **not** emitted by the
  build. Cloudflare Pages returned 404, then the SPA catch-all fallback
  served `/index.html`, which has no React-Router route for
  `/apps/referrals/*`, producing a blank surface or stale SPA state —
  documented at `deploy_surface_inventory.md` §4 and
  `runtime_parity_matrix.md` §6.
- **Relationship to `referral-admin-minimal/`**: that package is a
  stand-alone admin surface with its own `_redirects` and `public/`. It is
  NOT iframed by product-shell at `/apps/referrals/*`. Removing this rule
  from the product-shell redirects does not affect referral-admin-minimal's
  independent deploy (see `module_deploy_gate_spec.md` §3).
- **Action**: line deleted.

### 2.2 `/apps/vault/*  /apps/vault/index.html  200`

- **Evidence of orphan**: there is no `apps/modules/vault` in the repo.
  No vite config, no package.json, no source. Also no `vault-admin-minimal`
  parallel — this route was dead end-to-end.
- **Effect while rule was live**: identical to §2.1 — 404 on the iframe
  index.html, catch-all served product-shell SPA, React-Router 404.
- **Action**: line deleted.

### 2.3 Rules retained

| Rule                                       | Retention reason                                                                 |
|--------------------------------------------|----------------------------------------------------------------------------------|
| `/apps/payme/*   /apps/payme/index.html  200`  | `apps/modules/payme` exists (`vite.config.js` writes `apps/product-shell/public/apps/payme`). Gated on build success — see `module_deploy_gate_spec.md` §2. |
| `/apps/engage/*  /apps/engage/index.html 200`  | `apps/modules/engage` exists (`vite.config.js` writes `apps/product-shell/public/apps/engage`). Gated on build success — see `module_deploy_gate_spec.md` §2. |
| `/*              /index.html             200`  | SPA fallback for product-shell React Router. Required for deep-link behaviour. Must remain **last** in the file. |

### 2.4 Final rule list (authoritative)

```
/apps/payme/*    /apps/payme/index.html    200
/apps/engage/*   /apps/engage/index.html   200

/*    /index.html   200
```

Actual file at `apps/product-shell/public/_redirects` additionally carries
a comment header documenting ordering rules and the removal reasons; the
non-comment line list is exactly the four lines above.

---

## 3. Surfaces outside product-shell that must NOT leak into its deploy

The Cloudflare Pages project for product-shell is rooted at
`apps/product-shell` (see `cloudflare_runtime_notes.md` §2.2 and
`deploy_root_plan.md`). Nothing outside that root is shipped by the
product-shell Pages build. The following surfaces exist in the repo and
**must stay out of** the product-shell production deploy:

| Surface                                         | Has own `_redirects`? | Ships in product-shell deploy? | Notes                                                                 |
|-------------------------------------------------|-----------------------|--------------------------------|-----------------------------------------------------------------------|
| `engagefi-admin-minimal/`                       | Yes (`/* /index.html 200`) | **NO** — deploy separately if needed | Duplicates `apps/modules/engage` `_redirects`. Has its own Vite root. |
| `referral-admin-minimal/`                       | Yes (`/* /index.html 200`) | **NO** — deploy separately if needed | Independent; no iframe mount point in product-shell.                  |
| `payme-admin-minimal/`                          | No (`public/` not present in tree) | **NO** — not production path | See `deploy_surface_inventory.md` §3.                                 |
| `apps/modules/engage/public/_redirects`         | Yes (`/* /index.html 200`) | Built into `apps/product-shell/public/apps/engage/` | Lives inside the iframe bundle only; OK.                              |
| `worker-wb/`                                    | n/a                   | **NO** — Markdown reports only, not deployable | See `cloudflare_runtime_notes.md` §3.2.                               |
| `xyz-factory-system/` (repo root)               | n/a                   | **NO** — out of Pages root                       | Excluded by Pages root setting.                                       |

**Action**: no file moves. The Pages project root is already
`apps/product-shell`, so Pages does not publish the other roots. The
`module_deploy_gate_spec.md` records the gate explicitly so operators do not
inadvertently re-point the root.

---

## 4. Static assets retained in `apps/product-shell/public/`

Kept because at least one code path consumes them today
(see `deploy_surface_inventory.md` §5 and §7):

| File                         | Consumer                                                      | Keep? |
|------------------------------|---------------------------------------------------------------|-------|
| `biz-pages.png`              | Brand asset referenced by `AppShell`/favicon routes           | Yes   |
| `w99.png`                    | `apps/product-shell/src/app/AppShell.tsx:8` — hardcoded       | Yes   |
| `w91.png`, `w92.png`         | Static wallpaper fallback path (S3 resolver contract)         | Yes   |
| `_redirects`                 | This manifest                                                 | Yes (rewritten) |

No static asset files are deleted by this stage. Wallpaper pathway
consolidation is S3's responsibility (already completed — see
`resolver_contract_spec.md`).

---

## 5. What this stage explicitly does NOT do

Per build-sheet §6.7.3 and `cloudflare_runtime_notes.md` §0.3:

1. Does not create or modify `wrangler.toml` (S5 artifact).
2. Does not change Cloudflare dashboard bindings (`TENANTS_BUCKET`,
   `DEMO_BUCKET`) or project settings.
3. Does not rename, move, or delete any `apps/product-shell/src/` file.
4. Does not remove `engagefi-admin-minimal/`, `referral-admin-minimal/`, or
   `payme-admin-minimal/` from the repo. They remain as separately
   deployable surfaces; only the product-shell production path excludes
   them.
5. Does not alter wallet-connect code (Worker A S4 artifact:
   `wallet_unification_manifest.md`).

---

## 6. Verification checklist (operator, post-deploy)

| Check | Expected result |
|-------|------------------|
| `curl -I https://<host>/apps/payme/` after successful shell deploy | `200`, Content-Type `text/html`, served from `apps/product-shell/public/apps/payme/index.html` |
| `curl -I https://<host>/apps/engage/` after successful shell deploy | `200`, Content-Type `text/html`, served from `apps/product-shell/public/apps/engage/index.html` |
| `curl -I https://<host>/apps/referrals/` | `200` serving the product-shell SPA index (catch-all), NOT a dangling iframe rewrite. Acceptable because no iframe rule targets that path now. |
| `curl -I https://<host>/apps/vault/` | Same as `/apps/referrals/` — catch-all serves SPA index. |
| `curl -I https://<host>/api/published-page?slug=demo&page=tier-2` | `200` JSON or explicit 4xx/5xx from Pages Function; MUST NOT be rewritten to `/index.html` (Pages Functions precede `_redirects`). |
| `curl -I https://<host>/anything-random` | `200` serving product-shell SPA index via catch-all. |

If the `/apps/payme/` or `/apps/engage/` check returns 200 serving the
product-shell SPA index (identifiable by distinct HTML), the iframe build
did not run. Escalate to the module deploy gate — see
`module_deploy_gate_spec.md` §4.

---

## 7. Exit criteria (S4 pass-condition contribution)

- [x] `apps/product-shell/public/_redirects` contains zero rules whose
      target path has no build output under `apps/modules/<name>` or
      `apps/product-shell/public/apps/<name>/`.
- [x] Every retained iframe rule maps 1:1 to a module listed as INCLUDED in
      `module_deploy_gate_spec.md` §2.
- [x] The SPA catch-all is last.
- [x] No dashboard-held state is changed by this stage.
- [x] Admin mini-apps are marked EXCLUDED from shell production in
      `module_deploy_gate_spec.md`.

---

## 8. S5.3 fix — infinite-loop discard by Cloudflare Pages

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S5.3
worker: Worker B
checkpoint: CP-S5-REDIRECTS-NOLOOP
expected_status: PASS

### 8.1 Defect observed post-S4

After S4's cleanup (§2), the file at `apps/product-shell/public/_redirects`
still contained three splat-to-child rules whose destinations are themselves
matched by their source patterns:

```
/apps/payme/*    /apps/payme/index.html    200
/apps/engage/*   /apps/engage/index.html   200
/*               /index.html               200
```

- `/apps/payme/index.html` is captured by `/apps/payme/*`.
- `/apps/engage/index.html` is captured by `/apps/engage/*`.
- `/index.html` is captured by `/*`.

Cloudflare Pages' redirect parser classifies each of those as a
self-referential rewrite (the rewrite target re-matches the rule's own
pattern), flags the file as containing an infinite redirect, and discards
the entire rule set. The deploy completes with a "success" status but the
routing layer is non-functional: requests either 404 or return bare assets
with no SPA shell. This was surfaced by the cutover deploy logs reviewed
at CP-S5-REDIRECTS-NOLOOP.

### 8.2 Fix applied

The S5.3 revision of `apps/product-shell/public/_redirects` removes all
three loop-flagged rules and replaces the routing layer with Cloudflare's
native static asset resolution. The file now contains only header
comments — no active rewrite rules. This is valid for Cloudflare Pages
(`_redirects` may be empty or comments-only) and is accepted by the
deploy parser without loop-discard.

| Request path                | Served from (physical file)                           |
|-----------------------------|-------------------------------------------------------|
| `/`, `/index.html`          | `dist/index.html` (product-shell Vite build)          |
| `/apps/payme/`              | `public/apps/payme/index.html` (directory index)      |
| `/apps/payme/index.html`    | `public/apps/payme/index.html` (exact)                |
| `/apps/payme/assets/*`      | `public/apps/payme/assets/*` (exact)                  |
| `/apps/engage/`             | `public/apps/engage/index.html` (directory index)     |
| `/apps/engage/index.html`   | `public/apps/engage/index.html` (exact)               |
| `/apps/engage/assets/*`     | `public/apps/engage/assets/*` (exact)                 |
| `/biz-pages.png`, `/w9*.png`| `public/*` (exact)                                    |
| `/api/*`                    | Pages Functions (`functions/api/*`)                    |

The iframe mount contract stated in S5.3 — "Ensure iframe apps still
resolve correctly under `/apps/{name}/`" — is satisfied by directory-index
static resolution. When the GATED build produces
`apps/product-shell/public/apps/{payme,engage}/index.html`
(see `module_deploy_gate_spec.md` §2 rows 2–3), Cloudflare serves those
files for iframe mount navigation without any rewrite rule.

### 8.3 Deliberate non-inclusions

1. No product-shell SPA splat catch-all (`/* → /index.html`). The
   product-shell React Router uses `createBrowserRouter` with dynamic
   segments (`:slug`, `:designation/:slug`, `:slug/gate`, ...). Hard-refresh
   deep-link recovery for those dynamic paths is deferred to an S6 Pages
   Function (`apps/product-shell/functions/[[catchall]].ts`) where a
   programmatic rewrite can inspect the URL without being subject to
   `_redirects` loop detection. Re-introducing a splat catch-all in
   `_redirects` would reintroduce the loop-discard symptom that S5.3 fixes.
2. No `/apps/payme/*` and `/apps/engage/*` rewrites. Iframe apps at those
   paths are resolved via physical index.html + directory index.
   Iframe-internal `BrowserRouter` deep-link refresh is handled
   client-side on iframe reload at its base path.
3. No rules for `/apps/referrals/*` or `/apps/vault/*`. Those modules
   remain EXCLUDED per §2.1 and §2.2.

### 8.4 Invariant for future edits

Any rule added to `apps/product-shell/public/_redirects` MUST satisfy:
**the destination path MUST NOT be matched by the source pattern.**
Violating this invariant returns the project to the loop-discard state
documented in §8.1.

### 8.5 Post-fix verification

| Probe                                          | Expected result                                                                 |
|------------------------------------------------|---------------------------------------------------------------------------------|
| Cloudflare Pages deploy log                    | No "ignored redirect rule" warning; no "infinite redirect" flag.                |
| `curl -I https://<host>/`                      | 200, HTML from product-shell `dist/index.html`.                                  |
| `curl -I https://<host>/apps/payme/`           | 200, HTML from `public/apps/payme/index.html` (iframe SPA).                     |
| `curl -I https://<host>/apps/engage/`          | 200, HTML from `public/apps/engage/index.html` (iframe SPA).                    |
| `curl -I https://<host>/apps/payme/assets/...` | 200 asset served with correct Content-Type.                                      |
| `curl -I https://<host>/api/published-page?slug=demo&page=tier-2` | 200 JSON or explicit 4xx/5xx from Pages Function.             |

### 8.6 Exit criteria (S5.3 pass-condition)

- [x] `apps/product-shell/public/_redirects` contains zero rules whose
      destination path is matched by the rule's own source pattern.
- [x] Iframe apps at `/apps/{name}/` resolve via static directory index
      (no splat rewrite needed).
- [x] The file is minimal and valid for Cloudflare Pages (comments-only
      accepted; parser raises no infinite-redirect flag).
- [x] Dynamic SPA deep-link recovery is explicitly deferred to S6 Pages
      Functions with a rationale recorded in §8.3.
