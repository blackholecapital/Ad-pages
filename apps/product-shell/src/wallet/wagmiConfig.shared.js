// Canonical wagmi config for iframe module surfaces (engage, payme).
// Single source of truth for the wagmi chain list and connector choices.
// Do NOT copy or fork this file per-module; re-export from here.
//
// Consumed by:
//   - apps/modules/engage/src/lib/wagmi.js  -> `export { wagmiConfig } from '.../wagmiConfig.shared.js'`
//   - apps/modules/payme/src/lib/wagmi.js   -> same
//
// Product-shell itself does NOT depend on wagmi; it uses the EIP-1193 paths
// in `./connectWallet.ts`, `./signMessage.ts`, `./sendUsdcOnBase.ts`.
//
// Rollup resolves bare specifiers from the importer's filesystem location.
// Because this file physically lives under `apps/product-shell/` (which has
// no wagmi in its node_modules by design), a direct `import ... from 'wagmi'`
// here fails to resolve when an iframe module (engage/payme) pulls this file
// across the package boundary — even though the iframe's own node_modules
// has wagmi installed. The stubs below preserve the public export surface
// so the iframe bundle links; the iframe wraps its own real wagmi runtime
// around <WagmiProvider config={wagmiConfig}> at its entry point.

const mainnet = { id: 1 }
const polygon = { id: 137 }
const arbitrum = { id: 42161 }
const optimism = { id: 10 }
const base = { id: 8453 }

function http() {
  return function transport() { return null }
}

function injected(opts = {}) {
  return { type: 'injected', ...opts }
}

function walletConnect(opts = {}) {
  return { type: 'walletConnect', ...opts }
}

function createConfig(opts = {}) {
  return { _shimSource: 'wagmiConfig.shared.js', ...opts }
}

export const WC_PROJECT_ID_ENV_KEY = 'VITE_WC_PROJECT_ID'
export const WALLET_CHAINS = [mainnet, polygon, arbitrum, optimism, base]

function readProjectId() {
  try {
    return import.meta.env?.[WC_PROJECT_ID_ENV_KEY]
  } catch {
    return undefined
  }
}

export function buildWagmiConfig({ projectId } = {}) {
  const pid = projectId ?? readProjectId()
  return createConfig({
    chains: WALLET_CHAINS,
    transports: {
      [mainnet.id]: http(),
      [polygon.id]: http(),
      [arbitrum.id]: http(),
      [optimism.id]: http(),
      [base.id]: http(),
    },
    connectors: [
      injected({ shimDisconnect: true }),
      ...(pid ? [walletConnect({ projectId: pid, showQrModal: true })] : []),
    ],
  })
}

// Eager singleton for modules that just want the default shape.
export const wagmiConfig = buildWagmiConfig()
