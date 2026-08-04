import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS, type Product } from "@/lib/data";

export type ProductOverride = {
  slug: string;
  name: string | null;
  category: string | null;
  sku: string | null;
  description: string | null;
  image: string | null;
  mrp: number | null;
  price: number | null;
  discount_type: string;
  discount_value: number;
  availability: string;
  display_order: number;
  status: string;
  labels: string[];
  pinned: boolean;
  highlighted: boolean;
};

export type Offer = {
  id: string;
  title: string;
  offer_type: string;
  discount_type: string;
  discount_value: number;
  product_slugs: string[];
  categories: string[];
  min_items: number;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
};

export type UpsellItem = {
  id: string;
  slug: string;
  promo_price: number | null;
  discount_type: string;
  discount_value: number;
  priority: number;
  tags: string[];
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
};

export type UpsellSettings = {
  enabled: boolean;
  section_title: string;
  layout: string;
  max_items: number;
};

export type RecommendationRule = {
  id: string;
  trigger_category: string;
  recommend_slugs: string[];
  recommend_categories: string[];
  priority: number;
  active: boolean;
};

export const PRODUCT_LABELS = [
  { key: "best-seller", label: "Best Seller", emoji: "🔥" },
  { key: "customer-favorite", label: "Customer Favorite", emoji: "⭐" },
  { key: "new-arrival", label: "New Arrival", emoji: "🆕" },
  { key: "limited-offer", label: "Limited Offer", emoji: "🎉" },
  { key: "chef-recommendation", label: "Chef's Recommendation", emoji: "❤️" },
  { key: "premium-choice", label: "Premium Choice", emoji: "🥇" },
];

export const UPSELL_TAGS = [
  "Best Seller",
  "Limited Offer",
  "Trending",
  "Most Ordered",
  "Chef Recommendation",
  "Fresh Today",
];

export const OFFER_TYPES = [
  { key: "flash", label: "Flash Sale" },
  { key: "festival", label: "Festival Offer" },
  { key: "weekend", label: "Weekend Offer" },
  { key: "buy-more", label: "Buy More Save More" },
  { key: "combo", label: "Combo Offer" },
];

export function labelMeta(key: string) {
  return PRODUCT_LABELS.find((l) => l.key === key);
}

export function isLive(starts_at: string | null, ends_at: string | null, active = true) {
  if (!active) return false;
  const now = Date.now();
  if (starts_at && new Date(starts_at).getTime() > now) return false;
  if (ends_at && new Date(ends_at).getTime() < now) return false;
  return true;
}

function applyDiscount(base: number, type: string, value: number) {
  if (!value || type === "none") return base;
  const out = type === "percent" ? base - (base * value) / 100 : base - value;
  return Math.max(0, Math.round(out));
}

export type Pricing = {
  price: number;
  mrp: number | null;
  discountPct: number;
  saved: number;
  offerTitle?: string;
};

/** Effective pricing for a product, considering admin overrides and live offers. */
export function pricingFor(
  product: Product,
  override?: ProductOverride,
  offers: Offer[] = [],
): Pricing {
  const listed = override?.price ?? product.price;
  const mrp = override?.mrp ?? null;
  const base = mrp ?? listed;

  let final = override && override.discount_type !== "none"
    ? applyDiscount(base, override.discount_type, Number(override.discount_value))
    : listed;

  let offerTitle: string | undefined;
  for (const offer of offers) {
    if (!isLive(offer.starts_at, offer.ends_at, offer.active)) continue;
    const matches =
      offer.product_slugs.includes(product.slug) ||
      offer.categories.includes(product.category) ||
      (offer.product_slugs.length === 0 && offer.categories.length === 0);
    if (!matches) continue;
    const candidate = applyDiscount(final, offer.discount_type, Number(offer.discount_value));
    if (candidate < final) {
      final = candidate;
      offerTitle = offer.title;
    }
  }

  const reference = mrp ?? (final < listed ? listed : 0);
  const saved = reference > final ? Math.round(reference - final) : 0;
  const discountPct = reference > final ? Math.round((saved / reference) * 100) : 0;
  return { price: final, mrp: saved > 0 ? reference : null, discountPct, saved, offerTitle };
}

export function mergeProduct(product: Product, override?: ProductOverride): Product {
  if (!override) return product;
  return {
    ...product,
    name: override.name ?? product.name,
    description: override.description ?? product.description,
    image: override.image ?? product.image,
    category: override.category ?? product.category,
    price: override.price ?? product.price,
    stock: (override.availability as Product["stock"]) ?? product.stock,
  };
}

export type CatalogState = {
  overrides: Record<string, ProductOverride>;
  offers: Offer[];
  loaded: boolean;
};

let catalogPromise: Promise<CatalogState> | null = null;

/** Fetches (and caches for the session) admin overrides + live offers. */
export function loadCatalog(): Promise<CatalogState> {
  if (!catalogPromise) {
    catalogPromise = (async () => {
      const [{ data: ov }, { data: of }] = await Promise.all([
        supabase.from("product_overrides").select("*"),
        supabase.from("offers").select("*").eq("active", true),
      ]);
      const overrides: Record<string, ProductOverride> = {};
      for (const row of (ov ?? []) as ProductOverride[]) overrides[row.slug] = row;
      return { overrides, offers: (of ?? []) as Offer[], loaded: true };
    })().catch(() => ({ overrides: {}, offers: [], loaded: true }));
  }
  return catalogPromise;
}

export function invalidateCatalog() {
  catalogPromise = null;
}

/** Loads admin overrides + live offers once per mount. */
export function useCatalog(): CatalogState {
  const [state, setState] = useState<CatalogState>({ overrides: {}, offers: [], loaded: false });

  useEffect(() => {
    let alive = true;
    loadCatalog().then((next) => alive && setState(next));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

/** Products visible on the storefront, respecting hidden status, pin + display order. */
export function visibleProducts(overrides: Record<string, ProductOverride>, list: Product[] = PRODUCTS) {
  return list
    .filter((p) => (overrides[p.slug]?.status ?? "active") !== "hidden")
    .map((p) => mergeProduct(p, overrides[p.slug]))
    .sort((a, b) => {
      const oa = overrides[a.slug];
      const ob = overrides[b.slug];
      const pin = Number(ob?.pinned ?? false) - Number(oa?.pinned ?? false);
      if (pin !== 0) return pin;
      return (oa?.display_order ?? 0) - (ob?.display_order ?? 0);
    });
}
