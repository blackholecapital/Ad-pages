# Wallet-Connect Surface Inventory

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S1 / Worker A

Enumerates every wallet-connect implementation across the Biz monorepo so the
consolidation step (future stage) has one authoritative target surface.

## 1. Active implementations

### 1.1 product-shell Gate (cosmetic stub)
- File: `apps/product-shell/src/components/gate/WalletConnectButton.tsx`
- File: `apps/product-shell/src/components/gate/RequireGate.tsx`
- File: `apps/product-shell/src/state/demoGateState.tsx` (`connectWallet: async () =>`)
- File: `apps/product-shell/src/components/admin/AdminPanel.tsx:71`
- Behavior: `onConnect` flips a local boolean; no chain, no provider, no
  signature. Used by `RequireGate` (currently disabled — imports commented at
  `apps/product-shell/src/app/router.tsx:14-16`) and by `AdminPanel`'s
  `Connect Wallet` button which calls `actions.connectWallet()` from the demo
  gate state.
- No wagmi, no viem, no WalletConnect QR, no chain list.

### 1.2 apps/modules/engage (real wagmi v2)
- File: `apps/modules/engage/src/lib/wagmi.js`
- Chains: mainnet, polygon, arbitrum, optimism, base.
- Connectors: `injected({ shimDisconnect:true })` + optional
  `walletConnect({ projectId: VITE_WC_PROJECT_ID, showQrModal:true })`.
- Root wrapped by `WagmiProvider + QueryClientProvider` in
  `apps/modules/engage/src/main.jsx:4-8`.
- Used by `src/pages/QuestsPage.jsx:87` ("Connect wallet first" toast).

### 1.3 apps/modules/payme (USDC services)
- File: `apps/modules/payme/src/services/usdcTransfer.js`
- Helpers: `toUsdcAtomicUnits`, `fromUsdcAtomicUnits`, `formatUsdc`,
  `transferUsdc` (stub — returns `{status:"stubbed", txHash:null}`).
- `package.json` declares wagmi/viem/@tanstack/react-query deps but the
  actual wagmi config file (`src/lib/wagmi.js`) is **absent** from the
  payme module tree.

### 1.4 engagefi-admin-minimal (orphan duplicate of 1.2)
- File: `engagefi-admin-minimal/src/lib/wagmi.js`
- **Byte-identical** to `apps/modules/engage/src/lib/wagmi.js` (diff shows
  zero bytes of difference).
- `engagefi-admin-minimal/package.json` is also byte-identical to
  `apps/modules/engage/package.json` (both named `engagefi-questboard`).
- Used by `src/pages/QuestsPage.jsx:87`, `src/main.jsx` etc. — mirror copy.

### 1.5 payme-admin-minimal checkout engine (broken import)
- File: `payme-admin-minimal/payme-checkout-engine/components/PayMeCheckout.tsx`
- File: `payme-admin-minimal/payme-checkout-engine/components/SinglePaymentPage.tsx`
- Both import:
  ```ts
  import { connectWallet, selectNetwork, sendUsdc, wagmiConfig }
    from '../../src/services/usdcTransfer.js';
  ```
- `payme-admin-minimal/src/services/` **contains only `adminStore.js`** —
  there is no `usdcTransfer.js`. Import is broken at build time; this
  surface cannot compile as-is.
- `payme-admin-minimal/package.json` carries wagmi/viem deps but the
  promised `usdcTransfer` module was never committed here.

### 1.6 referral-admin-minimal (wallet-mode generator)
- File: `referral-admin-minimal/src/components/GeneratorPanel.jsx:68`
- Mode text: "Wallet mode requires Connect Wallet."
- No wagmi config in this package; relies on some host-page `isConnected`
  boolean via React context (not wired in-tree).

### 1.7 product-shell USDC utility (mock-only)
- File: `apps/product-shell/src/utils/usdc.ts`
- `sendUsdcOnBase()` returns a **deterministic mock txHash** derived from
  `hash(to + amount + dataLabel)`. No wagmi, no eth provider.
- Used by `apps/product-shell/src/features/marketplace/components/UsdcCheckoutCard.tsx`.

## 2. Wallet-connect signal flow (current)

```
Biz Page (ExclusivePage / AdminPanel / Marketplace / Basket)
    └─ WalletConnectButton / connectWallet()  ← cosmetic bool flip
         ↳ sends no message, no tx, no signature

Engage iframe (/apps/engage/*)
    └─ wagmiConfig (real)   ← only real chain connect in the product shell
         ↳ injected + optional WalletConnect QR

PayMe iframe (/apps/payme/*)
    └─ transferUsdc stub  ← no wagmi wired up in this build

payme-admin-minimal checkout engine
    └─ imports from ../../src/services/usdcTransfer.js  ← BROKEN IMPORT
```

## 3. Duplicated / divergent configs

| Pair                                                                             | Relation |
|----------------------------------------------------------------------------------|----------|
| `apps/modules/engage/src/lib/wagmi.js` ↔ `engagefi-admin-minimal/src/lib/wagmi.js` | identical (diff empty) |
| `apps/modules/engage/package.json` ↔ `engagefi-admin-minimal/package.json`          | identical |
| `apps/modules/payme/package.json` ↔ `payme-admin-minimal/package.json`              | drift — payme-admin-minimal drops `buffer`/`process` polyfills; neither carries a `wagmi.js` config |

## 4. furlink

- No code references to `furlink`, `FurLink`, `Furlink`, `fur-link` anywhere
  in the repo. The only hits are inside `job_site/build-sheet-*.txt`.
- Treat furlink as a **prospective** surface name in the build sheet: no
  wallet implementation exists under that name yet.

## 5. Consolidation target (recommended)

A single `packages/wallet-connect/` (to be created in S2+) exporting:
- `wagmiConfig` (single source, chains explicit)
- `connectWallet()` (real, returns `{address, chainId}`)
- `sendUsdcOnBase({to, amount})` (real Base USDC transfer, replaces mock)
- `WalletConnectButton` (canonical UI)

Consumers after consolidation:
- `apps/product-shell` (replace `src/components/gate/WalletConnectButton.tsx`,
  `src/state/demoGateState.tsx:connectWallet`, `src/utils/usdc.ts`)
- `apps/modules/engage` (replace `src/lib/wagmi.js`)
- `apps/modules/payme` (add — currently missing)
- Delete `engagefi-admin-minimal/src/lib/wagmi.js`, mark
  `engagefi-admin-minimal` a downstream fork of `apps/modules/engage`.
- Restore or delete `payme-admin-minimal/payme-checkout-engine/` — it cannot
  compile without `usdcTransfer.js`.
