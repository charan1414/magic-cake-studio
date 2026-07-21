import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, MapPin, Navigation, XCircle } from "lucide-react";
import { LAKKUR, DELIVERY_RADIUS_KM, MALUR_PINCODES, haversine } from "@/lib/data";
import { Eyebrow } from "@/components/motion-primitives";

export const Route = createFileRoute("/serviceability")({
  head: () => ({
    meta: [
      { title: "Delivery Check — C & It's Magic" },
      { name: "description", content: "Check if we deliver to your area. C & It's Magic delivers within 20 km of Lakkur, Malur." },
      { property: "og:title", content: "Do we deliver to you? — C & It's Magic" },
      { property: "og:description", content: "20 km delivery radius from Lakkur, Malur." },
    ],
  }),
  component: Serviceability,
});

type Result = { ok: boolean; distance?: number; message: string };

function Serviceability() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const checkPin = () => {
    const p = pincode.trim();
    if (!/^\d{6}$/.test(p)) return setResult({ ok: false, message: "Please enter a valid 6-digit pincode." });
    if (MALUR_PINCODES.includes(p)) setResult({ ok: true, message: "You're in our zone — delivery available." });
    else setResult({ ok: false, message: "That pincode is outside our current 20 km radius. Contact us for special orders." });
  };

  const geo = () => {
    if (!("geolocation" in navigator)) return setResult({ ok: false, message: "Geolocation not available." });
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const d = haversine(LAKKUR, { lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
        setResult({
          ok: d <= DELIVERY_RADIUS_KM,
          distance: d,
          message: d <= DELIVERY_RADIUS_KM ? `You're ${d.toFixed(1)} km away — well within our delivery zone.` : `You're ${d.toFixed(1)} km away — beyond our current 20 km reach.`,
        });
      },
      () => { setLoading(false); setResult({ ok: false, message: "Couldn't get your location. Try the pincode check instead." }); },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="pt-32">
      <section className="container-luxe pb-16">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Delivery Zone</Eyebrow>
          <h1 className="mt-4 font-display text-5xl leading-[1.02] text-cream md:text-6xl">Do we <span className="italic gold-text">deliver</span> to you?</h1>
          <p className="mt-5 text-base text-muted-foreground">We deliver within a 20 km radius of Lakkur, Malur — fresh, cinematic, on time.</p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-border/60 bg-card/40 p-6">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-4 w-4" /><span className="text-[11px] uppercase tracking-widest">By pincode</span>
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 563130"
                inputMode="numeric"
                maxLength={6}
                className="flex-1 rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-cream placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <button onClick={checkPin} className="btn-gold btn-gold-hover rounded-xl px-5 text-sm font-semibold">Check</button>
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/40 p-6">
            <div className="flex items-center gap-2 text-primary">
              <Navigation className="h-4 w-4" /><span className="text-[11px] uppercase tracking-widest">By location</span>
            </div>
            <button onClick={geo} disabled={loading} className="mt-4 w-full rounded-xl border border-primary/40 bg-primary/5 py-3 text-sm font-medium text-cream hover:bg-primary/10 disabled:opacity-60">
              {loading ? "Locating…" : "Use my current location"}
            </button>
          </div>
        </div>

        {result && (
          <div className={`mx-auto mt-8 max-w-3xl rounded-3xl border p-6 ${result.ok ? "border-primary/50 bg-primary/5" : "border-destructive/40 bg-destructive/10"}`}>
            <div className="flex items-start gap-4">
              {result.ok ? <CheckCircle2 className="h-6 w-6 text-primary" /> : <XCircle className="h-6 w-6 text-destructive" />}
              <div className="flex-1">
                <p className="font-display text-xl text-cream">{result.ok ? "Great news!" : "Out of range"}</p>
                <p className="mt-1 text-sm text-muted-foreground">{result.message}</p>
                {result.ok && (
                  <Link to="/menu" className="btn-gold btn-gold-hover mt-5 inline-flex rounded-full px-6 py-3 text-sm font-semibold">Start ordering</Link>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
