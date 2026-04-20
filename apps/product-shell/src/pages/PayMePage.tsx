import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { WorkspaceTile } from "../components/layout/WorkspaceTile";
import { ModuleFrame } from "../components/integrations/ModuleFrame";
import { CouponsPanel } from "../features/payme/CouponsPanel";
import { RecurringBillingPanel } from "../features/payme/RecurringBillingPanel";
import { PayMeSettingsPanel } from "../features/payme/PayMeSettingsPanel";

type RouteParams = { designation?: string; slug?: string };

type TabKey = "customers" | "add" | "history" | "invoice" | "coupons" | "recurring" | "settings";

// Tabs rendered inside the payme module (communicated via postMessage so the
// iframe never reloads and form state is preserved across tab switches).
const MODULE_TABS: { key: TabKey; label: string }[] = [
  { key: "customers", label: "Customers" },
  { key: "add",       label: "Add Customer" },
  { key: "history",   label: "History" },
  { key: "invoice",   label: "Create Invoice" },
];

// Tabs rendered as standalone panels inside the WorkspaceTile.
const PANEL_TABS: { key: TabKey; label: string }[] = [
  { key: "coupons",   label: "Coupons" },
  { key: "recurring", label: "Recurring Billing" },
  { key: "settings",  label: "Admin Settings" },
];

function adminPath(designation?: string, slug?: string) {
  if (designation && slug) return `/${designation}/${slug}/admin`;
  if (slug) return `/${slug}/gate/admin`;
  return "/admin";
}

export function PayMePage() {
  const nav = useNavigate();
  const { designation, slug } = useParams<RouteParams>();
  const [active, setActive] = useState<TabKey>("customers");
  const moduleFrameRef = useRef<HTMLIFrameElement>(null);

  const isModuleTab = MODULE_TABS.some((t) => t.key === active);

  function handleTabClick(key: TabKey) {
    setActive(key);
    const isModule = MODULE_TABS.some((t) => t.key === key);
    if (isModule) {
      // Tell the already-loaded iframe to switch tab — no reload, no lost state.
      moduleFrameRef.current?.contentWindow?.postMessage(
        { type: "PAYME_SWITCH_TAB", tab: key },
        "*"
      );
    }
  }

  const headerExtras = (
    <>
      {MODULE_TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          className={"workspaceTab" + (active === t.key ? " active" : "")}
          onClick={() => handleTabClick(t.key)}
        >
          {t.label}
        </button>
      ))}
      {PANEL_TABS.map((t) => (
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
        title={<span style={{ color: "#60a5fa" }}>PayMe</span>}
        headerExtras={headerExtras}
        contentClassName={isModuleTab ? "workspaceTileFill" : undefined}
      >
        {/* Keep the module mounted at all times so state/form data survive tab switches. */}
        <ModuleFrame ref={moduleFrameRef} module="payme" initialTab="customers" height="100%" hidden={!isModuleTab} />
        {active === "coupons"   && <CouponsPanel />}
        {active === "recurring" && <RecurringBillingPanel />}
        {active === "settings"  && <PayMeSettingsPanel />}
      </WorkspaceTile>
    </PageShell>
  );
}
