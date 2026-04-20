import {
  useCallback,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from "react";
import { DesktopPremiumShell } from "./DesktopPremiumShell";
import { useStageScale, makeToStageCoords } from "./useStageScale";
import type { StageScaleState } from "./useStageScale";
import SHELL, { type PremiumStageTile, type PremiumShellLayout } from "./shellConfig";

// ── Snap helper ──────────────────────────────────────────────────────────────

function snapTo(value: number, grid: number): number {
  return Math.round(value / grid) * grid;
}

// ── Clamp tile inside workspace bounds ──────────────────────────────────────

function clampTile(
  x: number,
  y: number,
  w: number,
  h: number
): { x: number; y: number } {
  const ws = SHELL.workspace;
  return {
    x: Math.max(ws.x, Math.min(ws.x + ws.w - w, x)),
    y: Math.max(ws.y, Math.min(ws.y + ws.h - h, y)),
  };
}

// ── Drag state ───────────────────────────────────────────────────────────────

type DragMove = {
  kind: "move";
  tileId: string;
  startPtrX: number;
  startPtrY: number;
  startTileX: number;
  startTileY: number;
};

type DragResize = {
  kind: "resize";
  tileId: string;
  startPtrX: number;
  startPtrY: number;
  startTileW: number;
  startTileH: number;
  tileX: number;
  tileY: number;
};

type DragState = DragMove | DragResize;

// ── Tile counter for unique IDs ──────────────────────────────────────────────

let tileCounter = 1;
function nextTileId() {
  return `tile_${tileCounter++}`;
}

// ── Default tile size (in stage-space pixels) ─────────────────────────────

const DEFAULT_W = 400;
const DEFAULT_H = 300;

// ── Studio tiles layer ───────────────────────────────────────────────────────

type StudioTilesProps = {
  tiles: PremiumStageTile[];
  selectedId: string | null;
  onTilePointerDown: (e: PointerEvent<HTMLDivElement>, tileId: string) => void;
  onResizePointerDown: (e: PointerEvent<HTMLDivElement>, tileId: string) => void;
  onDeleteTile: (tileId: string) => void;
};

function StudioTiles({
  tiles,
  selectedId,
  onTilePointerDown,
  onResizePointerDown,
  onDeleteTile,
}: StudioTilesProps) {
  return (
    <>
      {tiles.map((tile) => {
        const isSelected = tile.id === selectedId;
        return (
          <div
            key={tile.id}
            className={[
              "dpv1Tile",
              "dpv1TileInteractive",
              isSelected ? "dpv1TileSelected" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              left: tile.x,
              top: tile.y,
              width: tile.w,
              height: tile.h,
              zIndex: tile.z,
            }}
            onPointerDown={(e) => onTilePointerDown(e, tile.id)}
          >
            {tile.asset && (
              <img
                className="dpv1TileMedia"
                src={tile.asset}
                alt=""
                draggable={false}
              />
            )}
            <div className="dpv1TileLabel">
              {tile.asset ? tile.id : `${tile.id} — ${tile.w}×${tile.h}`}
            </div>

            {/* Delete button */}
            <button
              type="button"
              className="dpv1TileDelete"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onDeleteTile(tile.id)}
              title="Remove tile"
            >
              ×
            </button>

            {/* Resize handle */}
            <div
              className="dpv1ResizeHandle"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizePointerDown(e, tile.id);
              }}
            />
          </div>
        );
      })}
    </>
  );
}

// ── Studio props ─────────────────────────────────────────────────────────────

type DesktopPremiumStudioProps = {
  wallpaperUrl?: string;
  initialTiles?: PremiumStageTile[];
  onSave?: (layout: PremiumShellLayout) => void;
};

/**
 * Studio editor for desktop-premium-v1.
 *
 * Renders the same 2560×1440 stage as DesktopPremiumReceiver and adds:
 *   - Draggable, resizable tiles
 *   - Grid snapping (default 20px, per shell config)
 *   - Workspace bounds clamping
 *   - Stage-space coordinate export on save
 *
 * Pointer math:
 *   stageX = (clientX - viewportRect.left - stageOffsetX) / scale
 *   stageY = (clientY - viewportRect.top  - stageOffsetY) / scale
 */
export function DesktopPremiumStudio({
  wallpaperUrl,
  initialTiles = [],
  onSave,
}: DesktopPremiumStudioProps) {
  const cfg = SHELL;

  // ── Viewport ref + scale state ──
  const viewportRef = useRef<HTMLDivElement>(null);
  const scaleState = useStageScale(viewportRef as RefObject<HTMLElement>);
  const scaleStateRef = useRef<StageScaleState>(scaleState);
  scaleStateRef.current = scaleState;

  // Stable coordinate converter — always reads fresh scaleStateRef.current
  const toStageCoords = useCallback(
    makeToStageCoords(
      viewportRef as RefObject<HTMLElement>,
      scaleStateRef
    ),
    []
  );

  // ── Tile state ──
  const [tiles, setTiles] = useState<PremiumStageTile[]>(initialTiles);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ── Drag state (ref, not state, to avoid stale closure in pointermove) ──
  const dragRef = useRef<DragState | null>(null);

  // ── Saved JSON preview ──
  const [savedJson, setSavedJson] = useState<string | null>(null);

  // ── Add tile ──
  function handleAddTile() {
    const ws = cfg.workspace;
    const x = snapTo(ws.x + (ws.w - DEFAULT_W) / 2, cfg.grid);
    const y = snapTo(ws.y + (ws.h - DEFAULT_H) / 2, cfg.grid);
    const id = nextTileId();
    const newTile: PremiumStageTile = { id, x, y, w: DEFAULT_W, h: DEFAULT_H, z: tiles.length + 1 };
    setTiles((prev) => [...prev, newTile]);
    setSelectedId(id);
    setSavedJson(null);
  }

  // ── Delete tile ──
  function handleDeleteTile(tileId: string) {
    setTiles((prev) => prev.filter((t) => t.id !== tileId));
    if (selectedId === tileId) setSelectedId(null);
    setSavedJson(null);
  }

  // ── Save layout ──
  function handleSave() {
    const layout: PremiumShellLayout = {
      shellId: "desktop-premium-v1",
      stage: { w: 2560, h: 1440 },
      wallpaper: wallpaperUrl ?? null,
      tiles: tiles.map((t) => ({
        id: t.id,
        asset: t.asset ?? null,
        x: t.x,
        y: t.y,
        w: t.w,
        h: t.h,
        z: t.z,
      })),
    };
    setSavedJson(JSON.stringify(layout, null, 2));
    onSave?.(layout);
  }

  // ── Tile pointer down (start move) ──
  function handleTilePointerDown(
    e: PointerEvent<HTMLDivElement>,
    tileId: string
  ) {
    e.stopPropagation();
    const { x, y } = toStageCoords(e.clientX, e.clientY);
    const tile = tiles.find((t) => t.id === tileId);
    if (!tile) return;

    setSelectedId(tileId);
    dragRef.current = {
      kind: "move",
      tileId,
      startPtrX: x,
      startPtrY: y,
      startTileX: tile.x,
      startTileY: tile.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  // ── Resize handle pointer down ──
  function handleResizePointerDown(
    e: PointerEvent<HTMLDivElement>,
    tileId: string
  ) {
    const { x, y } = toStageCoords(e.clientX, e.clientY);
    const tile = tiles.find((t) => t.id === tileId);
    if (!tile) return;

    setSelectedId(tileId);
    dragRef.current = {
      kind: "resize",
      tileId,
      startPtrX: x,
      startPtrY: y,
      startTileW: tile.w,
      startTileH: tile.h,
      tileX: tile.x,
      tileY: tile.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  // ── Viewport pointer move (handles both move and resize) ──
  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;

    const { x: ptrX, y: ptrY } = toStageCoords(e.clientX, e.clientY);
    const grid = cfg.grid;

    if (drag.kind === "move") {
      const dx = ptrX - drag.startPtrX;
      const dy = ptrY - drag.startPtrY;
      const rawX = drag.startTileX + dx;
      const rawY = drag.startTileY + dy;
      const snappedX = snapTo(rawX, grid);
      const snappedY = snapTo(rawY, grid);

      setTiles((prev) =>
        prev.map((t) => {
          if (t.id !== drag.tileId) return t;
          const { x, y } = clampTile(snappedX, snappedY, t.w, t.h);
          return { ...t, x, y };
        })
      );
    } else {
      const dw = ptrX - drag.startPtrX;
      const dh = ptrY - drag.startPtrY;
      const ws = cfg.workspace;
      const rawW = drag.startTileW + dw;
      const rawH = drag.startTileH + dh;
      const newW = Math.max(grid * 2, snapTo(rawW, grid));
      const newH = Math.max(grid * 2, snapTo(rawH, grid));
      // Clamp so tile stays inside workspace
      const maxW = ws.x + ws.w - drag.tileX;
      const maxH = ws.y + ws.h - drag.tileY;

      setTiles((prev) =>
        prev.map((t) => {
          if (t.id !== drag.tileId) return t;
          return {
            ...t,
            w: Math.min(newW, maxW),
            h: Math.min(newH, maxH),
          };
        })
      );
    }
  }

  // ── Viewport pointer up / cancel ──
  function handlePointerUp() {
    dragRef.current = null;
    setSavedJson(null);
  }

  // ── Background click clears selection ──
  function handleViewportPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      setSelectedId(null);
    }
  }

  return (
    <div
      ref={viewportRef}
      className="dpv1Viewport"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerDown={handleViewportPointerDown}
      style={{ touchAction: "none" }}
    >
      <DesktopPremiumShell
        scaleState={scaleState}
        wallpaperUrl={wallpaperUrl}
        studioMode
        tilesLayer={
          <StudioTiles
            tiles={tiles}
            selectedId={selectedId}
            onTilePointerDown={handleTilePointerDown}
            onResizePointerDown={handleResizePointerDown}
            onDeleteTile={handleDeleteTile}
          />
        }
      />

      {/* Toolbar — viewport-relative, not inside the scaled stage */}
      <div className="dpv1StudioToolbar">
        <button type="button" className="dpv1ToolbarBtn" onClick={handleAddTile}>
          + Add Tile
        </button>
        <button
          type="button"
          className="dpv1ToolbarBtn primary"
          onClick={handleSave}
          disabled={tiles.length === 0}
        >
          Save Layout
        </button>
      </div>

      {/* JSON preview on save */}
      {savedJson && (
        <pre className="dpv1SavePanel">{savedJson}</pre>
      )}
    </div>
  );
}
