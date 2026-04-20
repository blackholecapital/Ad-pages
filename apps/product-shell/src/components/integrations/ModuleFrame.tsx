import { forwardRef } from "react";
import { buildEmbedTitle } from "./embedUtils";
import { resolveModuleUrl } from "./moduleRegistry";

type ModuleFrameProps = {
  module: string;
  /** Initial tab key passed to the module via ?tab= on first load. */
  initialTab?: string;
  height?: string;
  /** When true, hides the section without unmounting it (preserves iframe state). */
  hidden?: boolean;
};

export const ModuleFrame = forwardRef<HTMLIFrameElement, ModuleFrameProps>(
  function ModuleFrame({ module, initialTab, height = "70vh", hidden }, ref) {
    const base = resolveModuleUrl(module);
    const src = initialTab
      ? `${base}?tab=${encodeURIComponent(initialTab)}`
      : base;
    const fills = height === "100%";

    return (
      <section
        className="card"
        style={{
          padding: 0,
          overflow: "hidden",
          height: fills ? "100%" : undefined,
          display: hidden ? "none" : (fills ? "flex" : undefined),
          flexDirection: fills ? "column" : undefined,
        }}
      >
        <iframe
          ref={ref}
          title={buildEmbedTitle(module)}
          src={src}
          style={{ border: 0, width: "100%", height, flex: fills ? "1 1 auto" : undefined }}
          loading="lazy"
        />
      </section>
    );
  }
);
