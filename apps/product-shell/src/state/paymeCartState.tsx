import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type BasketItem = {
  id: string;
  sku: string;
  name: string;
  description?: string;
  setupPrice?: number;
  monthlyPrice?: number;
  interval?: "month" | "year" | "day30" | "day180";
  qty: number;
};

type PayMeCartContextValue = {
  open: boolean;
  items: BasketItem[];
  toggle: () => void;
  show: () => void;
  hide: () => void;
  addItem: (item: Omit<BasketItem, "qty"> & { qty?: number }) => void;
  updateQty: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

const PayMeCartContext = createContext<PayMeCartContextValue | null>(null);

export function PayMeCartProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BasketItem[]>([]);

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);

  const addItem = useCallback<PayMeCartContextValue["addItem"]>((item) => {
    setItems((prev) => {
      const qty = item.qty ?? 1;
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + qty } : p));
      }
      return [...prev, { ...item, qty }];
    });
    setOpen(true);
  }, []);

  const updateQty = useCallback<PayMeCartContextValue["updateQty"]>((id, delta) => {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: Math.max(0, p.qty + delta) } : p))
        .filter((p) => p.qty > 0)
    );
  }, []);

  const removeItem = useCallback<PayMeCartContextValue["removeItem"]>((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<PayMeCartContextValue>(
    () => ({ open, items, toggle, show, hide, addItem, updateQty, removeItem, clear }),
    [open, items, toggle, show, hide, addItem, updateQty, removeItem, clear]
  );

  return <PayMeCartContext.Provider value={value}>{children}</PayMeCartContext.Provider>;
}

export function usePayMeCart(): PayMeCartContextValue {
  const ctx = useContext(PayMeCartContext);
  if (!ctx) {
    return {
      open: false,
      items: [],
      toggle: () => {},
      show: () => {},
      hide: () => {},
      addItem: () => {},
      updateQty: () => {},
      removeItem: () => {},
      clear: () => {},
    };
  }
  return ctx;
}

export function intervalLabel(interval?: BasketItem["interval"]): string {
  switch (interval) {
    case "month":
      return "/ mo";
    case "year":
      return "/ yr";
    case "day30":
      return "/ 30 days";
    case "day180":
      return "/ 180 days";
    default:
      return "";
  }
}
