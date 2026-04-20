export default {
  async fetch(request: Request, env: { MEDIA_ASSETS: R2Bucket }): Promise<Response> {
    const url = new URL(request.url);

    // GET/HEAD only
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // "/content/c77.png" -> "content/c77.png"
    const key = url.pathname.replace(/^\/+/, "");

    if (!key) return new Response("Not Found", { status: 404 });

    // block traversal
    if (key.includes("..")) return new Response("Bad Request", { status: 400 });

    const obj = await env.MEDIA_ASSETS.get(key);
    if (!obj) return new Response("Not Found", { status: 404 });

    const headers = new Headers();
    obj.writeHttpMetadata(headers);

    // fallback content-type if not stored on object
    if (!headers.get("content-type")) {
      const lower = key.toLowerCase();
      if (lower.endsWith(".png")) headers.set("content-type", "image/png");
      else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) headers.set("content-type", "image/jpeg");
      else if (lower.endsWith(".webp")) headers.set("content-type", "image/webp");
      else if (lower.endsWith(".gif")) headers.set("content-type", "image/gif");
      else if (lower.endsWith(".svg")) headers.set("content-type", "image/svg+xml");
      else if (lower.endsWith(".json")) headers.set("content-type", "application/json; charset=utf-8");
      else headers.set("content-type", "application/octet-stream");
    }

    // aggressive caching
    headers.set("cache-control", "public, max-age=31536000, immutable");

    // etag
    if (obj.httpEtag) headers.set("etag", obj.httpEtag);

    return new Response(obj.body, { status: 200, headers });
  },
};
