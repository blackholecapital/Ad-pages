const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "content-type": "application/json" }
  });

const bad = (msg, status = 400) => json({ ok: false, error: msg }, status);

const sanitize = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

function normalizeImageCode(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return raw.includes(".") ? raw : `${raw}.png`;
}

function parseMediaToken(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (raw.startsWith("IMG:")) return { kind: "image", image: normalizeImageCode(raw.slice(4).trim()), mediaUrl: "" };
  if (raw.startsWith("VID:")) return { kind: "video", image: "", mediaUrl: raw.slice(4).trim() };
  if (raw.startsWith("EMB:")) return { kind: "social", image: "", mediaUrl: raw.slice(4).trim() };
  if (/^[A-Za-z][A-Za-z0-9_-]*$/.test(raw)) return { kind: "image", image: normalizeImageCode(raw), mediaUrl: "" };
  return null;
}

function mapBundleToPage(bundle, page) {
  const studioKey = page === "home" ? "gate" : page === "members" ? "vip" : page === "access" ? "perks" : null;
  if (!studioKey) return null;
  const p = bundle?.pages?.[studioKey];
  if (!p) return null;

  const content = p.content || {};
  const blocks = Array.isArray(p.blocks) ? p.blocks : [];
  const filtered = blocks
    .filter((b) => page !== "home" || b.id !== "card1")
    .slice(0, 3)
    .map((b) => {
      const lines = Array.isArray(content?.[b.id]) ? content[b.id].map((entry) => String(entry ?? "").trim()) : [];
      const token = parseMediaToken(lines[0] || "");
      return {
        id: b.id,
        kind: token?.kind || "text",
        image: token?.image || "",
        mediaUrl: token?.mediaUrl || "",
        x: b.x,
        y: b.y,
        w: b.w,
        h: b.h,
        title: token ? String(b.title || b.id) : String(lines[0] || b.id),
        lines: lines.slice(1).filter(Boolean)
      };
    });

  return { version: 1, page, blocks: filtered };
}

export async function onRequestGet({ request, env }) {
  if (!env?.TENANTS_BUCKET) return bad("Missing TENANTS_BUCKET binding", 500);

  const url = new URL(request.url);
  const slug = sanitize(url.searchParams.get("slug"));
  const page = sanitize(url.searchParams.get("page"));

  if (!slug) return bad("Missing slug");
  if (!page) return bad("Missing page");

  const key = `tenants/${slug}/${page}.json`;
  const obj = await env.TENANTS_BUCKET.get(key);
  if (obj) {
    const text = await obj.text();
    try {
      return json(JSON.parse(text));
    } catch {
      return bad("Invalid page JSON in bucket", 500);
    }
  }

  const legacy = await env.TENANTS_BUCKET.get(`${slug}.json`);
  if (!legacy) return bad("Not found", 404);

  let bundle;
  try {
    bundle = JSON.parse(await legacy.text());
  } catch {
    return bad("Invalid legacy JSON in bucket", 500);
  }

  const mapped = mapBundleToPage(bundle, page);
  if (!mapped) return bad("No page mapping", 404);
  return json(mapped);
}
