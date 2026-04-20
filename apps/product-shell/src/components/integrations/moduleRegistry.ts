const MODULE_BASE_PATHS: Record<string, string> = {
  engage: "/apps/engage/",
  payme: "/apps/payme/",
  referrals: "/apps/referrals/",
};

export function resolveModuleUrl(module: string) {
  return MODULE_BASE_PATHS[module] ?? "/";
}
