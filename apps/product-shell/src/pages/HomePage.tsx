import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import {
  fetchPublishedRuntimePage,
  selectWallpaperUrl,
} from "../runtime/publishedClient";
import {
  PREMIUM_SHELL_ID,
  adaptPremiumRuntimePage,
  isPremiumRuntimePage,
  type PremiumShellLayout,
  type PublishedRuntimePage,
} from "../runtime/types";

type RouteParams = { slug?: string; designation?: string };

const DEFAULT_WALLPAPER_URL = "/biz-pages.png";
const DEFAULT_STAGE = { w: 2560, h: 1440 } as const;

function buildFallbackLayout(wallpaperUrl: string): PremiumShellLayout {
  return {
    shellId: PREMIUM_SHELL_ID,
    stage: { ...DEFAULT_STAGE },
    wallpaper: wallpaperUrl,
    tiles: [],
  };
}

export function HomePage() {
  const { slug } = useParams<RouteParams>();
  const [runtimePage, setRuntimePage] = useState<PublishedRuntimePage | null>(null);
  const [wallpaperUrl, setWallpaperUrl] = useState<string>(DEFAULT_WALLPAPER_URL);
  const isSlugRoute = Boolean(slug);

  useEffect(() => {
    let cancelled = false;

    if (!slug) {
      setRuntimePage(null);
      setWallpaperUrl(DEFAULT_WALLPAPER_URL);
      return;
    }

    // Hardened behavior: keep a valid fullscreen wallpaper mounted while
    // runtime JSON resolves, instead of dropping into a legacy fallback.
    setRuntimePage(null);
    setWallpaperUrl(DEFAULT_WALLPAPER_URL);

    (async () => {
      const page = await fetchPublishedRuntimePage(slug, "home");
      if (cancelled) return;
      setRuntimePage(page);
      setWallpaperUrl(selectWallpaperUrl(page) || DEFAULT_WALLPAPER_URL);
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const premiumLayout = useMemo<PremiumShellLayout>(() => {
    if (isPremiumRuntimePage(runtimePage)) {
      return (
        adaptPremiumRuntimePage(runtimePage, wallpaperUrl || DEFAULT_WALLPAPER_URL) ||
        buildFallbackLayout(wallpaperUrl || DEFAULT_WALLPAPER_URL)
      );
    }

    return buildFallbackLayout(wallpaperUrl || DEFAULT_WALLPAPER_URL);
  }, [runtimePage, wallpaperUrl]);

  // Home no longer renders any legacy "Welcome Home" or content fallback.
  // Published slug routes always get the premium surface; non-slug routes
  // are dead-ended in router.tsx before this component is reached.
  return (
    <PageShell
      runtimePage={isSlugRoute ? runtimePage : null}
      wallpaperUrl={wallpaperUrl}
      premiumLayout={premiumLayout}
    />
  );
}
