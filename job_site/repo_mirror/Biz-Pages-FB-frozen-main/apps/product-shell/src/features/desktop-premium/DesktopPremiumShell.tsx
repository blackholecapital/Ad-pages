import type { ReactNode } from "react";
import type { StageDims, StageScaleState } from "./useStageScale";
import { DESKTOP_TARGET_ENVELOPE } from "./useStageScale";
import SHELL from "./shellConfig";

type DesktopPremiumShellProps = {
  scaleState: StageScaleState;
  /**
   * Stage dimensions to render. Taken verbatim from the premium payload
   * (`PublishedRuntimePage.stage`) — the shell never rederives these.
   * Defaults to the canonical 2560×1440 envelope for studio use.
   */
  stageDims?: StageDims;
  /**
   * Operator desktop target envelope. Emitted as a `data-*` attribute on
   * the root stage element for audit + test harnesses; does not affect
   * scale math (that is controlled by `useStageScale` + `stageDims`).
   */
  targetEnvelope?: StageDims;
  wallpaperUrl?: string | null;
  tilesLayer?: ReactNode;
  studioMode?: boolean;
};

/**
 * Pure stage renderer for desktop-premium-v1.
 *
 * Renders a `stageDims.w × stageDims.h` stage div scaled and centered via
 * CSS transform. Wallpaper covers the full stage (background-size: cover,
 * no letterboxing). Used identically by Studio and Receiver; both see the
 * same shell geometry because both pass the same `stageDims`.
 *
 * This component never reads `stageDims` from a module-level constant for
 * the renderer math — it consumes the props. The `SHELL` import is used
 * only for header/rail/workspace chrome positions that are fixed by the
 * shell contract (header height, rail widths, workspace band), not for the
 * stage envelope.
 *
 * **Surface ownership invariant (BIZ-PAGES-WALLPAPER-HOTFIX-003 S5):**
 * `scale`, `stageOffsetX`, and `stageOffsetY` are derived by
 * `useStageScale` from the receiver's owning surface. For the published
 * premium path that surface is the full viewport (`dpv1ReceiverMount`,
 * 100vw × 100vh) — so this shell never has to know about, or compensate
 * for, the AppShell nav-bar height. The stage envelope and offsets are
 * already pre-baked against the full surface.
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
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        left: stageOffsetX,
        top: stageOffsetY,
      }}
    >
      {/* Wallpaper — cover fit, driven by the payload URL verbatim. */}
      <div
        className="dpv1Wallpaper"
        aria-hidden
        style={
          wallpaperUrl
            ? {
                backgroundImage: `url('${wallpaperUrl}')`,
                backgroundSize: cfg.wallpaper.fit,
                backgroundPosition: cfg.wallpaper.position,
                backgroundRepeat: cfg.wallpaper.repeat,
              }
            : undefined
        }
      />

      {/* Header */}
      <div className="dpv1Header" style={{ height: cfg.header.h }}>
        <span className="dpv1HeaderLabel">{cfg.shellId}</span>
      </div>

      {/* Left rail */}
      <div
        className="dpv1LeftRail"
        style={{ width: cfg.leftRail.w, top: cfg.header.h }}
      />

      {/* Right rail */}
      <div
        className="dpv1RightRail"
        style={{ width: cfg.rightRail.w, top: cfg.header.h }}
      />

      {/* Workspace visual region */}
      <div
        className={`dpv1Workspace${studioMode ? " dpv1WorkspaceStudio" : ""}`}
        style={{
          left: cfg.workspace.x,
          top: cfg.workspace.y,
          width: cfg.workspace.w,
          height: cfg.workspace.h,
        }}
      />

      {/* Tiles layer — stage-space absolute coordinates, passed through. */}
      {tilesLayer && <div className="dpv1TilesLayer">{tilesLayer}</div>}
    </div>
  );
}
