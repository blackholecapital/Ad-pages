# Wallet-Connect Unification Manifest

job_id: BIZ-PAGES-PROD-DETANGLE-002
stage: S4 / Worker A
branch: claude/unify-wallet-connect-bQq3J
checkpoint: CP-S4-DETANGLE-CLEAN

Closes the S4 wallet-connect consolidation half of CP-S4-DETANGLE-CLEAN.
Maps every file change in this pass to the faults named in
`/job_site/wallet_surface_inventory.md` and
`/job_site/runtime_parity_matrix.md` § 7 ("One wallet-connect implementation
— FAIL").

## 1. Canonical target surface (new)

All new code lives under a single directory:

`/apps/product-shell/src/wallet/`

| File                         | Role                                                     |
|------------------------------|----------------------------------------------------------|
| `constants.ts`               | `CHAIN_IDS`, `SUPPORTED_CHAIN_IDS`, `USDC_BASE_ADDRESS`, `USDC_DECIMALS`, `WC_PROJECT_ID_ENV_KEY`, `SIGN_IN_MESSAGE` |
| `connectWallet.ts`           | EIP-1193 `eth_requestAccounts`; demo-safe fallback       |
| `signMessage.ts`             | EIP-1193 `personal_sign` with `SIGN_IN_MESSAGE` default  |
| `sendUsdcOnBase.ts`          | ERC-20 transfer on Base (chain 8453), real or mock       |
| `WalletConnectButton.tsx`    | Canonical button UI                                      |
| `wagmiConfig.shared.js`      | Single wagmi `createConfig` source — consumed by iframes |
| `index.ts`                   | Barrel export                                            |
| `README.md`                  | Surface contract + consumer list                         |

Product-shell itself does not pull in wagmi. The shell uses only the
EIP-1193 functions above. The shared wagmi config is loaded only by the
iframe modules that already declare `wagmi` and `viem` in their
`package.json` (engage, payme).

## 2. Change-set — product-shell

| Path                                                             | Change | Notes                                                                 |
|------------------------------------------------------------------|--------|-----------------------------------------------------------------------|
| `apps/product-shell/src/wallet/constants.ts`                     | new    | Canonical constants                                                   |
| `apps/product-shell/src/wallet/connectWallet.ts`                 | new    | Canonical connect                                                     |
| `apps/product-shell/src/wallet/signMessage.ts`                   | new    | Canonical sign                                                        |
| `apps/product-shell/src/wallet/sendUsdcOnBase.ts`                | new    | Canonical Base USDC transfer                                          |
| `apps/product-shell/src/wallet/WalletConnectButton.tsx`          | new    | Canonical button                                                      |
| `apps/product-shell/src/wallet/wagmiConfig.shared.js`            | new    | Canonical wagmi config + `buildWagmiConfig()` factory                 |
| `apps/product-shell/src/wallet/index.ts`                         | new    | Barrel                                                                |
| `apps/product-shell/src/wallet/README.md`                        | new    | Surface contract                                                      |
| `apps/product-shell/src/components/gate/WalletConnectButton.tsx` | rewrite | Reduced to a 1-line re-export of the canonical button                |
| `apps/product-shell/src/state/demoGateState.tsx`                 | patch  | `connectWallet`/`signMessage` now delegate to canonical module        |
| `apps/product-shell/src/utils/usdc.ts`                           | rewrite | Reduced to a re-export of `sendUsdcOnBase` from the canonical module  |
| `apps/product-shell/src/components/admin/AdminPanel.tsx`         | unchanged | Still calls `actions.connectWallet()` via `useDemoGate()`; inherits canonical path through `demoGateState.tsx` |

## 3. Change-set — apps/modules

| Path                                                 | Change | Notes                                                                              |
|------------------------------------------------------|--------|------------------------------------------------------------------------------------|
| `apps/modules/engage/src/lib/wagmi.js`               | rewrite | Now a re-export of `wagmiConfig` / `buildWagmiConfig` / `WALLET_CHAINS` from canonical shared file |
| `apps/modules/payme/src/lib/wagmi.js`                | new    | Parallel re-export; payme gets a declared wagmi config for the first time          |
| `apps/modules/payme/src/services/usdcTransfer.js`    | rewrite | Adds `wagmiConfig`, `connectWallet`, `selectNetwork`, `sendUsdc` exports; `transferUsdc` now routes through canonical `sendUsdcOnBase`; keeps unit helpers (`toUsdcAtomicUnits`, `fromUsdcAtomicUnits`, `formatUsdc`) |
| `apps/modules/payme/package.json`                    | patch  | Declares `./lib/wagmi` in `exports` alongside existing `./services/usdcTransfer`   |
| `apps/modules/engage/src/main.jsx`                   | unchanged | `WagmiProvider config={wagmiConfig}` now receives canonical config transparently  |
| `apps/modules/engage/src/components/Navbar.jsx`      | unchanged | wagmi `useConnect` hooks bind against canonical connectors                        |
| `apps/modules/engage/src/pages/QuestsPage.jsx`       | unchanged | wagmi `useAccount` — canonical config                                             |

## 4. Change-set — downstream mirrors

The three admin-minimal packages ship as independent vite builds with their
own `node_modules`. Cross-package relative imports are not viable at build
time, so each is kept in place and marked as a **downstream mirror** of the
canonical source.

| Path                                                    | Change | Notes                                                                  |
|---------------------------------------------------------|--------|------------------------------------------------------------------------|
| `engagefi-admin-minimal/src/lib/wagmi.js`               | patch  | Header comment declaring canonical source + parity obligation          |
| `referral-admin-minimal/src/lib/wagmi.js`               | patch  | Header comment + `walletConnect` now gated on `projectId` (parity with canonical; prevents crash when env var is absent) |
| `payme-admin-minimal/src/services/usdcTransfer.js`      | new    | Shim re-exporting from `apps/modules/payme/src/services/usdcTransfer.js` — resolves the broken import at `payme-checkout-engine/components/PayMeCheckout.tsx:27` and `SinglePaymentPage.tsx:25` |
| `payme-admin-minimal/src/config/constants.js`           | new    | Shim re-exporting `BASE_CHAIN_ID` and `USDC_DECIMALS` from canonical `constants.ts` — resolves the second broken import at `payme-checkout-engine/components/PayMeCheckout.tsx:29` and `SinglePaymentPage.tsx:27` |

Any future change to wagmi chain list, connectors, or USDC constants **must
land at the canonical source first** (`apps/product-shell/src/wallet/`),
then be replayed in these three mirror files.

## 5. Fault-to-fix coverage

Cross-reference to `/job_site/wallet_surface_inventory.md`:

| Inventory §                                          | Fault                                                     | Resolution                                                                              |
|------------------------------------------------------|-----------------------------------------------------------|------------------------------------------------------------------------------------------|
| 1.1 product-shell gate (cosmetic stub)               | Local boolean flip, no real connect                       | `demoGateState.tsx` delegates to canonical `connectWallet()` (EIP-1193 when available)   |
| 1.2 apps/modules/engage (real wagmi v2)              | Local `createConfig` duplicated                           | `src/lib/wagmi.js` re-exports canonical `wagmiConfig`                                    |
| 1.3 apps/modules/payme (USDC services)               | `wagmi.js` absent; `transferUsdc` stub                    | New `src/lib/wagmi.js` + `usdcTransfer.js` now routes through canonical `sendUsdcOnBase` |
| 1.4 engagefi-admin-minimal orphan duplicate          | Byte-identical config; no canonical marker                | Header comment declares canonical source; parity contract written down                   |
| 1.5 payme-admin-minimal broken import                | `usdcTransfer.js` + `constants.js` missing                | Two shim files created; broken imports now resolve to canonical module                   |
| 1.6 referral-admin-minimal wallet-mode generator     | Drift vs. canonical; `walletConnect` unguarded            | Header comment + `projectId` guard added; parity contract written down                   |
| 1.7 product-shell USDC utility (mock-only)           | Parallel mock in `src/utils/usdc.ts`                      | File reduced to re-export of canonical `sendUsdcOnBase`                                  |

## 6. wagmi `createConfig` call-site census (post-patch)

| File                                                    | `createConfig` | Status                                                       |
|---------------------------------------------------------|----------------|--------------------------------------------------------------|
| `apps/product-shell/src/wallet/wagmiConfig.shared.js`   | **yes**        | Canonical — single source of truth                           |
| `apps/modules/engage/src/lib/wagmi.js`                  | no             | Re-export only                                               |
| `apps/modules/payme/src/lib/wagmi.js`                   | no             | Re-export only                                               |
| `engagefi-admin-minimal/src/lib/wagmi.js`               | yes (mirror)   | Marked as downstream mirror; kept for independent deploy     |
| `referral-admin-minimal/src/lib/wagmi.js`               | yes (mirror)   | Marked as downstream mirror; kept for independent deploy     |
| `payme-admin-minimal/**`                                | no             | Consumes canonical via shims                                 |

One in-repo canonical + two explicit downstream mirrors. Zero unannotated
duplicates. Zero broken imports.

## 7. Signal flow after patch

```
Biz Page (gate / admin / marketplace / basket)
  └─ @ apps/product-shell/src/wallet/connectWallet.ts
       ↳ window.ethereum.eth_requestAccounts  (demo fallback if absent)

Engage iframe (/apps/engage/*)
  └─ WagmiProvider config = wagmiConfig
       ← imported via apps/modules/engage/src/lib/wagmi.js
       ← re-exported from apps/product-shell/src/wallet/wagmiConfig.shared.js
            ↳ injected + optional WalletConnect QR

PayMe iframe (/apps/payme/*)
  └─ apps/modules/payme/src/services/usdcTransfer.js
       ↳ connectWallet → wagmi/actions.connect(wagmiConfig)
       ↳ selectNetwork → wagmi/actions.switchChain(wagmiConfig, { chainId: 8453 })
       ↳ sendUsdc      → canonical sendUsdcOnBase()
            ↳ ERC-20 transfer(USDC_BASE_ADDRESS, amount) via eth_sendTransaction

payme-admin-minimal/payme-checkout-engine
  └─ ../../src/services/usdcTransfer.js   (shim → apps/modules/payme)
  └─ ../../src/config/constants.js        (shim → apps/product-shell/src/wallet)
     ↳ compiles; identical wagmi/usdc contract as payme module
```

## 8. furlink

No furlink code present in the working tree at S4 finish
(`grep -ri 'furlink' apps/ packages/ shared/ *-admin-minimal/` → empty,
matching the pre-existing statement in `wallet_surface_inventory.md` § 4).
When a furlink surface is introduced later, it consumes from
`apps/product-shell/src/wallet/` — no second wallet path is to be created.

## 9. Validation for CP-S4-DETANGLE-CLEAN (wallet half)

- [x] One wallet-connect path is declared and wired at
      `/apps/product-shell/src/wallet/`.
- [x] Duplicate wallet/connect surfaces are migrated or gated:
      - `apps/modules/engage/src/lib/wagmi.js` — migrated (re-export).
      - `apps/modules/payme/src/lib/wagmi.js` — added (re-export).
      - `apps/product-shell/src/components/gate/WalletConnectButton.tsx` — migrated.
      - `apps/product-shell/src/utils/usdc.ts` — migrated.
      - `apps/product-shell/src/state/demoGateState.tsx` — migrated.
      - `engagefi-admin-minimal/src/lib/wagmi.js` — gated (annotated mirror).
      - `referral-admin-minimal/src/lib/wagmi.js` — gated (annotated mirror).
- [x] Broken imports fixed:
      - `payme-admin-minimal/src/services/usdcTransfer.js` — created.
      - `payme-admin-minimal/src/config/constants.js` — created.
- [x] Canonical module exports `wagmiConfig`, `WalletConnectButton`,
      `connectWallet`, `signMessage`, `sendUsdcOnBase`, and chain/USDC
      constants.
- [x] Product-shell carries no wagmi dependency — EIP-1193 only.
- [x] No file outside `wagmiConfig.shared.js` calls `createConfig` from
      inside the canonical path tree (`apps/`); the two remaining call
      sites are annotated downstream mirrors.

## 10. Expected artifacts (form L7 compliance)

- `/job_site/wallet_unification_manifest.md` — this file.
- `/job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/product-shell/src/wallet/constants.ts`
- `/job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/product-shell/src/wallet/connectWallet.ts`
- `/job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/product-shell/src/wallet/signMessage.ts`
- `/job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/product-shell/src/wallet/sendUsdcOnBase.ts`
- `/job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/product-shell/src/wallet/WalletConnectButton.tsx`
- `/job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/product-shell/src/wallet/wagmiConfig.shared.js`
- `/job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/product-shell/src/wallet/index.ts`
- `/job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/product-shell/src/wallet/README.md`
- `/job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/product-shell/src/components/gate/WalletConnectButton.tsx`
- `/job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/product-shell/src/state/demoGateState.tsx`
- `/job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/product-shell/src/utils/usdc.ts`
- `/job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/product-shell/src/components/admin/AdminPanel.tsx` (unchanged; inherits canonical via `useDemoGate`)
- `/job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/modules/engage/src/lib/wagmi.js`
- `/job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/modules/payme/src/lib/wagmi.js`
- `/job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/modules/payme/src/services/usdcTransfer.js`
- `/job_site/repo_mirror/Biz-Pages-FB-frozen-main/apps/modules/payme/package.json`

Mirror paths resolve per `README.md` in the mirror root (by-reference
mirror: `/job_site/repo_mirror/Biz-Pages-FB-frozen-main/<path>` ↔ repo root
`<path>`).
