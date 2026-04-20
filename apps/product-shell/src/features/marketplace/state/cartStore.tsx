import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { mockCatalog, type CatalogProduct } from "./mockCatalog";

export type CartLine = CatalogProduct & { quantity: number };

type CartStoreValue = {
  catalog: CatalogProduct[];
  lines: CartLine[];
  itemCount: number;
  subtotalUsdc: number;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartStoreContext = createContext<CartStoreValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const value = useMemo<CartStoreValue>(() => {
    const addToCart = (productId: string) => {
      const product = mockCatalog.find((entry) => entry.id === productId);
      if (!product) return;

      setLines((prev) => {
        const existing = prev.find((line) => line.id === productId);
        if (!existing) return [...prev, { ...product, quantity: 1 }];

        return prev.map((line) =>
          line.id === productId ? { ...line, quantity: line.quantity + 1 } : line,
        );
      });
    };

    const removeFromCart = (productId: string) => {
      setLines((prev) =>
        prev
          .map((line) =>
            line.id === productId ? { ...line, quantity: line.quantity - 1 } : line,
          )
          .filter((line) => line.quantity > 0),
      );
    };

    const setQuantity = (productId: string, quantity: number) => {
      setLines((prev) => {
        if (quantity <= 0) {
          return prev.filter((line) => line.id !== productId);
        }

        const exists = prev.some((line) => line.id === productId);
        if (!exists) {
          const product = mockCatalog.find((entry) => entry.id === productId);
          if (!product) return prev;
          return [...prev, { ...product, quantity }];
        }

        return prev.map((line) => (line.id === productId ? { ...line, quantity } : line));
      });
    };

    const clearCart = () => setLines([]);

    return {
      catalog: mockCatalog,
      lines,
      itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotalUsdc: lines.reduce((sum, line) => sum + line.priceUsdc * line.quantity, 0),
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
    };
  }, [lines]);

  return <CartStoreContext.Provider value={value}>{children}</CartStoreContext.Provider>;
}

export function useCartStore() {
  const store = useContext(CartStoreContext);
  if (!store) throw new Error("useCartStore must be used within a CartProvider");
  return store;
}
