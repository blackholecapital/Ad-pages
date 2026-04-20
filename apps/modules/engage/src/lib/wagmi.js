// Re-export of the canonical wagmi config. Do NOT redeclare `createConfig`
// here. The single source of truth lives at:
//   apps/product-shell/src/wallet/wagmiConfig.shared.js
// and is owned by `apps/product-shell/src/wallet/` (see README in that dir).
//
// The relative path crosses app boundaries inside the monorepo; Vite's
// default resolver handles it because both trees are part of the same
// working tree. If the module is later extracted into its own deploy,
// swap this path for a published package import without touching callers.

export {
  wagmiConfig,
  buildWagmiConfig,
  WALLET_CHAINS,
  WC_PROJECT_ID_ENV_KEY,
} from '../../../../product-shell/src/wallet/wagmiConfig.shared.js'
