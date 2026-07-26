import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Save, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Eyebrow } from "@/components/motion-primitives";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/delivery")({
  head: () => ({
    meta: [
      { title: "Delivery Settings — Admin · C & It's Magic" },
      { name: "description", content: "Configure the delivery zone, radius, minimum order and fees for C & It's Magic." },
      { property: "og:title", content: "Delivery Settings — Admin" },
      { property: "og:description", content: "Control C & It's Magic delivery operations." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDeliveryPage,
});

type Settings = {
  id: string;
  business_lat: number;
  business_lng: number;
  business_address: string;
  delivery_radius_km: number;
  min_order_amount: number;
  base_delivery_fee: number;
  per_km_fee: number;
  free_delivery_threshold: number;
  delivery_enabled: boolean;
  serviceable_pincodes: string[];
  distance_mode: string;
  require_complete_address: boolean;
  allow_gps_checkout: boolean;
};

function AdminDeliveryPage() {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [s, setS] = useState<Settings | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      const ok = Boolean(data);
      setIsAdmin(ok);
      if (!ok) navigate({ to: "/account" });
    });
    supabase
      .from("delivery_settings" as never)
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        else if (data) setS(data as never as Settings);
      });
  }, [user, navigate]);

  const update = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((prev) => (prev ? { ...prev, [k]: v } : prev));

  const addPin = () => {
    const p = pinInput.trim();
    if (!/^\d{6}$/.test(p)) return toast.error("Enter a valid 6-digit pincode");
    if (!s) return;
    if (s.serviceable_pincodes.includes(p)) return toast.error("Already added");
    update("serviceable_pincodes", [...s.serviceable_pincodes, p]);
    setPinInput("");
  };
  const removePin = (p: string) => {
    if (!s) return;
    update("serviceable_pincodes", s.serviceable_pincodes.filter((x) => x !== p));
  };

  const save = async () => {
    if (!s) return;
    setSaving(true);
    const { error } = await supabase
      .from("delivery_settings" as never)
      .update({
        business_lat: s.business_lat,
        business_lng: s.business_lng,
        business_address: s.business_address,
        delivery_radius_km: s.delivery_radius_km,
        min_order_amount: s.min_order_amount,
        base_delivery_fee: s.base_delivery_fee,
        per_km_fee: s.per_km_fee,
        free_delivery_threshold: s.free_delivery_threshold,
        delivery_enabled: s.delivery_enabled,
        serviceable_pincodes: s.serviceable_pincodes,
        distance_mode: s.distance_mode,
        require_complete_address: s.require_complete_address,
        allow_gps_checkout: s.allow_gps_checkout,
      } as never)
      .eq("id", s.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Delivery settings saved");
  };

  if (isAdmin === false) return null;
  if (!s) {
    return (
      <div className="grid min-h-[60vh] place-items-center pt-32 text-sm text-muted-foreground">Loading…</div>
    );
  }

  return (
    <div className="pt-32">
      <section className="container-luxe pb-6">
        <Link to="/admin/orders" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to orders
        </Link>
        <div className="mt-4 flex items-end justify-between gap-6">
          <div>
            <Eyebrow>Admin · Delivery</Eyebrow>
            <h1 className="mt-3 font-display text-5xl leading-[1.02] text-cream md:text-6xl">
              Delivery <span className="italic gold-text">settings</span>.
            </h1>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="btn-gold btn-gold-hover inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </section>

      <section className="container-luxe grid gap-6 pb-24 lg:grid-cols-2">
        <Card icon={<MapPin className="h-4 w-4" />} title="Business location">
          <Field label="Business address" value={s.business_address} onChange={(v) => update("business_address", v)} />
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Latitude" value={s.business_lat} step={0.0001} onChange={(v) => update("business_lat", v)} />
            <NumField label="Longitude" value={s.business_lng} step={0.0001} onChange={(v) => update("business_lng", v)} />
          </div>
          <NumField label="Delivery radius (km)" value={s.delivery_radius_km} onChange={(v) => update("delivery_radius_km", v)} />
          <label className="block">
            <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">Distance mode</span>
            <select value={s.distance_mode} onChange={(e) => update("distance_mode", e.target.value)} className="w-full rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-cream focus:border-primary focus:outline-none">
              <option value="road" className="bg-black">Road distance (OSRM)</option>
              <option value="straight" className="bg-black">Straight-line distance</option>
            </select>
          </label>
          <div className="flex items-center justify-between rounded-xl border border-border bg-input/40 px-4 py-3">
            <div>
              <p className="text-sm text-cream">Delivery enabled</p>
              <p className="text-xs text-muted-foreground">Turn off to pause all delivery orders.</p>
            </div>
            <Toggle checked={s.delivery_enabled} onChange={(v) => update("delivery_enabled", v)} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-input/40 px-4 py-3">
            <div>
              <p className="text-sm text-cream">Require complete address</p>
              <p className="text-xs text-muted-foreground">Customer must provide street, city, district, state and pincode.</p>
            </div>
            <Toggle checked={s.require_complete_address} onChange={(v) => update("require_complete_address", v)} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-input/40 px-4 py-3">
            <div>
              <p className="text-sm text-cream">Allow GPS checkout</p>
              <p className="text-xs text-muted-foreground">Shows “Use GPS” on checkout for exact customer location.</p>
            </div>
            <Toggle checked={s.allow_gps_checkout} onChange={(v) => update("allow_gps_checkout", v)} />
          </div>
        </Card>

        <Card icon={<ShieldCheck className="h-4 w-4" />} title="Fees & thresholds">
          <NumField label="Minimum order amount (₹)" value={s.min_order_amount} onChange={(v) => update("min_order_amount", v)} />
          <NumField label="Base delivery fee (₹)" value={s.base_delivery_fee} onChange={(v) => update("base_delivery_fee", v)} />
          <NumField label="Per km fee (₹)" value={s.per_km_fee} onChange={(v) => update("per_km_fee", v)} />
          <NumField label="Free delivery threshold (₹)" value={s.free_delivery_threshold} onChange={(v) => update("free_delivery_threshold", v)} />
        </Card>

        <Card icon={<MapPin className="h-4 w-4" />} title="Serviceable pincodes" className="lg:col-span-2">
          <p className="text-xs text-muted-foreground">Leave empty to accept any pincode within the radius. Adding pincodes limits delivery to that list only.</p>
          <div className="mt-3 flex gap-2">
            <input
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="e.g. 563160"
              inputMode="numeric"
              maxLength={6}
              className="flex-1 rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-cream placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <button onClick={addPin} className="btn-gold btn-gold-hover rounded-xl px-5 text-sm font-semibold">Add</button>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {s.serviceable_pincodes.length === 0 && (
              <li className="text-xs text-muted-foreground">No pincode restriction — any address inside the radius is accepted.</li>
            )}
            {s.serviceable_pincodes.map((p) => (
              <li key={p} className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary">
                {p}
                <button onClick={() => removePin(p)} aria-label={`Remove ${p}`} className="text-primary/70 hover:text-destructive">×</button>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}

function Card({ icon, title, className, children }: { icon: React.ReactNode; title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-3xl border border-border/60 bg-card/40 p-6 ${className ?? ""}`}>
      <div className="flex items-center gap-2 text-primary"><span>{icon}</span><span className="text-[11px] uppercase tracking-widest">{title}</span></div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-cream focus:border-primary focus:outline-none" />
    </label>
  );
}

function NumField({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-cream focus:border-primary focus:outline-none" />
    </label>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full border transition-colors ${checked ? "border-primary bg-primary/40" : "border-border bg-input/40"}`}
      aria-pressed={checked}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${checked ? "left-6 bg-primary" : "left-0.5 bg-muted-foreground"}`} />
    </button>
  );
}
