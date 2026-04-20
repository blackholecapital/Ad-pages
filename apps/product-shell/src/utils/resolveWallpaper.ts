// Shared client-side asset resolver.
// Mirrors apps/product-shell/functions/_lib/runtime-r2.js so client fallbacks
// and server-emitted URLs stay aligned.

const ASSET_CLASS: Record<string, { folder: string; ext: string } | undefined> = {
  w: { folder: "wallpaper", ext: "png" },
  m: { folder: "mobile-wallpaper", ext: "png" },
  s: { folder: "skin", ext: "png" },
  g: { folder: "gif", ext: "gif" },
  c: { folder: "content", ext: "png" },
  x: { folder: "extra", ext: "png" },
};

function normalizeBaseUrl(baseUrl?: string | null): string {
  if (!baseUrl) return "";
  return baseUrl.replace(/\/+$/, "");
}

export function resolveRuntimeAssetUrl(
  code?: string | null,
  baseUrl?: string | null
): string | null {
  const value = String(code || "").trim().toLowerCase();
  if (!value) return null;

  const cls = ASSET_CLASS[value[0]];
  if (!cls) return null;

  const rest = value.slice(1);
  if (!rest || !/^\d+$/.test(rest)) return null;

  const base = normalizeBaseUrl(baseUrl);
  return base
    ? `${base}/${cls.folder}/${value}.${cls.ext}`
    : `/media/${cls.folder}/${value}.${cls.ext}`;
}

export function resolveWallpaperUrl(
  code?: string | null,
  baseUrl?: string | null
): string | null {
  const value = String(code || "").trim().toLowerCase();
  if (!value || (value[0] !== "w" && value[0] !== "m")) return null;
  return resolveRuntimeAssetUrl(value, baseUrl);
}
