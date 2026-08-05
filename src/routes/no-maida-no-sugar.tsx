import { createFileRoute } from "@tanstack/react-router";
import { Leaf, Wheat, Droplets, HeartPulse } from "lucide-react";
import { HealthyBanner, HealthySection } from "@/components/healthy-range";
import { Reveal, Eyebrow } from "@/components/motion-primitives";

export const Route = createFileRoute("/no-maida-no-sugar")({
  head: () => ({
    meta: [
      { title: "No Maida No Sugar — Clean Baking | C & It's Magic" },
      {
        name: "description",
        content: "Whole grain, jaggery and date-sweetened cakes and bars from C & It's Magic. No refined flour, no white sugar — delivered fresh around Malur.",
      },
      { property: "og:title", content: "No Maida No Sugar — Clean Baking | C & It's Magic" },
      { property: "og:description", content: "Guilt-free protein bars, banana cake, carrot cake and seed bars baked without maida or refined sugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HealthyPage,
});

function HealthyPage() {
  return (
    <div className="pt-24">
      <HealthyBanner />
      <HealthySection />
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
