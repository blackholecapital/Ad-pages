// Proof sibling: web-public mounts
// DOWNSTREAM STATUS: non-authoritative — wrapper-only around the existing
// per-mount `isMountAuthorized()` zero-arg boolean helpers plus
// Full Body profile mount compatibility lookups.
//
// FullBody | WB | P4.1 — step 4 (web-public mount wrapper).
//
// Symmetric to apps/operator-shell/src/mounts/proof.ts (step 3); same
// scope rules, same adapters, same closed sets. Only the mount set differs.
//
// Rollback: `git rm apps/web-public/src/mounts/proof.ts`.

import {
  adaptValidationResult,
  adaptCompatibilityResult,
  COMPATIBILITY_KINDS,
  CONSUMPTION_POINTS,
  type ProofResult,
} from "../../../../packages/proof-chassis/src/index.js";
import { FULL_BODY_PROFILE } from "../../../../packages/contracts-core/src/index.js";
import {
  DISABLE_MOUNT,
  isMountAuthorized as isDisableMountAuthorized,
} from "./disable.mount.js";
import {
  REMOVE_MOUNT,
  isMountAuthorized as isRemoveMountAuthorized,
} from "./remove.mount.js";
import {
  PAYME_ADMIN_MOUNT,
  isMountAuthorized as isPaymeAdminMountAuthorized,
} from "./payme-admin.mount.js";
import {
  REFERRAL_ADMIN_MOUNT,
  isMountAuthorized as isReferralAdminMountAuthorized,
} from "./referral-admin.mount.js";

interface WebPublicMount {
  readonly label: string;
  readonly touchpoint_id: string;
  readonly authorized: () => boolean;
}

const WEB_PUBLIC_MOUNTS: readonly WebPublicMount[] = [
  {
    label: "DISABLE_MOUNT",
    touchpoint_id: DISABLE_MOUNT.touchpoint_id,
    authorized: isDisableMountAuthorized,
  },
  {
    label: "REMOVE_MOUNT",
    touchpoint_id: REMOVE_MOUNT.touchpoint_id,
    authorized: isRemoveMountAuthorized,
  },
  {
    label: "PAYME_ADMIN_MOUNT",
    touchpoint_id: PAYME_ADMIN_MOUNT.touchpoint_id,
    authorized: isPaymeAdminMountAuthorized,
  },
  {
    label: "REFERRAL_ADMIN_MOUNT",
    touchpoint_id: REFERRAL_ADMIN_MOUNT.touchpoint_id,
    authorized: isReferralAdminMountAuthorized,
  },
];

function mountValidationProof(m: WebPublicMount): ProofResult {
  return adaptValidationResult({
    target_name: `${m.label}::authorization`,
    passed: m.authorized(),
    consumption_point: CONSUMPTION_POINTS.TOUCHPOINT_LAYER,
  });
}

function mountCompatibilityProof(m: WebPublicMount): ProofResult {
  return adaptCompatibilityResult({
    profile: FULL_BODY_PROFILE,
    kind: COMPATIBILITY_KINDS.MOUNT,
    id: m.touchpoint_id,
    consumption_point: CONSUMPTION_POINTS.TOUCHPOINT_LAYER,
  });
}

/**
 * Emit one ProofResult pair (validation + compatibility) per web-public
 * mount. Deterministic order: [DISABLE_MOUNT, REMOVE_MOUNT] ×
 * [validation, compatibility].
 */
export function webPublicMountProofs(): readonly ProofResult[] {
  const results: ProofResult[] = [];
  for (const m of WEB_PUBLIC_MOUNTS) {
    results.push(mountValidationProof(m));
    results.push(mountCompatibilityProof(m));
  }
  return results;
}
