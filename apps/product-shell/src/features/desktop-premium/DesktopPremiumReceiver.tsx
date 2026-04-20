import { useRef, type RefObject } from "react";
import { DesktopPremiumShell } from "./DesktopPremiumShell";
import { DESKTOP_TARGET_ENVELOPE, useStageScale } from "./useStageScale";
import type { PremiumShellLayout, PremiumStageTile } from "../../runtime/types";

/**
 * Published-side nudge only.
 * Studio stays untouched.
 * Negative X = move left
 * Positive Y = move down
 */

// Published-only tile offsets (do NOT affect Studio)
const PUBLISHED_TILE_OFFSET_X = -222; // big move left
const PUBLISHED_TILE_OFFSET_Y = -35;  // move up to add bottom margin





type ReceiverTilesProps = {
  tiles: PremiumStageTile[];
  offsetX?: number;
  offsetY?: number;
};

function ReceiverTiles({
  tiles,
  offsetX = 0,
  offsetY = 0,
}: ReceiverTilesProps) {
  if (tiles.length === 0) {
    return null;
  }

  return (
    <>
      {tiles.map((tile) => (
        <div
          key={tile.id}
          className="dpv1Tile"
          style={{
            left: tile.x + offsetX,
            top: tile.y + offsetY,
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
  asMount?: boolean;
};

export function DesktopPremiumReceiver({
  layout,
  asMount,
}: DesktopPremiumReceiverProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  const scaleState = useStageScale(
    viewportRef as RefObject<HTMLElement>,
    layout.stage,
    {
      fullPublishedViewport: !!asMount,
      fitMode: "cover",
    }
  );

  const receiverOffsetX = asMount ? PUBLISHED_TILE_OFFSET_X : 0;
  const receiverOffsetY = asMount ? PUBLISHED_TILE_OFFSET_Y : 0;


  const shellNode = (
    <DesktopPremiumShell
      scaleState={scaleState}
      stageDims={layout.stage}
      targetEnvelope={DESKTOP_TARGET_ENVELOPE}
      wallpaperUrl={layout.wallpaper ?? undefined}
      tilesLayer={
        <ReceiverTiles
          tiles={layout.tiles}
          offsetX={receiverOffsetX}
          offsetY={receiverOffsetY}
        />
      }
    />
  );

  if (asMount) {
    return (
      <div
        className="dpv1ReceiverMount"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", margin: 0, padding: 0, overflow: "hidden", background: "#000" }}
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
