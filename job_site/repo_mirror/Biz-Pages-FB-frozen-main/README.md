# Biz-Pages-FB-frozen-main (mirror manifest)

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S1 / Worker A
mirror_mode: by-reference

## Canonical source root
This mirror references the source tree of the Biz-Pages-FB-frozen repository
rooted at the repository root (repo working tree). Physical duplication of the
source into this path was intentionally skipped because:

1. The repo working tree **is** Biz-Pages-FB-frozen-main; duplicating it into
   `/job_site/repo_mirror/` would double commit history and invalidate the
   "frozen" invariant.
2. All subsequent worker stages cite paths relative to the repo root
   (`apps/product-shell/...`, `packages/*chassis/...`, `worker-wb/...`), not
   relative to the mirror.
3. `FILE_TREE.txt` in this directory captures the mirrored surface exactly at
   audit time (S1 start).

## How to interpret mirror-relative paths
When downstream artifacts reference
`/job_site/repo_mirror/Biz-Pages-FB-frozen-main/<path>`, translate that as
`<repo-root>/<path>`.

## Surface directories enumerated in FILE_TREE.txt
- apps/core-runtime
- apps/local-host
- apps/modules
- apps/operator-shell
- apps/product-shell      <-- premium shell + wallpaper renderer live here
- apps/web-public
- packages/contracts-core
- packages/lifecycle-chassis
- packages/policy-chassis
- packages/proof-chassis
- packages/registry-chassis
- packages/runtime-bridge
- packages/schema-chassis
- packages/session-transport
- packages/validation-chassis
- worker-wb               <-- Cloudflare Worker checkpoints (p2.x-p4.x)
- xyz-factory-system      <-- chassis invariants + stage-6 resolver
- engagefi-admin-minimal, payme-admin-minimal, referral-admin-minimal
- shared

## Commit anchor
Mirror captured on branch `claude/extract-repos-audit-shell-6RWzs`.
