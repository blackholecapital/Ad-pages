import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { WorkspaceTile } from "../components/layout/WorkspaceTile";
import { ModuleFrame } from "../components/integrations/ModuleFrame";

type RouteParams = { designation?: string; slug?: string };
type TabKey = "dashboard" | "referrals" | "add";

const TABS: { key: TabKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "referrals", label: "My Referrals" },
  { key: "add",       label: "Add Referral" },
];

function adminPath(designation?: string, slug?: string) {
  if (designation && slug) return `/${designation}/${slug}/admin`;
  if (slug) return `/${slug}/gate/admin`;
  return "/admin";
}

export function ReferralsPage() {
  const nav = useNavigate();
  const { designation, slug } = useParams<RouteParams>();
  const [active, setActive] = useState<TabKey>("dashboard");
  const frameRef = useRef<HTMLIFrameElement>(null);

  function handleTabClick(key: TabKey) {
    setActive(key);
    frameRef.current?.contentWindow?.postMessage(
      { type: "REFERRALS_SWITCH_TAB", tab: key },
      "*"
    );
  }

  const headerExtras = (
    <>
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          className={"workspaceTab" + (active === t.key ? " active" : "")}
          onClick={() => handleTabClick(t.key)}
        >
          {t.label}
        </button>
      ))}
      <button className="workspaceTab" type="button" onClick={() => nav(adminPath(designation, slug))}>
        ← Admin
      </button>
    </>
  );

  return (
    <PageShell>
      <WorkspaceTile
        title={<span style={{ color: "#60a5fa" }}>Referrals</span>}
        headerExtras={headerExtras}
        contentClassName="workspaceTileFill"
      >
        <ModuleFrame ref={frameRef} module="referrals" initialTab="dashboard" height="100%" />
      </WorkspaceTile>
    </PageShell>
  );
}
