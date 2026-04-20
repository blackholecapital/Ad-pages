import { CartPanel } from "../components/CartPanel";
import { CheckoutPanel } from "../components/CheckoutPanel";
import { ProductGrid } from "../components/ProductGrid";

export function MarketplacePage() {
  return (
    <section>
      <h2 className="pageTitle" style={{ color: "#fff", textAlign: "center", marginBottom: 12 }}>
        Skin Marketplace
      </h2>
      <ProductGrid />
      <CartPanel />
      <CheckoutPanel />
    </section>
  );
}
