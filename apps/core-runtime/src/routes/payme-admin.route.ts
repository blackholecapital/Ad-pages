// Route consumer: payme-admin
// DOWNSTREAM STATUS: non-authoritative — no route exposure outside canonical authority
// RB-INT-CHASSIS-001 — chassis-native payme-admin route on sf.api.factory

import type { Route } from "../../../../packages/contracts-core/src/chassis/route.contract.js";
import {
  ROUTE_IDS,
  SURFACE_IDS,
  REGISTRY_STATES,
} from "../../../../packages/contracts-core/src/chassis/domain.js";

export const PAYME_ADMIN_ROUTE: Route = {
  route_id: ROUTE_IDS.PAYME_ADMIN,
  surface_id: SURFACE_IDS.API_FACTORY,
  registry_state: REGISTRY_STATES.REGISTERED,
};
