// Shim that satisfies the broken imports at
//   payme-checkout-engine/components/PayMeCheckout.tsx:27
//   payme-checkout-engine/components/SinglePaymentPage.tsx:25
//
// Before this file existed the checkout engine could not compile (see
// /job_site/wallet_surface_inventory.md § 1.5). The implementation lives
// in the canonical wallet module at
// apps/product-shell/src/wallet/ and is re-exported here via the
// apps/modules/payme service surface so payme-admin-minimal stays as a
// thin consumer of a single wallet path.
//
// Canonical source:
//   /apps/product-shell/src/wallet/{connectWallet,signMessage,sendUsdcOnBase,constants,wagmiConfig.shared}
// Module re-export:
//   /apps/modules/payme/src/services/usdcTransfer.js
// This shim:
//   /payme-admin-minimal/src/services/usdcTransfer.js

export {
  wagmiConfig,
  connectWallet,
  selectNetwork,
  sendUsdc,
  transferUsdc,
  toUsdcAtomicUnits,
  fromUsdcAtomicUnits,
  formatUsdc,
  USDC_BASE_ADDRESS,
  USDC_DECIMALS,
} from '../../../apps/modules/payme/src/services/usdcTransfer.js'
