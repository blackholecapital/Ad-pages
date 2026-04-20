# gateway-integration-main (reference manifest)

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S1 / Worker A
mirror_mode: by-reference

## Purpose
Reference-only view of the Gateway integration surface the Biz Pages runtime
must conform to. No upstream `gateway-integration-main` archive was present on
this host at S1 capture; the Gateway runtime contract is expressed in this repo
through:

| Surface                        | Canonical repo path                                |
|--------------------------------|----------------------------------------------------|
| Worker entry (wb, retention)   | `worker-wb/p4.7/retention-decision.md`             |
| Runtime bridge (pass-through)  | `packages/runtime-bridge/src/bridge-contract.ts`   |
| Admin bridge contract          | `packages/runtime-bridge/src/admin-bridge-contract.ts` |
| Session transport              | `packages/session-transport/`                      |
| Core runtime install/activate  | `apps/core-runtime/src/routes/install.route.ts`    |
| Core runtime touchpoints       | `apps/core-runtime/src/touchpoints/*.touchpoint.ts` |
| Local host bridge              | `apps/local-host/src/bridge/runtime-bridge.ts`     |
| Product shell runtime client   | `apps/product-shell/src/runtime/publishedClient.ts` |
| Product shell functions (CF)   | `apps/product-shell/functions/_lib/`, `functions/api/` |
| Gateway-production-freeze stub | `job_site/gateway-production-freeze/.keep`         |

## Observed gaps vs expected archive
- No standalone `gateway-integration-main/` archive directory exists outside
  this repo; the Gateway contract is distributed across the paths above.
- `job_site/gateway-production-freeze/` currently contains only a `.keep` file
  listing the bare token `gateway`, which downstream stages must either fill
  with the freeze snapshot or treat as an empty placeholder.
- `packages/runtime-bridge/DERIVED_FROM.md` explicitly declares that runtime
  bridge is **pass-through only** and that authority remains upstream in
  `xyz-factory-system/`. Any Gateway-drift fix must respect that.

See `FILE_TREE.txt` for the exact file set that constitutes the Gateway
integration reference at S1 capture.
