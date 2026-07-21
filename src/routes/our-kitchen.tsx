import { createFileRoute } from "@tanstack/react-router";
import { Award, Flame, Heart, Leaf } from "lucide-react";
import { Eyebrow, Reveal } from "@/components/motion-primitives";
import craftCake from "@/assets/craft-cake.jpg";

export const Route = createFileRoute("/our-kitchen")({
  head: () => ({
    meta: [
      { title: "Our Kitchen — C & It's Magic" },
      { name: "description", content: "Inside the C & It's Magic kitchen: sourcing, standards, and the people behind every plate." },
      { property: "og:title", content: "Our Kitchen — C & It's Magic" },
      { property: "og:description", content: "Where the magic is made." },
      { property: "og:url", content: "/our-kitchen" },
      { property: "og:image", content: craftCake },
      { name: "twitter:image", content: craftCake },
    ],
    links: [{ rel: "canonical", href: "/our-kitchen" }],
  }),
  component: Kitchen,
});

const PILLARS = [
  { icon: Leaf, title: "Sourced daily", copy: "Farm-fresh dairy, seasonal fruit, single-origin cocoa. Nothing frozen, nothing forgotten." },
  { icon: Flame, title: "Slow crafted", copy: "Cakes rest overnight. Chicken brines for 24 hours. Rice tempered in real ghee." },
  { icon: Heart, title: "Made with intention", copy: "Every cake carries a story. Every plate is signed by the chef who made it." },
  { icon: Award, title: "Studio-grade finish", copy: "Trained pâtissiers. Restaurant-grade equipment. A visual bar that never breaks." },
];

function Kitchen() {
  return (
    <div className="pt-32">
      <section className="container-luxe pb-20">
        <Eyebrow>Our Kitchen</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-6xl leading-[1.02] text-cream md:text-7xl">
          A kitchen built like a <span className="italic gold-text">studio</span>.
        </h1>
        <p className="mt-6 max-w-xl text-base text-muted-foreground">
          Our workshop in Lakkur is equal parts pâtisserie and precision kitchen. Every recipe is composed, tasted, and photographed before it earns a place on the menu.
        </p>
      </section>

      <section className="container-luxe pb-24">
        <div className="relative aspect-[16/8] overflow-hidden rounded-3xl border border-border/60">
          <img src={craftCake} alt="C & It's Magic kitchen" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 max-w-lg">
            <p className="eyebrow">Est. Lakkur, Malur</p>
            <h2 className="mt-3 font-display text-3xl text-cream">A brand built on the belief that dessert deserves the same reverence as fine art.</h2>
          </div>
        </div>
      </section>

      <section className="container-luxe grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.05}>
            <div className="h-full rounded-2xl border border-border/60 bg-card/40 p-6">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-primary/40 text-primary"><p.icon className="h-4 w-4" /></span>
              <h3 className="mt-5 font-display text-xl text-cream">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.copy}</p>
            </div>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
