import { Outlet } from "react-router-dom";
import { TopNav } from "../components/nav/TopNav";
import { PayMePanel } from "../components/layout/PayMePanel";
import { PayMeCartProvider } from "../state/paymeCartState";

/**
 * Hardened production shell.
 *
 * This shell owns only the persistent top navigation overlay, the PayMe cart
 * panel overlay, and the route outlet. It deliberately does NOT mount:
 *   - legacy fallback wallpaper
 *   - any page-level content frame
 *
 * The published premium page owns the viewport and its wallpaper.
 */
export function AppShell() {
  return (
    <PayMeCartProvider>
      <div className="appRoot appRootPremium">
        <TopNav />
        <div className="appBody">
          <Outlet />
        </div>
        <PayMePanel />
      </div>
    </PayMeCartProvider>
  );
}
