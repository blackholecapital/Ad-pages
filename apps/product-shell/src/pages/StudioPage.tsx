import { useState } from "react";
import { DesktopPremiumStudio } from "../features/desktop-premium/DesktopPremiumStudio";
import { DesktopPremiumReceiver } from "../features/desktop-premium/DesktopPremiumReceiver";
import type { PremiumShellLayout } from "../features/desktop-premium/shellConfig";

type StudioMode = "edit" | "preview";

/**
 * Studio page for desktop-premium-v1.
 *
 * Renders the Studio editor by default. Toggling to "Preview" swaps in the
 * Receiver renderer using the last saved layout — confirming parity between
 * what the creator sees and what end-users receive.
 */
export function StudioPage() {
  const [mode, setMode] = useState<StudioMode>("edit");
  const [lastLayout, setLastLayout] = useState<PremiumShellLayout | null>(null);

  function handleSave(layout: PremiumShellLayout) {
    setLastLayout(layout);
  }

  return (
    <>
      {/* Mode toggle bar — above the stage viewport */}
      <div
        style={{
          position: "fixed",
          top: "var(--nav-h, 72px)",
          left: 0,
          right: 0,
          height: 44,
          background: "rgba(8,8,16,0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 16px",
          zIndex: 50,
        }}
      >
        <button
          type="button"
          className="dpv1ToolbarBtn"
          style={{ opacity: mode === "edit" ? 1 : 0.5 }}
          onClick={() => setMode("edit")}
        >
          Studio
        </button>
        <button
          type="button"
          className="dpv1ToolbarBtn"
          style={{ opacity: mode === "preview" ? 1 : 0.5 }}
          disabled={!lastLayout}
          onClick={() => setMode("preview")}
        >
          Receiver Preview
        </button>
        {lastLayout && (
          <span
            style={{
              marginLeft: 12,
              fontSize: 13,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "ui-monospace, monospace",
            }}
          >
            {lastLayout.tiles.length} tile{lastLayout.tiles.length !== 1 ? "s" : ""} saved
          </span>
        )}
      </div>

      {/* Stage area — below nav + mode bar */}
      <div
        style={{
          position: "fixed",
          top: "calc(var(--nav-h, 72px) + 44px)",
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
        }}
      >
        {mode === "edit" ? (
          <DesktopPremiumStudio onSave={handleSave} />
        ) : lastLayout ? (
          <DesktopPremiumReceiver layout={lastLayout} />
        ) : null}
      </div>
    </>
  );
}
