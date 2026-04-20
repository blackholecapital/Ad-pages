// Barrel export — core-runtime touchpoints
// DOWNSTREAM STATUS: non-authoritative

export type { TouchpointEventRefs } from "./install.touchpoint.js";
export { INSTALL_TOUCHPOINT, INSTALL_EVENTS } from "./install.touchpoint.js";
export { UPDATE_TOUCHPOINT, UPDATE_EVENTS } from "./update.touchpoint.js";
export { DISABLE_TOUCHPOINT, DISABLE_EVENTS } from "./disable.touchpoint.js";
export { REMOVE_TOUCHPOINT, REMOVE_EVENTS } from "./remove.touchpoint.js";
// RB-INT-CHASSIS-001 — admin panel touchpoints
export { PAYME_ADMIN_TOUCHPOINT, PAYME_ADMIN_EVENTS } from "./payme-admin.touchpoint.js";
export { REFERRAL_ADMIN_TOUCHPOINT, REFERRAL_ADMIN_EVENTS } from "./referral-admin.touchpoint.js";
