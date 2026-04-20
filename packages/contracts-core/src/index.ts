// Barrel export — packages/contracts-core
// DOWNSTREAM STATUS: non-authoritative

export type {
  Module,
  Event,
  Route,
  Surface,
  Trigger,
  Touchpoint,
  DeclarationEnvelope,
  Declaration,
  Manifest,
  InstallStamp,
  ResolverOutput,
} from "./chassis/index.js";

export {
  LIFECYCLE_STATES,
  REGISTRY_STATES,
  RESOLVER_STATES,
  CONSISTENCY_RESULTS,
  STAMP_STATES,
  SURFACE_IDS,
  ROUTE_IDS,
  TOUCHPOINT_IDS,
  TRIGGER_IDS,
  EVENT_IDS,
  MODULE_IDS,
  SHELL_OWNER_IDS,
  // Unresolved manifest field stubs — see chassis/domain.ts for status.
  DECLARATION_KINDS,
  DECLARATION_STATES,
  DECLARATION_SCOPES,
} from "./chassis/index.js";
export type {
  LifecycleState,
  RegistryState,
  ResolverState,
  ConsistencyResult,
  StampState,
  SurfaceId,
  RouteId,
  TouchpointId,
  TriggerId,
  EventId,
  ModuleId,
  ShellOwnerId,
  // Unresolved manifest field stubs — currently resolve to `never`.
  DeclarationKind,
  DeclarationState,
  DeclarationScope,
} from "./chassis/index.js";

// === Profile / compatibility layer (WA P3.0) ===
export {
  PROFILE_IDS,
  CHASSIS_PROFILE_STATUSES,
  DERIVATION_MODES,
  FULL_BODY_PROFILE,
  MOBILE_OPTIMIZED_PROFILE,
  PC_OPTIMIZED_PROFILE,
  PROFILE_COMPATIBILITY_MAP,
  lookupProfile,
  listProfiles,
  // Ad Pages product page domain (ADPAGES-SKU-REDUCTION-001 S5)
  ADPAGES_PAGE_KEYS,
  ADPAGES_STUDIO_PAGES,
} from "./profiles/index.js";
export type {
  ProfileId,
  ChassisProfileStatus,
  DerivationMode,
  ProfileExposure,
  ProfileConstraint,
  AdPagesPageKey,
  AdPagesStudioPage,
} from "./profiles/index.js";
