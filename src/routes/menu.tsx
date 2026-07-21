import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES, PRODUCTS } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { Eyebrow } from "@/components/motion-primitives";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — C & It's Magic" },
      { name: "description", content: "Explore signature cakes, cupcakes, desserts, fried chicken, burgers, biryani, rolls and street food from C & It's Magic." },
      { property: "og:title", content: "The Menu — C & It's Magic" },
      { property: "og:description", content: "A curated menu of cakes, desserts, and gourmet food." },
      { property: "og:url", content: "/menu" },
    ],
    links: [{ rel: "canonical", href: "/menu" }],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  const filtered = PRODUCTS.filter(
    (p) =>
      (cat === "all" || p.category === cat) &&
      (q === "" || p.name.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="pt-32">
      <section className="container-luxe pb-8">
        <Eyebrow>The Menu</Eyebrow>
        <h1 className="mt-4 font-display text-6xl leading-[1.02] text-cream md:text-7xl">
          Everything we <span className="italic gold-text">love to make</span>.
        </h1>
        <p className="mt-6 max-w-xl text-base text-muted-foreground">
          Cakes need a 24-hour head start. Everything else is on your doorstep in around three hours.
        </p>
      </section>

      <section className="container-luxe sticky top-20 z-30 pb-4">
        <div className="glass rounded-2xl p-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-xl bg-input/50 px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search dishes…"
                className="w-full bg-transparent text-sm text-cream placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCat("all")}
                className={`rounded-full border px-4 py-2 text-xs font-medium transition-all ${cat === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border text-cream/80 hover:border-primary/50"}`}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => setCat(c.slug)}
                  className={`rounded-full border px-4 py-2 text-xs font-medium transition-all ${cat === c.slug ? "border-primary bg-primary text-primary-foreground" : "border-border text-cream/80 hover:border-primary/50"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-luxe pb-24">
        {CATEGORIES.filter((c) => cat === "all" || c.slug === cat).map((c) => {
          const items = filtered.filter((p) => p.category === c.slug);
          if (items.length === 0) return null;
          return (
            <div key={c.slug} className="mt-16">
              <div className="mb-6 flex items-end justify-between border-b border-border/60 pb-4">
                <div>
                  <p className="eyebrow">{c.tagline}</p>
                  <h2 className="mt-1.5 font-display text-3xl text-cream">{c.name}</h2>
                </div>
                <Link to="/menu/$category" params={{ category: c.slug }} className="text-xs text-primary hover:underline">
                  View category
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="mt-20 text-center text-muted-foreground">No matches. Try a different search.</p>
        )}
      </section>
    </div>
  );
}
