import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS } from "@/lib/data";
import { Eyebrow } from "@/components/motion-primitives";
import { Check, DateTime, Num, Select, Text, TextArea } from "@/components/admin-form";

export const Route = createFileRoute("/_authenticated/admin/vouchers")({
  staticData: { sitemap: false },
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    const { data: isStaff } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "staff" });
    if (!isAdmin && !isStaff) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Admin · Vouchers — C & It's Magic" },
      { name: "description", content: "Create and manage customer voucher codes." },
      { property: "og:title", content: "Admin · Vouchers — C & It's Magic" },
      { property: "og:description", content: "Voucher management dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminVouchers,
});

type Voucher = {
  id?: string;
  code: string;
  title: string;
  description: string;
  discount_type: "fixed" | "percent";
  discount_value: number;
  min_order: number;
  max_discount: number | null;
  starts_at: string | null;
  expires_at: string | null;
  usage_limit: number | null;
  per_user_limit: number;
  product_slugs: string[];
  categories: string[];
  active: boolean;
  show_publicly: boolean;
};
type Stat = { uses: number; users: number; total: number };

const blank: Voucher = {
  code: "", title: "", description: "", discount_type: "fixed", discount_value: 100, min_order: 0, max_discount: null,
  starts_at: null, expires_at: null, usage_limit: null, per_user_limit: 1, product_slugs: [], categories: [], active: true, show_publicly: true,
};

const toLocal = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");
const fromLocal = (v: string) => (v ? new Date(v).toISOString() : null);
const statusOf = (v: Voucher) =>
  v.expires_at && new Date(v.expires_at) < new Date() ? "Expired" : v.active ? "Active" : "Inactive";
const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—");

function AdminVouchers() {
  const [list, setList] = useState<Voucher[]>([]);
  const [stats, setStats] = useState<Record<string, Stat>>({});
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const categories = useMemo(() => Array.from(new Set(PRODUCTS.map((p) => p.category))).sort(), []);

  const refresh = async () => {
    const [v, r] = await Promise.all([
      supabase.from("vouchers" as never).select("*").order("created_at", { ascending: false }),
      supabase.from("voucher_redemptions" as never).select("voucher_id,user_id,discount"),
    ]);
    setList(((v.data as unknown) as Voucher[]) ?? []);
    const s: Record<string, Stat & { set: Set<string> }> = {};
    for (const row of ((r.data as unknown) as { voucher_id: string; user_id: string; discount: number }[]) ?? []) {
      const e = (s[row.voucher_id] ??= { uses: 0, users: 0, total: 0, set: new Set() });
      e.uses++; e.total += Number(row.discount); e.set.add(row.user_id); e.users = e.set.size;
    }
    setStats(s);
  };
  useEffect(() => { refresh(); }, []);

  const save = async () => {
    if (!editing) return;
    const code = editing.code.trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) return toast.error("Code must be 3–30 letters/numbers");
    if (editing.discount_value <= 0) return toast.error("Discount value must be above 0");
    if (editing.discount_type === "percent" && editing.discount_value > 100) return toast.error("Percent cannot exceed 100");
    const payload = { ...editing, code };
    const { error } = editing.id
      ? await supabase.from("vouchers" as never).update(payload as never).eq("id", editing.id)
      : await supabase.from("vouchers" as never).insert(payload as never);
    if (error) return toast.error(error.message);
    toast.success("Voucher saved");
    setEditing(null);
    refresh();
  };

  const toggle = async (v: Voucher) => {
    await supabase.from("vouchers" as never).update({ active: !v.active } as never).eq("id", v.id!);
    refresh();
  };
  const remove = async (v: Voucher) => {
    if (!confirm(`Delete voucher ${v.code}?`)) return;
    const { error } = await supabase.from("vouchers" as never).delete().eq("id", v.id!);
    if (error) toast.error(error.message); else { toast.success("Deleted"); refresh(); }
  };

  const shown = list.filter((v) =>
    (filter === "all" || statusOf(v).toLowerCase() === filter) &&
    (!q || `${v.code} ${v.title}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="pt-32">
      <section className="container-luxe pb-8">
        <Eyebrow>Admin</Eyebrow>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-5xl text-cream">Voucher <span className="italic gold-text">management</span></h1>
          <button onClick={() => setEditing({ ...blank })} className="btn-gold btn-gold-hover inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">
            <Plus className="h-4 w-4" /> Create voucher
          </button>
        </div>
      </section>

      <section className="container-luxe pb-24">
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search vouchers" className="w-full rounded-xl border border-border/60 bg-transparent py-2.5 pl-9 pr-3 text-sm text-cream focus:border-primary focus:outline-none" />
          </div>
          <div className="flex gap-1 rounded-full border border-border p-1">
            {["all", "active", "inactive", "expired"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs capitalize ${filter === f ? "bg-primary text-primary-foreground" : "text-cream/70"}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-border/60 bg-card/40">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border/60">
                {["Voucher", "Discount", "Min order", "Usage", "Users", "Total given", "Validity", "Status", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {shown.map((v) => {
                const st = stats[v.id!] ?? { uses: 0, users: 0, total: 0 };
                const status = statusOf(v);
                return (
                  <tr key={v.id} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-3"><p className="font-medium text-cream">{v.code}</p><p className="text-[11px] text-muted-foreground">{v.title}</p></td>
                    <td className="px-4 py-3 text-cream">{v.discount_type === "percent" ? `${v.discount_value}% OFF` : `₹${v.discount_value} OFF`}</td>
                    <td className="px-4 py-3">₹{v.min_order}</td>
                    <td className="px-4 py-3">{st.uses}/{v.usage_limit ?? "∞"}</td>
                    <td className="px-4 py-3">{st.users}</td>
                    <td className="px-4 py-3">₹{st.total.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{fmtDate(v.starts_at)} – {fmtDate(v.expires_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggle(v)} className={`rounded-full px-2.5 py-1 text-[11px] ${status === "Active" ? "bg-primary/15 text-primary" : status === "Expired" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>{status}</button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(v)} aria-label="Edit" className="text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => remove(v)} aria-label="Delete" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {shown.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">No vouchers found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl text-cream">{editing.id ? "Edit voucher" : "New voucher"}</h2>
              <button onClick={() => setEditing(null)} aria-label="Close"><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Text label="Voucher code" value={editing.code} onChange={(v) => setEditing({ ...editing, code: v.toUpperCase() })} placeholder="WELCOME100" />
              <Text label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
              <TextArea className="sm:col-span-2" label="Description" rows={2} value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} />
              <Select label="Discount type" value={editing.discount_type} onChange={(v) => setEditing({ ...editing, discount_type: v as Voucher["discount_type"] })} options={[["fixed", "Fixed amount (₹)"], ["percent", "Percentage (%)"]]} />
              <Num label="Discount value" value={editing.discount_value} onChange={(v) => setEditing({ ...editing, discount_value: v ?? 0 })} />
              <Num label="Minimum order (₹)" value={editing.min_order} onChange={(v) => setEditing({ ...editing, min_order: v ?? 0 })} />
              <Num label="Max discount (₹, for %)" value={editing.max_discount} onChange={(v) => setEditing({ ...editing, max_discount: v })} placeholder="No cap" />
              <DateTime label="Start date" value={toLocal(editing.starts_at)} onChange={(v) => setEditing({ ...editing, starts_at: fromLocal(v) })} />
              <DateTime label="Expiry date" value={toLocal(editing.expires_at)} onChange={(v) => setEditing({ ...editing, expires_at: fromLocal(v) })} />
              <Num label="Total usage limit" value={editing.usage_limit} onChange={(v) => setEditing({ ...editing, usage_limit: v })} placeholder="Unlimited" />
              <Num label="Uses per customer" value={editing.per_user_limit} onChange={(v) => setEditing({ ...editing, per_user_limit: v ?? 1 })} />
              <div className="sm:col-span-2">
                <span className="eyebrow mb-1.5 block">Applies to categories (none = everything)</span>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => {
                    const on = editing.categories.includes(c);
                    return <button key={c} type="button" onClick={() => setEditing({ ...editing, categories: on ? editing.categories.filter((x) => x !== c) : [...editing.categories, c] })}
                      className={`rounded-full border px-3 py-1 text-xs ${on ? "border-primary bg-primary/15 text-primary" : "border-border text-cream/70"}`}>{c}</button>;
                  })}
                </div>
              </div>
              <Text className="sm:col-span-2" label="Specific products (comma-separated slugs, optional)" value={editing.product_slugs.join(", ")}
                onChange={(v) => setEditing({ ...editing, product_slugs: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
              <div className="flex gap-6 sm:col-span-2">
                <Check label="Active" checked={editing.active} onChange={(v) => setEditing({ ...editing, active: v })} />
                <Check label="Show to customers in Available Vouchers" checked={editing.show_publicly} onChange={(v) => setEditing({ ...editing, show_publicly: v })} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="rounded-full border border-border px-5 py-2.5 text-sm text-cream/80">Cancel</button>
              <button onClick={save} className="btn-gold btn-gold-hover rounded-full px-6 py-2.5 text-sm font-semibold">Save voucher</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
