import { PageShell } from "../components/layout/PageShell";
import { WorkspaceTile } from "../components/layout/WorkspaceTile";
import { MemberBillingPanel } from "../features/payme/MemberBillingPanel";

export function CustomerPage() {
  return (
    <PageShell>
      <WorkspaceTile title="Customer Service">
        <MemberBillingPanel />
      </WorkspaceTile>
    </PageShell>
  );
}
