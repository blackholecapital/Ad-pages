import { bad, json, sanitize, ADPAGES_VALID_PAGES } from "../_lib/runtime-schema.js";
import { getAssetBaseUrl, readBucketJson } from "../_lib/runtime-r2.js";

// Ad Pages tenants may only publish Home and Members.
// All other products keep the full page list.
const PAGES_ALL = ["home", "members", "services", "exclusive"];
const PAGES_AD  = [...ADPAGES_VALID_PAGES];

function parseSlugInfo(slug) {
  const value = String(slug || "").trim().toLowerCase();
  const paid = value.startsWith("xyz-");
  const product =
    value.startsWith("xyz-biz-") || value.startsWith("biz-") ? "biz" :
    value.startsWith("xyz-ad-") || value.startsWith("ad-") ? "ad" :
    "gate";
  return { slug: value, paid, product };
}

function pickSource(env, slug) {
  const info = parseSlugInfo(slug);

  if (!info.paid) {
    return {
      bucket: env?.DEMO_BUCKET,
      key: `json/${info.slug}/site.json`,
      mode: "demo"
    };
  }

  if (info.product === "biz") {
    return {
      bucket: env?.BIZPAGES_TENANTS,
      key: `tenants/${info.slug}/site.json`,
      mode: "paid-biz"
    };
  }

  if (info.product === "ad") {
    return {
      bucket: env?.ADPAGES_TENANTS,
      key: `tenants/${info.slug}/site.json`,
      mode: "paid-ad"
    };
  }

  return {
    bucket: env?.TENANTS_BUCKET,
    key: `tenants/${info.slug}/site.json`,
    mode: "paid-gate"
  };
}

function hasBundlePage(bundleJson, page) {
  return Boolean(bundleJson?.pages && typeof bundleJson.pages === "object" && bundleJson.pages[page]);
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const slug = sanitize(url.searchParams.get("slug"));
  if (!slug) return bad("Missing slug", 400);

  const info = parseSlugInfo(slug);
  const source = pickSource(env, slug);
  if (!source.bucket) return bad(`Missing bucket binding for ${source.mode}`, 500);

  let file = null;
  try {
    file = await readBucketJson(source.bucket, source.key);
  } catch {
    file = null;
  }

  const pageList = info.product === "ad" ? PAGES_AD : PAGES_ALL;
  const pages = {};
  for (const page of pageList) {
    if (!file?.json) {
      pages[page] = { mode: "missing", key: source.key };
      continue;
    }
    pages[page] = {
      mode: hasBundlePage(file.json, page) ? source.mode : "missing",
      key: source.key
    };
  }

  const assetBaseUrl = getAssetBaseUrl(env);

  return json({
    ok: true,
    version: 4,
    slug,
    source: { mode: source.mode, key: source.key },
    pages,
    ...(assetBaseUrl ? { assetBaseUrl } : {})
  });
}
