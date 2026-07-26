import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { CATEGORIES, getByCategory, ICE_CREAM_GROUPS } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
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
  errorComponent: ({ error }) => <p className="pt-40 text-center text-muted-foreground">{error.message}</p>,
  notFoundComponent: () => (
    <div className="grid min-h-[70vh] place-items-center pt-32 text-center">
      <div>
        <h1 className="font-display text-4xl text-cream">Category not found</h1>
        <Link to="/menu" className="mt-6 inline-block text-primary hover:underline">Back to menu</Link>
      </div>
    </div>
  ),
});

function CategoryPage() {
  const { category, items } = Route.useLoaderData();
  const isIceCream = category.slug === "ice-cream";
  return (
    <div className="pt-32">
      <section className="container-luxe pb-10">
        <Link to="/menu" className="text-xs text-muted-foreground hover:text-primary">← All categories</Link>
        <div className="mt-4">
          <Eyebrow>{category.tagline}</Eyebrow>
          <h1 className="mt-3 font-display text-6xl leading-[1.02] text-cream md:text-7xl">{category.name}</h1>
        </div>
      </section>
      <section className="container-luxe pb-24">
        {isIceCream ? (
          <div className="space-y-16">
            {ICE_CREAM_GROUPS.map((group) => {
              const groupItems = items.filter((p: import("@/lib/data").Product) => p.subcategory === group.slug);
              if (!groupItems.length) return null;
              return (
                <div key={group.slug}>
                  <div className="mb-6 flex items-end justify-between border-b border-border/40 pb-3">
                    <h2 className="font-display text-3xl text-cream md:text-4xl">
                      <span className="mr-2">{group.emoji}</span>{group.name}
                    </h2>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{groupItems.length} items</span>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {groupItems.map((p: import("@/lib/data").Product, i: number) => <ProductCard key={p.slug} product={p} index={i} />)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p: import("@/lib/data").Product, i: number) => <ProductCard key={p.slug} product={p} index={i} />)}
          </div>
        )}
      </section>
    </div>
  );
}
