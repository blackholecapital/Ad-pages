import { useCartStore } from "../state/cartStore";
import { ProductCard } from "./ProductCard";

export function ProductGrid() {
  const { catalog, addToCart } = useCartStore();

  return (
    <section className="cardsGrid">
      {catalog.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={addToCart} />
      ))}
    </section>
  );
}
