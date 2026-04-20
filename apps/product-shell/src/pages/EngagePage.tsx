import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { WorkspaceTile } from "../components/layout/WorkspaceTile";
import { ModuleFrame } from "../components/integrations/ModuleFrame";

type RouteParams = { designation?: string; slug?: string };
type TabKey = "quests" | "admin-quests" | "admin-users" | "admin-completions";

const TABS: { key: TabKey; label: string }[] = [
  { key: "quests",            label: "Quests" },
  { key: "admin-quests",      label: "Quest Admin" },
  { key: "admin-users",       label: "Users" },
  { key: "admin-completions", label: "Completions" },
];

function adminPath(designation?: string, slug?: string) {
  if (designation && slug) return `/${designation}/${slug}/admin`;
  if (slug) return `/${slug}/admin`;
  return "/admin";
}

export function EngagePage() {
  const nav = useNavigate();
  const { designation, slug } = useParams<RouteParams>();
  const [active, setActive] = useState<TabKey>("quests");
  const frameRef = useRef<HTMLIFrameElement>(null);

  function handleTabClick(key: TabKey) {
    setActive(key);
    frameRef.current?.contentWindow?.postMessage(
      { type: "ENGAGE_NAVIGATE", tab: key },
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
        title={<span style={{ color: "#60a5fa" }}>Engage</span>}
        headerExtras={headerExtras}
        contentClassName="workspaceTileFill"
      >
        <ModuleFrame ref={frameRef} module="engage" initialTab="quests" height="100%" />
      </WorkspaceTile>
    </PageShell>
  );
}
