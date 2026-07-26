import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Save, Search, Warehouse } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS } from "@/lib/data";
import { Eyebrow } from "@/components/motion-primitives";
import { toast } from "sonner";

type InventoryRow = {
  slug: string;
  quantity_remaining: number;
  low_stock_threshold: number;
  active: boolean;
  stock_status: string | null;
};

export const Route = createFileRoute("/_authenticated/admin/inventory")({
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
      { title: "Admin · Inventory — C & It's Magic" },
      { name: "description", content: "Manage inventory and low-stock thresholds for C & It's Magic." },
      { property: "og:title", content: "Admin · Inventory — C & It's Magic" },
      { property: "og:description", content: "Manage product stock levels and thresholds." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminInventory,
});

function AdminInventory() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const refresh = async () => {
    const { data, error } = await supabase
      .from("product_inventory")
      .select("slug, quantity_remaining, low_stock_threshold, active, stock_status")
      .order("slug");
    if (error) toast.error(error.message);
    else setRows((data as InventoryRow[] | null) ?? []);
  };

  useEffect(() => {
    refresh();
  }, []);

  const enriched = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows
      .map((row) => ({ row, product: PRODUCTS.find((p) => p.slug === row.slug) }))
      .filter(({ row, product }) => !needle || row.slug.includes(needle) || (product?.name ?? "").toLowerCase().includes(needle));
  }, [rows, q]);

  const updateLocal = (slug: string, patch: Partial<InventoryRow>) => {
    setRows((prev) => prev.map((row) => (row.slug === slug ? { ...row, ...patch } : row)));
  };

  const save = async (row: InventoryRow) => {
    setSaving(row.slug);
    const { error } = await supabase
      .from("product_inventory")
      .update({
        quantity_remaining: Math.max(0, Number(row.quantity_remaining)),
        low_stock_threshold: Math.max(0, Number(row.low_stock_threshold)),
        active: row.active,
      })
      .eq("slug", row.slug);
    setSaving(null);
    if (error) toast.error(error.message);
    else {
      toast.success("Inventory saved");
      refresh();
    }
  };

  return (
    <div className="pt-32">
      <section className="container-luxe pb-8">
        <Eyebrow>Admin</Eyebrow>
        <h1 className="mt-3 font-display text-5xl text-cream md:text-6xl">
          Inventory <span className="italic gold-text">Control</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Set quantity and low-stock thresholds. Menu badges update automatically.</p>
      </section>

      <section className="container-luxe pb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search product or slug" className="w-full rounded-full border border-border/60 bg-card/40 py-3 pl-11 pr-4 text-sm text-cream placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
        </div>
      </section>

      <section className="container-luxe pb-24">
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/30">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-black/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Low stock at</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {enriched.map(({ row, product }) => (
                  <tr key={row.slug} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product ? <img src={product.image} alt={product.name} className="h-12 w-12 rounded-lg object-cover" /> : <span className="grid h-12 w-12 place-items-center rounded-lg border border-border text-primary"><Warehouse className="h-4 w-4" /></span>}
                        <div>
                          <p className="font-medium text-cream">{product?.name ?? row.slug}</p>
                          <p className="text-xs text-muted-foreground">{row.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><NumberInput value={row.quantity_remaining} onChange={(v) => updateLocal(row.slug, { quantity_remaining: v })} /></td>
                    <td className="px-4 py-3"><NumberInput value={row.low_stock_threshold} onChange={(v) => updateLocal(row.slug, { low_stock_threshold: v })} /></td>
                    <td className="px-4 py-3"><StockPill status={row.stock_status ?? "in"} /></td>
                    <td className="px-4 py-3"><input type="checkbox" checked={row.active} onChange={(e) => updateLocal(row.slug, { active: e.target.checked })} className="h-4 w-4 accent-primary" /></td>
                    <td className="px-4 py-3"><button onClick={() => save(row)} disabled={saving === row.slug} className="btn-gold btn-gold-hover inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-60"><Save className="h-3.5 w-3.5" /> {saving === row.slug ? "Saving…" : "Save"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function NumberInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return <input type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-28 rounded-lg border border-border/60 bg-transparent px-3 py-2 text-sm text-cream focus:border-primary focus:outline-none" />;
}

function StockPill({ status }: { status: string }) {
  const cls = status === "out" ? "border-red-400/60 bg-red-400/10 text-red-300" : status === "low" ? "border-amber-400/60 bg-amber-400/10 text-amber-300" : "border-emerald-400/60 bg-emerald-400/10 text-emerald-300";
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase ${cls}`}>{status}</span>;
}