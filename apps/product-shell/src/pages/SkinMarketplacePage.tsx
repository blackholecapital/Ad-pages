import { useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { WorkspaceTile } from "../components/layout/WorkspaceTile";
import { CartProvider } from "../features/marketplace/state/cartStore";
import { MarketplacePage } from "../features/marketplace/pages/MarketplacePage";

type RouteParams = { designation?: string; slug?: string };

function adminPath(designation?: string, slug?: string) {
  if (designation && slug) return `/${designation}/${slug}/admin`;
  if (slug) return `/${slug}/gate/admin`;
  return "/admin";
}

export function SkinMarketplacePage() {
  const nav = useNavigate();
  const { designation, slug } = useParams<RouteParams>();

  const backToAdmin = (
    <button className="workspaceTab" type="button" onClick={() => nav(adminPath(designation, slug))}>
      ← Admin
    </button>
  );

  return (
    <PageShell>
      <WorkspaceTile title="Skins" headerExtras={backToAdmin}>
        <CartProvider>
          <MarketplacePage />
        </CartProvider>
      </WorkspaceTile>
    </PageShell>
  );
}
