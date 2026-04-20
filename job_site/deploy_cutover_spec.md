# Deploy Cutover Spec — BIZ-PAGES-PROD-DETANGLE-002 (S1 Baseline)

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S1 (baseline only — cutover is DEFERRED to S5)
worker: Worker B
authority: non-authoritative baseline. Declares the shape of the cutover
decision, enumerates the required inputs, and freezes the "do not modify
deploy targets yet" constraint. The actual cutover target is selected in S5
by Worker A in `/job_site/cloudflare_rebuild_runbook.md`.

required_references:
- /job_site/build-sheet-active.txt (resolved in this mirror as `/job_site/build-sheet-BIZ-PAGES-PROD`)
- /job_site/cloudflare_runtime_notes.md (companion artifact, this stage)
- /job_site/runtime_parity_matrix.md (Worker A artifact — produced in parallel)
- /job_site/wallpaper_renderer_fault_report.md (Worker A artifact — produced in parallel)

---

## 0. Hard Constraint (S1)

Per build-sheet §6.7.3:

> Do not modify deploy targets yet.

This spec therefore does NOT:
- change any Cloudflare project setting,
- create or delete any Pages project, Worker, or R2 bucket,
- write a `wrangler.toml`,
- edit `/apps/product-shell/public/_redirects`,
- rename any binding,
- change the Pages build command, build root, or output dir.

It only **describes the shape of the cutover** so S2–S5 can execute against
a fixed baseline.

---

## 1. Cutover Definition

A **cutover** for BIZ-PAGES-PROD-DETANGLE-002 is defined as: the operator
action that moves Biz Pages off its current (suspected poisoned) Cloudflare
Pages project metadata onto a deploy target whose configuration is either
(a) fully declared in this repo, or (b) declared in a new, clean Cloudflare
project whose settings are documented in `/job_site/cloudflare_binding_map.md`
and reproducible from `/job_site/cloudflare_rebuild_runbook.md`.

The cutover is complete only when all three are true:

1. No build-time configuration is read from a Cloudflare dashboard setting
   that is not also recorded in repo or in `/job_site/cloudflare_binding_map.md`.
2. One known premium slug (the S6 regression vector) passes Studio-style
   payload → object resolve → Biz render end-to-end.
3. The operator has selected, on record, which of the two cutover targets
   (see §2) is live.

---

## 2. Two Candidate Cutover Targets (S1 Declaration)

The cutover MUST resolve to exactly one of these two targets in S5. Both
are declared here so S2–S4 can build without favouring one prematurely.

### 2.1 Target A — Pages-first (repo-declared Pages project)

Cloudflare Pages remains the deploy target, but the project's configuration
is reconstructed from repo-declared values plus an explicit
`/job_site/cloudflare_binding_map.md`.

| Attribute | Value |
|---|---|
| deploy engine | Cloudflare Pages |
| build root | `apps/product-shell` |
| install | `npm install` |
| build | `npm run build` |
| output | `dist` |
| functions | `apps/product-shell/functions/` (auto-discovered) |
| R2 bindings | `TENANTS_BUCKET`, `DEMO_BUCKET` declared in Pages project |
| external Worker | optional — may remain to serve direct R2 asset URLs |
| repo artifacts required | `wrangler.toml` (Pages-compatible bindings block) in `apps/product-shell/`, recorded in `/job_site/cloudflare_rebuild_runbook.md` |
| safe when | Pages project can be cleanly recreated from the repo; no legacy Pages metadata needs to be preserved |

### 2.2 Target B — Worker-first (Worker-routed delivery, optional Pages static shell)

A standalone Cloudflare Worker becomes the authoritative `/api/*` and (if
chosen) `/wallpapers/*` surface. Pages, if still used, serves only static
shell bundles; alternatively the Worker serves the shell asset payload
directly.

| Attribute | Value |
|---|---|
| deploy engine | Cloudflare Worker (primary); optional static origin (R2 public bucket or Pages static-only) for shell assets |
| Worker script location | `apps/product-shell/worker/` (proposed — not yet created) |
| Worker routes | `/api/*` and, if chosen, `/wallpapers/*` and `/stickers/*` |
| R2 bindings | `TENANTS_BUCKET`, `DEMO_BUCKET`, plus any asset bucket binding needed for direct asset fetch |
| `wrangler.toml` | declared in the Worker directory; bindings + routes + compatibility date in-repo |
| Pages Functions | deprecated or proxied — must not double-serve `/api/*` |
| safe when | Pages metadata cannot be trusted and the operator wants the deploy definition to live entirely in-repo |

### 2.3 Target choice is DEFERRED

This spec does **not** choose between Target A and Target B. The S5 worker
order (`build-sheet` §6.6.3 for S5 Worker A) explicitly states that if
Pages cannot safely represent the required bucket/worker topology, Target B
becomes the primary path. The inputs needed to make that call are listed
in §4 below.

---

## 3. Poisoned-Metadata Principle

From build-sheet §1.3 and `/job_site/cloudflare_runtime_notes.md` §5 (B1):

> *The Cloudflare Pages project state is deeper than bucket recreation and
> must be treated as poisoned control-plane metadata until proven otherwise.*

Operationally, this means:

- P1. **Do not attempt an in-place Pages settings fix** as the first move.
  Every known-unknown in `/job_site/cloudflare_runtime_notes.md` §6 must
  be resolved in writing before any setting is edited in the existing
  Pages project.
- P2. **Favour a clean build artifact over preservation** of the existing
  Pages project ID if the known-unknowns cannot be fully reconciled. A new
  Pages project (Target A') or a Worker-first deploy (Target B) is
  preferable to editing a project whose history is opaque.
- P3. **The repo is the recovery surface.** After the cutover, the repo
  plus `/job_site/cloudflare_binding_map.md` plus
  `/job_site/cloudflare_rebuild_runbook.md` MUST be sufficient to recreate
  the deploy without reading the old Pages dashboard.
- P4. **No dashboard-only change is acceptable in S5.** Every S5 operator
  action must have a corresponding repo or job_site artifact change that
  records it. If a setting has to exist only in the dashboard (e.g. a
  secret), the existence of the setting (but not its value) must be
  declared in `/job_site/cloudflare_binding_map.md`.

---

## 4. Required Inputs Before S5 Cutover

The cutover cannot run until every row below has a declared value.

| Input | Source | Currently known? |
|---|---|---|
| R2 bucket names behind `TENANTS_BUCKET`, `DEMO_BUCKET` | operator / Cloudflare dashboard | NO — tracked as U5 in `/job_site/cloudflare_runtime_notes.md` §6 |
| Existence + identity of external Worker fronting bucket | operator / Cloudflare dashboard | NO — tracked as U6/U7 |
| Custom domain and DNS routing | operator / Cloudflare dashboard | NO — tracked as U2 |
| Access / WAF / Zero-Trust rules | operator / Cloudflare dashboard | NO — tracked as U8 |
| Node version pin | operator / Cloudflare dashboard or repo pin | NO — tracked as U4 |
| Renderer fault localization | `/job_site/wallpaper_renderer_fault_report.md` (Worker A, S1) | PENDING this stage |
| Runtime parity map | `/job_site/runtime_parity_matrix.md` (Worker A, S1) | PENDING this stage |
| Resolver contract | `/job_site/resolver_contract_spec.md` (Worker A, S3) | not produced yet |
| Deploy surface inventory | `/job_site/deploy_surface_inventory.md` (Worker A, S1) | not produced yet |
| Redirect-loop-free shell surface | `/job_site/deploy_cleanup_manifest.md` (Worker B, S4) | not produced yet |
| Operator final target choice | operator confirmation step in S5 | not made yet |

---

## 5. Cutover Gate (from Build-Sheet S5)

This spec records, but does not execute, the gate declared by the build-sheet:

- Pass condition (build-sheet §7.1 for S5): deploy config exists in repo;
  the binding map separates Worker bindings from Pages assumptions; the
  runbook explicitly addresses poisoned Pages metadata by reset or
  avoidance; and operator test prompts exist for the chosen cutover path.
- Patch condition (§7.2): deploy remains dashboard-only; binding
  names/targets are ambiguous; or no operator cutover checklist is
  produced.

The S5 Worker A order requires a `wrangler.toml` under
`/apps/product-shell/wrangler.toml`. This file is NOT created by this S1
pass (constraint §0). It is declared here only as a downstream requirement.

---

## 6. Cutover Sequence (declared, not executed)

The following sequence is the reference order for S5. Each step has a
repo/job_site output and a dashboard action. No step is executed in S1.

1. **Resolve known-unknowns.** Operator reads U1–U10 from
   `/job_site/cloudflare_runtime_notes.md` §6 into
   `/job_site/cloudflare_binding_map.md`. No deploy target touched.
2. **Select target.** Operator chooses Target A or Target B (see §2).
   Recorded in `/job_site/cloudflare_binding_map.md` and
   `/job_site/cloudflare_rebuild_runbook.md`.
3. **Declare repo config.** Worker A, S5 writes the repo-declared deploy
   spec:
   - Target A: `apps/product-shell/wrangler.toml` declaring R2 bindings.
   - Target B: Worker source under `apps/product-shell/worker/` plus its
     `wrangler.toml` declaring bindings + routes.
4. **Stand up clean deploy target.** Operator creates a new Pages project
   (Target A) or deploys the Worker (Target B) using the repo-declared
   config. The old Pages project is left **running but not edited** until
   the new target is proven.
5. **Verify bindings.** Operator runs the binding checks in
   `/job_site/operator_test_prompts.md` (S5 Worker B) against the new
   target. Verification covers binding presence, worker route presence,
   slug fetch, and asset resolution.
6. **Swap traffic.** DNS / custom domain / Worker route is moved to the new
   target. Old target kept live (not deleted) for rollback window.
7. **Regression.** Worker A, S6 executes the known-slug regression package
   (`/job_site/known_slug_test_vector.json`) against the new target and
   records evidence in `/job_site/final_regression_evidence.md`.
8. **Close out.** Old Pages project is retired after rollback window;
   retirement date recorded in `/job_site/commit_push_record.md`.

---

## 7. Explicit Exclusions from S5 Cutover

To keep the cutover narrow, these are out of scope for the cutover itself
(even though they may be addressed in adjacent stages):

- Renderer code changes — owned by S2, not by the cutover.
- Resolver code changes — owned by S3.
- Wallet-connect consolidation — owned by S4.
- `_redirects` rewriting beyond removing loop-prone rules — the cutover
  must not re-author redirect behaviour.
- Bucket data migration — operator belief (B4) is that bucket data is
  intact; the cutover assumes no R2 object-level edit.

---

## 8. Rollback Spec

Every cutover must have a rollback plan. The plan declared here is the
minimum viable rollback.

| Trigger | Action |
|---|---|
| New target fails binding check (§6 step 5) | Abort cutover. Old Pages project remains live. Re-enter §6 step 1 with updated known-unknowns. |
| DNS swapped but regression fails | Swap DNS back to old target within rollback window. Record failure evidence in `/job_site/final_regression_evidence.md`. |
| External Worker route collision after swap | Revert the route binding on the new Worker. Old route on old Worker reinstated. |
| Poisoned metadata turns out to also affect the new project | Restart with Target B (if A was chosen) or a second clean Pages project (if B was chosen). |

Rollback decisions are recorded in `/job_site/operator_test_prompts.md`
(S5 Worker B) and `/job_site/cloudflare_cutover_checklist.md` (S5 Worker B).

---

## 9. Baseline Verdict (Worker B, S1)

- The cutover is a **two-target, operator-selected action**. The target
  choice is deferred to S5 and depends on ten dashboard-held unknowns that
  this baseline enumerates.
- The cutover is **gated on the poisoned-metadata principle**: the repo
  must be the recovery surface; no in-place Pages edit is acceptable as
  the first move.
- The cutover sequence is an eight-step process, each step with a declared
  repo/job_site artifact owner.
- A minimum-viable rollback plan exists and is tied to specific triggers.

**No deploy target has been modified by this pass.** This spec is safe to
commit and push.
