import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import vanilla from "@/assets/milkshakes/classic-vanilla.jpg";
import chocolate from "@/assets/milkshakes/rich-chocolate.jpg";
import oreo from "@/assets/milkshakes/oreo.jpg";
import kitkat from "@/assets/milkshakes/kitkat.jpg";
import ferrero from "@/assets/milkshakes/ferrero-rocher.jpg";
import strawberry from "@/assets/milkshakes/strawberry.jpg";
import mango from "@/assets/milkshakes/fresh-mango.jpg";
import blueberry from "@/assets/milkshakes/blueberry.jpg";
import butterscotch from "@/assets/milkshakes/butterscotch.jpg";
import belgian from "@/assets/milkshakes/belgian-chocolate.jpg";
import brownie from "@/assets/milkshakes/brownie.jpg";
import coffee from "@/assets/milkshakes/cold-coffee.jpg";
import banana from "@/assets/milkshakes/banana.jpg";
import falooda from "@/assets/milkshakes/rose-falooda.jpg";
import dryFruit from "@/assets/milkshakes/dry-fruit.jpg";
import hero from "@/assets/milkshakes/hero.jpg";

export const MILKSHAKE_HERO = hero;

/** Bundled photography used when a product has no uploaded image. */
const FALLBACK: Record<string, string> = {
  "classic-vanilla": vanilla,
  "rich-chocolate": chocolate,
  oreo,
  kitkat,
  "ferrero-rocher": ferrero,
  strawberry,
  "fresh-mango": mango,
  blueberry,
  butterscotch,
  "belgian-chocolate": belgian,
  brownie,
  "cold-coffee": coffee,
  banana,
  "rose-falooda": falooda,
  "dry-fruit": dryFruit,
};

export const MILKSHAKE_BADGES = [
  { key: "best-seller", label: "Best Seller", emoji: "🔥" },
  { key: "new-arrival", label: "New Arrival", emoji: "🆕" },
  { key: "chefs-choice", label: "Chef's Choice", emoji: "👨‍🍳" },
];

export const MILKSHAKE_STATUSES: [string, string][] = [
  ["in", "In stock"],
  ["low", "Low stock"],
  ["out", "Out of stock"],
];

export type ShakeSize = { label: string; price: number; sale_price: number | null };
export type ShakeOption = { label: string; price: number };

export type Milkshake = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  ingredients: string;
  allergens: string;
  image_url: string | null;
  image_alt: string | null;
  sizes: ShakeSize[];
  customisations: ShakeOption[];
  badges: string[];
  status: string;
  featured: boolean;
  active: boolean;
  display_order: number;
  prep_minutes: number;
};

export function milkshakeImage(p: Pick<Milkshake, "slug" | "image_url">) {
  return p.image_url || FALLBACK[p.slug] || hero;
}

export function sizePricing(s: ShakeSize) {
  const mrp = Number(s.price) || 0;
  const sale = s.sale_price != null && Number(s.sale_price) > 0 && Number(s.sale_price) < mrp ? Number(s.sale_price) : null;
  const price = sale ?? mrp;
  return { price, mrp: sale ? mrp : null, discountPct: sale ? Math.round(((mrp - sale) / mrp) * 100) : 0 };
}

/** Final unit price for a chosen size and set of customisations. */
export function shakeLinePrice(size: ShakeSize, options: ShakeOption[]) {
  return sizePricing(size).price + options.reduce((s, o) => s + (Number(o.price) || 0), 0);
}

/** Stable cart slug so different size/customisation combos are separate lines. */
export function shakeCartSlug(slug: string, size: string, options: ShakeOption[]) {
  const opt = options.map((o) => o.label).sort().join("+");
  return `shake-${slug}-${size}${opt ? `-${opt}` : ""}`.toLowerCase().replace(/[^a-z0-9+-]+/g, "-");
}

const normalise = (r: Record<string, unknown>) =>
  ({ ...r, sizes: (r.sizes as ShakeSize[]) ?? [], customisations: (r.customisations as ShakeOption[]) ?? [] }) as Milkshake;

export function useMilkshakes(all = false) {
  const [items, setItems] = useState<Milkshake[]>([]);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    let q = supabase.from("milkshakes").select("*").order("display_order", { ascending: true });
    if (!all) q = q.eq("active", true);
    const { data } = await q;
    setItems((data ?? []).map((r) => normalise(r as Record<string, unknown>)));
    setLoading(false);
  }, [all]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return { items, setItems, loading, refresh };
}

export type SiteSection = {
  key: string;
  title: string;
  subtitle: string;
  description: string;
  visible: boolean;
  show_on_home: boolean;
  home_order: number;
  nav_label: string;
  show_in_nav: boolean;
  nav_order: number;
  card_layout: string;
  per_row_desktop: number;
  per_row_mobile: number;
  home_limit: number;
  banner_url: string | null;
  promo_text: string;
  accent: string;
  show_badges: boolean;
  show_discounts: boolean;
  seo_title: string;
  seo_description: string;
  og_image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
};

export const SECTION_FALLBACK: SiteSection = {
  key: "milkshakes",
  title: "Milkshakes",
  subtitle: "Hand-blended. Thick. Unapologetically indulgent.",
  description: "",
  visible: true,
  show_on_home: true,
  home_order: 0,
  nav_label: "Milkshakes",
  show_in_nav: true,
  nav_order: 0,
  card_layout: "grid",
  per_row_desktop: 3,
  per_row_mobile: 1,
  home_limit: 4,
  banner_url: null,
  promo_text: "",
  accent: "gold",
  show_badges: true,
  show_discounts: true,
  seo_title: "",
  seo_description: "",
  og_image_url: null,
  starts_at: null,
  ends_at: null,
};

/** Is the section switched on and inside its schedule window? */
export function sectionLive(s: SiteSection) {
  const now = Date.now();
  if (!s.visible) return false;
  if (s.starts_at && new Date(s.starts_at).getTime() > now) return false;
  if (s.ends_at && new Date(s.ends_at).getTime() < now) return false;
  return true;
}

export function useSiteSection(key: string) {
  const [section, setSection] = useState<SiteSection>({ ...SECTION_FALLBACK, key });
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    const { data } = await supabase.from("site_sections").select("*").eq("key", key).maybeSingle();
    if (data) setSection({ ...SECTION_FALLBACK, ...(data as SiteSection) });
    setLoading(false);
  }, [key]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return { section, setSection, loading, refresh };
}

/** Upload to private storage and return a long-lived signed URL. */
export async function uploadProductImage(file: File, folder: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2 || !data) throw e2 ?? new Error("Could not create image link");
  return data.signedUrl;
}
