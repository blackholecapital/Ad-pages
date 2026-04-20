// DOWNSTREAM MIRROR — do not edit directly.
//
// This file is a mirror of apps/modules/engage/src/lib/wagmi.js which now
// re-exports the canonical wagmi config from
// apps/product-shell/src/wallet/wagmiConfig.shared.js. This mirror is kept
// in-place because engagefi-admin-minimal is a sibling-deployed package
// with its own node_modules; cross-package relative imports would break at
// build time. Any future wagmi config change must land first at the
// canonical source, then be copied here to keep parity.
//
// Canonical source of truth:
//   /apps/product-shell/src/wallet/wagmiConfig.shared.js
// See /job_site/wallet_unification_manifest.md § "Downstream mirrors".

import { createConfig, http } from 'wagmi'
import { mainnet, polygon, arbitrum, optimism, base } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const wcProjectId = import.meta.env.VITE_WC_PROJECT_ID

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, arbitrum, optimism, base],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
  connectors: [
    injected({ shimDisconnect: true }),
    ...(wcProjectId
      ? [walletConnect({ projectId: wcProjectId, showQrModal: true })]
      : []),
  ],
})
