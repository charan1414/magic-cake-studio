import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Eyebrow } from "@/components/motion-primitives";
import type { Addon } from "@/components/checkout-addons";

export const Route = createFileRoute("/_authenticated/admin/addons")({
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
      { title: "Admin · Add-ons — C & It's Magic" },
      { name: "description", content: "Manage checkout add-ons like candles, toppers and caps." },
      { property: "og:title", content: "Admin · Add-ons — C & It's Magic" },
      { property: "og:description", content: "Checkout add-on management." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminAddons,
});

const table = () => supabase.from("addons" as never) as any;

function AdminAddons() {
  const [rows, setRows] = useState<Addon[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const refresh = async () => {
    const { data } = await table().select("*").order("display_order");
    setRows(data ?? []);
  };
  useEffect(() => { refresh(); }, []);

  const save = async (a: Addon) => {
    const { error } = await table().update({ name: a.name, price: a.price, active: a.active, display_order: a.display_order }).eq("id", a.id);
    if (error) toast.error(error.message); else { toast.success("Saved"); refresh(); }
  };
  const create = async () => {
    if (!name.trim()) return toast.error("Enter a name");
    const { error } = await table().insert({ name: name.trim(), price: price === "" ? null : Number(price), display_order: rows.length + 1 });
    if (error) toast.error(error.message); else { setName(""); setPrice(""); refresh(); }
  };
  const del = async (id: string) => {
    if (!confirm("Delete this add-on?")) return;
    const { error } = await table().delete().eq("id", id);
    if (error) toast.error(error.message); else refresh();
  };
  const patch = (id: string, p: Partial<Addon>) => setRows((r) => r.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const input = "rounded-xl border border-border bg-background/40 px-3 py-2 text-sm text-cream outline-none focus:border-primary";

  return (
    <div className="container-luxe pb-24 pt-32">
      <Eyebrow>Admin</Eyebrow>
      <h1 className="mt-3 font-display text-5xl text-cream">Add-ons</h1>
      <p className="mt-2 text-sm text-muted-foreground">Leave price empty to hide an add-on from ordering until it's priced.</p>

      <div className="mt-8 flex flex-wrap gap-3 rounded-3xl border border-border/60 bg-card/40 p-5">
        <input className={input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={`${input} w-32`} type="number" placeholder="Price ₹" value={price} onChange={(e) => setPrice(e.target.value)} />
        <button onClick={create} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Add</button>
      </div>

      <div className="mt-6 space-y-3">
        {rows.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card/40 p-4">
            <input className={`${input} flex-1`} value={a.name} onChange={(e) => patch(a.id, { name: e.target.value })} />
            <input className={`${input} w-28`} type="number" placeholder="Not set" value={a.price ?? ""} onChange={(e) => patch(a.id, { price: e.target.value === "" ? null : Number(e.target.value) })} />
            <input className={`${input} w-20`} type="number" title="Order" value={a.display_order} onChange={(e) => patch(a.id, { display_order: Number(e.target.value) })} />
            <label className="flex items-center gap-2 text-xs text-cream/80">
              <input type="checkbox" checked={a.active} onChange={(e) => patch(a.id, { active: e.target.checked })} /> Enabled
            </label>
            {a.price == null && <span className="text-[11px] text-primary">Price not set</span>}
            <button onClick={() => save(a)} className="rounded-full border border-primary/60 px-4 py-1.5 text-xs text-primary hover:bg-primary/10">Save</button>
            <button onClick={() => del(a.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
