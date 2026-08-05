import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ChefHat, Play, Sparkles, Truck, Clock, MapPin, Star } from "lucide-react";
import heroImg from "@/assets/hero-cake.jpg";
import craftImg from "@/assets/craft-cake.jpg";
import { CATEGORIES, PRODUCTS, cfcBucketImg, cfcCloseupImg } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { Reveal, SplitReveal, Eyebrow } from "@/components/motion-primitives";
import { DBCShowcase } from "@/components/dbc-showcase";
import { CinematicLoop } from "@/components/cinematic-loop";
import { HealthyBanner, HealthySection } from "@/components/healthy-range";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "C & It's Magic — Where Every Bite Feels Like Magic" },
      { name: "description", content: "Premium cakes, desserts and gourmet food delivered fresh to your door in Malur. A cloud kitchen crafted with obsessive care." },
      { property: "og:title", content: "C & It's Magic — Where Every Bite Feels Like Magic" },
      { property: "og:description", content: "Handcrafted cakes, gourmet desserts and cinematic cooking, delivered with magic." },
      { property: "og:url", content: "/" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const featured = PRODUCTS.filter((p) => p.bestSeller).slice(0, 6);
  return (
    <>
      <Hero />
      <Marquee />
      <DBCShowcase />
      <CFCBanner />
      <HealthyBanner compact />
      <HealthySection limit={3} />
      <CraftSection />
      <CategoryShowcase />

      <Signatures products={featured} />
      <CakeStudioCTA />
      <Promise />
    </>
  );
}

function CFCBanner() {
  return (
    <section className="relative isolate min-h-[60svh] w-full overflow-hidden border-b border-border/60">
      <CinematicLoop frames={[cfcBucketImg, cfcCloseupImg]} duration={9} />
      <div className="absolute inset-0 bg-gradient-to-l from-ink via-ink/80 to-ink/30" />
      <div className="container-luxe relative z-10 flex min-h-[60svh] items-center justify-end py-20">
        <Reveal>
          <div className="max-w-md text-right">
            <p className="text-[11px] uppercase tracking-[0.35em] text-amber-300">Crispy · Golden · Shareable</p>
            <h2 className="mt-4 font-display text-5xl leading-tight text-cream md:text-6xl">
              The <span className="italic text-amber-300">CFC Fried Bucket</span>
            </h2>
            <p className="mt-4 text-base text-cream/80">
              Eight pieces of hand-breaded, hot &amp; crispy fried chicken — built for sharing.
            </p>
            <a
              href="/cfc-fried-bucket"
              className="btn-gold btn-gold-hover mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
            >
              Order Now · ₹599 <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-28">
      {/* Backdrop */}
      <div className="absolute inset-0 -z-10">
        <img src={heroImg} alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/50 to-transparent" />
      </div>

      {/* Floating gold particles */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {[...Array(14)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary/60"
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: [-20, -220], opacity: [0, 0.9, 0] }}
            transition={{ duration: 6 + (i % 5), repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
            style={{ left: `${(i * 7 + 12) % 92}%`, bottom: `${(i * 11) % 40}px` }}
          />
        ))}
      </div>

      <div className="container-luxe relative z-10 grid gap-10 py-16 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Eyebrow>A Luxury Cloud Kitchen · Malur</Eyebrow>
          </motion.div>

          <h1 className="mt-6 font-display text-[13vw] leading-[0.95] tracking-tight text-cream md:text-[6.2vw]">
            <SplitReveal text="Where Every" />
            <br />
            <span className="italic">
              <SplitReveal text="Bite Feels" />
            </span>{" "}
            <span className="gold-text italic">
              <SplitReveal text="Like Magic." />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.9 }}
            className="mt-8 max-w-lg text-base leading-relaxed text-cream/75 md:text-lg"
          >
            Premium cakes, patisserie desserts and gourmet food — crafted with obsessive care
            and delivered fresh to your doorstep in and around Malur.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.9 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Link to="/menu" className="btn-gold btn-gold-hover inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold">
              Order Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/menu" className="btn-outline-gold btn-outline-gold-hover inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold">
              Explore Menu
            </Link>
            <Link to="/our-kitchen" className="inline-flex items-center gap-2 rounded-full border border-transparent px-5 py-3.5 text-sm text-cream/85 transition-colors hover:text-primary">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-primary/50 text-primary"><Play className="h-3.5 w-3.5 pl-0.5" /></span>
              Watch our kitchen
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1.2 }}
            className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-border/60 pt-6"
          >
            {[
              { k: "20 km", v: "Delivery radius" },
              { k: "24 hrs", v: "Cake advance" },
              { k: "4.9 ★", v: "Guest rating" },
            ].map((s) => (
              <div key={s.k}>
                <p className="font-display text-2xl text-primary">{s.k}</p>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">{s.v}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating card */}
        <div className="relative hidden items-center justify-center md:flex">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="floaty relative w-[380px] rounded-[28px] glass-heavy p-4 shadow-luxe"
          >
            <img src={heroImg} alt="Belgian Dark Truffle" className="aspect-[4/5] w-full rounded-[20px] object-cover" />
            <div className="mt-4 flex items-center justify-between px-2 pb-2">
              <div>
                <p className="eyebrow">Signature</p>
                <p className="font-display text-xl text-cream">Belgian Dark Truffle</p>
              </div>
              <p className="font-display text-2xl gold-text">₹1499</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const words = ["Fresh Baked", "Chef Crafted", "24k Gold Leaf", "Slow Cooked", "Gourmet Everyday", "Delivered With Magic"];
  return (
    <div className="relative overflow-hidden border-y border-border/60 bg-ink/50 py-6">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        className="flex gap-14 whitespace-nowrap"
      >
        {[...words, ...words, ...words].map((w, i) => (
          <span key={i} className="flex items-center gap-14 font-display text-3xl italic text-cream/80">
            {w}
            <Sparkles className="h-4 w-4 text-primary" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function CraftSection() {
  return (
    <section className="container-luxe py-32">
      <div className="grid gap-16 md:grid-cols-2 md:items-center">
        <Reveal>
          <div className="relative">
            <img src={craftImg} alt="Handcrafted cake" className="rounded-3xl object-cover shadow-luxe" loading="lazy" />
            <div className="absolute -bottom-8 -right-6 hidden max-w-[220px] rounded-2xl glass-heavy p-5 md:block">
              <p className="eyebrow">Since day one</p>
              <p className="mt-2 font-display text-2xl text-cream">Made from scratch. Every single day.</p>
            </div>
          </div>
        </Reveal>
        <div>
          <Eyebrow>Our Craft</Eyebrow>
          <h2 className="mt-5 font-display text-5xl leading-[1.05] text-cream md:text-6xl">
            An <span className="italic gold-text">obsession</span> with the perfect bite.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
            Every cake starts with cold butter and warm intention. We temper Belgian chocolate by hand,
            hand-whip fresh cream, and finish with a touch of 24k gold leaf. Because good enough was
            never the plan.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { icon: ChefHat, k: "By hand", v: "No shortcuts, no premixes" },
              { icon: Truck, k: "Fresh", v: "Baked the day it ships" },
              { icon: Sparkles, k: "Premium", v: "Belgian couverture, real vanilla" },
            ].map(({ icon: Icon, k, v }) => (
              <div key={k}>
                <span className="grid h-9 w-9 place-items-center rounded-full border border-primary/40 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-3 font-display text-lg text-cream">{k}</p>
                <p className="mt-1 text-xs text-muted-foreground">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryShowcase() {
  return (
    <section className="container-luxe py-24">
      <div className="mb-14 flex flex-col items-end justify-between gap-6 md:flex-row">
        <div>
          <Eyebrow>Explore the Menu</Eyebrow>
          <h2 className="mt-4 max-w-xl font-display text-5xl leading-tight text-cream">
            A universe of <span className="italic gold-text">flavor</span>.
          </h2>
        </div>
        <Link to="/menu" className="inline-flex items-center gap-2 text-sm text-primary hover:gap-3 transition-all">
          See full menu <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {CATEGORIES.slice(0, 6).map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.05}>
            <Link
              to="/menu/$category"
              params={{ category: c.slug }}
              className="group relative flex h-52 items-end overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 transition-all hover:border-primary/50 hover:shadow-luxe"
            >
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl transition-all group-hover:bg-primary/20" />
              <div className="relative">
                <p className="eyebrow">{c.tagline}</p>
                <p className="mt-2 font-display text-3xl text-cream group-hover:gold-text">{c.name}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs text-cream/70 group-hover:text-primary">
                  Discover <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Signatures({ products }: { products: typeof PRODUCTS }) {
  return (
    <section className="container-luxe py-24">
      <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
        <div>
          <Eyebrow>Guest Favourites</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-5xl leading-tight text-cream">
            Signature <span className="italic gold-text">indulgences</span>.
          </h2>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
      </div>
    </section>
  );
}

function CakeStudioCTA() {
  return (
    <section className="container-luxe py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-[32px] border border-primary/30 glass-heavy p-10 md:p-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/20 blur-[100px]" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-cocoa/40 blur-[100px]" />
          <div className="relative grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <Eyebrow>Signature Feature</Eyebrow>
              <h2 className="mt-4 font-display text-5xl leading-[1.05] text-cream md:text-6xl">
                Design your dream cake in the <span className="italic gold-text">Cake Studio</span>.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
                Choose shape, flavor, filling, frosting and decoration. Watch the price update
                as you compose. Save it, share it, order it. Every design gets its own unique
                Cake Design ID.
              </p>
              <Link to="/cake-studio" className="btn-gold btn-gold-hover mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold">
                Enter the Studio <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative">
              <motion.div
                className="floaty relative aspect-square rounded-full border border-primary/40 bg-gradient-to-br from-cocoa via-ink to-primary/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, ease: "linear", repeat: Infinity }}
              >
                <div className="absolute inset-6 rounded-full bg-gradient-to-br from-primary/30 to-cocoa" />
                <div className="absolute inset-16 rounded-full bg-gradient-to-br from-cream/20 to-primary/40" />
                <div className="absolute inset-24 rounded-full bg-primary/60 shadow-[0_0_60px_20px_oklch(0.82_0.13_82_/_0.4)]" />
              </motion.div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Promise() {
  const items = [
    { icon: Clock, k: "24 hrs advance", v: "Cakes are hand-decorated to order — plan a day ahead." },
    { icon: Truck, k: "3-hour delivery", v: "Standard food orders reach you within three hours." },
    { icon: MapPin, k: "20 km around Lakkur", v: "Currently serving Malur and surrounding villages." },
    { icon: Star, k: "Loyalty & rewards", v: "Earn points, unlock birthday treats and referrals." },
  ];
  return (
    <section className="container-luxe py-24">
      <Eyebrow>The Promise</Eyebrow>
      <h2 className="mt-4 max-w-2xl font-display text-5xl leading-tight text-cream">
        The way we <span className="italic gold-text">deliver magic</span>.
      </h2>
      <div className="mt-12 grid gap-5 md:grid-cols-4">
        {items.map(({ icon: Icon, k, v }, i) => (
          <Reveal key={k} delay={i * 0.06}>
            <div className="h-full rounded-2xl border border-border/60 bg-card/60 p-6 transition-colors hover:border-primary/40">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-primary/40 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-4 font-display text-xl text-cream">{k}</p>
              <p className="mt-2 text-sm text-muted-foreground">{v}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
