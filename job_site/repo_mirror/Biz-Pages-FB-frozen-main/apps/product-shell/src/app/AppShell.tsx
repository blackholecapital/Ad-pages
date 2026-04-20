import { Outlet } from "react-router-dom";
import { TopNav } from "../components/nav/TopNav";
import { PayMePanel } from "../components/layout/PayMePanel";
import { PayMeCartProvider } from "../state/paymeCartState";

// Default wallpaper served from public/. R2 tenant wallpapers override this
// via PageShell's wallpaperUrl prop, which renders above this fixed layer.
const DEFAULT_WALLPAPER_URL = "/w99.png";

export function AppShell() {
  return (
    <PayMeCartProvider>
      <div className="appRoot">
        <div className="appRootWallpaper" aria-hidden>
          <div
            className="wallpaperImage"
            style={{ backgroundImage: `url('${DEFAULT_WALLPAPER_URL}')` }}
          />
        </div>
        <TopNav />
        <div className="appBody">
          <Outlet />
        </div>
        <PayMePanel />
      </div>
    </PayMeCartProvider>
  );
}
