import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ChevronDown,
  History,
  Layers,
  Percent,
  RotateCcw,
  Save,
  Search,
  Tag,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Eyebrow } from "@/components/motion-primitives";
import { PRODUCT_LABELS, labelMeta } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/data";
import {
  PRODUCT_STATUSES,
  categoryName,
  discountPct,
  priceFromPct,
  savedAmount,
  saveRow,
  useInventory,
  usePriceHistory,
  type InvRow,
} from "@/lib/inventory";

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
      { title: "Admin · Inventory & Pricing — C & It's Magic" },
      { name: "description", content: "Central inventory: prices, discounts, stock, badges and visibility for every product." },
      { property: "og:title", content: "Admin · Inventory & Pricing — C & It's Magic" },
      { property: "og:description", content: "Single source of truth for the C & It's Magic catalogue." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminInventory,
});

const PAGE_SIZE = 25;

function AdminInventory() {
  const { rows, setRows, loading, refresh } = useInventory();
  const [original, setOriginal] = useState<Map<string, InvRow>>(new Map());
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [badge, setBadge] = useState("all");
  const [sort, setSort] = useState("manual");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<string | null>(null);
  const [historyFor, setHistoryFor] = useState<InvRow | null>(null);
  const [bulkPct, setBulkPct] = useState<number | null>(10);

  useEffect(() => {
    if (rows.length && original.size === 0) setOriginal(new Map(rows.map((r) => [r.id, { ...r }])));
  }, [rows, original.size]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = rows.filter((r) => {
      if (cat !== "all" && r.category !== cat) return false;
      if (badge !== "all" && !r.labels.includes(badge)) return false;
      if (needle && !`${r.name} ${r.slug} ${r.sku}`.toLowerCase().includes(needle)) return false;
      return true;
    });
    const by: Record<string, (a: InvRow, b: InvRow) => number> = {
      manual: (a, b) => a.display_order - b.display_order,
      az: (a, b) => a.name.localeCompare(b.name),
      za: (a, b) => b.name.localeCompare(a.name),
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      discount: (a, b) => discountPct(b.mrp, b.price) - discountPct(a.mrp, a.price),
      updated: (a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""),
    };
    return [...list].sort(by[sort] ?? by.manual);
  }, [rows, q, cat, badge, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    const discounted = rows.filter((r) => discountPct(r.mrp, r.price) > 0);
    const pcts = discounted.map((r) => discountPct(r.mrp, r.price));
    return {
      total: rows.length,
      discounted: discounted.length,
      bestSellers: rows.filter((r) => r.labels.includes("best-seller")).length,
      out: rows.filter((r) => r.status === "out").length,
      low: rows.filter((r) => r.status === "low" || (r.qty !== null && r.lowStock !== null && r.qty <= r.lowStock)).length,
      avg: pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0,
      max: pcts.length ? Math.round(Math.max(...pcts)) : 0,
      hidden: rows.filter((r) => !r.visible).length,
    };
  }, [rows]);

  const patch = (id: string, p: Partial<InvRow>) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const toggleLabel = (row: InvRow, key: string) =>
    patch(row.id, { labels: row.labels.includes(key) ? row.labels.filter((l) => l !== key) : [...row.labels, key] });

  const persist = async (row: InvRow) => {
    setSaving(row.id);
    try {
      await saveRow(row, original.get(row.id));
      setOriginal((prev) => new Map(prev).set(row.id, { ...row }));
      toast.success(`${row.name} updated — live on the site`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
    setSaving(null);
  };

  const bulkTargets = () => rows.filter((r) => selected.has(r.id));

  const bulkApply = async (fn: (r: InvRow) => Partial<InvRow>, label: string) => {
    const targets = bulkTargets();
    if (!targets.length) return toast.error("Select products first");
    setSaving("bulk");
    for (const r of targets) {
      const next = { ...r, ...fn(r) };
      patch(r.id, next);
      try {
        await saveRow(next, original.get(r.id));
        setOriginal((prev) => new Map(prev).set(r.id, { ...next }));
      } catch {
        /* keep going, report at the end */
      }
    }
    setSaving(null);
    toast.success(`${label} applied to ${targets.length} product${targets.length > 1 ? "s" : ""}`);
  };

  const pct = Number(bulkPct ?? 0);

  return (
    <div className="pt-32">
      <section className="container-luxe pb-8">
        <Eyebrow>Admin</Eyebrow>
        <h1 className="mt-3 font-display text-5xl text-cream md:text-6xl">
          Inventory & <span className="italic gold-text">Pricing</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          One dashboard for every product on the site — regular price, sale price, discount %, stock, badges,
          status and visibility. Saved changes go live instantly, no deployment.
        </p>
      </section>

      <section className="container-luxe pb-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <Stat label="Products" value={stats.total} />
          <Stat label="On discount" value={stats.discounted} />
          <Stat label="Best sellers" value={stats.bestSellers} />
          <Stat label="Out of stock" value={stats.out} tone="red" />
          <Stat label="Low stock" value={stats.low} tone="amber" />
          <Stat label="Avg discount" value={`${stats.avg}%`} />
          <Stat label="Top discount" value={`${stats.max}%`} />
          <Stat label="Hidden" value={stats.hidden} />
        </div>
      </section>

      <section className="container-luxe pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, slug or SKU"
              className="w-full rounded-full border border-border/60 bg-card/40 py-3 pl-11 pr-4 text-sm text-cream placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <Picker value={cat} onChange={(v) => { setCat(v); setPage(1); }} icon={<Layers className="h-3.5 w-3.5" />}
            options={[["all", "All categories"], ...CATEGORIES.map((c) => [c.slug, c.name] as [string, string]), ["healthy", "No Maida No Sugar"]]} />
          <Picker value={badge} onChange={(v) => { setBadge(v); setPage(1); }} icon={<Tag className="h-3.5 w-3.5" />}
            options={[["all", "All badges"], ...PRODUCT_LABELS.map((l) => [l.key, l.label] as [string, string])]} />
          <Picker value={sort} onChange={setSort} icon={<ArrowDownUp className="h-3.5 w-3.5" />}
            options={[["manual", "Manual order"], ["az", "A–Z"], ["za", "Z–A"], ["price-asc", "Lowest price"], ["price-desc", "Highest price"], ["discount", "Highest discount"], ["updated", "Recently updated"]]} />
        </div>
      </section>

      <section className="container-luxe pb-6">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card/30 p-4">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Bulk actions · {selected.size} selected
          </span>
          <label className="inline-flex items-center gap-2 text-xs text-cream/80">
            <Percent className="h-3.5 w-3.5 text-primary" />
            <input
              type="number"
              min={0}
              max={90}
              value={bulkPct ?? ""}
              onChange={(e) => setBulkPct(e.target.value === "" ? null : Number(e.target.value))}
              className="w-20 rounded-lg border border-border/60 bg-transparent px-2.5 py-1.5 text-sm text-cream focus:border-primary focus:outline-none"
            />
          </label>
          <BulkBtn onClick={() => bulkApply((r) => ({ mrp: Math.round(r.mrp * (1 + pct / 100)), price: Math.round(r.price * (1 + pct / 100)) }), `+${pct}% price`)}>
            Increase price {pct}%
          </BulkBtn>
          <BulkBtn onClick={() => bulkApply((r) => ({ mrp: Math.round(r.mrp * (1 - pct / 100)), price: Math.round(r.price * (1 - pct / 100)) }), `-${pct}% price`)}>
            Decrease price {pct}%
          </BulkBtn>
          <BulkBtn onClick={() => bulkApply((r) => ({ price: priceFromPct(r.mrp, pct) }), `${pct}% discount`)}>
            Apply {pct}% discount
          </BulkBtn>
          <BulkBtn onClick={() => bulkApply((r) => ({ price: r.mrp }), "Discounts removed")}>Remove discount</BulkBtn>
          <BulkBtn onClick={() => bulkApply(() => ({ visible: true }), "Visibility on")}>Show</BulkBtn>
          <BulkBtn onClick={() => bulkApply(() => ({ visible: false }), "Visibility off")}>Hide</BulkBtn>
          <BulkBtn
            onClick={() =>
              bulkApply((r) => {
                const o = original.get(r.id);
                return o ? { price: o.price, mrp: o.mrp } : {};
              }, "Original pricing restored")
            }
          >
            <RotateCcw className="mr-1 inline h-3 w-3" /> Restore pricing
          </BulkBtn>
          {cat !== "all" && (
            <BulkBtn
              onClick={() => {
                setSelected(new Set(filtered.map((r) => r.id)));
                toast.info(`Selected all ${filtered.length} products in ${categoryName(cat)}`);
              }}
            >
              Select whole category
            </BulkBtn>
          )}
        </div>
      </section>

      <section className="container-luxe pb-24">
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/30">
          <div className="max-h-[70vh] overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-black/85 text-left text-[11px] uppercase tracking-wider text-muted-foreground backdrop-blur">
                <tr>
                  <th className="px-3 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      checked={pageRows.length > 0 && pageRows.every((r) => selected.has(r.id))}
                      onChange={(e) => {
                        const next = new Set(selected);
                        pageRows.forEach((r) => (e.target.checked ? next.add(r.id) : next.delete(r.id)));
                        setSelected(next);
                      }}
                    />
                  </th>
                  <th className="px-3 py-3">Product</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">SKU</th>
                  <th className="px-3 py-3">Regular ₹</th>
                  <th className="px-3 py-3">Sale ₹</th>
                  <th className="px-3 py-3">Disc %</th>
                  <th className="px-3 py-3">Qty</th>
                  <th className="px-3 py-3">Low at</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Show</th>
                  <th className="px-3 py-3">Badges</th>
                  <th className="px-3 py-3">Order</th>
                  <th className="px-3 py-3">Updated</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading &&
                  [0, 1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td colSpan={15} className="px-3 py-4">
                        <div className="h-10 animate-pulse rounded-lg bg-white/[0.04]" />
                      </td>
                    </tr>
                  ))}
                {pageRows.map((row) => {
                  const dpc = discountPct(row.mrp, row.price);
                  return (
                    <tr key={row.id} className="align-middle hover:bg-white/[0.02]">
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-primary"
                          checked={selected.has(row.id)}
                          onChange={(e) => {
                            const next = new Set(selected);
                            e.target.checked ? next.add(row.id) : next.delete(row.id);
                            setSelected(next);
                          }}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <img src={row.image} alt={row.name} loading="lazy" className="h-12 w-12 rounded-lg object-cover" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-cream">{row.name}</p>
                            <p className="truncate text-[11px] text-muted-foreground">{row.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">{categoryName(row.category)}</td>
                      <td className="px-3 py-3">
                        <input value={row.sku} onChange={(e) => patch(row.id, { sku: e.target.value })} className="w-28 rounded-lg border border-border/60 bg-transparent px-2 py-1.5 text-xs text-cream focus:border-primary focus:outline-none" />
                      </td>
                      <td className="px-3 py-3">
                        <Cell value={row.mrp} onChange={(v) => patch(row.id, { mrp: v, price: Math.min(row.price, v) })} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell value={row.price} onChange={(v) => patch(row.id, { price: v, mrp: Math.max(row.mrp, v) })} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell
                          value={dpc}
                          suffix="%"
                          onChange={(v) => patch(row.id, { price: priceFromPct(row.mrp, Math.min(95, Math.max(0, v))) })}
                        />
                        {savedAmount(row.mrp, row.price) > 0 && (
                          <p className="mt-1 text-[10px] text-emerald-400">save ₹{savedAmount(row.mrp, row.price)}</p>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {row.source === "catalog" ? (
                          <Cell value={row.qty ?? 0} onChange={(v) => patch(row.id, { qty: v })} />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {row.source === "catalog" ? (
                          <Cell value={row.lowStock ?? 0} onChange={(v) => patch(row.id, { lowStock: v })} />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <select value={row.status} onChange={(e) => patch(row.id, { status: e.target.value })} className="rounded-lg border border-border/60 bg-card px-2 py-1.5 text-xs text-cream focus:border-primary focus:outline-none">
                          {PRODUCT_STATUSES.map(([v, l]) => (
                            <option key={v} value={v} className="bg-card">{l}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <input type="checkbox" checked={row.visible} onChange={(e) => patch(row.id, { visible: e.target.checked })} className="h-4 w-4 accent-primary" />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex max-w-[220px] flex-wrap gap-1">
                          {PRODUCT_LABELS.map((l) => {
                            const on = row.labels.includes(l.key);
                            return (
                              <button
                                key={l.key}
                                onClick={() => toggleLabel(row, l.key)}
                                title={l.label}
                                className={`rounded-full border px-2 py-0.5 text-[10px] transition-colors ${on ? "border-primary bg-primary/15 text-primary" : "border-border/60 text-muted-foreground hover:text-cream"}`}
                              >
                                {l.emoji}
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {row.labels.map((k) => (
                            <span key={k} className="text-[10px] text-primary/80">{labelMeta(k)?.label}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Cell value={row.display_order} onChange={(v) => patch(row.id, { display_order: v })} />
                      </td>
                      <td className="px-3 py-3 text-[11px] text-muted-foreground">
                        {row.updated_at ? new Date(row.updated_at).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => persist(row)} disabled={saving === row.id} className="btn-gold btn-gold-hover inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-semibold disabled:opacity-60">
                            <Save className="h-3 w-3" /> {saving === row.id ? "Saving…" : "Save"}
                          </button>
                          <button onClick={() => setHistoryFor(row)} title="Price history" className="grid h-8 w-8 place-items-center rounded-full border border-border/60 text-muted-foreground hover:border-primary/60 hover:text-primary">
                            <History className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
            <span>{filtered.length} products</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-full border border-border/60 px-3 py-1.5 disabled:opacity-40">Prev</button>
              <span>Page {page} / {pages}</span>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="rounded-full border border-border/60 px-3 py-1.5 disabled:opacity-40">Next</button>
              <button onClick={() => { refresh(); toast.info("Reloaded from the database"); }} className="rounded-full border border-border/60 px-3 py-1.5">Reload</button>
            </div>
          </div>
        </div>
      </section>

      {historyFor && <HistoryPanel row={historyFor} onClose={() => setHistoryFor(null)} onRestore={(price, mrp) => { patch(historyFor.id, { price, mrp }); setHistoryFor(null); toast.success("Previous pricing loaded — press Save to publish"); }} />}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: "red" | "amber" }) {
  const color = tone === "red" ? "text-red-300" : tone === "amber" ? "text-amber-300" : "text-cream";
  return (
    <div className="rounded-2xl border border-border/60 bg-card/30 p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-3xl ${color}`}>{value}</p>
    </div>
  );
}

function BulkBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-full border border-border/60 px-3.5 py-2 text-xs text-cream/85 transition-colors hover:border-primary/60 hover:text-primary">
      {children}
    </button>
  );
}

function Picker({ value, onChange, options, icon }: { value: string; onChange: (v: string) => void; options: [string, string][]; icon?: React.ReactNode }) {
  return (
    <label className="relative inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-2.5 text-xs text-cream/85">
      {icon}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="appearance-none bg-transparent pr-4 text-xs text-cream focus:outline-none">
        {options.map(([v, l]) => (
          <option key={v} value={v} className="bg-card">{l}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-muted-foreground" />
    </label>
  );
}

function Cell({ value, onChange, suffix }: { value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div className="inline-flex items-center gap-1">
      <input
        type="number"
        min={0}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 rounded-lg border border-border/60 bg-transparent px-2 py-1.5 text-xs text-cream focus:border-primary focus:outline-none"
      />
      {suffix && <span className="text-[10px] text-muted-foreground">{suffix}</span>}
    </div>
  );
}

function HistoryPanel({ row, onClose, onRestore }: { row: InvRow; onClose: () => void; onRestore: (price: number, mrp: number) => void }) {
  const history = usePriceHistory(row.slug);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="h-full w-full max-w-md overflow-y-auto border-l border-border/60 bg-ink p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <Eyebrow>Price history</Eyebrow>
            <h2 className="mt-2 font-display text-3xl text-cream">{row.name}</h2>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted-foreground hover:text-cream">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 space-y-3">
          {history.length === 0 && <p className="text-sm text-muted-foreground">No price changes recorded yet.</p>}
          {history.map((h) => (
            <div key={h.id} className="rounded-2xl border border-border/60 bg-card/30 p-4">
              <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString("en-IN")}</p>
              <p className="mt-2 text-sm text-cream">
                ₹{Number(h.previous_price ?? 0).toLocaleString("en-IN")} → <span className="text-primary">₹{Number(h.new_price ?? 0).toLocaleString("en-IN")}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Discount {Number(h.previous_discount ?? 0)}% → {Number(h.new_discount ?? 0)}%
              </p>
              <button
                onClick={() => onRestore(Number(h.previous_price ?? row.price), row.mrp)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-[11px] text-cream/85 hover:border-primary/60 hover:text-primary"
              >
                <RotateCcw className="h-3 w-3" /> Restore ₹{Number(h.previous_price ?? 0).toLocaleString("en-IN")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
