import { SIGN_IN_MESSAGE } from "./constants";
import { connectWallet, getConnectedAddress } from "./connectWallet";

export type SignResult =
  | { ok: true; signature: string; address: string; demo?: boolean }
  | { ok: false; reason: "no-address" | "rejected" | "unavailable" | "error"; error?: unknown };

export async function signMessage(message: string = SIGN_IN_MESSAGE): Promise<SignResult> {
  if (typeof window === "undefined") {
    return { ok: true, signature: "0xDEMO", address: "0xDEMO...WALLET", demo: true };
  }
  const eth = (window as any)?.ethereum;
  if (!eth?.request) {
    return { ok: true, signature: "0xDEMO", address: "0xDEMO...WALLET", demo: true };
  }

  let address = await getConnectedAddress();
  if (!address) {
    const c = await connectWallet();
    if (!c.ok) return { ok: false, reason: c.reason, error: (c as any).error };
    if (c.demo) return { ok: true, signature: "0xDEMO", address: c.address, demo: true };
    address = c.address;
  }

  try {
    const signature: string = await eth.request({ method: "personal_sign", params: [message, address] });
    return { ok: true, signature, address };
  } catch (error: any) {
    if (error?.code === 4001) return { ok: false, reason: "rejected", error };
    return { ok: false, reason: "error", error };
  }
}
