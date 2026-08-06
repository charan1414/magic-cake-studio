import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Leaf, ShoppingBag, Sparkles, Wheat } from "lucide-react";
import { toast } from "sonner";
import { Reveal, Eyebrow } from "@/components/motion-primitives";
import { NotifyMeButton } from "@/components/notify-me";
import { useCart } from "@/lib/cart-store";
import { sortRows } from "@/lib/inventory";
import {
  HEALTHY_HERO,
  healthyBadgeMeta,
  healthyImage,
  healthyPricing,
  useHealthyProducts,
  useHealthySettings,
  type HealthyBlock,
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
          {out ? (
            <NotifyMeButton slug={product.slug} productName={product.name} />
          ) : (
            <button
              onClick={() => {
                add({ slug: `healthy-${product.slug}`, name: product.name, price, image: healthyImage(product), variant: "No Maida · No Sugar" });
                toast.success(`${product.name} added to cart`);
              }}
              className="btn-gold btn-gold-hover inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/** Full collection grid, CMS-driven with admin-controlled sorting. */
export function HealthySection({ limit }: { limit?: number }) {
  const { items, loading } = useHealthyProducts();
  const { settings } = useHealthySettings();

  const ordered = sortRows(
    items.map((p) => {
      const { price, mrp } = healthyPricing(p);
      return { ...p, labels: p.badges ?? [], price, mrp: mrp ?? price };
    }),
    settings.sort_mode,
  );
  const list = limit ? ordered.slice(0, limit) : ordered;

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

function BlockGrid({ blocks, cols }: { blocks: HealthyBlock[]; cols: string }) {
  return (
    <div className={`mt-12 grid gap-5 ${cols}`}>
      {blocks.map((b, i) => (
        <Reveal key={`${b.title}-${i}`} delay={i * 0.06}>
          <div className="h-full rounded-2xl border border-border/60 bg-card/50 p-6 transition-colors hover:border-emerald-400/40">
            <p className="font-display text-2xl text-cream">{b.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/** Cinematic CMS-driven storytelling sections: ingredients, nutrition, process. */
export function HealthyStory() {
  const { settings, loading } = useHealthySettings();
  if (loading) return null;
  const { ingredients, nutrition, process } = settings;

  return (
    <>
      {ingredients.length > 0 && (
        <section className="border-y border-border/60 bg-black/30 py-24">
          <div className="container-luxe">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.3em] text-emerald-300">
              <Wheat className="h-3.5 w-3.5" /> Ingredients
            </span>
            <h2 className="mt-6 max-w-2xl font-display text-5xl leading-tight text-cream">
              {settings.ingredients_title}
            </h2>
            <BlockGrid blocks={ingredients} cols="md:grid-cols-2 lg:grid-cols-4" />
          </div>
        </section>
      )}

      {nutrition.length > 0 && (
        <section className="container-luxe py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.3em] text-primary">
            <Flame className="h-3.5 w-3.5" /> Nutrition
          </span>
          <h2 className="mt-6 max-w-2xl font-display text-5xl leading-tight text-cream">
            {settings.nutrition_title}
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {nutrition.map((n, i) => (
              <Reveal key={`${n.title}-${i}`} delay={i * 0.06}>
                <div className="h-full rounded-2xl border border-border/60 bg-gradient-to-b from-card/70 to-card/20 p-7 text-center">
                  <p className="font-display text-5xl gold-text">{n.title}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{n.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {process.length > 0 && (
        <section className="border-t border-border/60 py-24">
          <div className="container-luxe">
            <span className="inline-flex items-center gap-2 rounded-full border border-cream/25 bg-white/5 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.3em] text-cream/80">
              <Sparkles className="h-3.5 w-3.5" /> The craft
            </span>
            <h2 className="mt-6 max-w-2xl font-display text-5xl leading-tight text-cream">
              {settings.process_title}
            </h2>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {process.map((s, i) => (
                <Reveal key={`${s.title}-${i}`} delay={i * 0.08}>
                  <div className="relative h-full rounded-2xl border border-border/60 bg-card/50 p-7">
                    <span className="font-display text-6xl leading-none text-primary/25">0{i + 1}</span>
                    <p className="mt-4 font-display text-2xl text-cream">{s.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

