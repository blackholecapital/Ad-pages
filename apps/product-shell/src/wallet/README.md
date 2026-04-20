# Canonical wallet-connect module

Single source of truth for all wallet-connect behavior in the Biz Pages
monorepo. Closes out the wallet-connect duplication called out in
`/job_site/wallet_surface_inventory.md` and satisfies the S4 consolidation
goal in `/job_site/build-sheet-active.txt`.

## Surface

| Symbol                  | File                        | Notes                                                |
|-------------------------|-----------------------------|------------------------------------------------------|
| `connectWallet()`       | `connectWallet.ts`          | EIP-1193 `eth_requestAccounts`; demo-safe fallback   |
| `getConnectedAddress()` | `connectWallet.ts`          | Non-prompting `eth_accounts` read                    |
| `signMessage(msg?)`     | `signMessage.ts`            | EIP-1193 `personal_sign`; uses `SIGN_IN_MESSAGE`     |
| `sendUsdcOnBase()`      | `sendUsdcOnBase.ts`         | ERC-20 transfer on Base; mock hash in demo/SSR       |
| `WalletConnectButton`   | `WalletConnectButton.tsx`   | Canonical UI, used by gate + admin panel             |
| `wagmiConfig`           | `wagmiConfig.shared.js`     | Module wagmi singleton (engage/payme iframes only)   |
| `buildWagmiConfig()`    | `wagmiConfig.shared.js`     | Factory with override hook for tests                 |
| `CHAIN_IDS`, etc.       | `constants.ts`              | Chains, USDC contract, WC env key                    |

## Consumers

### Product shell (`apps/product-shell`)
- `src/components/gate/WalletConnectButton.tsx` → re-exports `WalletConnectButton` from here.
- `src/state/demoGateState.tsx` → `actions.connectWallet` and `actions.signMessage` now delegate to `connectWallet()` and `signMessage()` here.
- `src/utils/usdc.ts` → `sendUsdcOnBase` re-exported from here.
- `src/components/admin/AdminPanel.tsx` → unchanged; still calls `actions.connectWallet()` via `useDemoGate()`, which now reaches the canonical path.

### Engage iframe (`apps/modules/engage`)
- `src/lib/wagmi.js` → `export { wagmiConfig } from '../../../../product-shell/src/wallet/wagmiConfig.shared.js'`.
- `src/main.jsx`, `src/components/Navbar.jsx`, `src/pages/QuestsPage.jsx` — unchanged; they consume wagmi hooks on the now-canonical config.

### PayMe iframe (`apps/modules/payme`)
- `src/lib/wagmi.js` (new) → re-export of `wagmiConfig` from canonical.
- `src/services/usdcTransfer.js` → exports `connectWallet`, `selectNetwork`, `sendUsdc`, `wagmiConfig`, `transferUsdc`, plus unit helpers. The send path uses the canonical `sendUsdcOnBase` from here for EIP-1193 consistency.

### Downstream admin mirrors
- `engagefi-admin-minimal/src/lib/wagmi.js` → marked as mirror of `apps/modules/engage/src/lib/wagmi.js` via file header.
- `referral-admin-minimal/src/lib/wagmi.js` → same; header note documents canonical.
- `payme-admin-minimal/src/services/usdcTransfer.js` (new) → shim re-exporting from `apps/modules/payme/src/services/usdcTransfer.js` so the broken import at `payme-checkout-engine/components/PayMeCheckout.tsx:27` and `SinglePaymentPage.tsx:25` now resolves.

## What is NOT here (by design)

- **No wagmi dependency inside product-shell.** The shell's gate flow is
  EIP-1193-only; wagmi is pulled in only by the iframe module builds that
  already declare it.
- **No `furlink` wallet wiring.** No furlink code exists in the repo at
  audit time; add a re-export from here if a furlink surface is ever
  introduced.
- **No second wagmi config.** Any file that does `createConfig(...)` other
  than `wagmiConfig.shared.js` is a regression and should be replaced with a
  re-export of `wagmiConfig`.
