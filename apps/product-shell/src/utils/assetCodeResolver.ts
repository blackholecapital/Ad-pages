const SANITIZE_PATTERN = /[^a-zA-Z0-9-_]/g;

export function normalizeAssetCode(value: string) {
  return value.trim().toLowerCase().replace(SANITIZE_PATTERN, "");
}

export function resolveAssetCode(input?: string | null, fallback = "default") {
  if (!input) return fallback;
  const normalized = normalizeAssetCode(input);
  return normalized || fallback;
}
