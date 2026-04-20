import { useState } from "react";
import { DesktopPremiumStudio } from "../features/desktop-premium/DesktopPremiumStudio";
import { DesktopPremiumReceiver } from "../features/desktop-premium/DesktopPremiumReceiver";
import {
  ADPAGES_STUDIO_PAGES,
  type AdPagesStudioPageKey,
  type PremiumShellLayout,
} from "../features/desktop-premium/shellConfig";

type StudioMode = "edit" | "preview";

export function StudioPage() {
  const [mode, setMode] = useState<StudioMode>("edit");
  const [selectedPage, setSelectedPage] = useState<AdPagesStudioPageKey>("home");
  const [lastLayout, setLastLayout] = useState<PremiumShellLayout | null>(null);

  function handleSave(layout: PremiumShellLayout) {
    setLastLayout({ ...layout, page: selectedPage });
  }

  return (
    <>
      {/* Mode toggle + page picker — above the stage viewport */}
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
        {/* Mode buttons */}
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

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.12)", margin: "0 4px" }} />

        {/* Page picker — Ad Pages: Home and Members only */}
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Page
        </span>
        {ADPAGES_STUDIO_PAGES.map((p) => (
          <button
            key={p.key}
            type="button"
            className="dpv1ToolbarBtn"
            style={{
              opacity: selectedPage === p.key ? 1 : 0.45,
              borderColor: selectedPage === p.key ? "rgba(59,130,246,0.6)" : undefined,
              background: selectedPage === p.key ? "rgba(59,130,246,0.16)" : undefined,
            }}
            onClick={() => {
              setSelectedPage(p.key);
              setLastLayout(null);
            }}
          >
            {p.label}
          </button>
        ))}

        {/* Save indicator */}
        {lastLayout && (
          <span
            style={{
              marginLeft: 8,
              fontSize: 13,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "ui-monospace, monospace",
            }}
          >
            {lastLayout.tiles.length} tile{lastLayout.tiles.length !== 1 ? "s" : ""} saved
            {lastLayout.page ? ` · ${lastLayout.page}` : ""}
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
