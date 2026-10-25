import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { CATEGORIES, PRODUCTS } from "@/lib/data";
import { CompactProductCard } from "@/components/product-card";
import { Eyebrow } from "@/components/motion-primitives";
import { TrustBadge } from "@/components/trust-badge";

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

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

function MenuPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("featured");

  const filtered = useMemo(() => {
    const base = PRODUCTS.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (q === "" ||
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.category.toLowerCase().includes(q.toLowerCase())),
    );
    if (sort === "price-asc") return [...base].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...base].sort((a, b) => b.price - a.price);
    if (sort === "name") return [...base].sort((a, b) => a.name.localeCompare(b.name));
    return base;
  }, [q, cat, sort]);

  return (
    <div className="pt-24 md:pt-32">
      <section className="container-luxe pb-6">
        <Eyebrow>The Menu</Eyebrow>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] text-cream sm:text-5xl md:text-6xl lg:text-7xl">
          Everything we <span className="italic gold-text">love to make</span>.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground md:mt-6 md:text-base">
          Cakes need a 24-hour head start. Everything else is on your doorstep in around three hours.
        </p>
        <TrustBadge className="mt-4" />
      </section>

      <section className="container-luxe sticky top-16 z-30 pb-3 md:top-20">
        <div className="glass rounded-xl p-2 md:rounded-2xl md:p-3">
          <div className="flex items-center gap-2">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search cakes, desserts, snacks…"
                aria-label="Search the menu"
                className="w-full rounded-full bg-input/50 py-2 pl-9 pr-9 text-sm text-cream placeholder:text-muted-foreground focus:outline-none md:py-2.5"
              />
              {q && (
                <button onClick={() => setQ("")} aria-label="Clear search" className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-cream">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort products"
              className="shrink-0 rounded-full border border-border/60 bg-transparent px-3 py-2 text-xs text-cream/90"
            >
              <option value="featured">Popular</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="name">A–Z</option>
            </select>
          </div>
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:overflow-visible">
            <button
              onClick={() => setCat("all")}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${cat === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border text-cream/80 hover:border-primary/50"}`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.slug}
                onClick={() => setCat(c.slug)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${cat === c.slug ? "border-primary bg-primary text-primary-foreground" : "border-border text-cream/80 hover:border-primary/50"}`}
              >
                {c.name}
              </button>
            ))}
            <Link
              to="/milkshakes"
              className="shrink-0 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-cream/80 transition-all hover:border-primary/50"
            >
              Milkshakes
            </Link>
          </div>
        </div>
      </section>

      <section className="container-luxe pb-16 md:pb-24">
        {CATEGORIES.filter((c) => cat === "all" || c.slug === cat).map((c) => {
          const items = filtered.filter((p) => p.category === c.slug);
          if (items.length === 0) return null;
          return (
            <div key={c.slug} className="mt-8 md:mt-16">
              <div className="mb-3 flex items-end justify-between border-b border-border/60 pb-2.5 md:mb-6 md:pb-4">
                <div>
                  <p className="eyebrow">{c.tagline}</p>
                  <h2 className="mt-1 font-display text-xl text-cream md:mt-1.5 md:text-3xl">{c.name}</h2>
                </div>
                <Link to="/menu/$category" params={{ category: c.slug }} className="text-xs text-primary hover:underline">
                  View
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {items.map((p, i) => <CompactProductCard key={p.slug} product={p} index={i} />)}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="mt-16 text-center">
            <p className="font-display text-2xl text-cream">Nothing matches "{q}"</p>
            <p className="mt-2 text-sm text-muted-foreground">Try a different search or category.</p>
            <button onClick={() => { setQ(""); setCat("all"); }} className="mt-4 rounded-full border border-primary/60 px-5 py-2 text-xs font-semibold text-primary hover:bg-primary/10">
              Clear search
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
