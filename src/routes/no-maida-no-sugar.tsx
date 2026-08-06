import { createFileRoute } from "@tanstack/react-router";
import { Leaf, Wheat, Droplets, HeartPulse } from "lucide-react";
import { HealthyBanner, HealthySection, HealthyStory } from "@/components/healthy-range";
import { Reveal, Eyebrow } from "@/components/motion-primitives";

const URL = "https://magic-cake-studio.lovable.app/no-maida-no-sugar";
const TITLE = "No Maida No Sugar Cakes & Protein Bars | C & It's Magic";
const DESC =
  "Guilt-free cakes, protein bars and granola bars baked with whole grains, jaggery and dates — zero maida, zero refined sugar. Fresh delivery around Malur & Lakkur.";

export const Route = createFileRoute("/no-maida-no-sugar")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { name: "keywords", content: "no maida cake, sugar free cake Malur, healthy protein bar, jaggery cake, whole wheat bakery Lakkur" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "C & It's Magic" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": URL,
              name: "No Maida No Sugar",
              url: URL,
              description: DESC,
              isPartOf: { "@type": "WebSite", name: "C & It's Magic", url: "https://magic-cake-studio.lovable.app" },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://magic-cake-studio.lovable.app" },
                { "@type": "ListItem", position: 2, name: "No Maida No Sugar", item: URL },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Are these cakes really made without maida and sugar?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Every item in the No Maida No Sugar range uses whole wheat, oats, ragi or millet flour and is sweetened only with jaggery, dates, figs or raw honey.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Do the healthy bakes contain preservatives?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "No. They are baked in small batches and dispatched the same day, so nothing needs preservatives.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Where do you deliver the healthy range?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "We deliver across serviceable pincodes within roughly 20 km of our Lakkur kitchen, including Malur and surrounding areas.",
                  },
                },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: HealthyPage,
});

function HealthyPage() {
  return (
    <div className="pt-24">
      <HealthyBanner />
      <HealthySection />
      <HealthyStory />
      <Why />
    </div>
  );
}

function Why() {
  const items = [
    { icon: Wheat, k: "Whole grains only", v: "Whole wheat, oats, ragi and millet flours — never refined maida." },
    { icon: Droplets, k: "Natural sweetness", v: "Jaggery, dates, figs and raw honey do all the sweetening." },
    { icon: HeartPulse, k: "Real nutrition", v: "Nuts, seeds and nut butters for protein and slow-release energy." },
    { icon: Leaf, k: "Clean label", v: "No preservatives, no premixes, baked fresh the day it ships." },
  ];
  return (
    <section className="container-luxe pb-28">
      <Eyebrow>Why it matters</Eyebrow>
      <h2 className="mt-4 max-w-2xl font-display text-5xl leading-tight text-cream">
        Dessert that <span className="italic gold-text">loves you back</span>.
      </h2>
      <div className="mt-12 grid gap-5 md:grid-cols-4">
        {items.map(({ icon: Icon, k, v }, i) => (
          <Reveal key={k} delay={i * 0.06}>
            <div className="h-full rounded-2xl border border-border/60 bg-card/60 p-6 transition-colors hover:border-emerald-400/40">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-emerald-400/40 text-emerald-300">
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-4 font-display text-xl text-cream">{k}</p>
              <p className="mt-2 text-sm text-muted-foreground">{v}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
