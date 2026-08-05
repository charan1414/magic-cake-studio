import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import proteinBar from "@/assets/healthy/protein-bar.jpg";
import bananaCake from "@/assets/healthy/banana-cake.jpg";
import carrotCake from "@/assets/healthy/carrot-cake.jpg";
import granolaBar from "@/assets/healthy/granola-bar.jpg";
import seedsBar from "@/assets/healthy/seeds-bar.jpg";
import dryFruitBar from "@/assets/healthy/dry-fruit-bar.jpg";
import heroBanner from "@/assets/healthy/no-maida-hero.jpg";

export const HEALTHY_HERO = heroBanner;

/** Fallback artwork shipped with the app, used when the CMS has no image URL. */
export const HEALTHY_FALLBACK_IMAGES: Record<string, string> = {
  "protein-bar": proteinBar,
  "banana-cake": bananaCake,
  "carrot-cake": carrotCake,
  "granola-bar": granolaBar,
  "seeds-bar": seedsBar,
  "dry-fruit-bar": dryFruitBar,
};

export const HEALTHY_BADGES = [
  { key: "best-seller", label: "Best Seller", emoji: "🔥" },
  { key: "healthy-choice", label: "Healthy Choice", emoji: "🌿" },
  { key: "chefs-choice", label: "Chef's Choice", emoji: "👨‍🍳" },
  { key: "customer-favorite", label: "Customer Favorite", emoji: "⭐" },
  { key: "new-arrival", label: "New Arrival", emoji: "🆕" },
  { key: "limited-offer", label: "Limited Offer", emoji: "🎉" },
  { key: "sugar-free", label: "No Sugar", emoji: "🚫🍬" },
  { key: "high-protein", label: "High Protein", emoji: "💪" },
];

export const HEALTHY_STATUSES: [string, string][] = [
  ["in", "In stock"],
  ["low", "Low stock"],
  ["out", "Out of stock"],
  ["hidden", "Hidden"],
];

export type HealthyProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  discount_percent: number;
  discount_starts_at: string | null;
  discount_ends_at: string | null;
  badges: string[];
  status: string;
  display_order: number;
  enabled: boolean;
};

export function healthyBadgeMeta(key: string) {
  return HEALTHY_BADGES.find((b) => b.key === key);
}

export function healthyImage(p: HealthyProduct) {
  return p.image_url || HEALTHY_FALLBACK_IMAGES[p.slug] || proteinBar;
}

/** Returns effective price after a live, scheduled discount. */
export function healthyPricing(p: HealthyProduct) {
  const mrp = Number(p.price) || 0;
  const pct = Number(p.discount_percent) || 0;
  const now = Date.now();
  const started = !p.discount_starts_at || new Date(p.discount_starts_at).getTime() <= now;
  const notEnded = !p.discount_ends_at || new Date(p.discount_ends_at).getTime() >= now;
  const live = pct > 0 && started && notEnded;
  const price = live ? Math.max(0, Math.round(mrp - (mrp * pct) / 100)) : mrp;
  return { price, mrp: live ? mrp : null, discountPct: live ? Math.round(pct) : 0, saved: live ? mrp - price : 0 };
}

/** Storefront list: enabled, not hidden, ordered. */
export function useHealthyProducts() {
  const [items, setItems] = useState<HealthyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    supabase
      .from("healthy_products")
      .select("*")
      .eq("enabled", true)
      .neq("status", "hidden")
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        if (!alive) return;
        setItems((data ?? []) as HealthyProduct[]);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { items, loading };
}

/** Admin list: everything, with a refresh handle. */
export function useAllHealthyProducts() {
  const [items, setItems] = useState<HealthyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("healthy_products")
      .select("*")
      .order("display_order", { ascending: true });
    setItems((data ?? []) as HealthyProduct[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, refresh, setItems };
}
