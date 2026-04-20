import type { ReactNode } from "react";

import { DesktopPremiumReceiver } from "../../features/desktop-premium/DesktopPremiumReceiver";
import type {
  PremiumShellLayout,
  PublishedRuntimePage,
} from "../../runtime/types";
import {
  adaptPremiumRuntimePage,
  isPremiumRuntimePage,
} from "../../runtime/types";

const DEFAULT_FALLBACK_WALLPAPER_URL = "/biz-pages.png";

type PageShellProps = {
  children?: ReactNode;
  wallpaperUrl?: string;
  premiumLayout?: PremiumShellLayout | null;
  runtimePage?: PublishedRuntimePage | null;
};

export function PageShell({
  children,
  wallpaperUrl,
  premiumLayout,
  runtimePage,
}: PageShellProps) {
  const effectiveWallpaperUrl = wallpaperUrl ?? DEFAULT_FALLBACK_WALLPAPER_URL;

  const resolvedPremium: PremiumShellLayout | null =
    premiumLayout ??
    (isPremiumRuntimePage(runtimePage)
      ? adaptPremiumRuntimePage(runtimePage, effectiveWallpaperUrl)
      : null);

  if (resolvedPremium) {
    return <DesktopPremiumReceiver layout={resolvedPremium} asMount />;
  }

  return (
    <div className="pageShell">
      <div className="wallpaperLayer" aria-hidden>
                <div
          className="wallpaperImage"
          style={effectiveWallpaperUrl ? { backgroundImage: `url('${effectiveWallpaperUrl}')` } : undefined}
        />
      </div>
      <div className="pageShellContent">{children}</div>
    </div>
  );
}
