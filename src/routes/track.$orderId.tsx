import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, ChefHat, Clock, MapPin, Package, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Eyebrow } from "@/components/motion-primitives";

export const Route = createFileRoute("/track/$orderId")({
  ssr: false,
  head: ({ params }) => ({
    meta: [
      { title: `Track Order ${params.orderId?.slice(0, 8)} — C & It's Magic` },
      { name: "description", content: "Real-time tracking of your C & It's Magic order — from kitchen to doorstep." },
      { property: "og:title", content: "Track your order — C & It's Magic" },
      { property: "og:description", content: "Live status of your gourmet order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackPage,
});

type Order = {
  id: string;
  order_code: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  created_at: string;
  eta_minutes: number | null;
  items: { name: string; variant: string | null; qty: number; price: number }[];
};

// Customer-facing condensed view of the 10 internal stages.
const STAGES = [
  { key: "received", label: "Order received", icon: CheckCircle2, matches: ["received", "confirmed"] },
  { key: "preparing", label: "In the kitchen", icon: ChefHat, matches: ["preparing", "baking", "decoration", "quality_check"] },
  { key: "packed", label: "Packed", icon: Package, matches: ["packed"] },
  { key: "out_for_delivery", label: "Out for delivery", icon: Truck, matches: ["out_for_delivery"] },
  { key: "delivered", label: "Delivered", icon: MapPin, matches: ["delivered"] },
];

function TrackPage() {
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_code, status, subtotal, delivery_fee, tax, total, created_at, eta_minutes, items:order_items(name, variant, qty, price)")
        .eq("id", orderId)
        .maybeSingle();
      if (mounted) {
        setOrder(data as any);
        setLoading(false);
      }
    };
    fetch();
    const channel = supabase
      .channel(`order-${orderId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` }, () => fetch())
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (loading) {
    return <div className="grid min-h-[60vh] place-items-center pt-32 text-muted-foreground">Loading order…</div>;
  }
  if (!order) {
    return (
      <div className="grid min-h-[60vh] place-items-center pt-32 text-center">
        <div>
          <h1 className="font-display text-4xl text-cream">Order not found</h1>
          <Link to="/menu" className="mt-6 inline-block text-primary hover:underline">Back to menu</Link>
        </div>
      </div>
    );
  }

  const activeIdx = Math.max(0, STAGES.findIndex((s) => s.key === order.status));

  return (
    <div className="pt-32">
      <section className="container-luxe pb-8">
        <Eyebrow>Live tracking</Eyebrow>
        <h1 className="mt-3 font-display text-5xl text-cream md:text-6xl">
          Order <span className="italic gold-text">{order.order_code}</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Placed {new Date(order.created_at).toLocaleString("en-IN")}
          {order.eta_minutes ? ` · ETA ${order.eta_minutes} min` : ""}
        </p>
      </section>

      <section className="container-luxe grid gap-6 pb-24 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-border/60 bg-card/40 p-6">
          <h2 className="font-display text-2xl text-cream">Progress</h2>
          <ol className="mt-8 space-y-6">
            {STAGES.map((s, i) => {
              const done = i <= activeIdx;
              const current = i === activeIdx && order.status !== "delivered";
              const Icon = s.icon;
              return (
                <li key={s.key} className="flex items-start gap-4">
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border ${done ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"} ${current ? "shadow-luxe" : ""}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 border-b border-border/40 pb-6 last:border-none">
                    <p className={`font-medium ${done ? "text-cream" : "text-muted-foreground"}`}>{s.label}</p>
                    {current && <p className="mt-1 flex items-center gap-1.5 text-xs text-primary"><Clock className="h-3 w-3" /> In progress…</p>}
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-sm text-cream/85">
            Live status updates in real time — no need to refresh.
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-border/60 bg-card/40 p-6">
          <h3 className="font-display text-2xl text-cream">Summary</h3>
          <ul className="mt-4 divide-y divide-border/60">
            {order.items.map((it, idx) => (
              <li key={idx} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="text-sm text-cream">{it.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {it.variant ? `${it.variant} · ` : ""}Qty {it.qty} × ₹{Number(it.price).toLocaleString("en-IN")}
                  </p>
                </div>
                <p className="text-sm font-medium text-cream">₹{(Number(it.price) * it.qty).toLocaleString("en-IN")}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 text-sm">
            <Row k="Subtotal" v={`₹${Number(order.subtotal).toLocaleString("en-IN")}`} />
            <Row k="Delivery" v={order.delivery_fee === 0 ? "Free" : `₹${order.delivery_fee}`} />
            <Row k="Taxes" v={`₹${Number(order.tax).toLocaleString("en-IN")}`} />
          </dl>
          <div className="my-4 h-px bg-border/60" />
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-3xl gold-text">₹{Number(order.total).toLocaleString("en-IN")}</span>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex items-center justify-between"><dt className="text-muted-foreground">{k}</dt><dd className="text-cream">{v}</dd></div>;
}
