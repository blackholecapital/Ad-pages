// Local-host admin bridge — payme-admin and referral-admin bridge readiness
// DOWNSTREAM STATUS: non-authoritative — bridge only; no resolver authority
// RB-INT-CHASSIS-001 — app-level admin panel bridge readiness check

import type { InstallStamp } from "../../../../packages/contracts-core/src/chassis/install-stamp.contract.js";
import { STAMP_STATES } from "../../../../packages/contracts-core/src/chassis/domain.js";

export interface AdminBridgeConfig {
  readonly install_stamp: InstallStamp;
  readonly production_install_verified: boolean;
  readonly payme_admin_mount_ready: boolean;
  readonly referral_admin_mount_ready: boolean;
}

export function isAdminBridgeReady(config: AdminBridgeConfig): boolean {
  return (
    config.install_stamp.stamp_state === STAMP_STATES.ISSUED &&
    config.production_install_verified &&
    config.payme_admin_mount_ready &&
    config.referral_admin_mount_ready
  );
}
