// Barrel export — local-host bridge
// DOWNSTREAM STATUS: non-authoritative

export type { BridgeConfig } from "./runtime-bridge.js";
export { isBridgeReady } from "./runtime-bridge.js";

// RB-INT-CHASSIS-001 — admin panel bridge readiness
export type { AdminBridgeConfig } from "./admin-bridge.js";
export { isAdminBridgeReady } from "./admin-bridge.js";
