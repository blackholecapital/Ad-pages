# BASELINE INVENTORY — Gateway Production Freeze

job_id: RB-INT-CHASSIS-002
stage: S1
worker: worker_a
baseline_source: https://github.com/blackholecapital/gatweay-production-FREEZE (default branch, shallow clone)
capture_root: /tmp/baseline-freeze
authority: baseline truth for deployable identical working copy

## 1. APP ROOTS (top-level)

- product-shell/                         # primary deployable Cloudflare Pages app (TypeScript + Vite + React + Pages Functions)
- engagefi-admin-minimal/                # standalone admin app (Vite + React JSX)
- payme-admin-minimal/                   # standalone admin app (Vite + React JSX + checkout engine subpackage)
- referral-admin-minimal/                # standalone admin app (Vite + React JSX)

## 2. MODULE PACKAGES

- modules/engage/                        # engage module (Vite + React JSX)
- modules/payme/                         # payme module (Vite + React JSX)
- modules/referrals/                     # referrals module (Vite + React JSX)
- modules/vault/                         # vault module (Vite + React JSX + Pages Functions)
- modules/blueprint/                     # module boundary list only
- modules/.keep

## 3. PACKAGE MANIFESTS (package.json)

- product-shell/package.json                                         # name: gateway-demo-zero
- product-shell/package-lock.json
- engagefi-admin-minimal/package.json
- payme-admin-minimal/package.json
- payme-admin-minimal/package-lock.json
- referral-admin-minimal/package.json
- modules/engage/package.json
- modules/engage/package-lock.json
- modules/payme/package.json
- modules/referrals/package.json
- modules/vault/package.json

## 4. BUILD CONFIGS (vite, tsconfig)

- product-shell/vite.config.ts
- product-shell/tsconfig.json
- product-shell/tsconfig.node.json
- engagefi-admin-minimal/vite.config.js
- payme-admin-minimal/vite.config.js
- referral-admin-minimal/vite.config.js
- modules/engage/vite.config.js
- modules/payme/vite.config.js
- modules/referrals/vite.config.js
- modules/vault/vite.config.js

## 5. HTML ENTRYPOINTS (index.html)

- product-shell/index.html
- engagefi-admin-minimal/index.html
- payme-admin-minimal/index.html
- referral-admin-minimal/index.html
- modules/engage/index.html
- modules/payme/index.html
- modules/referrals/index.html
- modules/vault/index.html
- product-shell/public/apps/engage/index.html        # nested microfrontend shell
- product-shell/public/apps/payme/index.html         # nested microfrontend shell
- product-shell/public/apps/referrals/index.html     # nested microfrontend shell
- product-shell/public/apps/vault/index.html         # nested microfrontend shell

## 6. BOOTSTRAP / MAIN ENTRIES

- product-shell/src/main.tsx
- product-shell/src/app/AppShell.tsx
- product-shell/src/app/router.tsx
- product-shell/src/app/routes.ts
- engagefi-admin-minimal/src/main.jsx
- engagefi-admin-minimal/src/App.jsx
- payme-admin-minimal/ (entry via index.html + src/*)
- referral-admin-minimal/src/main.jsx
- referral-admin-minimal/src/App.jsx
- modules/engage/src/main.jsx
- modules/engage/src/App.jsx
- modules/payme/src/main.jsx
- modules/payme/src/App.jsx
- modules/referrals/src/main.jsx
- modules/referrals/src/App.jsx
- modules/vault/src/main.jsx
- modules/vault/src/App.jsx
- modules/vault/src/AppRoutes.jsx

## 7. PUBLIC ASSETS

- product-shell/public/_redirects
- product-shell/public/ads/ (A1.png, A2.png, A20.png, A21.png, A22.png, A23.png, A25.png, A29.png, A3.png, A30.png, A31.png, A4.png, A555.png, A66.png, A777.png, A99.jpg, .keep)
- product-shell/public/demo/logo-mark.png
- product-shell/public/wallpapers/payme-demo.png
- product-shell/public/apps/engage/assets/index-BeZrU_QC.js
- product-shell/public/apps/engage/assets/index-DU8f5DGq.css
- product-shell/public/apps/engage/_redirects
- product-shell/drip.png
- product-shell/public/Dev Notes — Drip Studio
- product-shell/public/dev notes 3.22.26
- product-shell/public/devnotes 3.222.26
- engagefi-admin-minimal/public/_redirects
- engagefi-admin-minimal/public/wallpaper333.png
- referral-admin-minimal/public/_redirects
- referral-admin-minimal/public/wallpaper333.png
- modules/engage/public/_redirects
- modules/engage/public/wallpaper333.png
- modules/payme/public/wallpaper333.png
- modules/payme/public/xyz-watermark.png
- modules/payme/drop.png
- modules/engage/drop.png
- modules/referrals/drop.png
- modules/referrals/public/_redirects
- modules/referrals/public/wallpaper333.png
- modules/vault/public/banker-plate-20260131.png
- modules/vault/public/coin-btn.png
- modules/vault/public/keep
- modules/vault/public/wallpaper333.png

## 8. REDIRECTS FILES

- product-shell/public/_redirects
- product-shell/public/apps/engage/_redirects
- engagefi-admin-minimal/public/_redirects
- referral-admin-minimal/public/_redirects
- modules/engage/public/_redirects
- modules/referrals/public/_redirects

## 9. ROUTES FILES / CLOUDFLARE PAGES ROUTING

- modules/vault/_routes.json

## 10. CLOUDFLARE PAGES FUNCTIONS

- product-shell/functions/_lib/runtime-compiler.js
- product-shell/functions/_lib/runtime-r2.js
- product-shell/functions/_lib/runtime-schema.js
- product-shell/functions/api/microfrontend-bootstrap.js
- product-shell/functions/api/microfrontend-trust-log.js
- product-shell/functions/api/page.js
- product-shell/functions/api/published-manifest.js
- product-shell/functions/api/published-page.js
- modules/vault/functions/api/1inch-allowance.js
- modules/vault/functions/api/1inch-approve-tx.js
- modules/vault/functions/api/1inch-quote.js
- modules/vault/functions/api/1inch-swap-tx.js
- modules/vault/functions/api/1inch-tokens.js
- modules/vault/functions/api/1inch/1inch-allowance.js
- modules/vault/functions/api/1inch/1inch-approve-tx.js
- modules/vault/functions/api/1inch/1inch-balances.js
- modules/vault/functions/api/1inch/1inch-quote.js
- modules/vault/functions/api/1inch/1inch-swap-tx.js
- modules/vault/functions/api/1inch/1inch-tokens.js
- modules/vault/functions/api/1inch/[[path]].js
- modules/vault/functions/api/balances.js
- modules/vault/functions/api/quote.js

## 11. PRODUCT-SHELL SOURCE TREE (deploy app)

- product-shell/src/main.tsx
- product-shell/src/app/AppShell.tsx
- product-shell/src/app/router.tsx
- product-shell/src/app/routes.ts
- product-shell/src/components/admin/AdminActionButton.tsx
- product-shell/src/components/admin/AdminPanel.tsx
- product-shell/src/components/admin/AdminStatusBlock.tsx
- product-shell/src/components/cards/ActionCard.tsx
- product-shell/src/components/cards/InfoCard.tsx
- product-shell/src/components/cards/TierCard.tsx
- product-shell/src/components/gate/DemoBypassButton.tsx
- product-shell/src/components/gate/GateStatusPill.tsx
- product-shell/src/components/gate/LoginModal.tsx
- product-shell/src/components/gate/RequireGate.tsx
- product-shell/src/components/gate/SignMessageButton.tsx
- product-shell/src/components/gate/WalletConnectButton.tsx
- product-shell/src/components/integrations/ModuleFrame.tsx
- product-shell/src/components/layout/ContentFrame.tsx
- product-shell/src/components/layout/PageShell.tsx
- product-shell/src/components/layout/WallpaperLayer.tsx
- product-shell/src/components/nav/TopNav.tsx
- product-shell/src/components/tenant/ExclusiveContentRenderer.tsx
- product-shell/src/components/tenant/ExclusiveTileGrid.tsx
- product-shell/src/components/tenant/MobilePublishedOverlayStage.tsx
- product-shell/src/components/tenant/OverlayMediaRenderer.tsx
- product-shell/src/components/tenant/PublishedOverlayStage.tsx
- product-shell/src/components/tenant/ResponsivePublishedOverlay.tsx
- product-shell/src/components/tenant/TenantOverlayStage.tsx
- product-shell/src/config/nav.config.ts
- product-shell/src/config/pageBackgrounds.ts
- product-shell/src/config/staticPageAssets.ts
- product-shell/src/contracts/microfrontend.ts
- product-shell/src/features/engage/EngagePanel.tsx
- product-shell/src/features/marketplace/components/BasketCheckoutCard.tsx
- product-shell/src/features/marketplace/components/CartPanel.tsx
- product-shell/src/features/marketplace/components/CheckoutPanel.tsx
- product-shell/src/features/marketplace/components/PayMeEmbedPlaceholder.tsx
- product-shell/src/features/marketplace/components/ProductCard.tsx
- product-shell/src/features/marketplace/components/ProductGrid.tsx
- product-shell/src/features/marketplace/components/UsdcCheckoutCard.tsx
- product-shell/src/features/marketplace/pages/MarketplacePage.tsx
- product-shell/src/features/marketplace/state/cartStore.tsx
- product-shell/src/features/marketplace/state/mockCatalog.ts
- product-shell/src/features/payme/MemberBillingPanel.tsx
- product-shell/src/features/payme/PayMeAdminCard.tsx
- product-shell/src/features/payme/PayMeAdminPanel.tsx
- product-shell/src/features/referrals/ReferralsPanel.tsx
- product-shell/src/hooks/usePublishedExclusiveTiles.ts
- product-shell/src/hooks/useViewportMode.ts
- product-shell/src/integrations/spine/bridge.ts
- product-shell/src/integrations/spine/index.ts
- product-shell/src/integrations/spine/registry.ts
- product-shell/src/integrations/spine/types.ts
- product-shell/src/mobile/README.md
- product-shell/src/mobile/styles/mobile-overlay.css
- product-shell/src/pages/AccessPage.tsx
- product-shell/src/pages/AccessTier1Page.tsx
- product-shell/src/pages/AccessTier2Page.tsx
- product-shell/src/pages/AccessTier3Page.tsx
- product-shell/src/pages/AdminPage.tsx
- product-shell/src/pages/EngagePage.tsx
- product-shell/src/pages/HomePage.tsx
- product-shell/src/pages/MembersPage.tsx
- product-shell/src/pages/PayMePage.tsx
- product-shell/src/pages/ReferralsPage.tsx
- product-shell/src/pages/SkinMarketplacePage.tsx
- product-shell/src/runtime/exclusiveTileHydration.ts
- product-shell/src/runtime/publishedClient.ts
- product-shell/src/runtime/routeContext.ts
- product-shell/src/runtime/types.ts
- product-shell/src/state/demoGateState.tsx
- product-shell/src/styles/admin.css
- product-shell/src/styles/cards.css
- product-shell/src/styles/gate.css
- product-shell/src/styles/global.css
- product-shell/src/styles/marketplace.css
- product-shell/src/styles/nav.css
- product-shell/src/styles/published-overlay.css
- product-shell/src/styles/shell.css
- product-shell/src/utils/assetCodeResolver.ts
- product-shell/src/utils/resolveStaticAsset.ts
- product-shell/src/utils/resolveWallpaper.ts
- product-shell/src/utils/tenantPageClient.ts
- product-shell/src/utils/usdc.ts
- product-shell/tests/microfrontend/compatibility-gates.test.mjs
- product-shell/tests/microfrontend/contract-schema.test.mjs
- product-shell/tests/microfrontend/isolation-degradation.test.mjs
- product-shell/tests/microfrontend/telemetry-ingestion.test.mjs
- product-shell/tests/microfrontend/trust-path.test.mjs

## 12. PRODUCTION SUPPORT FILES

- production/README.md
- production/compatibility-decision-ledger.md
- production/decision-ledger.md
- production/install/applied-install-record.yaml
- production/install/final-issued-stamp.yaml
- production/install/install-stamp-chain.yaml
- production/install/stamped-install-intake.yaml
- production/manifests/allowed-parts-ledger.yaml
- production/manifests/allowed-variation-ledger.yaml
- production/manifests/stamped-composition-ledger.yaml
- production/pass-1-checkpoint.md
- production/pass-2-checkpoint.md
- production/pass-2b-checkpoint.md
- production/pass-2c-checkpoint.md
- production/pass-3-checkpoint.md
- production/pass-3b-checkpoint.md
- production/pass-4-checkpoint.md
- production/pass-5-checkpoint.md
- production/preview-build-result.md
- production/qc/checks/install-stamp-integrity.md
- production/qc/checks/registry-bypass-risk.md
- production/qc/checks/resolver-path-integrity.md
- production/qc/checks/shell-ownership-integrity.md
- production/qc/checks/unauthorized-variation-detection.md
- production/qc/checks/undeclared-dependency-detection.md
- production/qc/checks/unstamped-artifact-detection.md
- production/qc/reports/issuance-decision-ledger.md
- production/qc/reports/open-qc-failures.md
- production/qc/reports/qc-check-results.md
- production/qc/reports/qc-decision-ledger.md
- production/resolver-decision-ledger.md
- production/stale-path-scan.md

## 13. RESOLVER-BOUNDARY FILES

- resolver-boundary/README.md
- resolver-boundary/compatibility/rule-application.md
- resolver-boundary/input/declared-dependencies.yaml
- resolver-boundary/input/declared-manifests.yaml
- resolver-boundary/input/declared-variation.yaml
- resolver-boundary/normalization/composition-record.json
- resolver-boundary/normalization/dependency-resolution-record.json
- resolver-boundary/stamped-output/install-stamp-draft.yaml

## 14. VARIATION CONTROL

- variation-control/README.md

## 15. REVIEW / ROOT ARTIFACTS

- _review-required/README.md
- _review-required/root-artifacts/BRIGHT_WALLPAPER_NOTES.md
- _review-required/root-artifacts/FILE_SYSTEM_SNAPSHOT.txt
- _review-required/root-artifacts/MEDIA_RENDERER_PATCH_NOTES.md
- _review-required/root-artifacts/MEDIA_TOKEN_PATCH_NOTES.md
- _review-required/root-artifacts/NOTES-demo-zero.md
- _review-required/root-artifacts/NOTES-path3-runtime-rebuild.md
- _review-required/root-artifacts/UPDATE_NOTES.md

## 16. PRODUCT-SHELL MICROFRONTEND DOCS

- product-shell/README.md
- product-shell/blueprint/authority-boundaries.md
- product-shell/blueprint/decision-register.md
- product-shell/blueprint/spine-compatibility-policy.md
- product-shell/docs/hardening/04d-exclusive-runtime-data-flow.md
- product-shell/docs/hardening/04d-exclusive-runtime-fix.md
- product-shell/docs/hardening/04d-exclusive-runtime-parity-check.md
- product-shell/docs/microfrontend/contracts-v1.md
- product-shell/docs/microfrontend/final-closeout-root-cause.md
- product-shell/docs/microfrontend/final-closeout-route-sanity.md
- product-shell/docs/microfrontend/final-closeout-typecheck-fix.md
- product-shell/docs/microfrontend/final-production-closeout.md
- product-shell/docs/microfrontend/pass-1-*.md                  (11 pass-1 docs)
- product-shell/docs/microfrontend/pass-1_5-*.md                (6 pass-1.5 docs)
- product-shell/docs/microfrontend/pass-2-*.md                  (13 pass-2 docs)
- product-shell/docs/microfrontend/pass-3-*.md                  (13 pass-3 docs)
- product-shell/docs/microfrontend/pass-4-*.md                  (22 pass-4 docs)
- product-shell/docs/microfrontend/pass-4_5-*.md                (7 pass-4.5 docs)
- product-shell/docs/microfrontend/pass-5-*.md                  (7 pass-5 docs)
- product-shell/docs/microfrontend/pass-b-rerun-*.md            (5 rerun docs)
- product-shell/docs/microfrontend/stripe-cutover-checklist.md

## 17. ROOT-LEVEL FILES

- README.md
- .gitignore

## SUMMARY

deploy_app_root (baseline):           product-shell/
standalone_admin_apps (baseline):     engagefi-admin-minimal/, payme-admin-minimal/, referral-admin-minimal/
module_packages (baseline):           modules/engage/, modules/payme/, modules/referrals/, modules/vault/, modules/blueprint/
production_support (baseline):        production/
resolver_boundary (baseline):         resolver-boundary/
variation_control (baseline):         variation-control/
review_artifacts (baseline):          _review-required/
package_manifests_count:              11 (package.json)
vite_configs_count:                   10
tsconfig_count:                       2 (tsconfig.json, tsconfig.node.json)
html_entrypoints_count:               12
redirects_count:                      6
pages_functions_count:                22 (8 product-shell + 14 vault)
primary_deploy_root:                  product-shell/
primary_build_command:                npm run build  (resolves: npm run build:engage && vite build)
primary_output_dir:                   dist (vite default, product-shell/dist)
