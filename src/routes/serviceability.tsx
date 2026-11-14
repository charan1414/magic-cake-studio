import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Clock, MapPin, Truck } from "lucide-react";
import { PinChecker } from "@/components/pin-checker";
import { getServiceablePincodes, type PincodeRow } from "@/lib/delivery.functions";
import { Eyebrow } from "@/components/motion-primitives";

export const Route = createFileRoute("/serviceability")({
  staticData: { sitemap: true },
  ssr: false,
  head: () => ({
    meta: [
      { title: "Delivery Areas & Pincode Check — C & It's Magic" },
      { name: "description", content: "Check if we deliver to your pincode. C & It's Magic delivers to 14+ pincodes within 20 km of Lakkur, Malur — Kolar and East Bengaluru." },
      { property: "og:title", content: "Do we deliver to you? — C & It's Magic" },
      { property: "og:description", content: "Enter your pincode to see delivery availability, fee and timing." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/serviceability" },
    ],
    links: [{ rel: "canonical", href: "/serviceability" }],
  }),
  component: Serviceability,
});

function Serviceability() {
  const load = useServerFn(getServiceablePincodes);
  const [rows, setRows] = useState<PincodeRow[]>([]);

  useEffect(() => {
    load().then((r) => setRows(r.filter((x) => x.active))).catch(() => {});
  }, [load]);

  return (
    <div className="pt-32">
      <section className="container-luxe pb-16">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Delivery Zone</Eyebrow>
          <h1 className="mt-4 font-display text-5xl leading-[1.02] text-cream md:text-6xl">
            Do we <span className="italic gold-text">deliver</span> to you?
          </h1>
          <p className="mt-5 text-base text-muted-foreground">
            Enter your pincode below. We deliver to every serviceable pincode within 20 km of our Lakkur kitchen.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xl">
          <PinChecker variant="panel" />
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
          {[
            { icon: MapPin, k: "Lakkur, Malur", v: "Our production kitchen" },
            { icon: Truck, k: "20 km radius", v: "Kolar & East Bengaluru" },
            { icon: Clock, k: "3 hours", v: "Standard food delivery" },
          ].map(({ icon: Icon, k, v }) => (
            <div key={k} className="rounded-2xl border border-border/60 bg-card/40 p-5">
              <Icon className="h-4 w-4 text-primary" />
              <p className="mt-3 font-display text-lg text-cream">{k}</p>
              <p className="mt-1 text-xs text-muted-foreground">{v}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-luxe pb-24">
        <h2 className="font-display text-3xl text-cream">Pincodes we currently serve</h2>
        <p className="mt-2 text-sm text-muted-foreground">Listed nearest first, with distance from our Lakkur kitchen.</p>
        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <div key={r.pincode} className="rounded-2xl border border-border/60 bg-card/40 p-5">
              <div className="flex items-baseline justify-between">
                <p className="font-display text-2xl gold-text">{r.pincode}</p>
                <span className="text-xs text-muted-foreground">{r.distance_km} km</span>
              </div>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-primary">
                {r.district.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{r.sample_areas.split(";").map((s) => s.trim()).filter(Boolean).join(" · ")}</p>
            </div>
          ))}
          {rows.length === 0 && <p className="text-sm text-muted-foreground">Loading serviceable pincodes…</p>}
        </div>

        <div className="mt-12 rounded-3xl border border-primary/30 bg-primary/5 p-8 text-center">
          <p className="eyebrow">Outside the list?</p>
          <h3 className="mt-3 font-display text-2xl text-cream">We take special orders on request.</h3>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/menu" className="btn-gold btn-gold-hover rounded-full px-6 py-3 text-sm font-semibold">Start ordering</Link>
            <Link to="/contact" className="rounded-full border border-primary/50 px-6 py-3 text-sm font-medium text-primary hover:bg-primary/10">Contact us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
