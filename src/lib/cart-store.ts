import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  slug: string;
  name: string;
  price: number;
  image: string;
  qty: number;
};

type CartState = {
  items: CartLine[];
  isOpen: boolean;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (line, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.slug === line.slug);
          if (existing) {
            return {
              items: s.items.map((i) => (i.slug === line.slug ? { ...i, qty: i.qty + qty } : i)),
              isOpen: true,
            };
          }
          return { items: [...s.items, { ...line, qty }], isOpen: true };
        }),
      remove: (slug) => set((s) => ({ items: s.items.filter((i) => i.slug !== slug) })),
      setQty: (slug, qty) =>
        set((s) => ({
          items: qty <= 0 ? s.items.filter((i) => i.slug !== slug) : s.items.map((i) => (i.slug === slug ? { ...i, qty } : i)),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    { name: "cim-cart" },
  ),
);

export const cartTotal = (items: CartLine[]) => items.reduce((s, i) => s + i.price * i.qty, 0);
export const cartCount = (items: CartLine[]) => items.reduce((s, i) => s + i.qty, 0);
