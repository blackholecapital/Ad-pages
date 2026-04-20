// Canonical wallet-connect constants.
// Single source of truth for chain list, contract addresses, and env key names.
// Consumed by:
//   - apps/product-shell/src/wallet/*     (gate + shell UI)
//   - apps/product-shell/src/wallet/wagmiConfig.shared.js (module wagmi config)
//   - apps/modules/engage/src/lib/wagmi.js       (re-export)
//   - apps/modules/payme/src/lib/wagmi.js        (re-export)
//   - apps/modules/payme/src/services/usdcTransfer.js (USDC send)

export const WC_PROJECT_ID_ENV_KEY = "VITE_WC_PROJECT_ID" as const;

export const CHAIN_IDS = {
  mainnet: 1,
  polygon: 137,
  optimism: 10,
  arbitrum: 42161,
  base: 8453,
} as const;

export type SupportedChainId = (typeof CHAIN_IDS)[keyof typeof CHAIN_IDS];

export const SUPPORTED_CHAIN_IDS: readonly SupportedChainId[] = [
  CHAIN_IDS.mainnet,
  CHAIN_IDS.polygon,
  CHAIN_IDS.optimism,
  CHAIN_IDS.arbitrum,
  CHAIN_IDS.base,
];

// Canonical USDC (native) on Base.
export const USDC_BASE_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
export const USDC_DECIMALS = 6 as const;

export const SIGN_IN_MESSAGE = "Sign Message to Enter Pages" as const;
