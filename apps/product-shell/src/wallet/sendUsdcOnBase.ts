import { CHAIN_IDS, USDC_BASE_ADDRESS, USDC_DECIMALS } from "./constants";

export type SendUsdcOnBaseParams = {
  to: string;
  amountUsdc: string;
  dataLabel?: string;
};

function validateAddress(to: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(to);
}

function mockTxHash(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const tail = hash.toString(16).padStart(8, "0");
  return `0x${tail}${tail}${tail}${tail}${tail}${tail}${tail}${tail}`;
}

function toAtomicHex(amountUsdc: string): string {
  const parts = amountUsdc.split(".");
  const whole = parts[0] ?? "0";
  const frac = (parts[1] ?? "").padEnd(USDC_DECIMALS, "0").slice(0, USDC_DECIMALS);
  const atomic = BigInt(whole) * 10n ** BigInt(USDC_DECIMALS) + BigInt(frac || "0");
  return "0x" + atomic.toString(16);
}

function encodeTransfer(to: string, amountAtomicHex: string): string {
  // ERC20 transfer(address,uint256) selector = 0xa9059cbb
  const pad = (hex: string) => hex.replace(/^0x/, "").padStart(64, "0");
  return "0xa9059cbb" + pad(to) + pad(amountAtomicHex);
}

async function switchToBase(eth: any): Promise<boolean> {
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x" + CHAIN_IDS.base.toString(16) }],
    });
    return true;
  } catch {
    return false;
  }
}

// Canonical Base USDC transfer. Uses injected provider when available;
// returns deterministic mock hash otherwise (demo / SSR / tests).
export async function sendUsdcOnBase({ to, amountUsdc, dataLabel }: SendUsdcOnBaseParams): Promise<string> {
  if (!to) throw new Error("Missing destination address");
  if (!validateAddress(to)) throw new Error("Invalid destination address");
  if (!amountUsdc || Number.isNaN(Number(amountUsdc)) || Number(amountUsdc) <= 0) {
    throw new Error("Invalid USDC amount");
  }

  const eth = typeof window !== "undefined" ? (window as any)?.ethereum : null;
  if (!eth?.request) {
    const seed = `${to}:${amountUsdc}:${dataLabel ?? ""}`;
    return mockTxHash(seed);
  }

  const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
  const from = accounts?.[0];
  if (!from) throw new Error("No connected wallet");

  await switchToBase(eth);

  const amountHex = toAtomicHex(amountUsdc);
  const data = encodeTransfer(to, amountHex);
  const txHash: string = await eth.request({
    method: "eth_sendTransaction",
    params: [{ from, to: USDC_BASE_ADDRESS, data, value: "0x0" }],
  });
  return txHash;
}
