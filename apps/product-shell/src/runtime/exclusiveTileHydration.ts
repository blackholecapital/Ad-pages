
import type { RenderedExclusiveTile } from "./types";
import { resolveRuntimeAssetUrl } from "../utils/resolveWallpaper";

const DEFAULT_TILE_COUNT = 6;

function makeDefaultTile(slot: number): RenderedExclusiveTile {
  return {
    slot,
    id: `exclusive-${slot}`,
    label: "",
    imageUrl: null,
    locked: true,
    price: null,
  };
}

export function normalizeExclusiveTiles(
  rawTiles: unknown[] | undefined | null
): RenderedExclusiveTile[] {
  if (!Array.isArray(rawTiles) || rawTiles.length === 0) return [];

  return rawTiles
    .map((raw, index) => normalizeOneExclusiveTile(raw, index))
    .filter((t): t is RenderedExclusiveTile => t !== null)
    .sort((a, b) => a.slot - b.slot);
}

function normalizeOneExclusiveTile(
  raw: unknown,
  index: number
): RenderedExclusiveTile | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const slot = toSlot(r.tileNumber ?? r.slot, index);
  const contentCodeRaw = r.contentCode ?? r.assetCode ?? r.code ?? r.id ?? `EC-${String(slot).padStart(3, "0")}`;
  const contentCode = String(contentCodeRaw || `EC-${String(slot).padStart(3, "0")}`);
  const label = String(r.tileName ?? r.name ?? r.title ?? r.label ?? "");
  const locked = deriveLocked(r);
  const price =
    r.purchasePrice != null ? String(r.purchasePrice) :
    r.price != null ? String(r.price) :
    null;

  const imageUrl =
    typeof r.contentUrl === "string" && r.contentUrl.trim() ? r.contentUrl.trim() :
    typeof r.imageUrl === "string" && r.imageUrl.trim() ? r.imageUrl.trim() :
    null;

  const assetCode =
    validateAssetCodeClient(contentCode) ||
    (typeof r.assetCode === "string" ? validateAssetCodeClient(r.assetCode) : "");

  const destinationPath =
    typeof r.destinationPath === "string" && r.destinationPath.trim() ? r.destinationPath.trim() :
    typeof r.contentPath === "string" && r.contentPath.trim() ? r.contentPath.trim() :
    typeof r.routePath === "string" && r.routePath.trim() ? r.routePath.trim() :
    typeof r.path === "string" && r.path.trim() ? r.path.trim() :
    null;

  return {
    slot,
    id: assetCode || contentCode,
    label,
    imageUrl,
    locked,
    price,
    ...(assetCode ? { assetCode } : {}),
    ...(destinationPath ? { destinationPath } : {}),
  };
}

function toSlot(value: unknown, fallbackIndex: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? n : fallbackIndex + 1;
}

function deriveLocked(r: Record<string, unknown>): boolean {
  if (r.lockStatus === "unlocked") return false;
  if (r.lockStatus === "locked") return true;
  if (typeof r.locked === "boolean") return r.locked;
  return true;
}

function validateAssetCodeClient(code: string): string {
  const trimmed = code.trim().toLowerCase();
  if (!trimmed) return "";
  const prefix = trimmed[0];
  if (prefix !== "c" && prefix !== "x") return "";
  const rest = trimmed.slice(1);
  if (!rest || !/^\d+$/.test(rest)) return "";
  return trimmed;
}

export type HydratedExclusiveTile = RenderedExclusiveTile & {
  resolvedImageSrc: string | null;
  destinationPath?: string | null;
};

export function hydrateExclusiveTilesFromPageData(
  pageData:
    | { exclusiveTiles?: RenderedExclusiveTile[] | unknown[]; assetBaseUrl?: string }
    | null
    | undefined,
  assetBaseUrl?: string | null,
  tileCount?: number
): HydratedExclusiveTile[] {
  const raw = pageData?.exclusiveTiles;
  const normalized = normalizeExclusiveTiles((raw as unknown[]) ?? []);
  const total = Math.max(tileCount ?? 0, normalized.length || DEFAULT_TILE_COUNT);
  const slotMap = new Map<number, RenderedExclusiveTile>();

  for (const tile of normalized) {
    slotMap.set(tile.slot, tile);
  }

  const result: HydratedExclusiveTile[] = [];
  for (let i = 0; i < total; i++) {
    const slot = i + 1;
    const tile = slotMap.get(slot) ?? makeDefaultTile(slot);
    const resolvedImageSrc =
      tile.imageUrl ||
      (tile.assetCode
        ? resolveRuntimeAssetUrl(tile.assetCode, assetBaseUrl ?? pageData?.assetBaseUrl ?? null)
        : null);

    result.push({
      ...tile,
      resolvedImageSrc,
      destinationPath: tile.destinationPath ?? null,
    });
  }

  return result;
}
