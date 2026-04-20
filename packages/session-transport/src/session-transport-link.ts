// Session transport link
// DOWNSTREAM STATUS: non-authoritative — transport only, no resolver authority
// RB-INT-CHASSIS-001 — chassis-native transport readiness check for admin panel sessions
//
// NOTE: isTransportReady is NOT a gate in INSTALL_CHAIN_GATES and must not be
// added to the install chain gate sequence. It is an additive check layered
// above the install chain for admin panel session availability only.

import type { SessionTransportConfig } from "./transport.contract.js";

export function isTransportReady(config: SessionTransportConfig): boolean {
  return (
    config.transport_state.bridge_ready &&
    config.transport_state.activation_eligible &&
    config.transport_state.admin_panels_registered
  );
}
