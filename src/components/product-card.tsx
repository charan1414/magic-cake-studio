import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Star } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/data";
import { useCart } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";
import { useCatalog, pricingFor, labelMeta } from "@/lib/catalog";
import { NotifyMeButton } from "@/components/notify-me";

type StockStatus = "in" | "low" | "out";

/** Shared card logic: live stock, admin pricing, add-to-cart. */
function useProductCard(product: Product) {
  const add = useCart((s) => s.add);
  const [stock, setStock] = useState<StockStatus>(product.stock ?? "in");
  const { overrides, offers } = useCatalog();
  const override = overrides[product.slug];
  const pricing = pricingFor(product, override, offers);

  useEffect(() => {
    if (override?.availability) setStock(override.availability as StockStatus);
  }, [override?.availability]);

  useEffect(() => {
    let active = true;
    supabase
      .from("product_inventory")
      .select("stock_status, active")
      .eq("slug", product.slug)
      .maybeSingle()
      .then(({ data }) => {
        if (!active || !data) return;
        if (!data.active) setStock("out");
        else setStock((data.stock_status as StockStatus | null) ?? product.stock ?? "in");
      });
    return () => {
      active = false;
    };
  }, [product.slug, product.stock]);

  const isCake = (product.category === "cakes" || product.category === "seasonal-special") && product.unitLabel !== "1 kg";
  const addToCart = () => {
    const slug = isCake ? `${product.slug}-500` : product.slug;
    const variant = isCake ? "500 g" : product.unitLabel;
    add({ slug, name: product.name, price: pricing.price, image: product.image, variant });
  };

  return { stock, pricing, addToCart, isCake };
}

function CardImage({ product }: { product: Product }) {
  const inner = (
    <>
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent opacity-70" />
    </>
  );
  return product.landing ? (
    <a href={product.landing} className="relative block aspect-[4/5] overflow-hidden">{inner}</a>
  ) : (
    <Link to="/product/$slug" params={{ slug: product.slug }} className="relative block aspect-[4/5] overflow-hidden">{inner}</Link>
  );
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { stock, pricing, addToCart } = useProductCard(product);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:shadow-luxe"
    >
      <CardImage product={product} />
      <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
          {override?.labels.map((key) => {
            const meta = labelMeta(key);
            if (!meta) return null;
            return (
              <span key={key} className="rounded-full border border-primary/60 bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
                {meta.emoji} {meta.label}
              </span>
            );
          })}
          {pricing.discountPct > 0 && (
            <span className="rounded-full bg-red-500/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">{pricing.discountPct}% off</span>
          )}
          {product.badge && (
            <span className="rounded-full bg-cream px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink">{product.badge}</span>
          )}

          {product.bestSeller && (
            <span className="rounded-full bg-primary/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">Bestseller</span>
          )}
          {product.chefPick && (
            <span className="rounded-full border border-primary/60 bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary backdrop-blur">Chef's Pick</span>
          )}
          {stock === "low" && (
            <span className="rounded-full border border-amber-400/60 bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300 backdrop-blur">Low stock</span>
          )}
          {stock === "out" && (
            <span className="rounded-full border border-red-400/60 bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-300 backdrop-blur">Out of stock</span>
          )}
          {stock === "in" && (
            <span className="rounded-full border border-emerald-400/50 bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 backdrop-blur">In stock</span>
          )}
        </div>
        <span className={`absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-sm border ${product.veg ? "border-emerald-400/60" : "border-red-400/60"} bg-black/60 backdrop-blur`}>
          <span className={`h-2.5 w-2.5 rounded-full ${product.veg ? "bg-emerald-400" : "bg-red-400"}`} />
        </span>


      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl leading-tight text-cream">{product.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          {(() => {
            return (
              <div>
                {(product.category === "cakes" || product.category === "seasonal-special") && product.unitLabel !== "1 kg" && <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Starts at · 500 g</p>}
                <p className="font-display text-2xl text-primary">
                  ₹{pricing.price.toLocaleString("en-IN")}
                  {pricing.mrp && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground line-through">₹{pricing.mrp.toLocaleString("en-IN")}</span>
                  )}
                  {product.unitLabel && <span className="ml-1 text-xs font-normal text-muted-foreground">/ {product.unitLabel}</span>}
                </p>
                {pricing.saved > 0 && (
                  <p className="text-[11px] font-medium text-emerald-400">You save ₹{pricing.saved.toLocaleString("en-IN")}</p>
                )}
                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Star className="h-3 w-3 fill-primary text-primary" /> 4.9 · {product.prepMins < 60 ? `${product.prepMins} min` : `${Math.round(product.prepMins/60)} hr`}
                </div>
              </div>
            );
          })()}
          <AddControl stock={stock} slug={product.slug} name={product.name} onAdd={addToCart} />
        </div>

      </div>
    </motion.article>
  );
}

function AddControl({ stock, slug, name, onAdd }: { stock: StockStatus; slug: string; name: string; onAdd: () => void }) {
  if (stock === "out") return <NotifyMeButton slug={slug} productName={name} source="catalog" />;
  return (
    <button
      onClick={onAdd}
      className="btn-gold btn-gold-hover inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
    >
      <Plus className="h-3.5 w-3.5" /> Add
    </button>
  );
}

/** Mobile-first compact card: square image, tight typography, small Add button. */
export function CompactProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { stock, pricing, addToCart, isCake } = useProductCard(product);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 9) * 0.03, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card/70 transition-all duration-300 hover:border-primary/50 hover:shadow-luxe"
    >
      {(() => {
        const inner = (
          <>
            <img src={product.image} alt={product.name} loading="lazy" className="aspect-square w-full object-cover" />
            {pricing.discountPct > 0 && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-red-500/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">{pricing.discountPct}%</span>
            )}
            {stock === "out" && (
              <span className="absolute inset-x-0 bottom-0 bg-black/70 py-1 text-center text-[9px] font-semibold uppercase tracking-wider text-red-300 backdrop-blur-sm">Sold out</span>
            )}
            {stock === "low" && (
              <span className="absolute left-1.5 top-1.5 rounded-full border border-amber-400/60 bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300">Low stock</span>
            )}
            {!product.veg && (
              <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-sm border border-red-400/60 bg-black/60">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              </span>
            )}
          </>
        );
        const cls = "relative block overflow-hidden";
        return product.landing ? (
          <a href={product.landing} className={cls}>{inner}</a>
        ) : (
          <Link to="/product/$slug" params={{ slug: product.slug }} className={cls}>{inner}</Link>
        );
      })()}

      <div className="flex flex-1 flex-col gap-1 p-2">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="line-clamp-2 text-[11px] font-medium leading-snug text-cream sm:text-xs">
          {product.name}
        </Link>
        {stock === "out" ? (
          <div className="mt-auto pt-0.5">
            <p className="text-xs font-semibold text-primary">₹{pricing.price.toLocaleString("en-IN")}</p>
            <NotifyMeButton slug={product.slug} productName={product.name} source="catalog" compact />
          </div>
        ) : (
          <div className="mt-auto flex items-end justify-between gap-1 pt-0.5">
            <div className="min-w-0">
              {isCake && <p className="truncate text-[9px] uppercase tracking-wide text-muted-foreground">500 g</p>}
              <p className="text-xs font-semibold text-primary sm:text-sm">
                ₹{pricing.price.toLocaleString("en-IN")}
                {pricing.mrp && <span className="ml-1 text-[9px] font-normal text-muted-foreground line-through">₹{pricing.mrp.toLocaleString("en-IN")}</span>}
              </p>
              {pricing.saved > 0 && <p className="text-[9px] font-medium text-emerald-400">Save ₹{pricing.saved.toLocaleString("en-IN")}</p>}
            </div>
            <button
              onClick={addToCart}
              aria-label={`Add ${product.name} to cart`}
              className="btn-gold btn-gold-hover inline-flex h-7 shrink-0 items-center gap-0.5 rounded-full px-2.5 text-[11px] font-semibold"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>
        )}
      </div>
    </motion.article>
  );
}
