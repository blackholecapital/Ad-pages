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

type PageShellProps = {
  children?: ReactNode;
  /** R2 tenant wallpaper URL. When provided, overrides the AppShell default.
   *  Only used by the legacy (non-premium) render path. */
  wallpaperUrl?: string;
  /**
   * Pre-adapted premium layout. When present, the shell renders the
   * canonical `DesktopPremiumReceiver` as the owning surface and does not
   * render the legacy wallpaper/content frame.
   */
  premiumLayout?: PremiumShellLayout | null;
  /**
   * Compiled runtime payload. When present AND `isPremiumRuntimePage(page)`
   * the shell dispatches to the premium receiver without the caller needing
   * to build a `PremiumShellLayout` manually. Supply `wallpaperUrl` to have
   * it flow into the adapted premium layout's `wallpaper` slot.
   */
  runtimePage?: PublishedRuntimePage | null;
};

/**
 * Legacy / static layout surface, extended with premium dispatch.
 *
 * Dispatch rules (single path, no overlap):
 *   1. If `premiumLayout` is supplied, render the canonical premium receiver
 *      as the owning full-viewport surface (`asMount`).
 *   2. Else, if `runtimePage` is supplied AND `isPremiumRuntimePage(runtimePage)`,
 *      adapt it (wallpaper URL resolved via `wallpaperUrl` prop) and render
 *      the canonical premium receiver as the owning surface (`asMount`).
 *   3. Otherwise, render the legacy wallpaper + content frame.
 *
 * For premium paths (1 and 2) the receiver uses `asMount` so it positions
 * itself as a fixed full-viewport surface (z-index 4). The AppShell default
 * wallpaper (z-index -1) is fully covered; the app nav (z-index 50) renders
 * on top. No competing wallpaper or content layers remain.
 */
export function PageShell({
  children,
  wallpaperUrl,
  premiumLayout,
  runtimePage,
}: PageShellProps) {
  const resolvedPremium: PremiumShellLayout | null =
    premiumLayout ??
    (isPremiumRuntimePage(runtimePage)
      ? adaptPremiumRuntimePage(runtimePage, wallpaperUrl ?? null)
      : null);

  if (resolvedPremium) {
    // Published-premium path (BIZ-PAGES-WALLPAPER-HOTFIX-003 S5):
    // No wrapper div here, no `top: var(--nav-h)` offset, no
    // `.pageShell` / `.wallpaperLayer` legacy chrome. The receiver mounts
    // its own `dpv1ReceiverMount` (position: fixed; inset: 0;
    // width: 100vw; height: 100vh) and is the sole owner of the published
    // surface. The app nav floats above it (z-index 50); the AppShell
    // default wallpaper (z-index -1) is fully occluded.
    return <DesktopPremiumReceiver layout={resolvedPremium} asMount />;
  }

  return (
    <div className="pageShell">
      <div className="wallpaperLayer" aria-hidden>
        <div
          className="wallpaperImage"
          style={wallpaperUrl ? { backgroundImage: `url('${wallpaperUrl}')` } : undefined}
        />
      </div>
      <div className="pageShellContent">{children}</div>
    </div>
  );
}
