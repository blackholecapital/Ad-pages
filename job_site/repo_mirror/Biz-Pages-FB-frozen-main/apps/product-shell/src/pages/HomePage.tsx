import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import {
  fetchPublishedRuntimePage,
  selectWallpaperUrl,
} from "../runtime/publishedClient";
import { isPremiumRuntimePage, type PublishedRuntimePage } from "../runtime/types";

type RouteParams = { slug?: string; designation?: string };

export function HomePage() {
  const { slug } = useParams<RouteParams>();
  const [runtimePage, setRuntimePage] = useState<PublishedRuntimePage | null>(null);
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);
  const isPremiumRuntime = isPremiumRuntimePage(runtimePage);

  useEffect(() => {
    if (!slug) {
      setRuntimePage(null);
      setWallpaperUrl(null);
      return;
    }
    let cancelled = false;
    fetchPublishedRuntimePage(slug, "home").then((page) => {
      if (cancelled) return;
      setRuntimePage(page);
      setWallpaperUrl(selectWallpaperUrl(page));
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <PageShell runtimePage={runtimePage} wallpaperUrl={wallpaperUrl ?? undefined}>
      {isPremiumRuntime ? null : (
        <div className="homeHero">
          <h1 className="homeHeroTitle">Welcome Home</h1>
        </div>
      )}
    </PageShell>
  );
}
