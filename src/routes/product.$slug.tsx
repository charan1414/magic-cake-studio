import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Minus, Plus, Share2, Star } from "lucide-react";
import { getProduct, PRODUCTS, CAKE_SIZES, cakePrice } from "@/lib/data";
import { useCart } from "@/lib/cart-store";
import { ProductCard } from "@/components/product-card";
import { Eyebrow } from "@/components/motion-primitives";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const p = getProduct(params.slug);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Product"} — C & It's Magic` },
      { name: "description", content: loaderData?.description ?? "" },
      { property: "og:title", content: loaderData?.name ?? "" },
      { property: "og:description", content: loaderData?.description ?? "" },
      { property: "og:type", content: "product" },
    ],
  }),
  component: ProductPage,
  errorComponent: ({ error }) => <p className="pt-40 text-center">{error.message}</p>,
  notFoundComponent: () => (
    <div className="grid min-h-[70vh] place-items-center pt-32 text-center">
      <div>
        <h1 className="font-display text-4xl text-cream">Not found</h1>
        <Link to="/menu" className="mt-6 inline-block text-primary hover:underline">Back to menu</Link>
      </div>
    </div>
  ),
});

function ProductPage() {
  const product = Route.useLoaderData();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const isCake = product.category === "cakes" || product.category === "seasonal-special";
  const [sizeIdx, setSizeIdx] = useState(0); // default 500 g — most affordable entry
  const size = CAKE_SIZES[sizeIdx];
  const unitPrice = isCake ? cakePrice(product.price, size) : product.price;
  const related = PRODUCTS.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 3);

  return (
    <div className="pt-28">
      <div className="container-luxe grid gap-10 py-12 md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative overflow-hidden rounded-3xl border border-border/60">
          <img src={product.image} alt={product.name} className="aspect-[4/5] w-full object-cover" />
          <div className="absolute left-4 top-4 flex gap-2">
            {product.bestSeller && <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">Bestseller</span>}
            {product.chefPick && <span className="rounded-full border border-primary/60 bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary backdrop-blur">Chef's Pick</span>}
          </div>
        </div>

        <div className="flex flex-col">
          <Link to="/menu/$category" params={{ category: product.category }} className="text-xs text-muted-foreground hover:text-primary">← Back to category</Link>
          <Eyebrow>{product.veg ? "Vegetarian" : "Non-Vegetarian"}</Eyebrow>
          <h1 className="mt-3 font-display text-5xl leading-[1.02] text-cream md:text-6xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary" /> 4.9 (312 reviews)</span>
            <span>•</span>
            <span>{product.calories} kcal</span>
            <span>•</span>
            <span>{product.prepMins < 60 ? `${product.prepMins} min` : `${Math.round(product.prepMins/60)} hr prep`}</span>
          </div>

          <p className="mt-6 text-base leading-relaxed text-muted-foreground">{product.description}</p>

          {isCake && (
            <div className="mt-8">
              <p className="eyebrow">Choose weight</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CAKE_SIZES.map((s, i) => (
                  <button
                    key={s.value}
                    onClick={() => setSizeIdx(i)}
                    className={`rounded-full border px-4 py-2 text-xs font-medium transition-all ${i === sizeIdx ? "border-primary bg-primary text-primary-foreground" : "border-border text-cream/80 hover:border-primary/50"}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Price scales with weight. Serves ~{Math.round(size.value / 125)} people.</p>
            </div>
          )}

          <div className="mt-8">
            <p className="eyebrow">Ingredients</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {product.ingredients.map((i: string) => (
                <li key={i} className="rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-cream/80">{i}</li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex items-baseline gap-3">
            <span className="font-display text-5xl gold-text">₹{(unitPrice * qty).toLocaleString("en-IN")}</span>
            {isCake && <span className="text-sm text-muted-foreground">{size.label}{qty > 1 ? ` × ${qty}` : ""}</span>}
            {!isCake && qty > 1 && <span className="text-sm text-muted-foreground">for {qty}</span>}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-11 w-11 place-items-center text-cream"><Minus className="h-4 w-4" /></button>
              <span className="min-w-8 text-center text-sm">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="grid h-11 w-11 place-items-center text-cream"><Plus className="h-4 w-4" /></button>
            </div>
            <button
              onClick={() => {
                const slug = isCake ? `${product.slug}-${size.value}` : product.slug;
                const variant = isCake ? size.label : undefined;
                add({ slug, name: product.name, price: unitPrice, image: product.image, variant }, qty);
                toast.success(`Added · ${product.name}${variant ? ` (${variant})` : ""} × ${qty}`);
              }}
              className="btn-gold btn-gold-hover flex-1 rounded-full px-6 py-3.5 text-sm font-semibold"
            >
              Add to Cart
            </button>
            <button aria-label="Wishlist" className="grid h-11 w-11 place-items-center rounded-full border border-border text-cream hover:border-primary hover:text-primary">
              <Heart className="h-4 w-4" />
            </button>
            <button aria-label="Share" onClick={() => { navigator.clipboard.writeText(window.location.href); toast("Link copied"); }} className="grid h-11 w-11 place-items-center rounded-full border border-border text-cream hover:border-primary hover:text-primary">
              <Share2 className="h-4 w-4" />
            </button>
          </div>


          <div className="mt-8">
            <PinChecker />
          </div>

          <div className="mt-4 rounded-2xl border border-border/60 bg-card/60 p-5 text-sm text-muted-foreground">
            <p className="font-medium text-cream">Delivery</p>
            <p className="mt-1">Cakes need 24 hours of advance notice. Food orders arrive within 3 hours. Available within 20 km of Lakkur.</p>
          </div>

        </div>
      </div>

      {related.length > 0 && (
        <section className="container-luxe py-20">
          <h2 className="mb-8 font-display text-3xl text-cream">You may also love</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
