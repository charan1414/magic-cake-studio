import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { MilkshakeBanner, MilkshakeGrid } from "@/components/milkshakes";
import { MILKSHAKE_BADGES, sectionLive, useMilkshakes, useSiteSection } from "@/lib/milkshakes";

export const Route = createFileRoute("/milkshakes")({
  head: () => ({
    meta: [
      { title: "Milkshakes — C & It's Magic" },
      { name: "description", content: "Premium hand-blended milkshakes: Oreo, Ferrero Rocher, Belgian Chocolate, Fresh Mango, Rose Falooda and more — delivered fresh." },
      { property: "og:title", content: "Milkshakes — C & It's Magic" },
      { property: "og:description", content: "Fifteen signature shakes, blended to order with real fruit and premium chocolate." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MilkshakesPage,
});

function MilkshakesPage() {
  const { section, loading: sLoading } = useSiteSection("milkshakes");
  const { items, loading } = useMilkshakes();
  const [q, setQ] = useState("");
  const [badge, setBadge] = useState("");

  const list = useMemo(
    () =>
      items.filter(
        (p) =>
          (!q || `${p.name} ${p.short_description} ${p.ingredients}`.toLowerCase().includes(q.toLowerCase())) &&
          (!badge || p.badges.includes(badge)),
      ),
    [items, q, badge],
  );

  if (!sLoading && !sectionLive(section)) {
    return <div className="container-luxe py-40 text-center text-muted-foreground">Milkshakes are not available right now. Please check back soon.</div>;
  }

  return (
    <>
      {typeof document !== "undefined" && section.seo_title ? <title>{section.seo_title}</title> : null}
      <div className="pt-20">
        <MilkshakeBanner section={section} />
      </div>
      <section className="container-luxe py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <label className="relative block w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search milkshakes…" aria-label="Search milkshakes" className="w-full rounded-full border border-border/60 bg-transparent py-2.5 pl-9 pr-4 text-sm text-cream focus:border-primary focus:outline-none" />
          </label>
          <div className="flex flex-wrap gap-2">
            {[{ key: "", label: "All", emoji: "" }, ...MILKSHAKE_BADGES].map((b) => (
              <button key={b.key} onClick={() => setBadge(b.key)} className={`min-h-9 rounded-full border px-4 text-xs ${badge === b.key ? "border-primary bg-primary/15 text-primary" : "border-border/60 text-cream/80"}`}>
                {b.emoji} {b.label}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-96 animate-pulse rounded-2xl bg-card/40" />)}</div>
        ) : list.length ? (
          <MilkshakeGrid items={list} section={section} />
        ) : (
          <p className="py-16 text-center text-muted-foreground">No milkshakes match your search.</p>
        )}
      </section>
    </>
  );
}
