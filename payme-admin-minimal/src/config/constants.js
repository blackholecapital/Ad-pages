// Shim that satisfies the broken imports at
//   payme-checkout-engine/components/PayMeCheckout.tsx:29
//   payme-checkout-engine/components/SinglePaymentPage.tsx:27
//
// Derived from the canonical wallet module at
// /apps/product-shell/src/wallet/constants.ts.
import { CHAIN_IDS, USDC_DECIMALS as CANONICAL_USDC_DECIMALS } from '../../../apps/product-shell/src/wallet/constants'

export const BASE_CHAIN_ID = CHAIN_IDS.base
export const USDC_DECIMALS = CANONICAL_USDC_DECIMALS
