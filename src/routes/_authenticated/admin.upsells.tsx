import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS } from "@/lib/data";
import { Eyebrow } from "@/components/motion-primitives";
import { UPSELL_TAGS, type RecommendationRule, type UpsellItem, type UpsellSettings } from "@/lib/catalog";
import { Check, DateTime, Num, Select, Text } from "./admin.products";

export const Route = createFileRoute("/_authenticated/admin/upsells")({
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
      { title: "Admin · Upsells — C & It's Magic" },
      { name: "description", content: "Manage checkout upsells and smart recommendation rules." },
      { property: "og:title", content: "Admin · Upsells — C & It's Magic" },
      { property: "og:description", content: "Checkout upsell and recommendation management." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminUpsells,
});

function AdminUpsells() {
  const [settings, setSettings] = useState<UpsellSettings>({ enabled: true, section_title: "Complete Your Order", layout: "carousel", max_items: 6 });
  const [items, setItems] = useState<UpsellItem[]>([]);
  const [rules, setRules] = useState<RecommendationRule[]>([]);
  const categories = useMemo(() => Array.from(new Set(PRODUCTS.map((p) => p.category))).sort(), []);

  const refresh = async () => {
    const [s, i, r] = await Promise.all([
      supabase.from("upsell_settings").select("*").maybeSingle(),
      supabase.from("upsell_items").select("*").order("priority", { ascending: false }),
      supabase.from("recommendation_rules").select("*").order("priority", { ascending: false }),
    ]);
    if (s.data) setSettings(s.data as UpsellSettings);
    setItems((i.data as UpsellItem[] | null) ?? []);
    setRules((r.data as RecommendationRule[] | null) ?? []);
  };

  useEffect(() => {
    refresh();
  }, []);

  const saveSettings = async () => {
    const { error } = await supabase.from("upsell_settings").upsert({ id: true, ...settings, max_items: Number(settings.max_items) || 6 });
    if (error) toast.error(error.message);
    else toast.success("Upsell settings saved");
  };

  return (
    <div className="pt-32">
      <section className="container-luxe pb-8">
        <Eyebrow>Admin</Eyebrow>
        <h1 className="mt-3 font-display text-5xl text-cream md:text-6xl">
          Checkout <span className="italic gold-text">Upsells</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Curate the "Complete Your Order" strip and the rules that power smart suggestions.</p>
      </section>

      <section className="container-luxe pb-10">
        <div className="grid gap-4 rounded-3xl border border-border/60 bg-card/30 p-6 md:grid-cols-4">
          <Text label="Section title" value={settings.section_title} onChange={(v) => setSettings({ ...settings, section_title: v })} />
          <Select label="Layout" value={settings.layout} onChange={(v) => setSettings({ ...settings, layout: v })} options={[["carousel", "Carousel"], ["grid", "Grid"]]} />
          <Num label="Max items" value={settings.max_items} onChange={(v) => setSettings({ ...settings, max_items: v ?? 6 })} />
          <div className="flex items-end justify-between gap-3">
            <Check label="Enabled" checked={settings.enabled} onChange={(v) => setSettings({ ...settings, enabled: v })} />
            <button onClick={saveSettings} className="btn-gold btn-gold-hover rounded-full px-5 py-2.5 text-xs font-semibold">Save</button>
          </div>
        </div>
      </section>

      <UpsellItems items={items} onChange={refresh} />
      <Rules rules={rules} categories={categories} onChange={refresh} />
    </div>
  );
}

function UpsellItems({ items, onChange }: { items: UpsellItem[]; onChange: () => void }) {
  const [slug, setSlug] = useState(PRODUCTS[0]?.slug ?? "");
  const [promo, setPromo] = useState<number | null>(null);
  const [discountType, setDiscountType] = useState("none");
  const [discountValue, setDiscountValue] = useState<number | null>(0);
  const [priority, setPriority] = useState<number | null>(0);
  const [tags, setTags] = useState<string[]>([]);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const add = async () => {
    const { error } = await supabase.from("upsell_items").insert({
      slug,
      promo_price: promo,
      discount_type: discountType,
      discount_value: Number(discountValue) || 0,
      priority: Number(priority) || 0,
      tags,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
    });
    if (error) return toast.error(error.message);
    toast.success("Upsell added");
    setTags([]);
    setPromo(null);
    onChange();
  };

  const toggle = async (item: UpsellItem) => {
    const { error } = await supabase.from("upsell_items").update({ active: !item.active }).eq("id", item.id);
    if (error) toast.error(error.message);
    else onChange();
  };

  const remove = async (item: UpsellItem) => {
    const { error } = await supabase.from("upsell_items").delete().eq("id", item.id);
    if (error) toast.error(error.message);
    else onChange();
  };

  return (
    <section className="container-luxe pb-10">
      <div className="rounded-3xl border border-border/60 bg-card/30 p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-display text-2xl text-cream">Curated upsell products</h2>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Select label="Product" value={slug} onChange={setSlug} options={PRODUCTS.map((p) => [p.slug, `${p.name} · ₹${p.price}`] as [string, string])} />
          <Num label="Promo price (₹, optional)" value={promo} onChange={setPromo} />
          <Select label="Discount type" value={discountType} onChange={setDiscountType} options={[["none", "None"], ["percent", "Percentage %"], ["amount", "Fixed ₹"]]} />
          <Num label="Discount value" value={discountValue} onChange={setDiscountValue} />
          <DateTime label="Starts" value={startsAt} onChange={setStartsAt} />
          <DateTime label="Ends" value={endsAt} onChange={setEndsAt} />
          <Num label="Priority" value={priority} onChange={setPriority} />
          <div className="flex items-end">
            <button onClick={add} className="btn-gold btn-gold-hover w-full rounded-full px-5 py-3 text-xs font-semibold">Add upsell</button>
          </div>
          <div className="md:col-span-4">
            <p className="eyebrow mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {UPSELL_TAGS.map((t) => {
                const on = tags.includes(t);
                return (
                  <button key={t} onClick={() => setTags(on ? tags.filter((x) => x !== t) : [...tags, t])} className={`rounded-full border px-3 py-1.5 text-xs ${on ? "border-primary bg-primary/15 text-primary" : "border-border/60 text-muted-foreground"}`}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-2">
          {items.map((it) => {
            const product = PRODUCTS.find((p) => p.slug === it.slug);
            return (
              <div key={it.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border/50 px-4 py-3">
                {product && <img src={product.image} alt={product.name} className="h-11 w-11 rounded-lg object-cover" loading="lazy" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-cream">{product?.name ?? it.slug}</p>
                  <p className="text-xs text-muted-foreground">
                    {it.promo_price != null ? `₹${it.promo_price}` : it.discount_type === "none" ? "Standard price" : it.discount_type === "percent" ? `${it.discount_value}% off` : `₹${it.discount_value} off`} · priority {it.priority}
                    {it.tags.length ? ` · ${it.tags.join(", ")}` : ""}
                  </p>
                </div>
                <button onClick={() => toggle(it)} className={`rounded-full border px-3 py-1 text-[11px] ${it.active ? "border-emerald-400/50 text-emerald-300" : "border-border text-muted-foreground"}`}>
                  {it.active ? "Active" : "Paused"}
                </button>
                <button onClick={() => remove(it)} aria-label="Delete" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            );
          })}
          {items.length === 0 && <p className="text-xs text-muted-foreground">No curated upsells yet — recommendation rules will fill the strip.</p>}
        </div>
      </div>
    </section>
  );
}

function Rules({ rules, categories, onChange }: { rules: RecommendationRule[]; categories: string[]; onChange: () => void }) {
  const [trigger, setTrigger] = useState(categories[0] ?? "cakes");
  const [recCats, setRecCats] = useState<string[]>([]);
  const [slugs, setSlugs] = useState("");
  const [priority, setPriority] = useState<number | null>(0);

  useEffect(() => {
    if (!trigger && categories[0]) setTrigger(categories[0]);
  }, [categories, trigger]);

  const add = async () => {
    const { error } = await supabase.from("recommendation_rules").insert({
      trigger_category: trigger,
      recommend_categories: recCats,
      recommend_slugs: slugs.split(",").map((s) => s.trim()).filter(Boolean),
      priority: Number(priority) || 0,
    });
    if (error) return toast.error(error.message);
    toast.success("Rule added");
    setRecCats([]);
    setSlugs("");
    onChange();
  };

  const remove = async (rule: RecommendationRule) => {
    const { error } = await supabase.from("recommendation_rules").delete().eq("id", rule.id);
    if (error) toast.error(error.message);
    else onChange();
  };

  return (
    <section className="container-luxe pb-24">
      <div className="rounded-3xl border border-border/60 bg-card/30 p-6">
        <h2 className="font-display text-2xl text-cream">Smart recommendation rules</h2>
        <p className="mt-1 text-xs text-muted-foreground">e.g. cart contains a cake → suggest cookies and ice cream.</p>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Select label="When cart contains" value={trigger} onChange={setTrigger} options={categories.map((c) => [c, c] as [string, string])} />
          <Text label="Recommend slugs (comma separated)" value={slugs} onChange={setSlugs} placeholder="ck-butter, dbc-sundae" className="md:col-span-2" />
          <Num label="Priority" value={priority} onChange={setPriority} />
          <div className="md:col-span-3">
            <p className="eyebrow mb-2">Recommend categories</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const on = recCats.includes(c);
                return (
                  <button key={c} onClick={() => setRecCats(on ? recCats.filter((x) => x !== c) : [...recCats, c])} className={`rounded-full border px-3 py-1.5 text-xs ${on ? "border-primary bg-primary/15 text-primary" : "border-border/60 text-muted-foreground"}`}>
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-end">
            <button onClick={add} className="btn-gold btn-gold-hover w-full rounded-full px-5 py-3 text-xs font-semibold">Add rule</button>
          </div>
        </div>

        <div className="mt-8 space-y-2">
          {rules.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border/50 px-4 py-3">
              <p className="min-w-0 flex-1 text-sm text-cream">
                <span className="text-primary">{r.trigger_category}</span> → {[...r.recommend_categories, ...r.recommend_slugs].join(", ") || "—"}
              </p>
              <span className="text-xs text-muted-foreground">priority {r.priority}</span>
              <button onClick={() => remove(r)} aria-label="Delete" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {rules.length === 0 && <p className="text-xs text-muted-foreground">No rules yet.</p>}
        </div>
      </div>
    </section>
  );
}
