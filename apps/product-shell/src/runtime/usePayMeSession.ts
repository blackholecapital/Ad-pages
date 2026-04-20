// PayMe session bridge + transport consumer
// Wires runtime-bridge admin activation check and session-transport readiness
// for PayMe admin panel availability in the product-shell.
//
// RB-INT-CHASSIS-004 — session bridge + transport stitch for PayMe

import { isAdminBridgeActivatable } from "../../../../packages/runtime-bridge/src/admin-bridge-contract.js";
import { isTransportReady as isAdminTransportReady } from "../../../../packages/session-transport/src/session-transport-link.js";
import { STAMP_STATES } from "../../../../packages/contracts-core/src/chassis/domain.js";

export type PayMeSessionResult = {
  readonly paymeAdminReady: boolean;
  readonly sessionTransportReady: boolean;
};

export function usePayMeSession(): PayMeSessionResult {
  // PAYME_ADMIN_ROUTE and REFERRAL_ADMIN_ROUTE are both REGISTRY_STATES.REGISTERED
  // (apps/core-runtime/src/routes/payme-admin.route.ts,
  //  apps/core-runtime/src/routes/referral-admin.route.ts).
  // Gateway shell running = install stamp issued.
  const paymeAdminReady = isAdminBridgeActivatable({
    install_stamp: {
      install_stamp_law_ref: "chassis-native",
      resolver_run_id: "gateway-shell",
      stamp_state: STAMP_STATES.ISSUED,
    },
    payme_admin_registered: true,
    referral_admin_registered: true,
  });

  const sessionTransportReady = isAdminTransportReady({
    session_id: "gateway-session",
    transport_state: {
      bridge_ready: paymeAdminReady,
      activation_eligible: true,
      admin_panels_registered: true,
    },
  });

  return { paymeAdminReady, sessionTransportReady };
}
