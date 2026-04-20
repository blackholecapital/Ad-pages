// DOWNSTREAM MIRROR — do not edit directly.
//
// Connector set matches the canonical wagmi config at
// apps/product-shell/src/wallet/wagmiConfig.shared.js. referral-admin-minimal
// ships as its own package with its own node_modules, so a cross-package
// relative import is not viable at build time; keep this file in lock-step
// with the canonical source.
//
// Canonical source of truth:
//   /apps/product-shell/src/wallet/wagmiConfig.shared.js
// See /job_site/wallet_unification_manifest.md § "Downstream mirrors".

import { http, createConfig } from 'wagmi'
import { mainnet, polygon, arbitrum, optimism, base } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_WC_PROJECT_ID

export const chains = [mainnet, polygon, arbitrum, optimism, base]

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    injected({ shimDisconnect: true }),
    ...(projectId
      ? [walletConnect({ projectId, showQrModal: true })]
      : []),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
})
