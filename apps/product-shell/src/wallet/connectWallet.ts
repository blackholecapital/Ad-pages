// Canonical connectWallet: EIP-1193 injected-provider connect with graceful
// fallback for environments without `window.ethereum` (demo gate mode).
// This is the one and only product-shell connect path. Module iframes
// (engage/payme) delegate their wagmi `useConnect` through this same chain
// list via `wagmiConfig.shared.js`.

export type ConnectResult =
  | { ok: true; address: string; chainId?: number; demo?: boolean }
  | { ok: false; reason: "rejected" | "unavailable" | "error"; error?: unknown };

function getInjected(): any | null {
  if (typeof window === "undefined") return null;
  const eth = (window as any)?.ethereum;
  return eth?.request ? eth : null;
}

export async function connectWallet(): Promise<ConnectResult> {
  const eth = getInjected();
  if (!eth) {
    // Demo/SSR path: no provider. Return a deterministic demo address so the
    // gate surface stays interactive without masquerading as a real connect.
    return { ok: true, address: "0xDEMO...WALLET", demo: true };
  }
  try {
    const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
    const address = accounts?.[0];
    if (!address) return { ok: false, reason: "rejected" };
    let chainIdNum: number | undefined;
    try {
      const chainHex: string = await eth.request({ method: "eth_chainId" });
      chainIdNum = parseInt(chainHex, 16);
    } catch {
      chainIdNum = undefined;
    }
    return { ok: true, address, chainId: chainIdNum };
  } catch (error: any) {
    if (error?.code === 4001) return { ok: false, reason: "rejected", error };
    return { ok: false, reason: "error", error };
  }
}

export async function getConnectedAddress(): Promise<string | null> {
  const eth = getInjected();
  if (!eth) return null;
  try {
    const accounts: string[] = await eth.request({ method: "eth_accounts" });
    return accounts?.[0] ?? null;
  } catch {
    return null;
  }
}
