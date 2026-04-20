import type { CartLine } from "../state/cartStore";

type BasketCheckoutCardProps = {
  line: CartLine;
  onChangeQuantity: (productId: string, quantity: number) => void;
};

export function BasketCheckoutCard({ line, onChangeQuantity }: BasketCheckoutCardProps) {
  return (
    <article className="card" style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <strong>{line.title}</strong>
        <span>{(line.priceUsdc * line.quantity).toFixed(2)} USDC</span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button type="button" className="loginTextBtn" onClick={() => onChangeQuantity(line.id, line.quantity - 1)}>
          -
        </button>
        <span>{line.quantity}</span>
        <button type="button" className="loginTextBtn" onClick={() => onChangeQuantity(line.id, line.quantity + 1)}>
          +
        </button>
      </div>
    </article>
  );
}
