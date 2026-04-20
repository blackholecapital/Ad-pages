// Session transport contract
// Upstream authority: xyz-factory-system/invariants/chassis/
// DOWNSTREAM STATUS: non-authoritative — consumes declared contracts only
// RB-INT-CHASSIS-001 — chassis-native transport contract for admin panel session linkage
//
// No resolver authority. No install path override. Transport state is additive
// over the existing bridge/activation gate sequence; it does NOT replace or
// bypass any install chain gate.

export interface SessionTransportState {
  readonly bridge_ready: boolean;
  readonly activation_eligible: boolean;
  readonly admin_panels_registered: boolean;
}

export interface SessionTransportConfig {
  readonly session_id: string;
  readonly transport_state: SessionTransportState;
}
