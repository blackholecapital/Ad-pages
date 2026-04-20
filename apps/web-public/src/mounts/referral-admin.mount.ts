// Mount: referral-admin touchpoint on sf.api.factory
// DOWNSTREAM STATUS: non-authoritative — no undeclared surface mounting

import type { Touchpoint } from "../../../../packages/contracts-core/src/chassis/touchpoint.contract.js";
import {
  TOUCHPOINT_IDS,
  SURFACE_IDS,
} from "../../../../packages/contracts-core/src/chassis/domain.js";

export const REFERRAL_ADMIN_MOUNT: Touchpoint = {
  touchpoint_id: TOUCHPOINT_IDS.API_REFERRAL_ADMIN,
  surface_id: SURFACE_IDS.API_FACTORY,
};

export function isMountAuthorized(): boolean {
  return REFERRAL_ADMIN_MOUNT.surface_id === SURFACE_IDS.API_FACTORY;
}
