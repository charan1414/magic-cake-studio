import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart, cartTotal } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-context";
import { Eyebrow } from "@/components/motion-primitives";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Checkout — C & It's Magic" },
      { name: "description", content: "Review your order and place it. Cash on delivery or online payment." },
      { property: "og:title", content: "Checkout — C & It's Magic" },
      { property: "og:description", content: "Complete your gourmet order." },
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
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [pincode, setPincode] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<"cod" | "online">("cod");
  const [placing, setPlacing] = useState(false);

  const subtotal = cartTotal(items);
  const delivery = subtotal > 999 ? 0 : subtotal === 0 ? 0 : 79;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;

  const place = async () => {
    if (!user) {
      toast.error("Please sign in to place an order");
      navigate({ to: "/auth" });
      return;
    }
    if (!contactName || !contactPhone || !line1 || !pincode) {
      toast.error("Please complete delivery details");
      return;
    }
    setPlacing(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        subtotal,
        delivery_fee: delivery,
        tax,
        total,
        contact_name: contactName,
        contact_phone: contactPhone,
        address: { line1, line2, pincode, city: "Malur", state: "Karnataka" },
        notes,
        payment_method: payment,
        payment_status: payment === "cod" ? "pending" : "pending",
        eta_minutes: 180,
      })
      .select("id, order_code")
      .single();

    if (error || !order) {
      setPlacing(false);
      toast.error(error?.message ?? "Could not place order");
      return;
    }

    const lines = items.map((i) => ({
      order_id: order.id,
      slug: i.slug,
      name: i.name,
      variant: i.variant ?? null,
      price: i.price,
      qty: i.qty,
      image: i.image,
    }));
    const { error: itemsErr } = await supabase.from("order_items").insert(lines);
    if (itemsErr) {
      setPlacing(false);
      toast.error(itemsErr.message);
      return;
    }
    toast.success(`Order ${order.order_code} placed!`);
    clear();
    navigate({ to: "/track/$orderId", params: { orderId: order.id } });
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
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/60 bg-card/40 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl text-cream">Your items ({items.length})</h2>
              <button onClick={clear} className="text-xs text-muted-foreground hover:text-destructive">Clear all</button>
            </div>
            <ul className="divide-y divide-border/60">
              {items.map((i) => (
                <li key={i.slug} className="flex items-center gap-4 py-4">
                  <img src={i.image} alt={i.name} className="h-20 w-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-cream">{i.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      {i.variant && (
                        <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-medium uppercase tracking-wider text-primary">{i.variant}</span>
                      )}
                      <span className="text-muted-foreground">
                        ₹{i.price.toLocaleString("en-IN")} × {i.qty}
                      </span>
                    </div>
                  </div>
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button onClick={() => setQty(i.slug, i.qty - 1)} className="grid h-8 w-8 place-items-center"><Minus className="h-3 w-3" /></button>
                    <span className="min-w-8 text-center text-sm">{i.qty}</span>
                    <button onClick={() => setQty(i.slug, i.qty + 1)} className="grid h-8 w-8 place-items-center"><Plus className="h-3 w-3" /></button>
                  </div>
                  <p className="w-24 text-right font-display gold-text">₹{(i.price * i.qty).toLocaleString("en-IN")}</p>
                  <button onClick={() => remove(i.slug)} aria-label="Remove" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/40 p-6">
            <h2 className="font-display text-2xl text-cream">Delivery details</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Field label="Full name" value={contactName} onChange={setContactName} />
              <Field label="Phone" value={contactPhone} onChange={setContactPhone} placeholder="+91…" />
              <Field label="Address line 1" value={line1} onChange={setLine1} className="md:col-span-2" />
              <Field label="Address line 2 (optional)" value={line2} onChange={setLine2} className="md:col-span-2" />
              <Field label="Pincode" value={pincode} onChange={setPincode} />
              <Field label="Order notes (optional)" value={notes} onChange={setNotes} />
            </div>
            <div className="mt-6">
              <p className="eyebrow">Payment</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <PayOption active={payment === "cod"} onClick={() => setPayment("cod")} title="Cash on Delivery" desc="Pay when it arrives." />
                <PayOption active={payment === "online"} onClick={() => setPayment("online")} title="Online (Razorpay)" desc="UPI, cards, wallets. Live payments coming soon." />
              </div>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-primary/30 bg-primary/5 p-6 lg:sticky lg:top-28">
          <h3 className="font-display text-2xl text-cream">Summary</h3>
          <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1 text-sm">
            {items.map((i) => (
              <li key={i.slug} className="flex items-start justify-between gap-3 border-b border-border/40 pb-2">
                <div>
                  <p className="text-cream">{i.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {i.variant ? `${i.variant} · ` : ""}Qty {i.qty} × ₹{i.price.toLocaleString("en-IN")}
                  </p>
                </div>
                <p className="whitespace-nowrap text-cream">₹{(i.price * i.qty).toLocaleString("en-IN")}</p>
              </li>
            ))}
          </ul>
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
          <button onClick={place} disabled={placing} className="btn-gold btn-gold-hover mt-4 w-full rounded-full py-3.5 text-sm font-semibold disabled:opacity-60">
            {placing ? "Placing…" : `Place Order · ₹${total.toLocaleString("en-IN")}`}
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

function Field({ label, value, onChange, placeholder, className }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-cream placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
    </label>
  );
}

function PayOption({ active, onClick, title, desc }: { active: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-xl border p-4 text-left transition-all ${active ? "border-primary bg-primary/10 shadow-luxe" : "border-border hover:border-primary/50"}`}>
      <p className="font-medium text-cream">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </button>
  );
}
