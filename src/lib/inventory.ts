/**
 * Single source of truth for storefront pricing, stock, badges and visibility.
 *
 * Merges the static catalogue (`PRODUCTS`) with admin overrides
 * (`product_overrides`), live stock (`product_inventory`) and the healthy range
 * (`healthy_products`) into one editable row model used by the admin inventory
 * dashboard.
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS, CATEGORIES } from "@/lib/data";
import { invalidateCatalog } from "@/lib/catalog";
import { healthyImage, type HealthyProduct } from "@/lib/healthy";

export type InvSource = "catalog" | "healthy";

export type InvRow = {
  source: InvSource;
  id: string; // `${source}:${slug}`
  slug: string;
  name: string;
  category: string;
  sku: string;
  image: string;
  mrp: number; // regular price
  price: number; // sale price
  qty: number | null;
  lowStock: number | null;
  status: string;
  visible: boolean;
  labels: string[];
  display_order: number;
  updated_at: string | null;
};

export const PRODUCT_STATUSES: [string, string][] = [
  ["in", "In stock"],
  ["low", "Low stock"],
  ["out", "Out of stock"],
  ["coming-soon", "Coming soon"],
  ["discontinued", "Discontinued"],
  ["draft", "Draft"],
];

export const SORT_MODES: [string, string][] = [
  ["manual", "Manual order"],
  ["best-seller", "Best Seller first"],
  ["new-arrival", "New Arrival first"],
  ["featured", "Featured first"],
  ["trending", "Trending first"],
  ["discount", "Highest discount"],
  ["price-asc", "Lowest price"],
  ["price-desc", "Highest price"],
  ["az", "Alphabetical A–Z"],
  ["za", "Alphabetical Z–A"],
];

export const categoryName = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug)?.name ?? (slug === "healthy" ? "No Maida No Sugar" : slug);

export function discountPct(mrp: number, price: number) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 1000) / 10;
}

export function priceFromPct(mrp: number, pct: number) {
  return Math.max(0, Math.round(mrp - (mrp * pct) / 100));
}

export function savedAmount(mrp: number, price: number) {
  return mrp > price ? Math.round(mrp - price) : 0;
}

/** Sorts storefront rows by the admin-selected mode. */
export function sortRows<T extends { labels: string[]; mrp: number; price: number; name: string; display_order: number }>(
  rows: T[],
  mode: string,
): T[] {
  const has = (r: T, key: string) => r.labels.includes(key);
  const list = [...rows];
  switch (mode) {
    case "best-seller":
      return list.sort((a, b) => Number(has(b, "best-seller")) - Number(has(a, "best-seller")));
    case "new-arrival":
      return list.sort((a, b) => Number(has(b, "new-arrival")) - Number(has(a, "new-arrival")));
    case "featured":
      return list.sort((a, b) => Number(has(b, "featured")) - Number(has(a, "featured")));
    case "trending":
      return list.sort((a, b) => Number(has(b, "trending")) - Number(has(a, "trending")));
    case "discount":
      return list.sort((a, b) => discountPct(b.mrp, b.price) - discountPct(a.mrp, a.price));
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "az":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "za":
      return list.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return list.sort((a, b) => a.display_order - b.display_order);
  }
}

type OverrideRow = {
  slug: string;
  name: string | null;
  category: string | null;
  sku: string | null;
  image: string | null;
  mrp: number | null;
  price: number | null;
  availability: string;
  display_order: number;
  status: string;
  labels: string[];
  updated_at: string | null;
};

type StockRow = { slug: string; quantity_remaining: number; low_stock_threshold: number; active: boolean };

/** Loads every product across the site into a single editable list. */
export function useInventory() {
  const [rows, setRows] = useState<InvRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [{ data: ov }, { data: stock }, { data: healthy }] = await Promise.all([
      supabase.from("product_overrides").select("*"),
      supabase.from("product_inventory").select("slug, quantity_remaining, low_stock_threshold, active"),
      supabase.from("healthy_products").select("*").order("display_order"),
    ]);

    const overrides = new Map((ov ?? []).map((r) => [r.slug, r as unknown as OverrideRow]));
    const stocks = new Map((stock ?? []).map((r) => [r.slug, r as StockRow]));

    const catalogRows: InvRow[] = PRODUCTS.map((p, i) => {
      const o = overrides.get(p.slug);
      const s = stocks.get(p.slug);
      const price = Number(o?.price ?? p.price);
      const mrp = Number(o?.mrp ?? 0) || price;
      return {
        source: "catalog" as const,
        id: `catalog:${p.slug}`,
        slug: p.slug,
        name: o?.name ?? p.name,
        category: o?.category ?? p.category,
        sku: o?.sku ?? p.slug.toUpperCase(),
        image: o?.image ?? p.image,
        mrp,
        price,
        qty: s?.quantity_remaining ?? null,
        lowStock: s?.low_stock_threshold ?? null,
        status: o?.availability ?? p.stock ?? "in",
        visible: (o?.status ?? "active") !== "hidden" && (s ? s.active : true),
        labels: o?.labels ?? [],
        display_order: o?.display_order ?? i,
        updated_at: o?.updated_at ?? null,
      };
    });

    const healthyRows: InvRow[] = ((healthy ?? []) as unknown as HealthyProduct[]).map((h) => {
      const mrp = Number(h.price) || 0;
      const pct = Number(h.discount_percent) || 0;
      return {
        source: "healthy" as const,
        id: `healthy:${h.slug}`,
        slug: h.slug,
        name: h.name,
        category: "healthy",
        sku: `NMNS-${h.slug.toUpperCase()}`,
        image: healthyImage(h),
        mrp,
        price: pct > 0 ? priceFromPct(mrp, pct) : mrp,
        qty: null,
        lowStock: null,
        status: h.status,
        visible: h.enabled && h.status !== "hidden",
        labels: h.badges ?? [],
        display_order: h.display_order,
        updated_at: null,
      };
    });

    setRows([...catalogRows, ...healthyRows]);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { rows, setRows, loading, refresh };
}

/** Persists a row and records the price change in history. */
export async function saveRow(row: InvRow, before?: InvRow) {
  if (row.source === "healthy") {
    const pct = discountPct(row.mrp, row.price);
    const { error } = await supabase
      .from("healthy_products")
      .update({
        name: row.name,
        price: row.mrp,
        discount_percent: pct,
        badges: row.labels,
        status: row.status === "draft" ? "hidden" : row.status,
        display_order: row.display_order,
        enabled: row.visible,
      })
      .eq("slug", row.slug);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("product_overrides").upsert(
      {
        slug: row.slug,
        name: row.name,
        category: row.category,
        sku: row.sku,
        mrp: row.mrp > row.price ? row.mrp : null,
        price: row.price,
        availability: row.status,
        status: row.visible ? "active" : "hidden",
        labels: row.labels,
        display_order: row.display_order,
        discount_type: "none",
        discount_value: 0,
      },
      { onConflict: "slug" },
    );
    if (error) throw error;

    if (row.qty !== null || row.lowStock !== null) {
      await supabase.from("product_inventory").upsert(
        {
          slug: row.slug,
          quantity_remaining: Math.max(0, Number(row.qty ?? 0)),
          low_stock_threshold: Math.max(0, Number(row.lowStock ?? 0)),
          active: row.visible && row.status !== "discontinued",
        },
        { onConflict: "slug" },
      );
    }
    invalidateCatalog();
  }

  if (before && (before.price !== row.price || before.mrp !== row.mrp)) {
    const { data: auth } = await supabase.auth.getUser();
    await supabase.from("price_history").insert({
      source: row.source,
      slug: row.slug,
      name: row.name,
      previous_price: before.price,
      new_price: row.price,
      previous_discount: discountPct(before.mrp, before.price),
      new_discount: discountPct(row.mrp, row.price),
      changed_by: auth.user?.id ?? null,
    });
  }
}

export type PriceHistoryRow = {
  id: string;
  source: string;
  slug: string;
  name: string | null;
  previous_price: number | null;
  new_price: number | null;
  previous_discount: number | null;
  new_discount: number | null;
  created_at: string;
};

export function usePriceHistory(slug: string | null) {
  const [rows, setRows] = useState<PriceHistoryRow[]>([]);
  useEffect(() => {
    if (!slug) return setRows([]);
    let alive = true;
    supabase
      .from("price_history")
      .select("*")
      .eq("slug", slug)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => alive && setRows((data ?? []) as PriceHistoryRow[]));
    return () => {
      alive = false;
    };
  }, [slug]);
  return rows;
}
