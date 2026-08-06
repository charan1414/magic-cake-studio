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
  component: AdminHealthy,
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
        description: row.description ?? "",
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

      <StorefrontPanel />
      <NotifyInbox />
    </div>
  );
}

/** Storefront sorting + cinematic content blocks for the healthy range. */
function StorefrontPanel() {
  const { settings, setSettings, refresh } = useHealthySettings();
  const [busy, setBusy] = useState(false);

  const setBlock = (key: "ingredients" | "nutrition" | "process", i: number, p: Partial<HealthyBlock>) =>
    setSettings((s) => ({ ...s, [key]: s[key].map((b, idx) => (idx === i ? { ...b, ...p } : b)) }));
  const addBlock = (key: "ingredients" | "nutrition" | "process") =>
    setSettings((s) => ({ ...s, [key]: [...s[key], { title: "New block", body: "" }] }));
  const removeBlock = (key: "ingredients" | "nutrition" | "process", i: number) =>
    setSettings((s) => ({ ...s, [key]: s[key].filter((_, idx) => idx !== i) }));

  const saveSettings = async () => {
    setBusy(true);
    const { error } = await supabase.from("healthy_settings").upsert({ id: true, ...settings }, { onConflict: "id" });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Storefront updated");
      refresh();
    }
  };

  const groups: [string, "ingredients" | "nutrition" | "process", "ingredients_title" | "nutrition_title" | "process_title"][] = [
    ["Ingredients", "ingredients", "ingredients_title"],
    ["Nutrition highlights", "nutrition", "nutrition_title"],
    ["How it's made", "process", "process_title"],
  ];

  return (
    <section className="container-luxe pb-24">
      <div className="rounded-2xl border border-border/60 bg-card/30 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Storefront</Eyebrow>
            <h2 className="mt-2 font-display text-3xl text-cream">Menu sorting & page content</h2>
            <p className="mt-2 text-sm text-muted-foreground">Promote items and rewrite the cinematic sections without touching code.</p>
          </div>
          <button onClick={saveSettings} disabled={busy} className="btn-gold btn-gold-hover inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold disabled:opacity-60">
            <Save className="h-3.5 w-3.5" /> {busy ? "Saving…" : "Save storefront"}
          </button>
        </div>

        <div className="mt-6 max-w-sm">
          <Select label="Menu sorting" value={settings.sort_mode} onChange={(v) => setSettings((s) => ({ ...s, sort_mode: v }))} options={SORT_MODES} />
        </div>

        <div className="mt-8 space-y-8">
          {groups.map(([label, key, titleKey]) => (
            <div key={key}>
              <p className="eyebrow mb-2">{label}</p>
              <Text label="Section heading" value={settings[titleKey]} onChange={(v) => setSettings((s) => ({ ...s, [titleKey]: v }))} />
              <div className="mt-3 space-y-3">
                {settings[key].map((b, i) => (
                  <div key={i} className="grid gap-3 rounded-xl border border-border/50 p-4 md:grid-cols-[1fr_2fr_auto]">
                    <Text label="Title" value={b.title} onChange={(v) => setBlock(key, i, { title: v })} />
                    <TextArea label="Body" rows={2} value={b.body} onChange={(v) => setBlock(key, i, { body: v })} />
                    <button onClick={() => removeBlock(key, i)} className="self-end pb-2 text-xs text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => addBlock(key)} className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3.5 py-2 text-xs text-cream/85 hover:border-primary/60 hover:text-primary">
                <Plus className="h-3.5 w-3.5" /> Add block
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type NotifyRow = {
  id: string;
  slug: string;
  product_name: string | null;
  email: string | null;
  phone: string | null;
  notified_at: string | null;
  created_at: string;
};

/** Waitlist captured from out-of-stock "Notify me" forms. */
function NotifyInbox() {
  const [rows, setRows] = useState<NotifyRow[]>([]);

  const load = async () => {
    const { data } = await supabase.from("notify_requests").select("*").order("created_at", { ascending: false }).limit(100);
    setRows((data ?? []) as NotifyRow[]);
  };

  useEffect(() => {
    load();
  }, []);

  const markNotified = async (row: NotifyRow) => {
    const { error } = await supabase.from("notify_requests").update({ notified_at: new Date().toISOString() }).eq("id", row.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Marked as notified");
      load();
    }
  };

  const contactLink = (row: NotifyRow) => {
    const msg = encodeURIComponent(`Good news! ${row.product_name ?? "Your item"} from C & It's Magic is back in stock.`);
    if (row.phone) return `https://wa.me/91${row.phone.slice(-10)}?text=${msg}`;
    return `mailto:${row.email}?subject=${encodeURIComponent("Back in stock — C & It's Magic")}&body=${msg}`;
  };

  return (
    <section className="container-luxe pb-24">
      <div className="rounded-2xl border border-border/60 bg-card/30 p-6">
        <div className="flex items-center gap-3">
          <BellRing className="h-5 w-5 text-primary" />
          <h2 className="font-display text-3xl text-cream">Notify-me waitlist</h2>
          <span className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground">{rows.filter((r) => !r.notified_at).length} pending</span>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-2 pr-4">Product</th>
                <th className="py-2 pr-4">Contact</th>
                <th className="py-2 pr-4">Requested</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 pr-4 text-cream">{r.product_name ?? r.slug}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{r.email ?? r.phone}</td>
                  <td className="py-3 pr-4 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("en-IN")}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase ${r.notified_at ? "border-emerald-400/50 text-emerald-300" : "border-amber-400/50 text-amber-300"}`}>
                      {r.notified_at ? "Notified" : "Pending"}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <a href={contactLink(r)} target="_blank" rel="noreferrer" className="rounded-full border border-border/60 px-3 py-1.5 text-[11px] text-cream/85 hover:border-primary/60 hover:text-primary">
                        Confirm availability
                      </a>
                      {!r.notified_at && (
                        <button onClick={() => markNotified(r)} className="rounded-full border border-border/60 px-3 py-1.5 text-[11px] text-cream/85 hover:border-primary/60 hover:text-primary">
                          Mark notified
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-sm text-muted-foreground">No requests yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

