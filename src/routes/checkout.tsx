import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart, cartTotal } from "@/lib/cart-store";
import { Eyebrow } from "@/components/motion-primitives";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — C & It's Magic" },
      { name: "description", content: "Review your order and place it. Payments powered by Razorpay." },
      { property: "og:title", content: "Checkout — C & It's Magic" },
      { property: "og:description", content: "Complete your order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  const subtotal = cartTotal(items);
  const delivery = subtotal > 999 ? 0 : subtotal === 0 ? 0 : 79;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;

  const place = () => {
    toast.success("Order flow launches soon — payments open in the next release.");
  };

  if (items.length === 0) {
    return (
      <div className="grid min-h-[70vh] place-items-center pt-32 text-center">
        <div>
          <ShoppingBag className="mx-auto h-8 w-8 text-primary" />
          <h1 className="mt-6 font-display text-4xl text-cream">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">Everything begins with a taste. Browse the menu.</p>
          <Link to="/menu" className="btn-gold btn-gold-hover mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold">Explore menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32">
      <section className="container-luxe pb-12">
        <Eyebrow>Checkout</Eyebrow>
        <h1 className="mt-4 font-display text-5xl leading-[1.02] text-cream md:text-6xl">Review your <span className="italic gold-text">order</span>.</h1>
      </section>

      <section className="container-luxe grid gap-6 pb-24 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-border/60 bg-card/40 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl text-cream">Your items ({items.length})</h2>
            <button onClick={clear} className="text-xs text-muted-foreground hover:text-destructive">Clear all</button>
          </div>
          <ul className="divide-y divide-border/60">
            {items.map((i) => (
              <li key={i.slug} className="flex items-center gap-4 py-4">
                <img src={i.image} alt={i.name} className="h-16 w-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-cream">{i.name}</p>
                  <p className="text-xs text-muted-foreground">₹{i.price} each</p>
                </div>
                <div className="inline-flex items-center rounded-full border border-border">
                  <button onClick={() => setQty(i.slug, i.qty - 1)} className="grid h-8 w-8 place-items-center"><Minus className="h-3 w-3" /></button>
                  <span className="min-w-8 text-center text-sm">{i.qty}</span>
                  <button onClick={() => setQty(i.slug, i.qty + 1)} className="grid h-8 w-8 place-items-center"><Plus className="h-3 w-3" /></button>
                </div>
                <p className="w-20 text-right font-display gold-text">₹{(i.price * i.qty).toLocaleString("en-IN")}</p>
                <button onClick={() => remove(i.slug)} aria-label="Remove" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit rounded-3xl border border-primary/30 bg-primary/5 p-6">
          <h3 className="font-display text-2xl text-cream">Summary</h3>
          <dl className="mt-5 space-y-3 text-sm">
            <Row k="Subtotal" v={`₹${subtotal.toLocaleString("en-IN")}`} />
            <Row k="Delivery" v={delivery === 0 ? "Free" : `₹${delivery}`} />
            <Row k="Taxes (est.)" v={`₹${tax.toLocaleString("en-IN")}`} />
          </dl>
          <div className="my-5 h-px bg-border/60" />
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-3xl gold-text">₹{total.toLocaleString("en-IN")}</span>
          </div>
          <Link to="/serviceability" className="mt-5 block rounded-xl border border-border bg-card/40 p-4 text-xs text-cream/85 hover:border-primary/50">
            Confirm delivery to your area →
          </Link>
          <button onClick={place} className="btn-gold btn-gold-hover mt-4 w-full rounded-full py-3.5 text-sm font-semibold">
            Place Order
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">Cakes require 24 hours notice. Food arrives in ~3 hours.</p>
        </aside>
      </section>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex items-center justify-between"><dt className="text-muted-foreground">{k}</dt><dd className="text-cream">{v}</dd></div>;
}
