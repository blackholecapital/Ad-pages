import { useRef, type RefObject } from "react";
import { DesktopPremiumShell } from "./DesktopPremiumShell";
import { DESKTOP_TARGET_ENVELOPE, useStageScale } from "./useStageScale";
// Canonical runtime contract lives in runtime/types. shellConfig's type
// aliases use literal 2560×1440 dims for authoring; the receiver accepts the
// widened runtime contract so server-emitted stage dims pass through without
// reinterpretation.
import type { PremiumShellLayout, PremiumStageTile } from "../../runtime/types";

type ReceiverTilesProps = {
  tiles: PremiumStageTile[];
};

function ReceiverTiles({ tiles }: ReceiverTilesProps) {
  if (tiles.length === 0) {
    return <div className="dpv1ReceiverEmpty">No tiles deployed</div>;
  }
  return (
    <>
      {tiles.map((tile) => (
        <div
          key={tile.id}
          className="dpv1Tile"
          style={{
            left: tile.x,
            top: tile.y,
            width: tile.w,
            height: tile.h,
            zIndex: tile.z,
          }}
        >
          {tile.asset && (
            <img
              className="dpv1TileMedia"
              src={tile.asset}
              alt=""
              draggable={false}
            />
          )}
        </div>
      ))}
    </>
  );
}

type DesktopPremiumReceiverProps = {
  layout: PremiumShellLayout;
  /**
   * When true the receiver renders its own full-viewport owning surface
   * (`dpv1ReceiverMount`, position:fixed inset:0 z-index:4) and positions
   * itself without any external wrapper. Use this on the published page path
   * (via PageShell) so the receiver is the top-level rendering owner and the
   * AppShell default wallpaper cannot paint behind or beside the premium stage.
   *
   * Leave unset (or false) for Studio preview: the receiver renders only
   * `dpv1Viewport` and fills whichever container the Studio supplies.
   */
  asMount?: boolean;
};

/**
 * Canonical receiver renderer for desktop-premium-v1.
 *
 * Consumes a `PremiumShellLayout` directly from the published runtime
 * payload. Stage dimensions, wallpaper URL and tile coordinates are taken
 * verbatim — no re-interpretation, no fallback to module-level defaults.
 *
 * When `asMount` is true (published page path) the component mounts its own
 * full-viewport `dpv1ReceiverMount` surface and becomes the top-level
 * rendering owner. The app nav (z-index 50) renders above it; the AppShell
 * default wallpaper (z-index -1) is fully covered.
 *
 * When `asMount` is false/absent (Studio preview path) the component renders
 * a `dpv1Viewport` that fills whatever container the Studio supplies.
 */
export function DesktopPremiumReceiver({ layout, asMount }: DesktopPremiumReceiverProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  // Published-premium path: tell useStageScale to use the full visual
  // viewport as the scale container, not whatever a (possibly nav-offset)
  // ancestor reports. This is the BIZ-PAGES-WALLPAPER-HOTFIX-003 S5 contract:
  // the premium receiver — not AppShell or HomePage — owns the published
  // surface, and that surface is 100vw × 100vh by declaration.
  const scaleState = useStageScale(
    viewportRef as RefObject<HTMLElement>,
    layout.stage,
    { fullPublishedViewport: !!asMount }
  );

  const shellNode = (
    <DesktopPremiumShell
      scaleState={scaleState}
      stageDims={layout.stage}
      targetEnvelope={DESKTOP_TARGET_ENVELOPE}
      wallpaperUrl={layout.wallpaper ?? undefined}
      tilesLayer={<ReceiverTiles tiles={layout.tiles} />}
    />
  );

  if (asMount) {
    // Published path: receiver owns the FULL viewport (100vw × 100vh) — no
    // top-offset for the app nav, no header-chrome height subtraction. The
    // app nav (z-index 50) floats above; the AppShell wallpaper layer is
    // fully occluded.
    //
    // Inline width/height/top/left enforce viewport dimensions as a
    // belt-and-suspenders override:
    //   - 100vw / 100vh — wins over any ancestor max-width clamp.
    //   - top:0 / left:0 — wins over any inherited `top: var(--nav-h)` from
    //     a stale legacy wrapper (we never want the published-premium mount
    //     to start below the nav; the receiver is the owner of the surface
    //     that the nav floats over).
    return (
      <div
        className="dpv1ReceiverMount"
        style={{ width: "100vw", height: "100vh", top: 0, left: 0 }}
        data-shell={layout.shellId}
        data-premium-owner="true"
        data-premium-surface="full-viewport"
        data-stage-w={layout.stage.w}
        data-stage-h={layout.stage.h}
        data-target-envelope-w={DESKTOP_TARGET_ENVELOPE.w}
        data-target-envelope-h={DESKTOP_TARGET_ENVELOPE.h}
      >
        <div ref={viewportRef} className="dpv1Viewport">
          {shellNode}
        </div>
      </div>
    );
  }

  // Studio preview path: fills the caller's container (no fixed positioning).
  return (
    <div
      ref={viewportRef}
      className="dpv1Viewport"
      data-shell={layout.shellId}
      data-stage-w={layout.stage.w}
      data-stage-h={layout.stage.h}
      data-target-envelope-w={DESKTOP_TARGET_ENVELOPE.w}
      data-target-envelope-h={DESKTOP_TARGET_ENVELOPE.h}
    >
      {shellNode}
    </div>
  );
}
