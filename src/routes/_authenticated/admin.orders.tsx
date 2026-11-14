import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, X, Check, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Eyebrow } from "@/components/motion-primitives";
import { toast } from "sonner";

export const ORDER_STAGES = [
  "received",
  "confirmed",
  "preparing",
  "baking",
  "decoration",
  "quality_check",
  "packed",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;
export type OrderStage = (typeof ORDER_STAGES)[number];

const STAGE_LABEL: Record<OrderStage, string> = {
  received: "Order Received",
  confirmed: "Confirmed",
  preparing: "Preparing",
  baking: "Baking",
  decoration: "Decoration",
  quality_check: "Quality Check",
  packed: "Packed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const PAYMENT_STATUSES = ["pending", "paid", "refunded", "failed"];
const DELIVERY_TYPES = ["delivery", "pickup"];

type OrderRow = {
  id: string;
  order_code: string;
  status: string;
  payment_status: string;
  payment_method: string;
  delivery_type: string;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  contact_name: string | null;
  contact_phone: string | null;
  notes: string | null;
  address: Record<string, unknown> | null;
  eta_minutes: number | null;
  user_id: string;
  created_at: string;
};

export const Route = createFileRoute("/_authenticated/admin/orders")({
  staticData: { sitemap: false },
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });
    const { data: isStaff } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "staff",
    });
    if (!isAdmin && !isStaff) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Admin · Orders — C & It's Magic" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminOrders,
});

function AdminOrders() {
  const user = useAuth((s) => s.user);
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [payStatus, setPayStatus] = useState<string>("all");
  const [delivery, setDelivery] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, order_code, status, payment_status, payment_method, delivery_type, subtotal, delivery_fee, tax, total, contact_name, contact_phone, notes, address, eta_minutes, user_id, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    setRows((data as OrderRow[] | null) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (payStatus !== "all" && r.payment_status !== payStatus) return false;
      if (delivery !== "all" && r.delivery_type !== delivery) return false;
      if (from && new Date(r.created_at) < new Date(from)) return false;
      if (to && new Date(r.created_at) > new Date(`${to}T23:59:59`)) return false;
      if (!needle) return true;
      return (
        r.order_code.toLowerCase().includes(needle) ||
        r.id.toLowerCase().includes(needle) ||
        (r.contact_name ?? "").toLowerCase().includes(needle) ||
        (r.contact_phone ?? "").toLowerCase().includes(needle)
      );
    });
  }, [rows, q, status, payStatus, delivery, from, to]);

  const selected = rows.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="pt-32">
      <section className="container-luxe pb-8">
        <Eyebrow>Admin</Eyebrow>
        <h1 className="mt-3 font-display text-5xl text-cream md:text-6xl">
          Order <span className="italic gold-text">Management</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Signed in as {user?.email}. Real-time updates from the kitchen and delivery floor.
        </p>
      </section>

      <section className="container-luxe pb-6">
        <div className="grid gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 md:grid-cols-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search order id, code, name, phone"
              className="w-full rounded-full border border-border/60 bg-transparent py-2.5 pl-10 pr-4 text-sm text-cream placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <Select value={status} onChange={setStatus} label="Status" options={["all", ...ORDER_STAGES]} render={(v) => (v === "all" ? "All statuses" : STAGE_LABEL[v as OrderStage] ?? v)} />
          <Select value={payStatus} onChange={setPayStatus} label="Payment" options={["all", ...PAYMENT_STATUSES]} render={(v) => (v === "all" ? "All payments" : v)} />
          <Select value={delivery} onChange={setDelivery} label="Type" options={["all", ...DELIVERY_TYPES]} render={(v) => (v === "all" ? "All types" : v)} />
          <div className="flex items-center gap-2">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-lg border border-border/60 bg-transparent px-3 py-2 text-xs text-cream focus:border-primary focus:outline-none" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-lg border border-border/60 bg-transparent px-3 py-2 text-xs text-cream focus:border-primary focus:outline-none" />
          </div>
        </div>
      </section>

      <section className="container-luxe pb-24">
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/30">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-black/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Placed</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">Loading…</td>
                  </tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">No orders match your filters.</td>
                  </tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-cream">{r.order_code}</td>
                    <td className="px-4 py-3 text-cream">
                      <div>{r.contact_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.contact_phone ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                    <td className="px-4 py-3 text-xs uppercase text-cream/80">{r.payment_status}</td>
                    <td className="px-4 py-3 text-xs uppercase text-cream/80">{r.delivery_type}</td>
                    <td className="px-4 py-3 font-medium text-primary">₹{Number(r.total).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedId(r.id)} className="rounded-full border border-primary/50 px-3 py-1.5 text-xs text-primary hover:bg-primary/10">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {selected && <OrderDrawer order={selected} onClose={() => setSelectedId(null)} onSaved={refresh} />}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const label = STAGE_LABEL[status as OrderStage] ?? status;
  const done = status === "delivered";
  const cancelled = status === "cancelled";
  const cls = cancelled
    ? "border-red-400/60 bg-red-400/10 text-red-300"
    : done
      ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
      : "border-primary/50 bg-primary/10 text-primary";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${cls}`}>{label}</span>;
}

function Select({ value, onChange, label, options, render }: { value: string; onChange: (v: string) => void; label: string; options: readonly string[]; render: (v: string) => string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg border border-border/60 bg-black/40 px-3 py-2 text-xs text-cream focus:border-primary focus:outline-none">
        {options.map((o) => (
          <option key={o} value={o} className="bg-black">{render(o)}</option>
        ))}
      </select>
    </label>
  );
}

function OrderDrawer({ order, onClose, onSaved }: { order: OrderRow; onClose: () => void; onSaved: () => void }) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<{ status: string; note: string | null; created_at: string }[]>([]);
  const [items, setItems] = useState<{ name: string; variant: string | null; qty: number; price: number }[]>([]);

  useEffect(() => {
    (async () => {
      const [h, it] = await Promise.all([
        supabase.from("order_status_history").select("status, note, created_at").eq("order_id", order.id).order("created_at", { ascending: false }),
        supabase.from("order_items").select("name, variant, qty, price").eq("order_id", order.id),
      ]);
      setHistory((h.data as typeof history) ?? []);
      setItems((it.data as typeof items) ?? []);
    })();
  }, [order.id]);

  const updateStatus = async (next: OrderStage) => {
    setSaving(true);
    const { error } = await supabase.from("orders").update({ status: next, eta_minutes: order.eta_minutes }).eq("id", order.id);
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    // The trigger records the transition automatically; write the note separately.
    if (note.trim()) {
      await supabase.from("order_status_history").insert({ order_id: order.id, status: next, note: note.trim() });
    }
    // Queue notification (delivery handled in Stage 3)
    if (order.contact_phone || order.contact_name) {
      await supabase.from("notification_logs").insert([
        { order_id: order.id, channel: "whatsapp", event: `status:${next}`, recipient: order.contact_phone ?? "", status: "pending" },
      ]);
    }
    toast.success(`Status → ${STAGE_LABEL[next]}`);
    setNote("");
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <aside className="h-full w-full max-w-xl overflow-y-auto border-l border-border/60 bg-ink p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Order</p>
            <h2 className="font-display text-3xl text-cream">{order.order_code}</h2>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-border text-cream hover:border-primary"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-4 rounded-2xl border border-border/60 bg-card/40 p-4 text-sm">
          <p className="text-cream">{order.contact_name ?? "—"}</p>
          <p className="text-muted-foreground">{order.contact_phone ?? "—"}</p>
          {order.address && (
            <p className="mt-2 text-xs text-muted-foreground">{Object.values(order.address).filter(Boolean).join(", ")}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full border border-border px-2 py-0.5 text-cream/80">Type: {order.delivery_type}</span>
            <span className="rounded-full border border-border px-2 py-0.5 text-cream/80">Pay: {order.payment_status}</span>
            <span className="rounded-full border border-border px-2 py-0.5 text-cream/80">Method: {order.payment_method}</span>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-display text-lg text-cream">Items</h3>
          <ul className="mt-2 divide-y divide-border/60 text-sm">
            {items.map((it, i) => (
              <li key={i} className="flex justify-between py-2">
                <span className="text-cream">{it.name}{it.variant ? ` · ${it.variant}` : ""} × {it.qty}</span>
                <span className="text-muted-foreground">₹{(Number(it.price) * it.qty).toLocaleString("en-IN")}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-border/60 pt-3 text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-display text-xl gold-text">₹{Number(order.total).toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-display text-lg text-cream">Update status</h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note (visible in history)"
            rows={2}
            className="mt-2 w-full rounded-xl border border-border/60 bg-transparent px-3 py-2 text-sm text-cream placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {ORDER_STAGES.map((s) => (
              <button
                key={s}
                disabled={saving || order.status === s}
                onClick={() => updateStatus(s)}
                className={`rounded-full border px-3 py-2 text-xs font-medium transition-all ${order.status === s ? "border-primary bg-primary/15 text-primary" : "border-border text-cream/80 hover:border-primary/60"} disabled:opacity-50`}
              >
                {order.status === s && <Check className="mr-1 inline h-3 w-3" />} {STAGE_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-display text-lg text-cream">History</h3>
          <ol className="mt-2 space-y-2 text-sm">
            {history.map((h, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border border-border/40 bg-card/30 p-3">
                <Clock className="mt-0.5 h-3 w-3 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-cream">{STAGE_LABEL[h.status as OrderStage] ?? h.status}</p>
                  {h.note && <p className="mt-0.5 text-xs text-muted-foreground">{h.note}</p>}
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{new Date(h.created_at).toLocaleString("en-IN")}</p>
                </div>
              </li>
            ))}
            {history.length === 0 && <li className="text-xs text-muted-foreground">No history yet.</li>}
          </ol>
        </div>
      </aside>
    </div>
  );
}
