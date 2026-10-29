import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CATEGORIES, getByCategory, ICE_CREAM_GROUPS } from "@/lib/data";
import { CompactProductCard } from "@/components/product-card";
import { Eyebrow } from "@/components/motion-primitives";

export const Route = createFileRoute("/menu/$category")({
  loader: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.category);
    if (!cat) throw notFound();
    return { category: cat, items: getByCategory(params.category) };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.category.name ?? "Category";
    return {
      meta: [
        { title: `${name} — C & It's Magic` },
        { name: "description", content: `${name}: ${loaderData?.category.tagline ?? ""} from C & It's Magic.` },
        { property: "og:title", content: `${name} — C & It's Magic` },
        { property: "og:description", content: loaderData?.category.tagline ?? "" },
      ],
    };
  },
  component: CategoryPage,
  errorComponent: ({ error }: { error: unknown }) => <p className="pt-40 text-center text-muted-foreground">{String(error)}</p>,
  notFoundComponent: () => (
    <div className="grid min-h-[70vh] place-items-center pt-32 text-center">
      <div>
        <h1 className="font-display text-4xl text-cream">Category not found</h1>
        <Link to="/menu" className="mt-6 inline-block text-primary hover:underline">Back to menu</Link>
      </div>
    </div>
  ),
});

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

function CategoryPage() {
  const { category, items } = Route.useLoaderData();
  const [sort, setSort] = useState<SortKey>("featured");
  const isIceCream = category.slug === "ice-cream";

  const sorted = useMemo(() => {
    if (sort === "price-asc") return [...items].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...items].sort((a, b) => b.price - a.price);
    if (sort === "name") return [...items].sort((a, b) => a.name.localeCompare(b.name));
    return items;
  }, [items, sort]);

  const Grid = ({ list }: { list: typeof items }) => (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {list.map((p: import("@/lib/data").Product, i: number) => <CompactProductCard key={p.slug} product={p} index={i} />)}
    </div>
  );

  return (
    <div className="pt-24 md:pt-32">
      <section className="container-luxe pb-6">
        <Link to="/menu" className="text-xs text-muted-foreground hover:text-primary">← All categories</Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Eyebrow>{category.tagline}</Eyebrow>
            <h1 className="mt-2 font-display text-4xl leading-[1.05] text-cream sm:text-5xl md:text-6xl lg:text-7xl">{category.name}</h1>
          </div>
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
      </section>
      <section className="container-luxe pb-16 md:pb-24">
        {isIceCream ? (
          <div className="space-y-10 md:space-y-16">
            {ICE_CREAM_GROUPS.map((group) => {
              const groupItems = sorted.filter((p: import("@/lib/data").Product) => p.subcategory === group.slug);
              if (!groupItems.length) return null;
              return (
                <div key={group.slug}>
                  <div className="mb-3 flex items-end justify-between border-b border-border/40 pb-2.5 md:mb-6 md:pb-3">
                    <h2 className="font-display text-2xl text-cream md:text-4xl">
                      <span className="mr-2">{group.emoji}</span>{group.name}
                    </h2>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{groupItems.length} items</span>
                  </div>
                  <Grid list={groupItems} />
                </div>
              );
            })}
          </div>
        ) : (
          <Grid list={sorted} />
        )}
      </section>
    </div>
  );
}
