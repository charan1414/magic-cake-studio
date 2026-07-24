import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, Plus, Star } from "lucide-react";
import type { Product } from "@/lib/data";
import { useCart } from "@/lib/cart-store";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const add = useCart((s) => s.add);
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:shadow-luxe"
    >
      <Link to="/product/$slug" params={{ slug: product.slug }} className="relative block aspect-[4/5] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent opacity-70" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.bestSeller && (
            <span className="rounded-full bg-primary/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">Bestseller</span>
          )}
          {product.chefPick && (
            <span className="rounded-full border border-primary/60 bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary backdrop-blur">Chef's Pick</span>
          )}
        </div>
        <span className={`absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-sm border ${product.veg ? "border-emerald-400/60" : "border-red-400/60"} bg-black/60 backdrop-blur`}>
          <span className={`h-2.5 w-2.5 rounded-full ${product.veg ? "bg-emerald-400" : "bg-red-400"}`} />
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl leading-tight text-cream">{product.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          </div>
          <button aria-label="Wishlist" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-cream/70 transition-colors hover:border-primary/50 hover:text-primary">
            <Heart className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          {(() => {
            const isCake = product.category === "cakes" || product.category === "seasonal-special";
            const displayPrice = product.price; // 500 g base for cakes, unit price otherwise
            return (
              <div>
                {isCake && <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Starts at · 500 g</p>}
                <p className="font-display text-2xl text-primary">₹{displayPrice.toLocaleString("en-IN")}</p>
                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Star className="h-3 w-3 fill-primary text-primary" /> 4.9 · {product.prepMins < 60 ? `${product.prepMins} min` : `${Math.round(product.prepMins/60)} hr`}
                </div>
              </div>
            );
          })()}
          <button
            onClick={() => {
              const isCake = product.category === "cakes" || product.category === "seasonal-special";
              const price = product.price;
              const slug = isCake ? `${product.slug}-500` : product.slug;
              const variant = isCake ? "500 g" : undefined;
              add({ slug, name: product.name, price, image: product.image, variant });
            }}
            className="btn-gold btn-gold-hover inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>

      </div>
    </motion.article>
  );
}
