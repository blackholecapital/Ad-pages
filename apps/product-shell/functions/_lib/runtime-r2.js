// Asset code → R2 folder + extension mapping. This is the SERVER half of the
// resolver contract declared in /job_site/resolver_contract_spec.md §1.
// The client half lives in apps/product-shell/src/utils/resolveWallpaper.ts
// and MUST produce identical output for the same input.
const ASSET_CLASS = {
  w: { folder: "wallpaper", ext: "png" },
  m: { folder: "mobile-wallpaper", ext: "png" },
  s: { folder: "skin", ext: "png" },
  g: { folder: "gif", ext: "gif" },
  c: { folder: "content", ext: "png" },
  x: { folder: "extra", ext: "png" }
};

export async function readBucketJson(bucket, key) {
  const obj = await bucket.get(key);
  if (!obj) return null;

  const text = await obj.text();
  return {
    key,
    raw: text,
    json: JSON.parse(text)
  };
}

export async function objectExists(bucket, key) {
  const obj = await bucket.get(key);
  return Boolean(obj);
}

/**
 * Read the worker-fronted asset host from the Pages Functions env.
 * When set, asset URLs target that host; when unset, asset URLs use the
 * `/media/...` Pages-served prefix that the deploy-side Worker route
 * will rewrite to R2 (see /job_site/cloudflare_runtime_notes.md §3).
 */
export function getAssetBaseUrl(env) {
  const raw = env && typeof env.ASSET_BASE_URL === "string" ? env.ASSET_BASE_URL.trim() : "";
  if (!raw) return "";
  // Strip trailing slash so callers can join with "/" unconditionally.
  return raw.replace(/\/+$/, "");
}

/**
 * Map an asset code (e.g. "w91", "c1234") to the canonical asset URL.
 * Pure, no I/O. The single source of truth for asset URL composition on
 * the server side. Returns "" when the code is missing or invalid.
 */
export function resolveAssetUrl(code, env) {
  const value = String(code || "").trim().toLowerCase();
  if (!value) return "";

  const prefix = value[0];
  const cls = ASSET_CLASS[prefix];
  if (!cls) return "";

  const rest = value.slice(1);
  if (!rest || !/^\d+$/.test(rest)) return "";

  const base = getAssetBaseUrl(env);
  // Worker-fronted host: root-level folders. Pages-only fallback: /media/
  // prefix so the deploy-side route can rewrite to R2 (see §1.2 of the
  // resolver contract spec).
  return base
    ? `${base}/${cls.folder}/${value}.${cls.ext}`
    : `/media/${cls.folder}/${value}.${cls.ext}`;
}
