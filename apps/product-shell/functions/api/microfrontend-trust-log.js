const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const ALLOWED_EVENT_NAMES = new Set([
  "BOOTSTRAP_ISSUANCE_SUCCEEDED",
  "BOOTSTRAP_ISSUANCE_FAILED",
  "TRUST_REJECTED",
  "CAPABILITY_DENIED",
  "VERSION_INCOMPATIBLE",
  "MODULE_DISABLED_REJECTED",
  "DEGRADED_TERMINAL_BLOCK",
  "NAVIGATION_BOUNDARY_DENIED",
  "SCHEMA_OR_VERSION_REJECTED",
  "SANDBOX_OR_POLICY_REJECTED",
  "MODULE_READY_SUCCEEDED",
  "MODULE_READY_FAILED",
]);

const ALLOWED_FAILURE_CLASS = new Set(["user", "module", "shell", "policy"]);
const ALLOWED_SEVERITY = new Set(["info", "warn", "error"]);
const ALLOWED_PRODUCERS = new Set(["shell.ui", "shell.bridge", "backend.bootstrap", "backend.trust-log"]);

function trimStr(v, max = 200) {
  return String(v ?? "")
    .slice(0, max)
    .trim();
}

function normalizeEvent(body) {
  const eventName = trimStr(body?.eventName, 80);
  const failureClass = trimStr(body?.failureClass, 16);
  const severity = trimStr(body?.severity, 16);
  const producer = trimStr(body?.producer, 40) || "shell.ui";

  if (!ALLOWED_EVENT_NAMES.has(eventName)) return { ok: false, error: "invalid-event-name" };
  if (!ALLOWED_FAILURE_CLASS.has(failureClass)) return { ok: false, error: "invalid-failure-class" };
  if (!ALLOWED_SEVERITY.has(severity)) return { ok: false, error: "invalid-severity" };
  if (!ALLOWED_PRODUCERS.has(producer)) return { ok: false, error: "invalid-producer" };

  const normalized = {
    schema: "gateway.microfrontend.TrustAuditEvent",
    version: 1,
    eventName,
    severity,
    reasonCode: trimStr(body?.reasonCode, 80) || "UNSPECIFIED",
    failureClass,
    producer,
    moduleId: trimStr(body?.moduleId, 40) || "unknown",
    frameId: trimStr(body?.frameId, 120) || undefined,
    requestId: trimStr(body?.requestId, 120) || undefined,
    correlationId: trimStr(body?.correlationId, 120) || undefined,
    tenantId: trimStr(body?.tenantId, 120) || undefined,
    tenantSlug: trimStr(body?.tenantSlug, 120) || undefined,
    sessionId: trimStr(body?.sessionId, 120) || undefined,
    pathname: trimStr(body?.pathname, 240) || undefined,
    detail: trimStr(body?.detail, 300) || undefined,
    timestampMs: Number.isFinite(body?.timestampMs) ? Number(body.timestampMs) : Date.now(),
    acceptedAtMs: Date.now(),
  };

  return { ok: true, event: normalized };
}

export async function onRequestPost({ request }) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid-json" }, 400);
  }

  const normalized = normalizeEvent(body);
  if (!normalized.ok) return json({ ok: false, error: normalized.error }, 400);

  // Sink point for structured trust/isolation audit events.
  return json({
    ok: true,
    acceptedAtMs: normalized.event.acceptedAtMs,
    eventName: normalized.event.eventName,
    reasonCode: normalized.event.reasonCode,
    event: normalized.event,
  });
}
