import React, { createContext, useContext, useMemo, useReducer } from "react";
import { connectWallet as canonicalConnectWallet } from "../wallet/connectWallet";
import { signMessage as canonicalSignMessage } from "../wallet/signMessage";

export type DemoGateState = {
  walletConnected: boolean;
  signedMessage: boolean;
  walletAddress?: string;
  demoBypass: boolean;
  tier1Unlocked: boolean;
  tier2Unlocked: boolean;
  tier3Unlocked: boolean;
};

type Actions = {
  connectWallet: () => Promise<boolean>;
  signMessage: () => Promise<boolean>;
  simulateSignedMessage: () => void;
  unlockTier1: () => void;
  unlockTier2: () => void;
  unlockTier3: () => void;
  toggleTier1: () => void;
  toggleTier2: () => void;
  toggleTier3: () => void;
  resetDemoState: () => void;
  enableBypass: () => void;
};

type Ctx = { state: DemoGateState; actions: Actions };

const initialState: DemoGateState = {
  walletConnected: false,
  signedMessage: false,
  walletAddress: undefined,
  demoBypass: false,
  tier1Unlocked: true,
  tier2Unlocked: true,
  tier3Unlocked: true
};

type Event =
  | { type: "CONNECT_WALLET"; address?: string }
  | { type: "SIGN_MESSAGE" }
  | { type: "SIM_SIGNED" }
  | { type: "UNLOCK_T1" }
  | { type: "UNLOCK_T2" }
  | { type: "UNLOCK_T3" }
  | { type: "TOGGLE_T1" }
  | { type: "TOGGLE_T2" }
  | { type: "TOGGLE_T3" }
  | { type: "RESET" }
  | { type: "BYPASS_ON" };

function reducer(state: DemoGateState, event: Event): DemoGateState {
  switch (event.type) {
    case "CONNECT_WALLET":
      return { ...state, walletConnected: true, walletAddress: event.address ?? state.walletAddress };
    case "SIGN_MESSAGE":
      return { ...state, signedMessage: true };
    case "SIM_SIGNED":
      return { ...state, signedMessage: true };
    case "UNLOCK_T1":
      return { ...state, tier1Unlocked: true };
    case "UNLOCK_T2":
      return { ...state, tier2Unlocked: true };
    case "UNLOCK_T3":
      return { ...state, tier3Unlocked: true };
    case "TOGGLE_T1":
      return { ...state, tier1Unlocked: !state.tier1Unlocked };
    case "TOGGLE_T2":
      return { ...state, tier2Unlocked: !state.tier2Unlocked };
    case "TOGGLE_T3":
      return { ...state, tier3Unlocked: !state.tier3Unlocked };
    case "BYPASS_ON":
      return { ...state, demoBypass: true };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

const DemoGateContext = createContext<Ctx | null>(null);

export function DemoGateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions: Actions = useMemo(
    () => ({
      connectWallet: async () => {
        const result = await canonicalConnectWallet();
        if (!result.ok) return false;
        dispatch({ type: "CONNECT_WALLET", address: result.address });
        return true;
      },
      signMessage: async () => {
        const result = await canonicalSignMessage();
        if (!result.ok) return false;
        dispatch({ type: "SIGN_MESSAGE" });
        return true;
      },
      simulateSignedMessage: () => dispatch({ type: "SIM_SIGNED" }),
      unlockTier1: () => dispatch({ type: "UNLOCK_T1" }),
      unlockTier2: () => dispatch({ type: "UNLOCK_T2" }),
      unlockTier3: () => dispatch({ type: "UNLOCK_T3" }),
      toggleTier1: () => dispatch({ type: "TOGGLE_T1" }),
      toggleTier2: () => dispatch({ type: "TOGGLE_T2" }),
      toggleTier3: () => dispatch({ type: "TOGGLE_T3" }),
      resetDemoState: () => dispatch({ type: "RESET" }),
      enableBypass: () => dispatch({ type: "BYPASS_ON" })
    }),
    [dispatch]
  );


  return <DemoGateContext.Provider value={{ state, actions }}>{children}</DemoGateContext.Provider>;
}

export function useDemoGate(): Ctx {
  const ctx = useContext(DemoGateContext);
  if (!ctx) throw new Error("useDemoGate must be used within DemoGateProvider");
  return ctx;
}
