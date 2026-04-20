# CURRENT REBUILD INVENTORY — gateway-fullbody-freeze

job_id: RB-INT-CHASSIS-002
stage: S1
worker: worker_a
current_rebuild_source: /home/user/gateway-fullbody-freeze (attached file system, branch claude/inventory-app-structure-Ilqh1)
continuation_of: https://github.com/blackholecapital/gateway-fullbody-freeze/tree/main
authority: current rebuild truth

## 1. APP ROOTS (top-level)

- apps/core-runtime/                     # TS route/touchpoint/session tree (no package.json, no build config)
- apps/operator-shell/                   # TS mount tree (no package.json, no build config)
- apps/web-public/                       # TS mount tree (no package.json, no build config)
- apps/local-host/                       # TS transport/bridge tree (no package.json, no build config)

## 2. PACKAGE MANIFESTS (package.json)

- (none)                                 # NO package.json anywhere in the repo

## 3. BUILD CONFIGS

- (none)                                 # NO vite.config.*, NO tsconfig.json, NO tsconfig.node.json, NO wrangler.*, NO *.config.js, NO *.config.ts

## 4. HTML ENTRYPOINTS

- (none)                                 # NO index.html anywhere in the repo

## 5. BOOTSTRAP / MAIN ENTRIES

- (none)                                 # NO src/main.tsx, NO src/main.jsx, NO App.tsx, NO App.jsx, NO AppShell.tsx

## 6. PUBLIC ASSETS

- (none)                                 # NO public/ directory anywhere in the repo

## 7. REDIRECTS / ROUTES FILES

- (none)                                 # NO _redirects, NO _headers, NO _routes.json, NO wrangler.toml

## 8. CLOUDFLARE PAGES FUNCTIONS

- (none)                                 # NO functions/ directory, NO functions/api/, NO functions/_lib/

## 9. MODULE PACKAGES (packages/)

- packages/contracts-core/DERIVED_FROM.md
- packages/contracts-core/WA-P1.1.merge-notes.md
- packages/contracts-core/src/index.ts
- packages/lifecycle-chassis/DERIVED_FROM.md
- packages/lifecycle-chassis/src/index.ts
- packages/lifecycle-chassis/src/install.lifecycle.ts
- packages/lifecycle-chassis/src/update.lifecycle.ts
- packages/lifecycle-chassis/src/disable.lifecycle.ts
- packages/lifecycle-chassis/src/remove.lifecycle.ts
- packages/policy-chassis/DERIVED_FROM.md
- packages/policy-chassis/src/index.ts
- packages/policy-chassis/src/adapter.policy.ts
- packages/policy-chassis/src/chassis.policy.ts
- packages/policy-chassis/src/manifest.policy.ts
- packages/policy-chassis/src/variation.policy.ts
- packages/proof-chassis/DERIVED_FROM.md
- packages/proof-chassis/src/index.ts
- packages/proof-chassis/src/compatibility.adapter.ts
- packages/proof-chassis/src/consumption-map.ts
- packages/proof-chassis/src/install-chain.adapter.ts
- packages/proof-chassis/src/operator-summary.adapter.ts
- packages/proof-chassis/src/result-domain.ts
- packages/proof-chassis/src/validation.adapter.ts
- packages/registry-chassis/DERIVED_FROM.md
- packages/registry-chassis/src/index.ts
- packages/registry-chassis/src/event-registry.ts
- packages/registry-chassis/src/module-registry.ts
- packages/registry-chassis/src/route-registry.ts
- packages/registry-chassis/src/surface-registry.ts
- packages/registry-chassis/src/trigger-registry.ts
- packages/runtime-bridge/DERIVED_FROM.md
- packages/runtime-bridge/src/index.ts
- packages/runtime-bridge/src/admin-bridge-contract.ts
- packages/runtime-bridge/src/bridge-contract.ts
- packages/schema-chassis/DERIVED_FROM.md
- packages/schema-chassis/src/index.ts
- packages/schema-chassis/src/event.schema.ts
- packages/schema-chassis/src/install-stamp.schema.ts
- packages/schema-chassis/src/manifest.schema.ts
- packages/schema-chassis/src/module.schema.ts
- packages/schema-chassis/src/route.schema.ts
- packages/schema-chassis/src/surface.schema.ts
- packages/schema-chassis/src/touchpoint.schema.ts
- packages/schema-chassis/src/trigger.schema.ts
- packages/session-transport/DERIVED_FROM.md
- packages/session-transport/src/index.ts
- packages/session-transport/src/session-transport-link.ts
- packages/session-transport/src/transport-contract.ts
- packages/session-transport/src/transport.contract.ts
- packages/validation-chassis/DERIVED_FROM.md
- packages/validation-chassis/src/index.ts
- packages/validation-chassis/src/compatibility.validator.ts
- packages/validation-chassis/src/failure-codes.ts
- packages/validation-chassis/src/id-domain.validator.ts
- packages/validation-chassis/src/install-chain.validator.ts
- packages/validation-chassis/src/lifecycle-transition.validator.ts
- packages/validation-chassis/src/mount-compatibility.validator.ts
- packages/validation-chassis/src/mount.validator.ts
- packages/validation-chassis/src/profile-runtime-gate.validator.ts
- packages/validation-chassis/src/result.ts
- packages/validation-chassis/src/route-surface.validator.ts
- packages/validation-chassis/src/schema.validator.ts
- packages/validation-chassis/src/shell-mount.validator.ts
- packages/validation-chassis/src/shell-surface.validator.ts
- packages/validation-chassis/src/touchpoint-event.validator.ts
- packages/validation-chassis/src/touchpoint-surface.validator.ts
- packages/validation-chassis/src/trigger-event.validator.ts

## 10. apps/core-runtime SOURCE

- apps/core-runtime/src/routes/index.ts
- apps/core-runtime/src/routes/proof.ts
- apps/core-runtime/src/routes/install.route.ts
- apps/core-runtime/src/routes/update.route.ts
- apps/core-runtime/src/routes/disable.route.ts
- apps/core-runtime/src/routes/remove.route.ts
- apps/core-runtime/src/routes/payme-admin.route.ts
- apps/core-runtime/src/routes/referral-admin.route.ts
- apps/core-runtime/src/touchpoints/index.ts
- apps/core-runtime/src/touchpoints/proof.ts
- apps/core-runtime/src/touchpoints/install.touchpoint.ts
- apps/core-runtime/src/touchpoints/update.touchpoint.ts
- apps/core-runtime/src/touchpoints/disable.touchpoint.ts
- apps/core-runtime/src/touchpoints/remove.touchpoint.ts
- apps/core-runtime/src/touchpoints/payme-admin.touchpoint.ts
- apps/core-runtime/src/touchpoints/referral-admin.touchpoint.ts
- apps/core-runtime/src/session/index.ts
- apps/core-runtime/src/session/activation-gate.ts
- apps/core-runtime/src/session/install-chain.proof.ts

## 11. apps/operator-shell SOURCE

- apps/operator-shell/src/mounts/index.ts
- apps/operator-shell/src/mounts/proof.ts
- apps/operator-shell/src/mounts/install.mount.ts
- apps/operator-shell/src/mounts/update.mount.ts
- apps/operator-shell/src/mounts/payme-admin.mount.ts
- apps/operator-shell/src/mounts/referral-admin.mount.ts
- apps/operator-shell/src/app/layout/shell.layout.ts
- apps/operator-shell/src/app/layout/shell.layout.proof.ts
- apps/operator-shell/src/app/layout/shell.layout.proof-run.ts

## 12. apps/web-public SOURCE

- apps/web-public/src/mounts/index.ts
- apps/web-public/src/mounts/proof.ts
- apps/web-public/src/mounts/disable.mount.ts
- apps/web-public/src/mounts/remove.mount.ts
- apps/web-public/src/mounts/payme-admin.mount.ts
- apps/web-public/src/mounts/referral-admin.mount.ts
- apps/web-public/src/app/layout/shell.layout.ts
- apps/web-public/src/app/layout/shell.layout.proof.ts
- apps/web-public/src/app/layout/shell.layout.proof-run.ts

## 13. apps/local-host SOURCE

- apps/local-host/src/transport/index.ts
- apps/local-host/src/transport/session-link.ts
- apps/local-host/src/bridge/index.ts
- apps/local-host/src/bridge/runtime-bridge.ts
- apps/local-host/src/bridge/admin-bridge.ts

## 14. xyz-factory-system (chassis reference, non-deploy)

- xyz-factory-system/invariants/policies/manifest-policy.md
- xyz-factory-system/invariants/policies/adapter-policy.md
- xyz-factory-system/invariants/policies/variation-policy.md
- xyz-factory-system/invariants/policies/chassis-policy.md
- xyz-factory-system/invariants/chassis/schemas/surface.schema.md
- xyz-factory-system/invariants/chassis/schemas/route.schema.md
- xyz-factory-system/invariants/chassis/schemas/event.schema.md
- xyz-factory-system/invariants/chassis/schemas/module.schema.md
- xyz-factory-system/invariants/chassis/schemas/install-stamp.schema.md
- xyz-factory-system/invariants/chassis/schemas/touchpoint.schema.md
- xyz-factory-system/invariants/chassis/schemas/manifest.schema.md
- xyz-factory-system/invariants/chassis/schemas/trigger.schema.md
- xyz-factory-system/invariants/chassis/types/Trigger.contract.md
- xyz-factory-system/invariants/chassis/types/Manifest.contract.md
- xyz-factory-system/invariants/chassis/types/Surface.contract.md
- xyz-factory-system/invariants/chassis/types/Module.contract.md
- xyz-factory-system/invariants/chassis/types/InstallStamp.contract.md
- xyz-factory-system/invariants/chassis/types/Touchpoint.contract.md
- xyz-factory-system/invariants/chassis/types/Route.contract.md
- xyz-factory-system/invariants/chassis/types/Event.contract.md
- xyz-factory-system/invariants/chassis/registry/trigger-registry.md
- xyz-factory-system/invariants/chassis/registry/surface-registry.md
- xyz-factory-system/invariants/chassis/registry/event-registry.md
- xyz-factory-system/invariants/chassis/registry/module-registry.md
- xyz-factory-system/invariants/chassis/lifecycle/ (present)
- xyz-factory-system/stage-6-software/manifests/ (present)
- xyz-factory-system/stage-6-software/bindings/ (present)
- xyz-factory-system/stage-6-software/resolver/ (present)
- xyz-factory-system/stage-6-software/qc/ (present)
- xyz-factory-system/stage-6-software/production/install/ (present)
- xyz-factory-system/stage-6-software/registries/ (present)

## 15. worker-wb (prior-pass worker reports, non-deploy)

- worker-wb/p2-prep/, worker-wb/p2.1/, worker-wb/p3-prep/, worker-wb/p3.1/, worker-wb/p4-prep/, worker-wb/p4.2/, worker-wb/p4.4/, worker-wb/p4.6/, worker-wb/p4.7/

## 16. job_site (runtime docs for this run)

- job_site/factory-manual-v1.11.txt
- job_site/foreman-manual-v1.11.txt
- job_site/worker-execution-manual-v1.1.txt
- job_site/build-sheet-v1.11.txt
- job_site/build-sheet-rb-int-chassis-002.txt
- job_site/target_path_manifest.yaml                  (prior pass RB-INT-CHASSIS-001 S2 artifact)
- job_site/integration_blueprint.md                   (prior pass RB-INT-CHASSIS-001 artifact)
- job_site/rebuild_execution_order.md                 (prior pass RB-INT-CHASSIS-001 artifact)
- job_site/fragment_allowlist.md                      (prior pass RB-INT-CHASSIS-001 artifact)
- job_site/runtime_change_manifest.md                 (prior pass RB-INT-CHASSIS-001 artifact)
- job_site/ui_change_manifest.md                      (prior pass RB-INT-CHASSIS-001 artifact)

## 17. ROOT-LEVEL FILES

- README.md

## SUMMARY

deploy_app_root (current):                none
standalone_admin_apps (current):          none
module_packages_matching_baseline:        none
production_support (current):             none at production/ path
resolver_boundary (current):              none at resolver-boundary/ path
variation_control (current):              none at variation-control/ path
review_artifacts (current):               none at _review-required/ path
package_manifests_count:                  0
vite_configs_count:                       0
tsconfig_count:                           0
html_entrypoints_count:                   0
redirects_count:                          0
pages_functions_count:                    0
primary_deploy_root:                      NONE
primary_build_command:                    NONE
primary_output_dir:                       NONE
repo_architecture:                        TypeScript chassis monorepo (no bundler, no runtime, no Pages deploy surface)
