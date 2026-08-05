import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Reveal, Eyebrow } from "@/components/motion-primitives";
import { useCart } from "@/lib/cart-store";
import {
  HEALTHY_HERO,
  healthyBadgeMeta,
  healthyImage,
  healthyPricing,
  useHealthyProducts,
  type HealthyProduct,
} from "@/lib/healthy";

/** Cinematic banner for the No Maida No Sugar collection. */
export function HealthyBanner({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`relative isolate w-full overflow-hidden border-y border-border/60 ${compact ? "min-h-[52svh]" : "min-h-[68svh]"}`}>
      <img src={HEALTHY_HERO} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/20" />
      <div className={`container-luxe relative z-10 flex items-center py-20 ${compact ? "min-h-[52svh]" : "min-h-[68svh]"}`}>
        <Reveal>
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.3em] text-emerald-300">
              <Leaf className="h-3.5 w-3.5" /> Guilt-free
            </span>
            <h2 className="mt-6 font-display text-5xl leading-[1.03] text-cream md:text-7xl">
              No Maida. <span className="italic gold-text">No Sugar.</span>
              <br />
              All Magic.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-cream/75">
              A clean-label range baked with whole grains, jaggery, dates and honey — the same
              obsessive craft, none of the refined flour or white sugar.
            </p>
            <Link
              to="/no-maida-no-sugar"
              className="btn-gold btn-gold-hover mt-9 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
            >
              Explore the range <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function HealthyCard({ product, index = 0 }: { product: HealthyProduct; index?: number }) {
  const add = useCart((s) => s.add);
  const { price, mrp, discountPct, saved } = healthyPricing(product);
  const out = product.status === "out";
  const low = product.status === "low";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/50 transition-all hover:border-emerald-400/40 hover:shadow-luxe"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={healthyImage(product)}
          alt={product.name}
          width={1024}
          height={768}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${out ? "grayscale" : ""}`}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.badges.map((b) => {
            const meta = healthyBadgeMeta(b);
            if (!meta) return null;
            return (
              <span key={b} className="rounded-full bg-ink/80 px-2.5 py-1 text-[10px] uppercase tracking-wider text-cream backdrop-blur">
                {meta.emoji} {meta.label}
              </span>
            );
          })}
        </div>
        {discountPct > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-red-500/90 px-2.5 py-1 text-[11px] font-semibold text-white">
            {discountPct}% OFF
          </span>
        )}
        <span
          className={`absolute bottom-3 left-3 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider backdrop-blur ${
            out
              ? "border-red-400/50 bg-ink/80 text-red-300"
              : low
                ? "border-amber-400/50 bg-ink/80 text-amber-300"
                : "border-emerald-400/50 bg-ink/80 text-emerald-300"
          }`}
        >
          {out ? "Out of stock" : low ? "Low stock" : "In stock"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-2xl text-cream">{product.name}</h3>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        )}
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            {mrp && <p className="text-xs text-muted-foreground line-through">₹{mrp.toLocaleString("en-IN")}</p>}
            <p className="font-display text-3xl gold-text">₹{price.toLocaleString("en-IN")}</p>
            {saved > 0 && <p className="text-[11px] text-emerald-400">You save ₹{saved.toLocaleString("en-IN")}</p>}
          </div>
          <button
            disabled={out}
            onClick={() => {
              add({ slug: `healthy-${product.slug}`, name: product.name, price, image: healthyImage(product), variant: "No Maida · No Sugar" });
              toast.success(`${product.name} added to cart`);
            }}
            className="btn-gold btn-gold-hover inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> {out ? "Sold out" : "Add to Cart"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

/** Full collection grid, CMS-driven. */
export function HealthySection({ limit }: { limit?: number }) {
  const { items, loading } = useHealthyProducts();
  const list = limit ? items.slice(0, limit) : items;

  if (!loading && list.length === 0) return null;

  return (
    <section className="container-luxe py-24">
      <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
        <div>
          <Eyebrow>No Maida · No Sugar</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-5xl leading-tight text-cream">
            Clean indulgence, <span className="italic gold-text">zero compromise</span>.
          </h2>
        </div>
        {limit && (
          <Link to="/no-maida-no-sugar" className="inline-flex items-center gap-2 text-sm text-primary transition-all hover:gap-3">
            See the full range <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl border border-border/60 bg-card/40" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <HealthyCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
