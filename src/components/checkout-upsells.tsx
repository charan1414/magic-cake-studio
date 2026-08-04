import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS } from "@/lib/data";
import { useCart } from "@/lib/cart-store";
import {
  isLive,
  pricingFor,
  useCatalog,
  type RecommendationRule,
  type UpsellItem,
  type UpsellSettings,
} from "@/lib/catalog";

/**
 * Admin-managed "Complete your order" block. Products, promotional pricing,
 * badges, ordering, layout and section title all come from the admin panel.
 */
export function CheckoutUpsells({ cartSlugs }: { cartSlugs: string[] }) {
  const add = useCart((s) => s.add);
  const { overrides, offers } = useCatalog();
  const [settings, setSettings] = useState<UpsellSettings | null>(null);
  const [items, setItems] = useState<UpsellItem[]>([]);
  const [rules, setRules] = useState<RecommendationRule[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [s, i, r] = await Promise.all([
        supabase.from("upsell_settings").select("*").maybeSingle(),
        supabase.from("upsell_items").select("*").eq("active", true),
        supabase.from("recommendation_rules").select("*").eq("active", true).order("priority", { ascending: false }),
      ]);
      if (!alive) return;
      setSettings((s.data as UpsellSettings | null) ?? null);
      setItems((i.data as UpsellItem[] | null) ?? []);
      setRules((r.data as RecommendationRule[] | null) ?? []);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const inCart = useMemo(() => {
    const set = new Set<string>();
    for (const slug of cartSlugs) {
      set.add(slug);
      set.add(slug.replace(/-\d+$/, ""));
    }
    return set;
  }, [cartSlugs]);

  const cartCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const slug of inCart) {
      const p = PRODUCTS.find((x) => x.slug === slug);
      if (p) cats.add(p.category);
    }
    return cats;
  }, [inCart]);

  const picks = useMemo(() => {
    const max = settings?.max_items ?? 6;

    // 1. Curated upsells scheduled by the admin.
    const curated = items
      .filter((it) => isLive(it.starts_at, it.ends_at, it.active) && !inCart.has(it.slug))
      .sort((a, b) => b.priority - a.priority)
      .map((it) => ({ item: it, product: PRODUCTS.find((p) => p.slug === it.slug) }))
      .filter((x) => x.product);

    // 2. Smart recommendation rules based on what's already in the basket.
    const ruleSlugs: string[] = [];
    for (const rule of rules) {
      if (!cartCategories.has(rule.trigger_category)) continue;
      ruleSlugs.push(...rule.recommend_slugs);
      for (const cat of rule.recommend_categories) {
        ruleSlugs.push(...PRODUCTS.filter((p) => p.category === cat).map((p) => p.slug));
      }
    }

    const seen = new Set(curated.map((c) => c.item.slug));
    const fromRules = ruleSlugs
      .filter((s) => !seen.has(s) && !inCart.has(s))
      .filter((s, idx, arr) => arr.indexOf(s) === idx)
      .map((s) => ({ item: undefined as UpsellItem | undefined, product: PRODUCTS.find((p) => p.slug === s) }))
      .filter((x) => x.product);

    return [...curated, ...fromRules].slice(0, max);
  }, [items, rules, inCart, cartCategories, settings]);

  if (!settings?.enabled || picks.length === 0) return null;

  const grid = settings.layout === "grid";

  return (
    <div className="rounded-3xl border border-primary/25 bg-primary/5 p-6">
      <h2 className="font-display text-2xl text-cream">{settings.section_title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">Small additions our guests love alongside this basket.</p>
      <div
        className={
          grid
            ? "mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            : "mt-5 flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        }
      >
        {picks.map(({ item, product }) => {
          if (!product) return null;
          const base = pricingFor(product, overrides[product.slug], offers);
          let price = base.price;
          if (item) {
            if (item.promo_price != null) price = Number(item.promo_price);
            else if (item.discount_type === "percent") price = Math.max(0, Math.round(price - (price * Number(item.discount_value)) / 100));
            else if (item.discount_type === "amount") price = Math.max(0, Math.round(price - Number(item.discount_value)));
          }
          const strike = price < base.price ? base.price : base.mrp;
          return (
            <div
              key={product.slug}
              className={`overflow-hidden rounded-2xl border border-border/60 bg-card/60 ${grid ? "" : "w-48 shrink-0 snap-start"}`}
            >
              <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" loading="lazy" />
              <div className="p-3">
                {item?.tags?.length ? (
                  <span className="mb-1.5 inline-flex rounded-full border border-primary/50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                    {item.tags[0]}
                  </span>
                ) : null}
                <p className="line-clamp-1 text-sm font-medium text-cream">{product.name}</p>
                <p className="mt-1 text-xs gold-text">
                  ₹{price.toLocaleString("en-IN")}
                  {strike && strike > price ? (
                    <span className="ml-1.5 text-muted-foreground line-through">₹{strike.toLocaleString("en-IN")}</span>
                  ) : null}
                  {product.unitLabel ? ` / ${product.unitLabel}` : ""}
                </p>
                <button
                  onClick={() => {
                    add({ slug: product.slug, name: product.name, price, image: product.image, variant: product.unitLabel });
                    toast.success(`Added · ${product.name}`);
                  }}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-primary/50 py-2 text-xs font-medium text-primary hover:bg-primary/10"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
