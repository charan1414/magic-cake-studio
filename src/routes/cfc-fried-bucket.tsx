import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Drumstick, Flame, HandPlatter, ShoppingBag, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import cfcCloseup from "@/assets/cfc-closeup.jpg";
import cfcBucketOpen from "@/assets/cfc-bucket-open.jpg";
import cfcPlated from "@/assets/cfc-plated.jpg";
import cfcHeroAsset from "@/assets/cfc-hero.png.asset.json";
const cfcHero = cfcHeroAsset.url;
import { CinematicLoop } from "@/components/cinematic-loop";
import { PinChecker } from "@/components/pin-checker";
import { ProductCard } from "@/components/product-card";
import { Reveal, Eyebrow } from "@/components/motion-primitives";
import { getProduct, PRODUCTS } from "@/lib/data";
import { useCart } from "@/lib/cart-store";
import { usePin } from "@/lib/pin-store";

export const Route = createFileRoute("/cfc-fried-bucket")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "CFC Fried Bucket · ₹599 — C & It's Magic" },
      { name: "description", content: "Eight pieces of hand-breaded, hot & crispy fried chicken, cooked fresh to order and built for sharing. Just ₹599, delivered around Malur." },
      { property: "og:title", content: "CFC Fried Bucket · Just ₹599" },
      { property: "og:description", content: "Crispy. Golden. Unapologetically Good. Eight pieces of signature hand-breaded fried chicken." },
      { property: "og:type", content: "product" },
      { property: "og:url", content: "https://magic-cake-studio.lovable.app/cfc-fried-bucket" },
    ],
    links: [{ rel: "canonical", href: "https://magic-cake-studio.lovable.app/cfc-fried-bucket" }],
  }),
  component: CfcBucketPage,
});

const PRICE = 599;

function CfcBucketPage() {
  const product = getProduct("cfc-fried-bucket");
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const serviceable = usePin((s) => s.serviceable);
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    if (!product) return;
    add({ slug: product.slug, name: product.name, price: PRICE, image: product.image });
    setAdded(true);
    openCart();
  };

  const pairsWith = PRODUCTS.filter((p) =>
    ["ck-choco-chip", "ic-chocolate-delight", "loaded-fries"].includes(p.slug),
  );

  return (
    <div className="pb-28 md:pb-0">
      {/* 1 · Hero */}
      <section className="relative isolate flex min-h-[92svh] items-center overflow-hidden">
        <CinematicLoop frames={[cfcHero]} duration={12} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/70 to-ink" />
        <div className="container-luxe relative z-10 py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[11px] uppercase tracking-[0.4em] text-amber-300">Signature Bucket</p>
            <h1 className="mx-auto mt-6 max-w-3xl font-display text-6xl leading-[0.95] text-cream md:text-8xl">
              CFC <span className="italic text-amber-300">Fried Bucket</span>
            </h1>
            <p className="mt-6 text-lg text-cream/80">Crispy. Golden. Unapologetically Good.</p>

            <div className="mt-8 inline-flex -rotate-2 items-center gap-3 rounded-md bg-amber-400 px-7 py-3 shadow-luxe">
              <Flame className="h-5 w-5 text-ink" />
              <span className="font-display text-3xl font-semibold text-ink">JUST ₹{PRICE}</span>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={addToCart}
                className="btn-gold btn-gold-hover inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold"
              >
                Order Now <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#delivery"
                className="btn-outline-gold btn-outline-gold-hover inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold"
              >
                Check Delivery
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2 · What's in the bucket */}
      <section className="container-luxe py-24">
        <Reveal>
          <Eyebrow>What's in the bucket</Eyebrow>
          <h2 className="mt-4 font-display text-5xl text-cream">Everything you get.</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Drumstick, k: "8 pieces", v: "Hand-breaded, hot & crispy fried chicken" },
            { icon: Flame, k: "Fried to order", v: "Never held under a lamp — straight from the fryer" },
            { icon: HandPlatter, k: "Dips included", v: "House dips served alongside (selection varies)" },
            { icon: Users, k: "Serves 3–4", v: "A bucket built for sharing" },
          ].map(({ icon: Icon, k, v }, i) => (
            <Reveal key={k} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-amber-400/25 bg-card/60 p-6">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-amber-400/50 text-amber-300">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-4 font-display text-xl text-cream">{k}</p>
                <p className="mt-2 text-sm text-muted-foreground">{v}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3 · Close-up gallery */}
      <section className="py-8">
        <div className="container-luxe">
          <Reveal>
            <Eyebrow>Up close</Eyebrow>
          </Reveal>
        </div>
        <div className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 md:px-12">
          {[
            { src: cfcHero, alt: "Crispy fried chicken with fries and dip" },
            { src: cfcBucketOpen, alt: "The bucket being opened, steam rising" },
            { src: cfcPlated, alt: "Fried chicken plated with dips" },
          ].map((g) => (
            <img
              key={g.alt}
              src={g.src}
              alt={g.alt}
              loading="lazy"
              className="h-[320px] w-[85vw] max-w-[520px] shrink-0 snap-center rounded-3xl object-cover shadow-luxe md:h-[420px]"
            />
          ))}
        </div>
      </section>

      {/* 4 · Why you'll love it */}
      <section className="container-luxe py-24">
        <Reveal>
          <Eyebrow>Why you'll love it</Eyebrow>
          <h2 className="mt-4 font-display text-5xl text-cream">
            Fried the <span className="italic text-amber-300">long way</span>.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { icon: Sparkles, t: "Hand-breaded in-house, piece by piece" },
            { icon: Flame, t: "Cooked fresh to order, never pre-fried" },
            { icon: Users, t: "Portioned for sharing — a table pleaser" },
          ].map(({ icon: Icon, t }, i) => (
            <Reveal key={t} delay={i * 0.07}>
              <div className="flex h-full items-start gap-4 rounded-2xl border border-border/60 bg-card/60 p-6">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-amber-400/50 text-amber-300">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-sm leading-relaxed text-cream/85">{t}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 5 · Delivery PIN checker */}
      <section id="delivery" className="container-luxe py-16">
        <Reveal>
          <div className="mx-auto max-w-xl">
            <Eyebrow>Delivery</Eyebrow>
            <h2 className="mt-4 font-display text-4xl text-cream">Can we reach you?</h2>
            <div className="mt-6">
              <PinChecker variant="panel" subtotal={PRICE} />
            </div>
            <button
              onClick={addToCart}
              disabled={serviceable === false}
              className="btn-gold btn-gold-hover mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />
              {serviceable === false ? "Not serviceable yet" : added ? "Added · Add another" : `Add to Cart · ₹${PRICE}`}
            </button>
          </div>
        </Reveal>
      </section>

      {/* 6 · Pairs well with */}
      <section className="container-luxe py-24">
        <Reveal>
          <Eyebrow>Pairs well with</Eyebrow>
          <h2 className="mt-4 font-display text-5xl text-cream">Make it a feast.</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pairsWith.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>
        <div className="mt-10">
          <Link to="/menu/$category" params={{ category: "fried-chicken" }} className="inline-flex items-center gap-2 text-sm text-amber-300 transition-all hover:gap-3">
            See the full Fried Chicken menu <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 7 · Sticky mobile order bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-400/30 bg-ink/95 px-5 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">CFC Fried Bucket</p>
            <p className="font-display text-2xl text-amber-300">JUST ₹{PRICE}</p>
          </div>
          <button
            onClick={addToCart}
            disabled={serviceable === false}
            className="btn-gold btn-gold-hover inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
          >
            <ShoppingBag className="h-4 w-4" /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
