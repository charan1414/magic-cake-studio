import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Save, Search, Tag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS } from "@/lib/data";
import { Eyebrow } from "@/components/motion-primitives";
import { Check, DateTime, Num, Select, Text } from "@/components/admin-form";
import {
  OFFER_TYPES,
  PRODUCT_LABELS,
  pricingFor,
  invalidateCatalog,
  type Offer,
  type ProductOverride,
} from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin/products")({
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
      { title: "Admin · Products — C & It's Magic" },
      { name: "description", content: "Manage products, pricing, discounts, labels and offers." },
      { property: "og:title", content: "Admin · Products — C & It's Magic" },
      { property: "og:description", content: "Product, pricing and offer management." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminProducts,
});

const blank = (slug: string): ProductOverride => ({
  slug,
  name: null,
  category: null,
  sku: null,
  description: null,
  image: null,
  mrp: null,
  price: null,
  discount_type: "none",
  discount_value: 0,
  availability: "in",
  display_order: 0,
  status: "active",
  labels: [],
  pinned: false,
  highlighted: false,
});

function AdminProducts() {
  const [rows, setRows] = useState<Record<string, ProductOverride>>({});
  const [offers, setOffers] = useState<Offer[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const refresh = async () => {
    const [{ data: ov }, { data: of }] = await Promise.all([
      supabase.from("product_overrides").select("*"),
      supabase.from("offers").select("*").order("created_at", { ascending: false }),
    ]);
    const map: Record<string, ProductOverride> = {};
    for (const row of (ov ?? []) as ProductOverride[]) map[row.slug] = row;
    setRows(map);
    setOffers((of ?? []) as Offer[]);
    invalidateCatalog();
  };

  useEffect(() => {
    refresh();
  }, []);

  const categories = useMemo(() => Array.from(new Set(PRODUCTS.map((p) => p.category))).sort(), []);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const o = rows[p.slug];
      if (category !== "all" && (o?.category ?? p.category) !== category) return false;
      if (status !== "all" && (o?.status ?? "active") !== status) return false;
      if (!needle) return true;
      return (
        p.name.toLowerCase().includes(needle) ||
        p.slug.includes(needle) ||
        (o?.sku ?? "").toLowerCase().includes(needle) ||
        p.category.includes(needle) ||
        String(o?.price ?? p.price).includes(needle)
      );
    });
  }, [rows, q, category, status]);

  const patch = (slug: string, p: Partial<ProductOverride>) =>
    setRows((prev) => ({ ...prev, [slug]: { ...(prev[slug] ?? blank(slug)), ...p } }));

  const save = async (slug: string) => {
    const row = rows[slug] ?? blank(slug);
    setSaving(slug);
    const { error } = await supabase.from("product_overrides").upsert(
      {
        ...row,
        slug,
        mrp: row.mrp === null || Number.isNaN(Number(row.mrp)) ? null : Number(row.mrp),
        price: row.price === null || Number.isNaN(Number(row.price)) ? null : Number(row.price),
        discount_value: Number(row.discount_value) || 0,
        display_order: Number(row.display_order) || 0,
      },
      { onConflict: "slug" },
    );
    setSaving(null);
    if (error) toast.error(error.message);
    else {
      toast.success("Product saved");
      invalidateCatalog();
      refresh();
    }
  };

  return (
    <div className="pt-32">
      <section className="container-luxe pb-8">
        <Eyebrow>Admin</Eyebrow>
        <h1 className="mt-3 font-display text-5xl text-cream md:text-6xl">
          Product <span className="italic gold-text">Management</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Pricing, discounts, labels, ordering and visibility — live across the site the moment you save.</p>
      </section>

      <section className="container-luxe grid gap-3 pb-6 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, SKU, category, price" className="w-full rounded-full border border-border/60 bg-card/40 py-3 pl-11 pr-4 text-sm text-cream placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
        </div>
        <Select value={category} onChange={setCategory} options={[["all", "All categories"], ...categories.map((c) => [c, c] as [string, string])]} />
        <Select value={status} onChange={setStatus} options={[["all", "All statuses"], ["active", "Active"], ["hidden", "Hidden"]]} />
      </section>

      <section className="container-luxe pb-16">
        <div className="space-y-3">
          {list.map((p) => {
            const row = rows[p.slug] ?? blank(p.slug);
            const preview = pricingFor(p, row, []);
            const open = openSlug === p.slug;
            return (
              <div key={p.slug} className="overflow-hidden rounded-2xl border border-border/60 bg-card/30">
                <button onClick={() => setOpenSlug(open ? null : p.slug)} className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-white/[0.02]">
                  <img src={row.image ?? p.image} alt={p.name} className="h-14 w-14 rounded-lg object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-cream">{row.name ?? p.name}</p>
                    <p className="text-xs text-muted-foreground">{row.category ?? p.category} · {row.sku ?? p.slug}</p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="font-display text-lg gold-text">₹{preview.price.toLocaleString("en-IN")}</p>
                    {preview.mrp && <p className="text-[11px] text-muted-foreground line-through">₹{preview.mrp.toLocaleString("en-IN")}</p>}
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase ${row.status === "hidden" ? "border-red-400/50 text-red-300" : "border-emerald-400/50 text-emerald-300"}`}>{row.status}</span>
                </button>

                {open && (
                  <div className="grid gap-4 border-t border-border/50 p-5 md:grid-cols-3">
                    <Text label="Display name" value={row.name ?? ""} onChange={(v) => patch(p.slug, { name: v || null })} placeholder={p.name} />
                    <Text label="Category" value={row.category ?? ""} onChange={(v) => patch(p.slug, { category: v || null })} placeholder={p.category} />
                    <Text label="SKU" value={row.sku ?? ""} onChange={(v) => patch(p.slug, { sku: v || null })} placeholder={p.slug.toUpperCase()} />
                    <Text label="Image URL" value={row.image ?? ""} onChange={(v) => patch(p.slug, { image: v || null })} placeholder="https://…" className="md:col-span-2" />
                    <Text label="Description" value={row.description ?? ""} onChange={(v) => patch(p.slug, { description: v || null })} placeholder={p.description} className="md:col-span-3" />

                    <Num label="Original price (MRP ₹)" value={row.mrp} onChange={(v) => patch(p.slug, { mrp: v })} />
                    <Num label="Selling price (₹)" value={row.price} onChange={(v) => patch(p.slug, { price: v })} placeholder={String(p.price)} />
                    <div className="grid grid-cols-2 gap-3">
                      <Select label="Discount type" value={row.discount_type} onChange={(v) => patch(p.slug, { discount_type: v })} options={[["none", "No discount"], ["percent", "Percentage %"], ["amount", "Fixed ₹"]]} />
                      <Num label="Discount value" value={row.discount_value} onChange={(v) => patch(p.slug, { discount_value: v ?? 0 })} />
                    </div>

                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 md:col-span-3">
                      <p className="eyebrow">Live preview</p>
                      <div className="mt-2 flex flex-wrap items-baseline gap-3">
                        {preview.mrp && <span className="text-sm text-muted-foreground line-through">₹{preview.mrp.toLocaleString("en-IN")}</span>}
                        <span className="font-display text-3xl gold-text">₹{preview.price.toLocaleString("en-IN")}</span>
                        {preview.discountPct > 0 && <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[11px] font-semibold text-white">{preview.discountPct}% OFF</span>}
                        {preview.saved > 0 && <span className="text-sm text-emerald-400">You save ₹{preview.saved.toLocaleString("en-IN")}</span>}
                      </div>
                    </div>

                    <Select label="Availability" value={row.availability} onChange={(v) => patch(p.slug, { availability: v })} options={[["in", "In stock"], ["low", "Low stock"], ["out", "Out of stock"]]} />
                    <Select label="Status" value={row.status} onChange={(v) => patch(p.slug, { status: v })} options={[["active", "Active"], ["hidden", "Hidden"]]} />
                    <Num label="Display order" value={row.display_order} onChange={(v) => patch(p.slug, { display_order: v ?? 0 })} />

                    <div className="md:col-span-3">
                      <p className="eyebrow mb-2">Labels</p>
                      <div className="flex flex-wrap gap-2">
                        {PRODUCT_LABELS.map((l) => {
                          const on = row.labels.includes(l.key);
                          return (
                            <button
                              key={l.key}
                              onClick={() => patch(p.slug, { labels: on ? row.labels.filter((x) => x !== l.key) : [...row.labels, l.key] })}
                              className={`rounded-full border px-3 py-1.5 text-xs ${on ? "border-primary bg-primary/15 text-primary" : "border-border/60 text-muted-foreground hover:border-primary/40"}`}
                            >
                              {l.emoji} {l.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-5 md:col-span-3">
                      <Check label="Pinned" checked={row.pinned} onChange={(v) => patch(p.slug, { pinned: v })} />
                      <Check label="Highlighted" checked={row.highlighted} onChange={(v) => patch(p.slug, { highlighted: v })} />
                      <button onClick={() => save(p.slug)} disabled={saving === p.slug} className="btn-gold btn-gold-hover ml-auto inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold disabled:opacity-60">
                        <Save className="h-3.5 w-3.5" /> {saving === p.slug ? "Saving…" : "Save product"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <OffersPanel offers={offers} onChange={refresh} categories={categories} />
    </div>
  );
}

function OffersPanel({ offers, onChange, categories }: { offers: Offer[]; onChange: () => void; categories: string[] }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("flash");
  const [discountType, setDiscountType] = useState("percent");
  const [value, setValue] = useState<number | null>(10);
  const [cats, setCats] = useState<string[]>([]);
  const [slugs, setSlugs] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const create = async () => {
    if (!title.trim()) return toast.error("Give the offer a title");
    const { error } = await supabase.from("offers").insert({
      title: title.trim(),
      offer_type: type,
      discount_type: discountType,
      discount_value: Number(value) || 0,
      categories: cats,
      product_slugs: slugs.split(",").map((s) => s.trim()).filter(Boolean),
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
    });
    if (error) return toast.error(error.message);
    toast.success("Offer created");
    setTitle("");
    setSlugs("");
    setCats([]);
    onChange();
  };

  const toggle = async (offer: Offer) => {
    const { error } = await supabase.from("offers").update({ active: !offer.active }).eq("id", offer.id);
    if (error) toast.error(error.message);
    else onChange();
  };

  const remove = async (offer: Offer) => {
    const { error } = await supabase.from("offers").delete().eq("id", offer.id);
    if (error) toast.error(error.message);
    else onChange();
  };

  return (
    <section className="container-luxe pb-24">
      <div className="rounded-3xl border border-border/60 bg-card/30 p-6">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          <h2 className="font-display text-2xl text-cream">Offer management</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Scheduled offers switch themselves on and off automatically.</p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Text label="Offer title" value={title} onChange={setTitle} placeholder="Weekend Cake Fest" />
          <Select label="Offer type" value={type} onChange={setType} options={OFFER_TYPES.map((o) => [o.key, o.label] as [string, string])} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Discount" value={discountType} onChange={setDiscountType} options={[["percent", "Percentage %"], ["amount", "Fixed ₹"]]} />
            <Num label="Value" value={value} onChange={setValue} />
          </div>
          <Text label="Product slugs (comma separated)" value={slugs} onChange={setSlugs} placeholder="mango-magic-cake, ck-butter" className="md:col-span-3" />
          <div className="md:col-span-3">
            <p className="eyebrow mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const on = cats.includes(c);
                return (
                  <button key={c} onClick={() => setCats(on ? cats.filter((x) => x !== c) : [...cats, c])} className={`rounded-full border px-3 py-1.5 text-xs ${on ? "border-primary bg-primary/15 text-primary" : "border-border/60 text-muted-foreground"}`}>
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          <DateTime label="Starts" value={startsAt} onChange={setStartsAt} />
          <DateTime label="Ends" value={endsAt} onChange={setEndsAt} />
          <div className="flex items-end">
            <button onClick={create} className="btn-gold btn-gold-hover w-full rounded-full px-5 py-3 text-xs font-semibold">Create offer</button>
          </div>
        </div>

        <div className="mt-8 space-y-2">
          {offers.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border/50 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-cream">{o.title}</p>
                <p className="text-xs text-muted-foreground">
                  {OFFER_TYPES.find((t) => t.key === o.offer_type)?.label} · {o.discount_type === "percent" ? `${o.discount_value}%` : `₹${o.discount_value}`} ·{" "}
                  {o.starts_at ? new Date(o.starts_at).toLocaleDateString() : "now"} → {o.ends_at ? new Date(o.ends_at).toLocaleDateString() : "open"}
                </p>
              </div>
              <button onClick={() => toggle(o)} className={`rounded-full border px-3 py-1 text-[11px] ${o.active ? "border-emerald-400/50 text-emerald-300" : "border-border text-muted-foreground"}`}>
                {o.active ? "Active" : "Paused"}
              </button>
              <button onClick={() => remove(o)} className="text-xs text-muted-foreground hover:text-destructive">Delete</button>
            </div>
          ))}
          {offers.length === 0 && <p className="text-xs text-muted-foreground">No offers yet.</p>}
        </div>
      </div>
    </section>
  );
}
