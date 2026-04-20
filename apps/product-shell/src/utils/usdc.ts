// Re-export from the canonical wallet module. The USDC-on-Base send path
// is owned by `apps/product-shell/src/wallet/sendUsdcOnBase.ts`.
export { sendUsdcOnBase } from "../wallet/sendUsdcOnBase";
export type { SendUsdcOnBaseParams } from "../wallet/sendUsdcOnBase";
