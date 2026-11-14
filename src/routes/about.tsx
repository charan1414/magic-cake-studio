import { createFileRoute, Link } from "@tanstack/react-router";
import { Eyebrow } from "@/components/motion-primitives";
import { FOUNDER_PHOTO, useFounder } from "@/lib/founder";

export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "About — C & It's Magic" },
      { name: "description", content: "The story, philosophy and people behind C & It's Magic — a luxury cloud kitchen from Lakkur, Malur." },
      { property: "og:title", content: "About — C & It's Magic" },
      { property: "og:description", content: "A modern maison of cakes and cuisine." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <div className="pt-32">
      <section className="container-luxe pb-24">
        <Eyebrow>Our Story</Eyebrow>
        <h1 className="mt-4 max-w-4xl font-display text-6xl leading-[1.02] text-cream md:text-7xl">
          C &amp; It's <span className="italic gold-text">Magic</span> — where every bite carries a signature.
        </h1>
        <div className="mt-14 grid gap-16 md:grid-cols-2">
          <div className="space-y-6 text-base text-muted-foreground">
            <p>What began as a passion project in Lakkur has grown into a modern maison — a cloud kitchen that treats dessert and dining with equal precision.</p>
            <p>We reject the assumption that a cloud kitchen must feel disposable. Our packaging is architectural, our garnishes are photographed before they leave, and our chefs sign every box.</p>
            <p>We build every menu the way a designer builds a collection — sourcing, sketching, tasting, refining. Nothing on our menu is there without a reason.</p>
          </div>
          <div className="space-y-4">
            <Stat n="20 km" l="Delivery radius, always fresh" />
            <Stat n="24 hr" l="Advance notice for signature cakes" />
            <Stat n="9" l="Curated categories" />
            <Stat n="1" l="Standard: cinematic" />
          </div>
        </div>
      </section>

      <FounderSection />

      <section className="container-luxe pb-24">
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-10 text-center">
          <p className="eyebrow">Come taste the difference</p>
          <h2 className="mt-3 font-display text-3xl text-cream md:text-4xl">Ready to order?</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/menu" className="btn-gold btn-gold-hover rounded-full px-6 py-3 text-sm font-semibold">Explore menu</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="flex items-baseline gap-4 border-b border-border/60 pb-4">
      <span className="font-display text-4xl gold-text">{n}</span>
      <span className="text-sm text-cream/80">{l}</span>
    </div>
  );
}

function FounderSection() {
  const f = useFounder();
  return (
    <section className="border-y border-border/60 bg-card/20">
      <div className="container-luxe py-24">
        <Eyebrow>Meet the founder</Eyebrow>
        <div className="mt-8 grid gap-12 md:grid-cols-[minmax(0,22rem)_1fr]">
          <div>
            <div className="overflow-hidden rounded-3xl border border-primary/30">
              <img src={f.photo_url ?? FOUNDER_PHOTO} alt={`${f.name}, ${f.designation} of ${f.company}`} className="aspect-[4/5] w-full object-cover" />
            </div>
            <p className="mt-5 font-display text-3xl text-cream">{f.name}</p>
            <p className="text-sm gold-text">{f.designation}</p>
            <p className="mt-1 text-xs text-muted-foreground">{f.location} · Est. {f.founded}</p>
            {(f.instagram_url || f.linkedin_url) && (
              <div className="mt-4 flex gap-3 text-xs">
                {f.instagram_url && <a href={f.instagram_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Instagram</a>}
                {f.linkedin_url && <a href={f.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn</a>}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-display text-4xl leading-tight text-cream md:text-5xl">
              The hands behind every <span className="italic gold-text">signature</span>.
            </h2>
            <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-muted-foreground">{f.bio}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-black/30 p-5">
                <p className="eyebrow">Mission</p>
                <p className="mt-2 text-sm text-cream/85">{f.mission}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-black/30 p-5">
                <p className="eyebrow">Vision</p>
                <p className="mt-2 text-sm text-cream/85">{f.vision}</p>
              </div>
            </div>

            {f.timeline.length > 0 && (
              <ol className="mt-10 space-y-5 border-l border-primary/30 pl-6">
                {f.timeline.map((t, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[1.72rem] top-2 h-2 w-2 rounded-full bg-primary" />
                    <p className="font-display text-xl gold-text">{t.year}</p>
                    <p className="text-sm font-medium text-cream">{t.title}</p>
                    <p className="text-sm text-muted-foreground">{t.detail}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: f.name,
            jobTitle: f.designation,
            worksFor: { "@type": "Organization", name: f.company },
            address: f.location,
            sameAs: [f.instagram_url, f.linkedin_url].filter(Boolean),
          }),
        }}
      />
    </section>
  );
}
