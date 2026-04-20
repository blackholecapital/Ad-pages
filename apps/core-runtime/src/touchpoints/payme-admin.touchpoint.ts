// Touchpoint consumer: payme-admin
// DOWNSTREAM STATUS: non-authoritative — consumes declared contracts only, no direct module coupling
// RB-INT-CHASSIS-001 — chassis-native payme-admin touchpoint on sf.api.factory

import type { Touchpoint } from "../../../../packages/contracts-core/src/chassis/touchpoint.contract.js";
import {
  type EventId,
  TOUCHPOINT_IDS,
  SURFACE_IDS,
  EVENT_IDS,
} from "../../../../packages/contracts-core/src/chassis/domain.js";

export const PAYME_ADMIN_TOUCHPOINT: Touchpoint = {
  touchpoint_id: TOUCHPOINT_IDS.API_PAYME_ADMIN,
  surface_id: SURFACE_IDS.API_FACTORY,
};

export interface TouchpointEventRefs {
  readonly request_event_id: EventId;
  readonly completion_event_id: EventId;
  readonly failure_event_id: EventId;
}

export const PAYME_ADMIN_EVENTS: TouchpointEventRefs = {
  request_event_id: EVENT_IDS.PAYME_ADMIN_REQUESTED,
  completion_event_id: EVENT_IDS.PAYME_ADMIN_COMPLETED,
  failure_event_id: EVENT_IDS.PAYME_ADMIN_FAILED,
};
