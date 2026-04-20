import { resolveAssetCode } from "./assetCodeResolver";

export function resolveStaticAsset(pathTemplate: string, assetCode?: string | null) {
  const code = resolveAssetCode(assetCode);
  return pathTemplate.replace("{assetCode}", code);
}
