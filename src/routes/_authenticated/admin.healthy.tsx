import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Leaf, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Eyebrow } from "@/components/motion-primitives";
import { Check, DateTime, Num, Select, Text, TextArea } from "@/components/admin-form";
import {
  HEALTHY_BADGES,
  HEALTHY_STATUSES,
  healthyImage,
  healthyPricing,
  useAllHealthyProducts,
  type HealthyProduct,
} from "@/lib/healthy";

export const Route = createFileRoute("/_authenticated/admin/healthy")({
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
      { title: "Admin · No Maida No Sugar — C & It's Magic" },
      { name: "description", content: "Manage the No Maida No Sugar range: products, prices, discounts and badges." },
      { property: "og:title", content: "Admin · No Maida No Sugar" },
      { property: "og:description", content: "Healthy range content management." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminHealthy;
});

const toLocal = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");

function AdminHealthy() {
  const { items, loading, refresh, setItems } = useAllHealthyProducts();
  const [openId, setOpenId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const patch = (id: string, p: Partial<HealthyProduct>) =>
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const save = async (row: HealthyProduct) => {
    setSaving(row.id);
    const { error } = await supabase
      .from("healthy_products")
      .update({
        slug: row.slug,
        name: row.name,
        description: row.description,
        image_url: row.image_url,
        price: Number(row.price) || 0,
        discount_percent: Number(row.discount_percent) || 0,
        discount_starts_at: row.discount_starts_at,
        discount_ends_at: row.discount_ends_at,
        badges: row.badges,
        status: row.status,
        display_order: Number(row.display_order) || 0,
        enabled: row.enabled,
      })
      .eq("id", row.id);
    setSaving(null);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      refresh();
    }
  };

  const create = async () => {
    const stamp = Date.now().toString(36);
    const { error } = await supabase.from("healthy_products").insert({
      slug: `new-item-${stamp}`,
      name: "New healthy item",
      description: "Describe this clean-label treat.",
      price: 99,
      badges: [],
      status: "in",
      display_order: items.length + 1,
      enabled: false,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Draft item created — it stays hidden until you enable it");
      refresh();
    }
  };

  const remove = async (row: HealthyProduct) => {
    const { error } = await supabase.from("healthy_products").delete().eq("id", row.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      refresh();
    }
  };

  return (
    <div className="pt-32">
      <section className="container-luxe pb-8">
        <Eyebrow>Admin</Eyebrow>
        <h1 className="mt-3 flex flex-wrap items-center gap-3 font-display text-5xl text-cream md:text-6xl">
          No Maida <span className="italic gold-text">No Sugar</span>
          <Leaf className="h-7 w-7 text-emerald-400" />
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Add products, set prices, schedule discounts and control badges — everything goes live on the site the moment you save.
        </p>
        <button onClick={create} className="btn-gold btn-gold-hover mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold">
          <Plus className="h-3.5 w-3.5" /> Add product
        </button>
      </section>

      <section className="container-luxe pb-24">
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        <div className="space-y-3">
          {items.map((row) => {
            const open = openId === row.id;
            const preview = healthyPricing(row);
            return (
              <div key={row.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card/30">
                <button onClick={() => setOpenId(open ? null : row.id)} className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-white/[0.02]">
                  <img src={healthyImage(row)} alt={row.name} className="h-14 w-14 rounded-lg object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-cream">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.slug} · order {row.display_order}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="font-display text-lg gold-text">₹{preview.price.toLocaleString("en-IN")}</p>
                    {preview.mrp && <p className="text-[11px] text-muted-foreground line-through">₹{preview.mrp.toLocaleString("en-IN")}</p>}
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase ${row.enabled ? "border-emerald-400/50 text-emerald-300" : "border-red-400/50 text-red-300"}`}>
                    {row.enabled ? row.status : "off"}
                  </span>
                </button>

                {open && (
                  <div className="grid gap-4 border-t border-border/50 p-5 md:grid-cols-3">
                    <Text label="Product name" value={row.name} onChange={(v) => patch(row.id, { name: v })} />
                    <Text label="Slug" value={row.slug} onChange={(v) => patch(row.id, { slug: v })} />
                    <Text label="Image URL" value={row.image_url ?? ""} onChange={(v) => patch(row.id, { image_url: v || null })} placeholder="Leave blank for built-in artwork" />
                    <TextArea label="Description" value={row.description ?? ""} onChange={(v) => patch(row.id, { description: v || null })} rows={3} className="md:col-span-3" />

                    <Num label="Price (₹)" value={row.price} onChange={(v) => patch(row.id, { price: v ?? 0 })} />
                    <Num label="Discount %" value={row.discount_percent} onChange={(v) => patch(row.id, { discount_percent: v ?? 0 })} />
                    <Num label="Display order" value={row.display_order} onChange={(v) => patch(row.id, { display_order: v ?? 0 })} />
                    <DateTime label="Discount starts" value={toLocal(row.discount_starts_at)} onChange={(v) => patch(row.id, { discount_starts_at: v ? new Date(v).toISOString() : null })} />
                    <DateTime label="Discount ends" value={toLocal(row.discount_ends_at)} onChange={(v) => patch(row.id, { discount_ends_at: v ? new Date(v).toISOString() : null })} />
                    <Select label="Stock status" value={row.status} onChange={(v) => patch(row.id, { status: v })} options={HEALTHY_STATUSES} />

                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 md:col-span-3">
                      <p className="eyebrow">Live preview</p>
                      <div className="mt-2 flex flex-wrap items-baseline gap-3">
                        {preview.mrp && <span className="text-sm text-muted-foreground line-through">₹{preview.mrp.toLocaleString("en-IN")}</span>}
                        <span className="font-display text-3xl gold-text">₹{preview.price.toLocaleString("en-IN")}</span>
                        {preview.discountPct > 0 && <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[11px] font-semibold text-white">{preview.discountPct}% OFF</span>}
                        {preview.saved > 0 && <span className="text-sm text-emerald-400">You save ₹{preview.saved.toLocaleString("en-IN")}</span>}
                      </div>
                    </div>

                    <div className="md:col-span-3">
                      <p className="eyebrow mb-2">Badges</p>
                      <div className="flex flex-wrap gap-2">
                        {HEALTHY_BADGES.map((b) => {
                          const on = row.badges.includes(b.key);
                          return (
                            <button
                              key={b.key}
                              onClick={() => patch(row.id, { badges: on ? row.badges.filter((x) => x !== b.key) : [...row.badges, b.key] })}
                              className={`rounded-full border px-3 py-1.5 text-xs ${on ? "border-primary bg-primary/15 text-primary" : "border-border/60 text-muted-foreground hover:border-primary/40"}`}
                            >
                              {b.emoji} {b.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-5 md:col-span-3">
                      <Check label="Visible on site" checked={row.enabled} onChange={(v) => patch(row.id, { enabled: v })} />
                      <button onClick={() => remove(row)} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                      <button onClick={() => save(row)} disabled={saving === row.id} className="btn-gold btn-gold-hover ml-auto inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold disabled:opacity-60">
                        <Save className="h-3.5 w-3.5" /> {saving === row.id ? "Saving…" : "Save product"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {!loading && items.length === 0 && <p className="text-sm text-muted-foreground">No healthy products yet — add your first one.</p>}
        </div>
      </section>
    </div>
  );
}
