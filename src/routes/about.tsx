import { createFileRoute, Link } from "@tanstack/react-router";
import { Eyebrow } from "@/components/motion-primitives";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — C & It's Magic" },
      { name: "description", content: "The story, philosophy and people behind C & It's Magic — a luxury cloud kitchen from Lakkur, Malur." },
      { property: "og:title", content: "About — C & It's Magic" },
      { property: "og:description", content: "A modern maison of cakes and cuisine." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <div className="pt-32">
      <section className="container-luxe pb-24">
        <Eyebrow>Our Story</Eyebrow>
        <h1 className="mt-4 max-w-4xl font-display text-6xl leading-[1.02] text-cream md:text-7xl">
          C &amp; It's <span className="italic gold-text">Magic</span> — where every bite carries a signature.
        </h1>
        <div className="mt-14 grid gap-16 md:grid-cols-2">
          <div className="space-y-6 text-base text-muted-foreground">
            <p>What began as a passion project in Lakkur has grown into a modern maison — a cloud kitchen that treats dessert and dining with equal precision.</p>
            <p>We reject the assumption that a cloud kitchen must feel disposable. Our packaging is architectural, our garnishes are photographed before they leave, and our chefs sign every box.</p>
            <p>We build every menu the way a designer builds a collection — sourcing, sketching, tasting, refining. Nothing on our menu is there without a reason.</p>
          </div>
          <div className="space-y-4">
            <Stat n="20 km" l="Delivery radius, always fresh" />
            <Stat n="24 hr" l="Advance notice for signature cakes" />
            <Stat n="9" l="Curated categories" />
            <Stat n="1" l="Standard: cinematic" />
          </div>
        </div>
      </section>

      <section className="container-luxe pb-24">
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-10 text-center">
          <p className="eyebrow">Come taste the difference</p>
          <h2 className="mt-3 font-display text-3xl text-cream md:text-4xl">Ready to order?</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/menu" className="btn-gold btn-gold-hover rounded-full px-6 py-3 text-sm font-semibold">Explore menu</Link>
            <Link to="/cake-studio" className="rounded-full border border-primary/50 px-6 py-3 text-sm font-medium text-primary hover:bg-primary/10">Design a cake</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="flex items-baseline gap-4 border-b border-border/60 pb-4">
      <span className="font-display text-4xl gold-text">{n}</span>
      <span className="text-sm text-cream/80">{l}</span>
    </div>
  );
}
