// Touchpoint consumer: referral-admin
// DOWNSTREAM STATUS: non-authoritative — consumes declared contracts only, no direct module coupling
// RB-INT-CHASSIS-001 — chassis-native referral-admin touchpoint on sf.api.factory

import type { Touchpoint } from "../../../../packages/contracts-core/src/chassis/touchpoint.contract.js";
import {
  type EventId,
  TOUCHPOINT_IDS,
  SURFACE_IDS,
  EVENT_IDS,
} from "../../../../packages/contracts-core/src/chassis/domain.js";

export const REFERRAL_ADMIN_TOUCHPOINT: Touchpoint = {
  touchpoint_id: TOUCHPOINT_IDS.API_REFERRAL_ADMIN,
  surface_id: SURFACE_IDS.API_FACTORY,
};

export interface TouchpointEventRefs {
  readonly request_event_id: EventId;
  readonly completion_event_id: EventId;
  readonly failure_event_id: EventId;
}

export const REFERRAL_ADMIN_EVENTS: TouchpointEventRefs = {
  request_event_id: EVENT_IDS.REFERRAL_ADMIN_REQUESTED,
  completion_event_id: EVENT_IDS.REFERRAL_ADMIN_COMPLETED,
  failure_event_id: EVENT_IDS.REFERRAL_ADMIN_FAILED,
};
