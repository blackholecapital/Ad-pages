import { normalizePageSpec, ADPAGES_VALID_PAGES } from "./runtime-schema.js";
import { getAssetBaseUrl, resolveAssetUrl } from "./runtime-r2.js";

const STUDIO_PAGE_KEY = {
  home: "gate",
  members: "vip",
  access: "perks"
};

// Ad Pages product detection — mirrors parseSlugInfo in published-page / manifest.
function isAdSlug(slug) {
  const s = String(slug || "").trim().toLowerCase();
  return s.startsWith("xyz-ad-") || s.startsWith("ad-");
}

// Exported so consumers can reference the canonical Ad Pages page set.
export { ADPAGES_VALID_PAGES as ADPAGES_STUDIO_PAGES };

function mediaFromLegacy(kind, lines) {
  const first = String(lines[0] || "").trim();
  if (kind === "image") {
    return { title: "", lines: [], image: first, mediaUrl: "" };
  }
  if (kind === "video" || kind === "social") {
    return {
      title: "",
      lines: [],
      image: "",
      mediaUrl: first
    };
  }
  return {
    title: first,
    lines: lines.slice(1).map((entry) => String(entry)),
    image: "",
    mediaUrl: ""
  };
}

export function compileMobileBlocks(blocks) {
  const mobileWidth = 336;
  const sidePadding = 16;
  const topPadding = 16;
  const gap = 16;

  let cursorY = topPadding;

  return blocks.map((block) => {
    const lineCount = Array.isArray(block.lines) ? block.lines.length : 0;
    const estimatedHeight = Math.max(
      150,
      Math.min(360, 84 + lineCount * 22)
    );

    const mobileBlock = {
      ...block,
      x: sidePadding,
      y: cursorY,
      w: mobileWidth,
      h: Math.max(block.kind && block.kind !== "text" ? 220 : estimatedHeight, 180)
    };

    cursorY += mobileBlock.h + gap;
    return mobileBlock;
  });
}

function compilePremiumTiles(blocks, env) {
  return (Array.isArray(blocks) ? blocks : []).map((block, index) => {
    const asset =
      block.contentUrl ||
      resolveAssetUrl(block.image, env) ||
      "";

    return {
      id: String(block.id || `tile-${index + 1}`),
      asset: asset || null,
      x: Number(block.x || 0),
      y: Number(block.y || 0),
      w: Number(block.w || 320),
      h: Number(block.h || 180),
      z: index + 1
    };
  });
}

export function compileRuntimePage(page, pageSpec, source, { slug, env } = {}) {
  // Defense-in-depth: Ad Pages tenants may only compile Home and Members.
  if (slug && isAdSlug(slug) && !ADPAGES_VALID_PAGES.has(page)) return null;

  const normalized = normalizePageSpec(pageSpec, page);
  if (!normalized) return null;

  const desktopBlocks = normalized.blocks;
  const isMobileNative = normalized.mobile === true;
  const isPremium = normalized.shellId === "desktop-premium-v1";
  const assetBaseUrl = getAssetBaseUrl(env);

  const result = {
    ok: true,
    version: 2,
    page,
    source,
    ...(slug ? { slug } : {}),
    ...(assetBaseUrl ? { assetBaseUrl } : {}),
    ...(isPremium
      ? {
          shellId: "desktop-premium-v1",
          stage: { w: 2560, h: 1440 },
          tiles: compilePremiumTiles(desktopBlocks, env)
        }
      : {}),
    desktop: {
      canvas: isPremium
        ? { width: 2560, minHeight: 1440 }
        : { width: 1280, minHeight: 760 },
      blocks: desktopBlocks
    }
  };

  if (isMobileNative) {
    result.mobile = true;
    if (normalized.viewport) result.viewport = normalized.viewport;
  } else {
    const mobileBlocks = compileMobileBlocks(desktopBlocks);
    result.mobile = {
      canvas: {
        width: 368,
        minHeight: Math.max(
          640,
          mobileBlocks.length
            ? mobileBlocks[mobileBlocks.length - 1].y + mobileBlocks[mobileBlocks.length - 1].h + 24
            : 640
        )
      },
      blocks: mobileBlocks
    };
  }

  if (normalized.wallpaper) {
    result.wallpaper = normalized.wallpaper;
    const wallpaperUrl = resolveAssetUrl(normalized.wallpaper, env);
    if (wallpaperUrl) result.wallpaperUrl = wallpaperUrl;
  }

  if (normalized.skin) {
    result.skin = normalized.skin;
    const skinUrl = resolveAssetUrl(normalized.skin, env);
    if (skinUrl) result.skinUrl = skinUrl;
  }

  if (normalized.gif) {
    result.gif = normalized.gif;
    const gifUrl = resolveAssetUrl(normalized.gif, env);
    if (gifUrl) result.gifUrl = gifUrl;
  }

  if (Array.isArray(normalized.exclusiveTiles) && normalized.exclusiveTiles.length) {
    result.exclusiveTiles = normalized.exclusiveTiles.map((tile) => {
      if (tile.imageUrl) return tile;
      const resolved = tile.assetCode ? resolveAssetUrl(tile.assetCode, env) : "";
      if (!resolved) return tile;
      return { ...tile, imageUrl: resolved };
    });
  }

  return result;
}

export function normalizePublishedPage(page, rawPage) {
  return normalizePageSpec(rawPage, page);
}

export function mapLegacyBundleToPage(bundle, page) {
  const studioKey = STUDIO_PAGE_KEY[page];
  if (!studioKey) return null;

  const pageNode = bundle?.pages?.[studioKey];
  if (!pageNode) return null;

  const blocks = Array.isArray(pageNode.blocks) ? pageNode.blocks : [];
  const content = pageNode?.content || {};
  const cardKinds = pageNode?.cardKinds || {};

  const normalizedBlocks = blocks.slice(0, 6).map((block, index) => {
    const lines = Array.isArray(content?.[block.id]) ? content[block.id] : [];
    const kind = ["text", "image", "video", "social"].includes(String(cardKinds?.[block.id] || "").toLowerCase())
      ? String(cardKinds[block.id]).toLowerCase()
      : "text";

    const media = mediaFromLegacy(kind, lines);

    return {
      id: block.id || `block-${index + 1}`,
      x: Number(block.x || 0),
      y: Number(block.y || 0),
      w: Number(block.w || 320),
      h: Number(block.h || 180),
      title: media.title,
      lines: media.lines,
      kind,
      image: media.image,
      mediaUrl: media.mediaUrl
    };
  });

  return {
    version: 2,
    page,
    blocks: normalizedBlocks
  };
}
