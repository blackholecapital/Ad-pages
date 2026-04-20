import { useEffect, useRef, useState, type RefObject } from "react";
import SHELL from "./shellConfig";

export type StageDims = { w: number; h: number };

export type StageScaleState = {
  scale: number;
  stageOffsetX: number;
  stageOffsetY: number;
  /** Actual stage dims the scale was computed against — kept in state so
   *  downstream consumers (tile layer, pointer math) cannot drift from the
   *  envelope in use. */
  stageW: number;
  stageH: number;
};

export type UseStageScaleOptions = {
  /**
   * Operator desktop target envelope — the reference container size the
   * 2560×1440 stage is tuned for. `useStageScale` always aspect-preserves
   * `stage`; the envelope is carried alongside the scale state so the
   * receiver can expose it (e.g. via `data-*` attrs) and so downstream
   * layout code has one authoritative desktop target instead of rederiving
   * it from scattered constants.
   */
  targetEnvelope?: StageDims;
  /**
   * Premium published surface ownership flag (BIZ-PAGES-WALLPAPER-HOTFIX-003 S5).
   *
   * When `true`, the hook prefers the visual viewport (`window.innerWidth`,
   * `window.innerHeight`) over `containerRef.clientWidth/Height` whenever
   * the container measurement reports a value smaller than the viewport on
   * either axis. This is the published-premium contract: the premium
   * receiver owns the FULL viewport (the `dpv1ReceiverMount` div is
   * `position: fixed; inset: 0; width: 100vw; height: 100vh`) and must NOT
   * inherit any nav-bar / header-chrome height subtraction from any
   * intermediate AppShell or HomePage layer.
   *
   * Without this flag the hook defaults to legacy/Studio behavior:
   * measure the container directly (Studio supplies its own bounded box).
   */
  fullPublishedViewport?: boolean;
};

/** Canonical desktop envelope for the premium shell (operator target). */
export const DESKTOP_TARGET_ENVELOPE: StageDims = { w: 2560, h: 1440 };

/** Canonical stage used when the caller does not pass explicit dims. */
export const DEFAULT_PREMIUM_STAGE: StageDims = { w: SHELL.stage.w, h: SHELL.stage.h };

const INITIAL: StageScaleState = {
  scale: 1,
  stageOffsetX: 0,
  stageOffsetY: 0,
  stageW: DEFAULT_PREMIUM_STAGE.w,
  stageH: DEFAULT_PREMIUM_STAGE.h,
};

/**
 * Observes the container element and computes the CSS scale + centering
 * offsets needed to fit a `stage.w × stage.h` surface inside it while
 * preserving aspect ratio.
 *
 * Formula (aspect-preserving, full-viewport fill on the limiting axis,
 * `contain` semantics — never `Math.max`/cover, which would clip stage-edge
 * tiles on non-16:9 viewports):
 *
 *   scale    = min(containerW / stage.w, containerH / stage.h)
 *   offsetX  = (containerW - stage.w * scale) / 2
 *   offsetY  = (containerH - stage.h * scale) / 2
 *
 * The stage dims are sourced from the premium payload (or the default
 * operator envelope when absent). This function does NOT re-interpret tile
 * coordinates — it only derives CSS transform values.
 *
 * **Published-premium surface ownership (BIZ-PAGES-WALLPAPER-HOTFIX-003 S5):**
 * When `options.fullPublishedViewport === true`, the hook also samples
 * `window.innerWidth/innerHeight` and uses the larger of (container axis,
 * viewport axis) on each axis. This guards the published-premium path
 * against any legacy top-offset container behavior — in particular against
 * any path that subtracts the AppShell/HomePage nav-bar height (`--nav-h`,
 * 72px) from the container before scaling. Removing nav-bar dilation makes
 * the premium stage reach the full 100vw × 100vh surface assigned by the
 * `dpv1ReceiverMount` (position: fixed; inset: 0). On standard 16:9
 * displays the dark side bands caused by header-loss disappear because the
 * scale container's aspect ratio matches the stage's 16:9 again.
 */
export function useStageScale(
  containerRef: RefObject<HTMLElement>,
  stage: StageDims = DEFAULT_PREMIUM_STAGE,
  options: UseStageScaleOptions = {}
): StageScaleState {
  const { fullPublishedViewport = false } = options;
  const [ss, setSS] = useState<StageScaleState>(() => ({
    ...INITIAL,
    stageW: stage.w,
    stageH: stage.h,
  }));
  const ssRef = useRef<StageScaleState>(ss);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function readViewport(): { vw: number; vh: number } {
      // Container measurement is always the primary signal — Studio supplies
      // its own bounded preview box and must use that exactly.
      let vw = el!.clientWidth;
      let vh = el!.clientHeight;
      // Published-premium-only escape hatch: if the receiver mount is
      // declared as the full viewport (100vw × 100vh, position: fixed;
      // inset: 0) then any container axis shorter than the viewport axis
      // means an intermediate ancestor reduced it (e.g. nav-h subtraction
      // from a legacy top-offset wrapper). Recover the full viewport so the
      // stage scale stays bound to the premium receiver's declared surface.
      if (fullPublishedViewport && typeof window !== "undefined") {
        const winW = window.innerWidth || vw;
        const winH = window.innerHeight || vh;
        if (winW > vw) vw = winW;
        if (winH > vh) vh = winH;
      }
      return { vw, vh };
    }

    function update() {
      const { vw, vh } = readViewport();
      if (!vw || !vh) return;
      const s = Math.min(vw / stage.w, vh / stage.h);
      const ox = (vw - stage.w * s) / 2;
      const oy = (vh - stage.h * s) / 2;
      const next: StageScaleState = {
        scale: s,
        stageOffsetX: ox,
        stageOffsetY: oy,
        stageW: stage.w,
        stageH: stage.h,
      };
      ssRef.current = next;
      setSS(next);
    }

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    // When sampling the visual viewport, also re-derive on window resize so
    // the stage tracks viewport changes that don't trigger ResizeObserver on
    // the container element (e.g. URL-bar collapse, fullscreen toggles).
    let onWinResize: (() => void) | undefined;
    if (fullPublishedViewport && typeof window !== "undefined") {
      onWinResize = update;
      window.addEventListener("resize", onWinResize);
    }
    return () => {
      ro.disconnect();
      if (onWinResize && typeof window !== "undefined") {
        window.removeEventListener("resize", onWinResize);
      }
    };
  }, [containerRef, stage.w, stage.h, fullPublishedViewport]);

  return ss;
}

/**
 * Returns a function that converts viewport-relative pointer coordinates
 * into stage-space coordinates using the current scale state ref.
 */
export function makeToStageCoords(
  containerRef: RefObject<HTMLElement>,
  ssRef: RefObject<StageScaleState>
) {
  return function toStageCoords(clientX: number, clientY: number): { x: number; y: number } {
    const rect = containerRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
    const current = ssRef.current ?? INITIAL;
    const { scale, stageOffsetX, stageOffsetY } = current;
    const rawX = clientX - rect.left;
    const rawY = clientY - rect.top;
    return {
      x: (rawX - stageOffsetX) / scale,
      y: (rawY - stageOffsetY) / scale,
    };
  };
}
