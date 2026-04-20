// Re-export of the canonical wagmi config. See
// `apps/product-shell/src/wallet/README.md` for context.
// No local `createConfig` may be declared here.
export {
  wagmiConfig,
  buildWagmiConfig,
  WALLET_CHAINS,
  WC_PROJECT_ID_ENV_KEY,
} from '../../../../product-shell/src/wallet/wagmiConfig.shared.js'
