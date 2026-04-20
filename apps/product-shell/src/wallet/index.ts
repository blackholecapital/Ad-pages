// Canonical wallet-connect surface for Biz Pages.
// All product-shell and module surfaces import from here (directly or via
// the shared wagmi config at `./wagmiConfig.shared.js`).

export {
  CHAIN_IDS,
  SUPPORTED_CHAIN_IDS,
  USDC_BASE_ADDRESS,
  USDC_DECIMALS,
  SIGN_IN_MESSAGE,
  WC_PROJECT_ID_ENV_KEY,
} from "./constants";
export type { SupportedChainId } from "./constants";

export { connectWallet, getConnectedAddress } from "./connectWallet";
export type { ConnectResult } from "./connectWallet";

export { signMessage } from "./signMessage";
export type { SignResult } from "./signMessage";

export { sendUsdcOnBase } from "./sendUsdcOnBase";
export type { SendUsdcOnBaseParams } from "./sendUsdcOnBase";

export { WalletConnectButton } from "./WalletConnectButton";
