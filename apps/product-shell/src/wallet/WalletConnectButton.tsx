// Canonical WalletConnectButton. The old gate-local variant at
// src/components/gate/WalletConnectButton.tsx now re-exports this component.

type WalletConnectButtonProps = {
  connected: boolean;
  onConnect: () => void;
  label?: string;
  connectedLabel?: string;
  className?: string;
};

export function WalletConnectButton({
  connected,
  onConnect,
  label = "Connect wallet",
  connectedLabel = "Wallet connected",
  className = "loginTextBtn",
}: WalletConnectButtonProps) {
  return (
    <button type="button" className={className} onClick={onConnect} disabled={connected}>
      {connected ? connectedLabel : label}
    </button>
  );
}
