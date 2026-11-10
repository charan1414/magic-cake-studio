import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Clock, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Eyebrow, Reveal } from "@/components/motion-primitives";
import { NotifyMeButton } from "@/components/notify-me";
import { useCart } from "@/lib/cart-store";
import {
  MILKSHAKE_BADGES,
  MILKSHAKE_HERO,
  milkshakeImage,
  sectionLive,
  shakeCartSlug,
  shakeLinePrice,
  sizePricing,
  useMilkshakes,
  useSiteSection,
  type Milkshake,
  type ShakeOption,
  type SiteSection,
} from "@/lib/milkshakes";

const COLS_D: Record<number, string> = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" };
const COLS_M: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-2" };

export function MilkshakeBanner({ section, compact = false }: { section: SiteSection; compact?: boolean }) {
  return (
    <section className={`relative isolate w-full overflow-hidden border-y border-border/60 ${compact ? "min-h-[48svh]" : "min-h-[62svh]"}`}>
      <img src={section.banner_url || MILKSHAKE_HERO} alt="Assorted premium milkshakes" className="absolute inset-0 h-full w-full object-cover object-right" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/10" />
      <div className={`container-luxe relative z-10 flex items-center py-20 ${compact ? "min-h-[48svh]" : "min-h-[62svh]"}`}>
        <Reveal>
          <div className="max-w-xl">
            {section.promo_text && <Eyebrow>{section.promo_text}</Eyebrow>}
            <h2 className="mt-5 font-display text-5xl leading-[1.03] text-cream md:text-7xl">
              <span className="italic gold-text">{section.title}</span>
            </h2>
            <p className="mt-5 text-lg text-cream/85">{section.subtitle}</p>
            {section.description && <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/70">{section.description}</p>}
            {compact && (
              <Link to="/milkshakes" className="btn-gold btn-gold-hover mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold">
                Explore milkshakes <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function MilkshakeCard({ product, section, index = 0 }: { product: Milkshake; section: SiteSection; index?: number }) {
  const add = useCart((s) => s.add);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [opts, setOpts] = useState<ShakeOption[]>([]);
  const size = product.sizes[sizeIdx] ?? product.sizes[0];
  const [imgOk, setImgOk] = useState(true);
  if (!size) return null;
  const { mrp, discountPct } = sizePricing(size);
  const total = shakeLinePrice(size, opts);
  const out = product.status === "out";
  const toggle = (o: ShakeOption) =>
    setOpts((p) => (p.some((x) => x.label === o.label) ? p.filter((x) => x.label !== o.label) : [...p, o]));

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/50 transition-all hover:border-primary/50 hover:shadow-luxe"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={imgOk ? milkshakeImage(product) : MILKSHAKE_HERO}
          onError={() => setImgOk(false)}
          alt={product.image_alt || product.name}
          width={800}
          height={1000}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${out ? "grayscale" : ""}`}
        />
        {section.show_badges && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.badges.map((b) => {
              const m = MILKSHAKE_BADGES.find((x) => x.key === b);
              return m ? (
                <span key={b} className="rounded-full bg-ink/80 px-2.5 py-1 text-[10px] uppercase tracking-wider text-cream backdrop-blur">
                  {m.emoji} {m.label}
                </span>
              ) : null;
            })}
          </div>
        )}
        {section.show_discounts && discountPct > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-semibold text-destructive-foreground">{discountPct}% OFF</span>
        )}
        {product.status !== "in" && (
          <span className={`absolute bottom-3 left-3 rounded-full border bg-ink/80 px-2.5 py-1 text-[10px] uppercase tracking-wider backdrop-blur ${out ? "border-red-400/50 text-red-300" : "border-amber-400/50 text-amber-300"}`}>
            {out ? "Out of stock" : "Low stock"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-2xl text-cream">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{product.short_description}</p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"><Clock className="h-3 w-3" /> Ready in ~{product.prep_minutes} min</p>

        {product.sizes.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
            {product.sizes.map((s, i) => (
              <button
                key={s.label}
                role="radio"
                aria-checked={i === sizeIdx}
                onClick={() => setSizeIdx(i)}
                className={`min-h-9 rounded-full border px-3.5 text-xs transition-colors ${i === sizeIdx ? "border-primary bg-primary/15 text-primary" : "border-border/60 text-cream/80 hover:border-primary/50"}`}
              >
                {s.label} · ₹{sizePricing(s).price}
              </button>
            ))}
          </div>
        )}

        {product.customisations.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.customisations.map((o) => {
              const on = opts.some((x) => x.label === o.label);
              return (
                <button
                  key={o.label}
                  onClick={() => toggle(o)}
                  aria-pressed={on}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${on ? "border-primary bg-primary/15 text-primary" : "border-border/50 text-muted-foreground hover:text-cream"}`}
                >
                  {on ? "✓ " : "+ "}
                  {o.label}
                  {Number(o.price) > 0 ? ` ₹${o.price}` : ""}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            {section.show_discounts && mrp && <p className="text-xs text-muted-foreground line-through">₹{mrp}</p>}
            <p className="font-display text-3xl gold-text">₹{total}</p>
          </div>
          {out ? (
            <NotifyMeButton slug={`shake-${product.slug}`} productName={product.name} />
          ) : (
            <button
              onClick={() => {
                const variant = [size.label, ...opts.map((o) => o.label)].join(" · ");
                add({ slug: shakeCartSlug(product.slug, size.label, opts), name: product.name, price: total, image: milkshakeImage(product), variant });
                toast.success(`${product.name} added to cart`);
              }}
              className="btn-gold btn-gold-hover inline-flex min-h-10 items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function MilkshakeGrid({ items, section }: { items: Milkshake[]; section: SiteSection }) {
  const cols = `${COLS_M[section.per_row_mobile] ?? "grid-cols-1"} sm:grid-cols-2 ${COLS_D[section.per_row_desktop] ?? "lg:grid-cols-3"}`;
  return (
    <div className={`grid gap-5 ${cols}`}>
      {items.map((p, i) => (
        <MilkshakeCard key={p.id} product={p} section={section} index={i} />
      ))}
    </div>
  );
}

/** Homepage block: banner + featured shakes, fully controlled from Admin. */
export function MilkshakeHomeSection() {
  const { section, loading } = useSiteSection("milkshakes");
  const { items } = useMilkshakes();
  if (loading || !sectionLive(section) || !section.show_on_home) return null;
  const featured = items.filter((p) => p.featured);
  const list = (featured.length ? featured : items).slice(0, section.home_limit);
  return (
    <>
      <MilkshakeBanner section={section} compact />
      {list.length > 0 && (
        <section className="container-luxe py-10 md:py-20">
          <div className="mb-5 flex items-end justify-between gap-3 md:mb-10 md:gap-6">
            <h2 className="font-display text-2xl text-cream md:text-5xl">Featured <span className="italic gold-text">shakes</span></h2>
            <Link to="/milkshakes" className="inline-flex shrink-0 items-center gap-1 text-xs text-primary hover:gap-2 md:gap-2 md:text-sm">See all <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" /></Link>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 lg:grid-cols-4">
            {list.map((product) => (
              <Link key={product.id} to="/milkshakes" className="group min-w-0 overflow-hidden rounded-lg border border-border/60 bg-card/50 transition-colors hover:border-primary/50 sm:rounded-xl">
                <div className="relative aspect-square overflow-hidden">
                  <img src={milkshakeImage(product)} alt={product.image_alt || product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {product.badges[0] && section.show_badges && (
                    <span className="absolute left-1 top-1 rounded-full bg-ink/80 px-1 py-0.5 text-[8px] text-cream sm:left-2 sm:top-2 sm:px-2 sm:text-[10px]">
                      {MILKSHAKE_BADGES.find((badge) => badge.key === product.badges[0])?.label}
                    </span>
                  )}
                </div>
                <div className="p-1.5 sm:p-3">
                  <p className="line-clamp-2 min-h-7 text-[10px] font-medium leading-tight text-cream sm:min-h-10 sm:text-sm">{product.name}</p>
                  <p className="mt-1 text-[10px] font-semibold text-primary sm:text-sm">From ₹{sizePricing(product.sizes[0]).price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
