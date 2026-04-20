export type TenantPageClientConfig = {
  basePath?: string;
};

export function createTenantPagePath(slug: string, path: string, config: TenantPageClientConfig = {}) {
  const base = config.basePath ?? "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}/${slug}${normalizedPath}`.replace(/\/+/g, "/");
}
