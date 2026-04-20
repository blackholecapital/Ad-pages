import type { PublishedRuntimeManifest, PublishedRuntimePage } from "./types";
import { resolveRuntimeAssetUrl, resolveWallpaperUrl } from "../utils/resolveWallpaper";

async function safeJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchPublishedRuntimePage(slug: string, page: string): Promise<PublishedRuntimePage | null> {
  const res = await fetch(`/api/published-page?slug=${encodeURIComponent(slug)}&page=${encodeURIComponent(page)}`);
  if (!res.ok) {
    console.warn("[gateway] published runtime page fetch failed", {
      slug,
      page,
      status: res.status
    });
    return null;
  }

  const data = await safeJson<PublishedRuntimePage>(res);
  if (!data?.ok) {
    console.warn("[gateway] published runtime page payload invalid", { slug, page, data });
    return null;
  }

  return data;
}

export async function fetchPublishedRuntimeManifest(slug: string): Promise<PublishedRuntimeManifest | null> {
  const res = await fetch(`/api/published-manifest?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) {
    console.warn("[gateway] published runtime manifest fetch failed", {
      slug,
      status: res.status
    });
    return null;
  }

  const data = await safeJson<PublishedRuntimeManifest>(res);
  if (!data?.ok) {
    console.warn("[gateway] published runtime manifest payload invalid", { slug, data });
    return null;
  }

  return data;
}

/**
 * Single asset-resolution accessor for a compiled runtime payload.
 * Prefers the URL the server already emitted; falls back to the same
 * `<assetBaseUrl>/<folder>/<code>.<ext>` rule the server uses
 * when the payload doesn't carry one (older bundles or edge cache).
 *
 * The slug-based static path that used to live in `resolveWallpaper.ts`
 * is intentionally NOT used as a fallback — see
 * /job_site/resolver_contract_spec.md §5.
 */
export function selectWallpaperUrl(
  payload: PublishedRuntimePage | null | undefined
): string | null {
  if (!payload) return null;
  if (payload.wallpaperUrl) return payload.wallpaperUrl;
  return resolveWallpaperUrl(payload.wallpaper, payload.assetBaseUrl);
}


export function resolvePayloadAssetUrl(
  payload: Pick<PublishedRuntimePage, "assetBaseUrl"> | null | undefined,
  code?: string | null
): string | null {
  return resolveRuntimeAssetUrl(code, payload?.assetBaseUrl);
}
