const MIME = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  json: "application/json",
};

function normalizePath(segments) {
  const raw = Array.isArray(segments) ? segments.join("/") : String(segments || "");
  return raw
    .split("/")
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join("/");
}

function contentTypeFor(key) {
  const ext = key.split(".").pop()?.toLowerCase() || "";
  return MIME[ext] || "application/octet-stream";
}

export async function onRequestGet({ params, env }) {
  if (!env?.MEDIA_ASSETS) {
    return new Response("Missing MEDIA_ASSETS binding", { status: 500 });
  }

  const key = normalizePath(params.path);
  if (!key) {
    return new Response("Missing asset path", { status: 400 });
  }

  const object = await env.MEDIA_ASSETS.get(key);
  if (!object) {
    return new Response("Asset not found", { status: 404 });
  }

  const headers = new Headers();
  headers.set("content-type", object.httpMetadata?.contentType || contentTypeFor(key));
  headers.set("cache-control", "public, max-age=31536000, immutable");
  if (object.httpEtag) headers.set("etag", object.httpEtag);

  return new Response(object.body, { headers });
}
