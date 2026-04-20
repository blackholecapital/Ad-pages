const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const bad = (error, status = 400, extra = {}) => json({ ok: false, error, ...extra }, status);

const sanitize = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");

function parseTenant(pathname = "/") {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length >= 3 && parts[2] === "gate") {
    return { designation: undefined, slug: sanitize(parts[0]) || "demo", basePath: `/${parts[0]}/gate` };
  }
  if (parts.length >= 4 && parts[2] && parts[3] === "gate") {
    return { designation: sanitize(parts[0]) || undefined, slug: sanitize(parts[1]) || "demo", basePath: `/${parts[0]}/${parts[1]}/gate` };
  }
  return { designation: undefined, slug: "demo", basePath: "/gate" };
}

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const moduleId = sanitize(url.searchParams.get("moduleId"));
  const frameId = String(url.searchParams.get("frameId") || "").trim();
  const pathname = String(url.searchParams.get("pathname") || "/");

  if (!moduleId) return bad("Missing moduleId");
  if (!frameId) return bad("Missing frameId");

  const tenant = parseTenant(pathname);
  const now = Date.now();
  const expiresAtMs = now + 5 * 60_000;

  const payload = {
    issuer: "backend",
    issuedAtMs: now,
    expiresAtMs,
    sessionNonce: crypto.randomUUID(),
    tenant: {
      id: `tenant-${tenant.slug}`,
      slug: tenant.slug,
      designation: tenant.designation,
    },
    session: { sessionId: crypto.randomUUID() },
    auth: { subject: "anonymous", roles: ["member"] },
    capabilities: [
      { id: "navigation.request", scope: "tenant" },
      { id: "bootstrap.request", scope: "session" },
      { id: "module.health.ping", scope: "self" },
      { id: "module.error.emit", scope: "self" },
    ],
    navigation: { basePath: tenant.basePath },
    config: { flags: { "mf.v1.enabled": true, "mf.pass2.enforced": true } },
    frame: {
      frameId,
      allowedOrigin: url.origin,
    },
  };

  return json({ ok: true, version: 1, moduleId, audience: "module", payload });
}
