import { useCartStore } from "../state/cartStore";
import { PayMeEmbedPlaceholder } from "./PayMeEmbedPlaceholder";
import { UsdcCheckoutCard } from "./UsdcCheckoutCard";

export function CheckoutPanel() {
  const { subtotalUsdc } = useCartStore();

  return (
    <section className="cardsGrid" style={{ marginTop: 16 }}>
      <UsdcCheckoutCard subtotalUsdc={subtotalUsdc} />
      <PayMeEmbedPlaceholder />
    </section>
  );
}
