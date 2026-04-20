// Barrel export — packages/runtime-bridge
// DOWNSTREAM STATUS: non-authoritative

export type { RuntimeBridgeState } from "./bridge-contract.js";
export { isBridgeActivatable } from "./bridge-contract.js";

// RB-INT-CHASSIS-001 — admin panel bridge activation
export type { AdminBridgeState } from "./admin-bridge-contract.js";
export { isAdminBridgeActivatable } from "./admin-bridge-contract.js";
