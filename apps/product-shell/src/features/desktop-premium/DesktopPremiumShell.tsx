import type { ReactNode } from "react";
import type { StageDims, StageScaleState } from "./useStageScale";
import { DESKTOP_TARGET_ENVELOPE } from "./useStageScale";
import SHELL from "./shellConfig";

type DesktopPremiumShellProps = {
  scaleState: StageScaleState;
  stageDims?: StageDims;
  targetEnvelope?: StageDims;
  wallpaperUrl?: string | null;
  tilesLayer?: ReactNode;
  studioMode?: boolean;
};

/**
 * Hardened published shell.
 *
 * The wallpaper owns the entire stage. Legacy internal header/rails/workspace
 * chrome is deliberately removed from the published renderer so nothing can
 * compete with the wallpaper or reintroduce the old shell visuals.
 */
export function DesktopPremiumShell({
  scaleState,
  stageDims,
  targetEnvelope = DESKTOP_TARGET_ENVELOPE,
  wallpaperUrl,
  tilesLayer,
  studioMode = false,
}: DesktopPremiumShellProps) {
  const cfg = SHELL;
  const { scale, stageOffsetX, stageOffsetY } = scaleState;
  const finalScale = scale;
  const stage = stageDims ?? { w: scaleState.stageW, h: scaleState.stageH };

  return (
    <div
      className="dpv1Stage"
      data-shell={cfg.shellId}
      data-stage-w={stage.w}
      data-stage-h={stage.h}
      data-target-envelope-w={targetEnvelope.w}
      data-target-envelope-h={targetEnvelope.h}
      style={{
        width: stage.w,
        height: stage.h,
        transform: `scale(${finalScale})`,
        transformOrigin: "top left",
        left: stageOffsetX,
        top: stageOffsetY,
      }}
    >
      <div
        className="dpv1Wallpaper"
        aria-hidden
        style={
          wallpaperUrl
            ? {
                backgroundImage: `url('${wallpaperUrl}')`,
                backgroundSize: "cover",
                backgroundPosition: "center center",
                backgroundRepeat: "no-repeat",
              }
            : undefined
        }
      />

      {studioMode ? (
        <div
          className="dpv1Workspace dpv1WorkspaceStudio"
          style={{
            left: cfg.workspace.x,
            top: cfg.workspace.y,
            width: cfg.workspace.w,
            height: cfg.workspace.h,
          }}
        />
      ) : null}

      {tilesLayer ? <div className="dpv1TilesLayer">{tilesLayer}</div> : null}
    </div>
  );
}