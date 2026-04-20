# FULLBODY-CHASSIE-V1-FROZEN--main (reference manifest)

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S1 / Worker A
mirror_mode: by-reference

## Canonical chassis sources in-repo

| Chassis surface              | Canonical repo path                       |
|------------------------------|-------------------------------------------|
| Upstream authority root      | `xyz-factory-system/`                     |
| Invariants - chassis types   | `xyz-factory-system/invariants/chassis/types/` |
| Invariants - lifecycle       | `xyz-factory-system/invariants/chassis/lifecycle/` |
| Invariants - registry        | `xyz-factory-system/invariants/chassis/registry/` |
| Invariants - schemas         | `xyz-factory-system/invariants/chassis/schemas/`  |
| Stage-6 resolver             | `xyz-factory-system/stage-6-software/resolver/`   |
| Stage-6 production install   | `xyz-factory-system/stage-6-software/production/install/` |
| Proof chassis                | `packages/proof-chassis/src/`             |
| Validation chassis           | `packages/validation-chassis/src/`        |
| Registry chassis             | `packages/registry-chassis/src/`          |
| Lifecycle chassis            | `packages/lifecycle-chassis/src/`         |
| Policy chassis               | `packages/policy-chassis/src/`            |
| Schema chassis               | `packages/schema-chassis/src/`            |
| Contracts core               | `packages/contracts-core/src/`            |

## Chassis authority model
Per `packages/runtime-bridge/DERIVED_FROM.md`:
- One-way authority: upstream (`xyz-factory-system/`) → downstream (everything else).
- Runtime bridge is strictly pass-through; cannot synthesize install-path artifacts.
- Install path must be complete: stamped-output → stamped-install-intake →
  applied-install-record → runtime activation. No shortcut permitted.

## Absent archive
No standalone `FULLBODY-CHASSIE-V1-FROZEN--main` archive directory was present
on this host at S1 capture. `FILE_TREE.txt` in this directory enumerates the
chassis surface actually available in the repo working tree.
