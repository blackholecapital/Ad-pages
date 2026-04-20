import { bad, json, sanitize, assertRuntimeParams } from "../_lib/runtime-schema.js";
import { compileRuntimePage, normalizePublishedPage } from "../_lib/runtime-compiler.js";
import { readBucketJson } from "../_lib/runtime-r2.js";

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

function extractPageFromStoredJson(storedJson, page) {
  if (storedJson && typeof storedJson === "object" && storedJson.pages && typeof storedJson.pages === "object") {
    return storedJson.pages[page] ?? null;
  }
  return storedJson ?? null;
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const slug = sanitize(url.searchParams.get("slug"));
  const page = sanitize(url.searchParams.get("page"));

  const validation = assertRuntimeParams(slug, page);
  if (!validation.ok) return bad(validation.error, validation.status);

  const source = pickSource(env, slug);
  if (!source.bucket) return bad(`Missing bucket binding for ${source.mode}`, 500);

  try {
    const file = await readBucketJson(source.bucket, source.key);
    if (!file) return bad("Tenant page not found", 404, { slug, page, key: source.key, mode: source.mode });

    const rawPage = extractPageFromStoredJson(file.json, page);
    if (!rawPage) return bad("Published page JSON is invalid or missing page", 500, { slug, page, key: source.key });

    const normalized = normalizePublishedPage(page, rawPage);
    if (!normalized || (!normalized.blocks.length && !normalized.exclusiveTiles?.length)) {
      return bad("Published page JSON is invalid or empty", 500, { slug, page, key: source.key });
    }

    return json(
      compileRuntimePage(page, normalized, { mode: source.mode, key: source.key }, { slug, env }),
      200,
      { "x-runtime-source": source.key }
    );
  } catch (error) {
    return bad("Failed to compile runtime page", 500, {
      slug,
      page,
      message: error instanceof Error ? error.message : String(error)
    });
  }
}
