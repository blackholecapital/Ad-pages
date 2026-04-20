import { Outlet } from "react-router-dom";
import { TopNav } from "../components/nav/TopNav";

export function AppShell() {
  return (
    <div className="appRoot appRootPremium">
      <TopNav />
      <div className="appBody">
        <Outlet />
      </div>
    </div>
  );
}
