import type { CatalogProduct } from "../state/mockCatalog";

type ProductCardProps = {
  product: CatalogProduct;
  onAdd: (productId: string) => void;
};

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <article className="card">
      <div className="wallpaperLayer" style={{ marginBottom: 8 }}>
        <img className="wallpaperImage" src={product.image} alt={product.title} />
      </div>
      <h3 className="sectionTitle" style={{ margin: 0 }}>{product.title}</h3>
      <p style={{ margin: "4px 0 12px", opacity: 0.72 }}>{product.priceUsdc.toFixed(2)} USDC</p>
      <button className="loginTextBtn" type="button" onClick={() => onAdd(product.id)}>
        Add to cart
      </button>
    </article>
  );
}
