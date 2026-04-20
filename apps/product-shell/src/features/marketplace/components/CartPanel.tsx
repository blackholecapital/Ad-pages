import { useCartStore } from "../state/cartStore";
import { BasketCheckoutCard } from "./BasketCheckoutCard";

export function CartPanel() {
  const { lines, itemCount, setQuantity, clearCart } = useCartStore();

  return (
    <section style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h3 className="sectionTitle" style={{ margin: 0 }}>Cart ({itemCount})</h3>
        <button type="button" className="loginTextBtn" onClick={clearCart}>
          Clear
        </button>
      </div>

      {lines.length === 0 ? (
        <article className="card">No items in cart.</article>
      ) : (
        <div className="cardsGrid">
          {lines.map((line) => (
            <BasketCheckoutCard key={line.id} line={line} onChangeQuantity={setQuantity} />
          ))}
        </div>
      )}
    </section>
  );
}
