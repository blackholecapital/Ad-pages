import { useMatches, useParams } from "react-router-dom";
import type { RouteKey } from "../app/routes";

type MatchHandle = { pageKey?: RouteKey };
type RouteParams = { designation?: string; slug?: string };

function getActivePageKey(matches: ReturnType<typeof useMatches>): RouteKey {
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const handle = matches[i].handle as MatchHandle | undefined;
    if (handle?.pageKey) return handle.pageKey;
  }
  return "home";
}

export function useRuntimeRouteContext() {
  const matches = useMatches();
  const { designation, slug } = useParams<RouteParams>();

  return {
    designation,
    slug,
    pageKey: getActivePageKey(matches)
  };
}
