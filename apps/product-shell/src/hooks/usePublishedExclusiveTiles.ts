import { useEffect, useState } from "react";

import {
  hydrateExclusiveTilesFromPageData,
  type HydratedExclusiveTile,
} from "../runtime/exclusiveTileHydration";
import { fetchPublishedRuntimePage } from "../runtime/publishedClient";

export function usePublishedExclusiveTiles(slug?: string) {
  const [tiles, setTiles] = useState<HydratedExclusiveTile[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!slug) {
        setTiles([]);
        return;
      }

      const page = await fetchPublishedRuntimePage(slug, "exclusive");
      if (cancelled) return;

      if (!page) {
        setTiles([]);
        return;
      }

      setTiles(hydrateExclusiveTilesFromPageData(page, page.assetBaseUrl ?? null));
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return tiles;
}
