import { PayMeAdminCard } from "./PayMeAdminCard";
import { usePayMeSession } from "../../runtime/usePayMeSession";

export function PayMeAdminPanel() {
  const { paymeAdminReady, sessionTransportReady } = usePayMeSession();

  if (!paymeAdminReady || !sessionTransportReady) {
    return (
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0 }}>
        PayMe admin panel unavailable — bridge not activatable.
      </p>
    );
  }

  return (
    <section className="cardsGrid" style={{ marginTop: 16 }}>
      <PayMeAdminCard title="Active plans" value="—" helper="live data pending" />
      <PayMeAdminCard title="USDC collected" value="—" helper="rolling 30-day total" />
      <PayMeAdminCard title="Failed renewals" value="—" helper="live data pending" />
    </section>
  );
}
