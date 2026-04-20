// Re-exports the canonical wallet-connect button. The implementation lives
// in `apps/product-shell/src/wallet/WalletConnectButton.tsx`. Consumers may
// import from either path; this file is kept so existing import sites
// (gate surfaces) don't need to move.
export { WalletConnectButton } from "../../wallet/WalletConnectButton";
