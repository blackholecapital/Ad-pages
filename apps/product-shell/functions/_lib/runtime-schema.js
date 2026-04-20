const VALID_PAGES = new Set(["home", "members", "services", "exclusive"]);

export const json = (obj, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "content-type": "application/json", ...extraHeaders }
  });

export const bad = (msg, status = 400, details = undefined) =>
  json({ ok: false, error: msg, details }, status);

export function sanitize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function assertRuntimeParams(slug, page) {
  if (!slug) return { ok: false, error: "Missing slug", status: 400 };
  if (!page) return { ok: false, error: "Missing page", status: 400 };
  if (!VALID_PAGES.has(page)) return { ok: false, error: "Unsupported page", status: 400 };
  return { ok: true };
}

export function toFiniteNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

/**
 * Validates a media asset code. Lowercase only, prefix must be one of the
 * accepted prefixes, followed by at least one digit (digits only).
 * Returns the validated code or empty string if invalid.
 */
export function validateAssetCode(value, allowedPrefixes = ["w", "s", "g", "c"]) {
  const code = String(value || "").trim().toLowerCase();
  if (!code) return "";
  const prefix = code[0];
  if (!allowedPrefixes.includes(prefix)) return "";
  const rest = code.slice(1);
  if (!rest || !/^\d+$/.test(rest)) return "";
  return code;
}

export function normalizeBlock(raw, index = 0) {
  if (!raw || typeof raw !== "object") return null;

  const id = String(raw.id || `block-${index + 1}`);
  const lines = Array.isArray(raw.lines)
    ? raw.lines.map((entry) => String(entry ?? "").trim()).filter(Boolean)
    : [];
  const kind = ["text", "image", "video", "social"].includes(String(raw.kind || "").toLowerCase())
    ? String(raw.kind).toLowerCase()
    : "text";
  const rawImage = String(raw.image || "").trim();
  // If it looks like an asset code (short string, no slashes), validate it; otherwise keep as-is
  const image = rawImage && !rawImage.includes("/") ? validateAssetCode(rawImage, ["c", "x"]) : rawImage;
  const contentUrl = String(raw.contentUrl || "").trim();
  const mediaUrl = String(raw.mediaUrl || "").trim();

  return {
    id,
    x: toFiniteNumber(raw.x),
    y: toFiniteNumber(raw.y),
    w: Math.max(40, toFiniteNumber(raw.w, 320)),
    h: Math.max(40, toFiniteNumber(raw.h, 180)),
    title: String(raw.title || id),
    lines,
    kind,
    image,
    ...(contentUrl ? { contentUrl } : {}),
    mediaUrl
  };
}

function normalizeCard(raw, index = 0) {
  if (!raw || typeof raw !== "object") return null;

  const id = String(raw.id || `block-${index + 1}`);
  const contentCode = validateAssetCode(raw.contentCode, ["c", "x"]);
  const contentUrl = String(raw.contentUrl || "").trim();
  const lines = Array.isArray(raw.lines)
    ? raw.lines.map((entry) => String(entry ?? "").trim()).filter(Boolean)
    : [];

  return {
    id,
    x: toFiniteNumber(raw.x),
    y: toFiniteNumber(raw.y),
    w: Math.max(40, toFiniteNumber(raw.w, 320)),
    h: Math.max(40, toFiniteNumber(raw.h, 180)),
    title: String(raw.title || id),
    lines,
    kind: contentCode || contentUrl ? "image" : "text",
    image: contentCode,
    ...(contentUrl ? { contentUrl } : {}),
    mediaUrl: ""
  };
}


function normalizeExclusiveTile(raw, index = 0) {
  if (!raw || typeof raw !== "object") return null;

  const tileNumber =
    Number.isFinite(Number(raw.tileNumber)) ? Number(raw.tileNumber) :
    Number.isFinite(Number(raw.slot)) ? Number(raw.slot) :
    index + 1;

  const contentCodeRaw =
    raw.contentCode ??
    raw.assetCode ??
    raw.code ??
    raw.id ??
    `EC-${String(tileNumber).padStart(3, "0")}`;
  const contentCode = String(contentCodeRaw || `EC-${String(tileNumber).padStart(3, "0")}`);

  const tileName = String(
    raw.tileName ??
    raw.name ??
    raw.title ??
    raw.label ??
    `Exclusive Content-${tileNumber}`
  );

  let locked = true;
  if (raw.lockStatus === "unlocked") locked = false;
  else if (raw.lockStatus === "locked") locked = true;
  else if (typeof raw.locked === "boolean") locked = raw.locked;

  const purchasePrice =
    raw.purchasePrice != null ? String(raw.purchasePrice) :
    raw.price != null ? String(raw.price) :
    null;

  const contentUrl =
    raw.contentUrl != null && String(raw.contentUrl).trim()
      ? String(raw.contentUrl).trim()
      : raw.imageUrl != null && String(raw.imageUrl).trim()
        ? String(raw.imageUrl).trim()
        : null;

  const assetCode = validateAssetCode(contentCode, ["c", "x"]) ||
    validateAssetCode(raw.assetCode, ["c", "x"]);

  const destinationPath =
    raw.destinationPath != null && String(raw.destinationPath).trim()
      ? String(raw.destinationPath).trim()
      : raw.contentPath != null && String(raw.contentPath).trim()
        ? String(raw.contentPath).trim()
        : raw.routePath != null && String(raw.routePath).trim()
          ? String(raw.routePath).trim()
          : raw.path != null && String(raw.path).trim()
            ? String(raw.path).trim()
            : null;

  return {
    slot: tileNumber,
    id: assetCode || contentCode,
    label: tileName,
    imageUrl: contentUrl,
    locked,
    price: purchasePrice,
    ...(assetCode ? { assetCode } : {}),
    ...(destinationPath ? { destinationPath } : {})
  };
}

export function normalizePageSpec(spec, page) {
  if (!spec || typeof spec !== "object") return null;

  const blocks = Array.isArray(spec.blocks)
    ? spec.blocks.map(normalizeBlock).filter(Boolean)
    : Array.isArray(spec.cards)
      ? spec.cards.map(normalizeCard).filter(Boolean)
      : [];

  const result = {
    version: 2,
    page,
    blocks
  };

  // "m" prefix = mobile wallpaper (mobile-wallapaper R2 folder)
  const wallpaper = validateAssetCode(spec.wallpaper || spec.wallpaperCode, ["w", "m"]);
  const skin = validateAssetCode(spec.skin || spec.skinCode, ["s"]);
  const gif = validateAssetCode(spec.gif || spec.gifCode, ["g"]);

  if (wallpaper) result.wallpaper = wallpaper;
  if (skin) result.skin = skin;
  if (gif) result.gif = gif;

  // Normalize exclusive tiles (tier-2 page payloads)
  if (Array.isArray(spec.exclusiveTiles) && spec.exclusiveTiles.length) {
    const tiles = spec.exclusiveTiles
      .map((t, i) => normalizeExclusiveTile(t, i))
      .filter(Boolean);
    if (tiles.length) result.exclusiveTiles = tiles;
  }

  // Pass through desktop-premium-v1 shell ID if declared
  if (spec.shellId === "desktop-premium-v1") result.shellId = "desktop-premium-v1";

  // Pass through mobile-native flags from the studio JSON
  if (spec.mobile === true) result.mobile = true;
  if (spec.viewport && typeof spec.viewport === "object" &&
      typeof spec.viewport.width === "number" && typeof spec.viewport.height === "number") {
    result.viewport = { width: spec.viewport.width, height: spec.viewport.height };
  }

  return result;
}
