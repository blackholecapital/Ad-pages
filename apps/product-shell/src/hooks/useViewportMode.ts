import { useEffect, useState } from "react";

export type ViewportMode = "mobile" | "desktop";

export function useViewportMode(breakpointPx = 860): ViewportMode {
  const [mode, setMode] = useState<ViewportMode>("desktop");

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    const update = () => setMode(mq.matches ? "mobile" : "desktop");
    update();

    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpointPx]);

  return mode;
}
