// Admin bridge contract — payme-admin and referral-admin bridge state
// Upstream authority: xyz-factory-system/invariants/chassis/
// DOWNSTREAM STATUS: non-authoritative — pass-through only; no resolver authority
// RB-INT-CHASSIS-001 — chassis-native admin panel bridge activation check

import type { InstallStamp } from "../../contracts-core/src/chassis/install-stamp.contract.js";
import { STAMP_STATES } from "../../contracts-core/src/chassis/domain.js";

export interface AdminBridgeState {
  readonly install_stamp: InstallStamp;
  readonly payme_admin_registered: boolean;
  readonly referral_admin_registered: boolean;
}

export function isAdminBridgeActivatable(state: AdminBridgeState): boolean {
  return (
    state.install_stamp.stamp_state === STAMP_STATES.ISSUED &&
    state.payme_admin_registered &&
    state.referral_admin_registered
  );
}
