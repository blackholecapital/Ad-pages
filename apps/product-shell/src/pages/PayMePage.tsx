import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { WorkspaceTile } from "../components/layout/WorkspaceTile";
import { InvoiceComposer } from "../features/payme/InvoiceComposer";

type RouteParams = { designation?: string; slug?: string };

function adminPath(designation?: string, slug?: string) {
  if (designation && slug) return `/${designation}/${slug}/admin`;
  if (slug) return `/${slug}/admin`;
  return "/admin";
}

export function PayMePage() {
  const nav = useNavigate();
  const { designation, slug } = useParams<RouteParams>();

  const headerExtras = (
    <button className="workspaceTab" type="button" onClick={() => nav(adminPath(designation, slug))}>
      ← Admin
    </button>
  );

  return (
    <PageShell>
      <WorkspaceTile
        title={<span style={{ color: "#60a5fa" }}>PayMe</span>}
        headerExtras={headerExtras}
      >
        <InvoiceComposer />
      </WorkspaceTile>
    </PageShell>
  );
}
