import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, ImagePlus, Pencil, Plus, Save, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Eyebrow } from "@/components/motion-primitives";
import { Check, DateTime, Num, Select, Text, TextArea } from "@/components/admin-form";
import {
  MILKSHAKE_BADGES,
  MILKSHAKE_STATUSES,
  uploadProductImage,
  useMilkshakes,
  useSiteSection,
  type Milkshake,
  type ShakeOption,
  type ShakeSize,
  type SiteSection,
} from "@/lib/milkshakes";

export const Route = createFileRoute("/_authenticated/admin/milkshakes")({
  staticData: { sitemap: false },
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const [{ data: isAdmin }, { data: isStaff }] = await Promise.all([
      supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" }),
      supabase.rpc("has_role", { _user_id: data.user.id, _role: "staff" }),
    ]);
    if (!isAdmin && !isStaff) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Admin · Milkshakes — C & It's Magic" },
      { name: "description", content: "Manage milkshakes: products, photos, sizes, prices and the storefront section." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminMilkshakes,
});

const toLocal = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");

function AdminMilkshakes() {
  const { items, setItems, loading } = useMilkshakes(true);
  const { section, setSection, refresh: refreshSection } = useSiteSection("milkshakes");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const list = items.filter(
    (p) => (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.slug.includes(q.toLowerCase())) && (!filter || (filter === "inactive" ? !p.active : p.status === filter)),
  );

  const patch = (id: string, p: Partial<Milkshake>) => setItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const save = async (row: Milkshake) => {
    setSaving(row.id);
    const { error } = await supabase
      .from("milkshakes")
      .update({
        slug: row.slug,
        name: row.name,
        short_description: row.short_description,
        description: row.description,
        ingredients: row.ingredients,
        allergens: row.allergens,
        image_url: row.image_url,
        image_alt: row.image_alt,
        sizes: row.sizes,
        customisations: row.customisations,
        badges: row.badges,
        status: row.status,
        featured: row.featured,
        active: row.active,
        display_order: Number(row.display_order) || 0,
        prep_minutes: Number(row.prep_minutes) || 0,
      })
      .eq("id", row.id);
    setSaving(null);
    if (error) toast.error(error.message);
    else toast.success(`${row.name} saved`);
  };

  const create = async () => {
    const { data, error } = await supabase
      .from("milkshakes")
      .insert({
        slug: `new-shake-${Date.now().toString(36)}`,
        name: "New Milkshake",
        short_description: "A hand-blended signature shake.",
        sizes: [
          { label: "Regular", price: 149, sale_price: null },
          { label: "Large", price: 199, sale_price: null },
        ],
        customisations: [],
        badges: [],
        display_order: (items.length + 1) * 10,
      })
      .select();
    if (error) return toast.error(error.message);
    if (data?.length) setItems((prev) => [...prev, ...(data as unknown as Milkshake[])]);
    toast.success("Milkshake created — open it to edit");
  };

  const duplicate = async (row: Milkshake) => {
    const { id: _drop, slug: _s, ...rest } = row;
    const { data, error } = await supabase
      .from("milkshakes")
      .insert({ ...rest, slug: `${row.slug}-copy-${Date.now().toString(36)}`, name: `${row.name} (Copy)` })
      .select();
    if (error) return toast.error(error.message);
    if (data?.length) setItems((prev) => [...prev, ...(data as unknown as Milkshake[])]);
    toast.success("Duplicated");
  };

  const remove = async (row: Milkshake) => {
    if (!confirm(`Delete "${row.name}" permanently? This cannot be undone.`)) return;
    const { error } = await supabase.from("milkshakes").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    setItems((prev) => prev.filter((r) => r.id !== row.id));
    toast.success("Deleted");
  };

  return (
    <div className="container-luxe py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Admin</Eyebrow>
          <h1 className="mt-2 font-display text-4xl text-cream">Milkshakes</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings((v) => !v)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 text-xs font-medium text-primary">
            <Settings className="h-4 w-4" /> Section settings
          </button>
          <button onClick={create} className="btn-gold btn-gold-hover inline-flex min-h-10 items-center gap-2 rounded-full px-5 text-xs font-semibold">
            <Plus className="h-4 w-4" /> Add milkshake
          </button>
        </div>
      </div>

      {showSettings && <SectionSettings section={section} setSection={setSection} refresh={refreshSection} />}

      <div className="mt-6 flex flex-wrap gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or slug…" className="w-64 rounded-xl border border-border/60 bg-transparent px-3 py-2.5 text-sm text-cream focus:border-primary focus:outline-none" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-border/60 bg-transparent px-3 py-2.5 text-sm text-cream">
          <option value="">All</option>
          <option value="in">In stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <p className="mt-10 text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-6 space-y-4">
          {list.map((row) => (
            <Row key={row.id} row={row} saving={saving === row.id} patch={patch} save={save} duplicate={duplicate} remove={remove} />
          ))}
          {list.length === 0 && <p className="text-muted-foreground">No milkshakes match.</p>}
        </div>
      )}
    </div>
  );
}

function Row({
  row,
  saving,
  patch,
  save,
  duplicate,
  remove,
}: {
  row: Milkshake;
  saving: boolean;
  patch: (id: string, p: Partial<Milkshake>) => void;
  save: (r: Milkshake) => void;
  duplicate: (r: Milkshake) => void;
  remove: (r: Milkshake) => void;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadProductImage(file, "milkshakes");
      patch(row.id, { image_url: url });
      toast.success("Photo uploaded — remember to Save");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const setSize = (i: number, s: Partial<ShakeSize>) => {
    const sizes = row.sizes.map((x, j) => (j === i ? { ...x, ...s } : x));
    patch(row.id, { sizes });
  };
  const setOpt = (i: number, o: Partial<ShakeOption>) => {
    const customisations = row.customisations.map((x, j) => (j === i ? { ...x, ...o } : x));
    patch(row.id, { customisations });
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50">
      <div className="flex items-center gap-3 p-3">
        <img src={row.image_url || "/favicon.png"} alt="" className="h-12 w-12 rounded-lg object-cover" onError={(e) => (e.currentTarget.style.opacity = "0.2")} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-cream">{row.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            /{row.slug} · {row.sizes.map((s) => s.label).join(" / ")} · {row.active ? "Active" : "Inactive"}{row.featured ? " · Featured" : ""}
          </p>
        </div>
        <label className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 text-xs text-cream/85">
          <ImagePlus className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Photo"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
        </label>
        <button onClick={() => setOpen((v) => !v)} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs text-cream/85">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
        <button onClick={() => duplicate(row)} aria-label="Duplicate" className="grid h-9 w-9 place-items-center rounded-full border border-border text-cream/85"><Copy className="h-3.5 w-3.5" /></button>
        <button onClick={() => remove(row)} aria-label="Delete" className="grid h-9 w-9 place-items-center rounded-full border border-border text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>

      {open && (
        <div className="space-y-5 border-t border-border/60 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Text label="Name" value={row.name} onChange={(v) => patch(row.id, { name: v })} />
            <Text label="Slug" value={row.slug} onChange={(v) => patch(row.id, { slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
            <Num label="Display order" value={row.display_order} onChange={(v) => patch(row.id, { display_order: v ?? 0 })} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Text label="Short description" value={row.short_description} onChange={(v) => patch(row.id, { short_description: v })} />
            <Text label="Ingredients" value={row.ingredients} onChange={(v) => patch(row.id, { ingredients: v })} />
            <Text label="Allergens" value={row.allergens} onChange={(v) => patch(row.id, { allergens: v })} />
          </div>
          <TextArea label="Detailed description" value={row.description} onChange={(v) => patch(row.id, { description: v })} />
          <div className="grid gap-3 md:grid-cols-3">
            <Text label="Image URL (auto-filled on upload)" value={row.image_url ?? ""} onChange={(v) => patch(row.id, { image_url: v || null })} />
            <Text label="Alt text" value={row.image_alt ?? ""} onChange={(v) => patch(row.id, { image_alt: v || null })} />
            <Num label="Prep time (minutes)" value={row.prep_minutes} onChange={(v) => patch(row.id, { prep_minutes: v ?? 0 })} />
          </div>

          <div>
            <p className="eyebrow mb-2">Sizes &amp; prices</p>
            <div className="space-y-2">
              {row.sizes.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_90px_90px_auto] items-end gap-2">
                  <Text value={s.label} onChange={(v) => setSize(i, { label: v })} placeholder="Size name" />
                  <Num label="Price ₹" value={s.price} onChange={(v) => setSize(i, { price: v ?? 0 })} />
                  <Num label="Sale ₹" value={s.sale_price} onChange={(v) => setSize(i, { sale_price: v })} />
                  <button onClick={() => patch(row.id, { sizes: row.sizes.filter((_, j) => j !== i) })} aria-label="Remove size" className="mb-1 grid h-9 w-9 place-items-center rounded-full border border-border text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
            <button onClick={() => patch(row.id, { sizes: [...row.sizes, { label: "New size", price: 0, sale_price: null }] })} className="mt-2 text-xs text-primary hover:underline">+ Add size</button>
          </div>

          <div>
            <p className="eyebrow mb-2">Customisations</p>
            <div className="space-y-2">
              {row.customisations.map((o, i) => (
                <div key={i} className="grid grid-cols-[1fr_90px_auto] items-end gap-2">
                  <Text value={o.label} onChange={(v) => setOpt(i, { label: v })} placeholder="Option name" />
                  <Num label="Extra ₹" value={o.price} onChange={(v) => setOpt(i, { price: v ?? 0 })} />
                  <button onClick={() => patch(row.id, { customisations: row.customisations.filter((_, j) => j !== i) })} aria-label="Remove option" className="mb-1 grid h-9 w-9 place-items-center rounded-full border border-border text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
            <button onClick={() => patch(row.id, { customisations: [...row.customisations, { label: "New option", price: 0 }] })} className="mt-2 text-xs text-primary hover:underline">+ Add option</button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="eyebrow mb-2">Status</p>
              <Select value={row.status} onChange={(v) => patch(row.id, { status: v })} options={MILKSHAKE_STATUSES} />
            </div>
            <div>
              <p className="eyebrow mb-2">Badges</p>
              <div className="flex flex-wrap gap-2">
                {MILKSHAKE_BADGES.map((b) => {
                  const on = row.badges.includes(b.key);
                  return (
                    <button key={b.key} onClick={() => patch(row.id, { badges: on ? row.badges.filter((x) => x !== b.key) : [...row.badges, b.key] })} className={`min-h-9 rounded-full border px-3 text-xs ${on ? "border-primary bg-primary/15 text-primary" : "border-border text-cream/80"}`}>
                      {b.emoji} {b.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <Check label="Active" checked={row.active} onChange={(v) => patch(row.id, { active: v })} />
            <Check label="Featured on homepage" checked={row.featured} onChange={(v) => patch(row.id, { featured: v })} />
            <button onClick={() => setPreview(true)} className="min-h-9 rounded-full border border-border px-3 text-xs text-cream/85">Preview on site</button>
          </div>

          <div className="flex gap-2">
            <button onClick={() => save(row)} disabled={saving} className="btn-gold btn-gold-hover inline-flex min-h-10 items-center gap-2 rounded-full px-6 text-xs font-semibold">
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      )}

      {preview && <PreviewModal row={row} onClose={() => setPreview(false)} />}
    </div>
  );
}

function PreviewModal({ row, onClose }: { row: Milkshake; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-4" onClick={(e) => e.stopPropagation()}>
        <img src={row.image_url || "/favicon.png"} alt={row.name} className="aspect-[4/5] w-full rounded-xl object-cover" onError={(e) => (e.currentTarget.style.opacity = "0.2")} />
        <h3 className="mt-3 font-display text-2xl text-cream">{row.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{row.short_description}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {row.sizes.map((s) => <span key={s.label} className="rounded-full border border-border px-3 py-1 text-xs text-cream/85">{s.label} · ₹{Number(s.sale_price || s.price)}</span>)}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{row.ingredients}</p>
        {row.allergens && <p className="mt-1 text-xs text-muted-foreground">Allergens: {row.allergens}</p>}
        <button onClick={onClose} className="mt-4 w-full rounded-full border border-border py-2 text-sm text-cream">Close preview</button>
      </div>
    </div>
  );
}

function SectionSettings({ section, setSection, refresh }: { section: SiteSection; setSection: (s: SiteSection) => void; refresh: () => void }) {
  const [saving, setSaving] = useState(false);
  const p = (v: Partial<SiteSection>) => setSection({ ...section, ...v });

  const save = async () => {
    setSaving(true);
    const { id: _k, updated_at: _u, ...rest } = section as Record<string, unknown> & { updated_at?: string };
    const { error } = await supabase.from("site_sections").update(rest as never).eq("key", "milkshakes");
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Section saved — storefront updates immediately");
      refresh();
    }
  };

  return (
    <div className="mt-6 space-y-4 rounded-2xl border border-primary/40 bg-card/60 p-5">
      <div className="grid gap-3 md:grid-cols-3">
        <Text label="Section title" value={section.title} onChange={(v) => p({ title: v })} />
        <Text label="Subtitle" value={section.subtitle} onChange={(v) => p({ subtitle: v })} />
        <Text label="Description" value={section.description} onChange={(v) => p({ description: v })} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Text label="Nav label" value={section.nav_label} onChange={(v) => p({ nav_label: v })} />
        <Num label="Nav order" value={section.nav_order} onChange={(v) => p({ nav_order: v ?? 0 })} />
        <Num label="Products per row (desktop)" value={section.per_row_desktop} onChange={(v) => p({ per_row_desktop: v ?? 3 })} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Num label="Products per row (mobile)" value={section.per_row_mobile} onChange={(v) => p({ per_row_mobile: v ?? 1 })} />
        <Num label="Featured shown on homepage" value={section.home_limit} onChange={(v) => p({ home_limit: v ?? 4 })} />
        <Num label="Homepage position" value={section.home_order} onChange={(v) => p({ home_order: v ?? 0 })} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Text label="Banner image URL" value={section.banner_url ?? ""} onChange={(v) => p({ banner_url: v || null })} />
        <Text label="Promo label (small text above title)" value={section.promo_text} onChange={(v) => p({ promo_text: v })} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Select label="Card layout" value={section.card_layout} onChange={(v) => p({ card_layout: v })} options={[["grid", "Grid"], ["list", "List"]]} />
        <Select label="Accent" value={section.accent} onChange={(v) => p({ accent: v })} options={[["gold", "Gold"], ["cream", "Cream"]]} />
        <Text label="SEO title" value={section.seo_title} onChange={(v) => p({ seo_title: v })} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Text label="SEO description" value={section.seo_description} onChange={(v) => p({ seo_description: v })} />
        <Text label="Social share image URL" value={section.og_image_url ?? ""} onChange={(v) => p({ og_image_url: v || null })} />
        <div />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Check label="Section visible" checked={section.visible} onChange={(v) => p({ visible: v })} />
        <Check label="Show on homepage" checked={section.show_on_home} onChange={(v) => p({ show_on_home: v })} />
        <Check label="Show in navigation" checked={section.show_in_nav} onChange={(v) => p({ show_in_nav: v })} />
        <Check label="Show badges" checked={section.show_badges} onChange={(v) => p({ show_badges: v })} />
        <Check label="Show discounts" checked={section.show_discounts} onChange={(v) => p({ show_discounts: v })} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <DateTime label="Available from" value={toLocal(section.starts_at)} onChange={(v) => p({ starts_at: v ? new Date(v).toISOString() : null })} />
        <DateTime label="Available until" value={toLocal(section.ends_at)} onChange={(v) => p({ ends_at: v ? new Date(v).toISOString() : null })} />
      </div>
      <button onClick={save} disabled={saving} className="btn-gold btn-gold-hover inline-flex min-h-10 items-center gap-2 rounded-full px-6 text-xs font-semibold">
        <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save section"}
      </button>
    </div>
  );
}
