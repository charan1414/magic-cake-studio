import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Save, Share2, Sparkles, Upload } from "lucide-react";
import { CAKE_SHAPES, CAKE_SIZES, CAKE_FLAVORS, CAKE_FILLINGS, CAKE_FROSTINGS, CAKE_THEMES, CAKE_DECORATIONS, cakePrice } from "@/lib/data";
import { Eyebrow } from "@/components/motion-primitives";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const Cake3D = lazy(() => import("@/components/cake-3d"));

export const Route = createFileRoute("/cake-studio")({
  head: () => ({
    meta: [
      { title: "Cake Studio — Design Your Cake | C & It's Magic" },
      { name: "description", content: "Design a custom cake in real time — shape, flavor, filling, frosting, decoration and personal message. Live price estimation." },
      { property: "og:title", content: "The Cake Studio — C & It's Magic" },
      { property: "og:description", content: "Design your dream cake in real time." },
      { property: "og:url", content: "/cake-studio" },
    ],
  }),
  component: CakeStudio,
});

const BASE_PRICE = 899;
const DECOR_COST = 120;

function CakeStudio() {
  const [shape, setShape] = useState(CAKE_SHAPES[0]);
  const [size, setSize] = useState(CAKE_SIZES[1]);
  const [flavor, setFlavor] = useState(CAKE_FLAVORS[0]);
  const [filling, setFilling] = useState(CAKE_FILLINGS[0]);
  const [frosting, setFrosting] = useState(CAKE_FROSTINGS[0]);
  const [theme, setTheme] = useState(CAKE_THEMES[0]);
  const [decors, setDecors] = useState<string[]>(["24K Gold Leaf"]);
  const [message, setMessage] = useState("Happy Birthday");
  const [reference, setReference] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const user = useAuth((s) => s.user);

  const price = useMemo(() => {
    const base = Math.round(BASE_PRICE * size.mult);
    const decor = decors.length * DECOR_COST;
    const tier = shape.toLowerCase().includes("tier") ? 800 : shape === "Wedding Cake" ? 1600 : 0;
    return base + decor + tier;
  }, [size, decors, shape]);

  const toggleDecor = (d: string) =>
    setDecors((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  const save = async () => {
    if (!user) {
      toast.error("Please sign in to save your design");
      return;
    }
    setSaving(true);
    let ref_url: string | undefined;
    if (reference) {
      const { data, error } = await supabase.storage
        .from("cake-references")
        .upload(`${user.id}/${Date.now()}-${reference.name}`, reference, { upsert: false });
      if (error) console.warn(error);
      else if (data) ref_url = data.path;
    }
    const { data, error } = await supabase
      .from("cake_designs")
      .insert({
        user_id: user.id,
        config: { shape, size, flavor, filling, frosting, theme, decors },
        message,
        estimated_price: price,
        reference_image_url: ref_url ?? null,
      })
      .select("design_code")
      .single();
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success(`Saved · ${data.design_code}`);
  };

  return (
    <div className="pt-28">
      <section className="container-luxe pb-6">
        <Eyebrow>Signature Feature · Cake Studio</Eyebrow>
        <h1 className="mt-4 font-display text-5xl leading-[1.02] text-cream md:text-7xl">
          Design your <span className="italic gold-text">dream cake</span>.
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground">
          Compose it. Watch the price update in real time. Save it, share it, order it —
          your cake gets its own unique design ID.
        </p>
      </section>

      <section className="container-luxe grid gap-8 pb-24 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Preview */}
        <div className="sticky top-28 h-fit rounded-3xl border border-border/60 glass-heavy p-6">
          <div className="aspect-square overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-ink to-cocoa/40">
            <ClientOnly fallback={<CakePreview theme={theme} shape={shape} decors={decors} message={message} />}>
              <Suspense fallback={<CakePreview theme={theme} shape={shape} decors={decors} message={message} />}>
                <Cake3D
                  color={theme.color}
                  accent={theme.accent}
                  tiers={shape.toLowerCase().includes("three") || shape === "Wedding Cake" ? 3 : shape.toLowerCase().includes("two") ? 2 : 1}
                  decorations={decors}
                  message={message}
                />
              </Suspense>
            </ClientOnly>
          </div>
          <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">Drag to rotate · Live 3D preview</p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <Info label="Shape" value={shape} />
            <Info label="Size" value={size.label} />
            <Info label="Flavor" value={flavor} />
            <Info label="Frosting" value={frosting} />
          </div>
          <div className="mt-6 flex items-end justify-between border-t border-border/60 pt-5">
            <div>
              <p className="eyebrow">Live estimate</p>
              <p className="mt-1 font-display text-4xl gold-text">₹{price.toLocaleString("en-IN")}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Includes decoration. Delivery calculated at checkout.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={save} disabled={saving} className="btn-gold btn-gold-hover inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60">
                <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast("Link copied"); }} className="grid h-11 w-11 place-items-center rounded-full border border-border text-cream hover:border-primary">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Configurator */}
        <div className="space-y-8">
          <Step title="1. Shape">
            <Chips options={CAKE_SHAPES} value={shape} onChange={setShape} />
          </Step>
          <Step title="2. Size">
            <div className="flex flex-wrap gap-2">
              {CAKE_SIZES.map((s) => (
                <button key={s.label} onClick={() => setSize(s)} className={chip(size.label === s.label)}>
                  {s.label}
                </button>
              ))}
            </div>
          </Step>
          <Step title="3. Flavor & Sponge">
            <Chips options={CAKE_FLAVORS} value={flavor} onChange={setFlavor} />
          </Step>
          <Step title="4. Filling">
            <Chips options={CAKE_FILLINGS} value={filling} onChange={setFilling} />
          </Step>
          <Step title="5. Frosting">
            <Chips options={CAKE_FROSTINGS} value={frosting} onChange={setFrosting} />
          </Step>
          <Step title="6. Color Theme">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CAKE_THEMES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setTheme(t)}
                  className={`group flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${theme.name === t.name ? "border-primary shadow-luxe" : "border-border hover:border-primary/40"}`}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border" style={{ background: t.color }}>
                    <span className="h-3 w-3 rounded-full" style={{ background: t.accent }} />
                  </span>
                  <span className="text-xs text-cream/85">{t.name}</span>
                </button>
              ))}
            </div>
          </Step>
          <Step title="7. Decorations">
            <div className="flex flex-wrap gap-2">
              {CAKE_DECORATIONS.map((d) => {
                const on = decors.includes(d);
                return (
                  <button key={d} onClick={() => toggleDecor(d)} className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${on ? "border-primary bg-primary text-primary-foreground" : "border-border text-cream/80 hover:border-primary/40"}`}>
                    {on && <Check className="h-3.5 w-3.5" />} {d}
                  </button>
                );
              })}
            </div>
          </Step>
          <Step title="8. Personalized Message">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 40))}
              placeholder="Happy Birthday"
              className="w-full rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-cream placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">{message.length}/40 characters</p>
          </Step>
          <Step title="9. Reference Image (optional)">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border/80 bg-card/40 p-5 hover:border-primary/50">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-primary/40 text-primary">
                <Upload className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm text-cream">{reference ? reference.name : "Upload inspiration (PNG, JPG, WEBP)"}</span>
                <span className="text-xs text-muted-foreground">Stored securely with your order.</span>
              </span>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setReference(e.target.files?.[0] ?? null)} className="hidden" />
            </label>
          </Step>
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-sm text-cream/85">
            <p className="flex items-center gap-2 font-medium"><Sparkles className="h-4 w-4 text-primary" /> AI design suggestions</p>
            <p className="mt-2 text-muted-foreground">Try Pistachio + Rose Petals for a wedding, or Belgian Dark + Gold Leaf for a milestone birthday.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 font-display text-2xl text-cream">{title}</h3>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 px-3 py-2">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-cream">{value}</p>
    </div>
  );
}

function chip(active: boolean) {
  return `rounded-full border px-4 py-2 text-xs font-medium transition-all ${active ? "border-primary bg-primary text-primary-foreground" : "border-border text-cream/80 hover:border-primary/40"}`;
}

function Chips({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className={chip(value === o)}>{o}</button>
      ))}
    </div>
  );
}

function CakePreview({ theme, shape, decors, message }: { theme: typeof CAKE_THEMES[number]; shape: string; decors: string[]; message: string }) {
  const twoTier = shape.toLowerCase().includes("two");
  const threeTier = shape.toLowerCase().includes("three") || shape === "Wedding Cake";
  const tiers = threeTier ? 3 : twoTier ? 2 : 1;

  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-b from-ink to-cocoa/40">
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 20%, ${theme.accent}20, transparent 60%)` }} />

      {/* Tiers */}
      <div className="absolute inset-x-0 bottom-16 flex flex-col items-center justify-end">
        {Array.from({ length: tiers }).map((_, i) => {
          const w = 55 + (tiers - 1 - i) * 20;
          const h = 42 + (tiers - 1 - i) * 6;
          return (
            <motion.div
              key={i}
              layout
              className="relative rounded-t-[14px] shadow-2xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              style={{ width: `${w}%`, height: `${h}px`, background: theme.color, borderTop: `2px solid ${theme.accent}` }}
            >
              <div className="absolute inset-x-0 top-0 h-3 rounded-t-[14px]" style={{ background: `linear-gradient(180deg, ${theme.accent}55, transparent)` }} />
              {i === 0 && decors.includes("24K Gold Leaf") && (
                <div className="absolute inset-x-2 top-1 h-1 rounded-full" style={{ background: theme.accent, boxShadow: `0 0 12px ${theme.accent}` }} />
              )}
            </motion.div>
          );
        })}
        {/* Base plate */}
        <div className="mt-1 h-2 w-3/4 rounded-full" style={{ background: `${theme.accent}55` }} />
      </div>

      {/* Decorations dots */}
      <div className="absolute inset-x-0 top-1/3 flex justify-center gap-1.5">
        {decors.slice(0, 5).map((d, i) => (
          <motion.span
            key={d}
            initial={{ scale: 0, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="h-2 w-2 rounded-full"
            style={{ background: theme.accent, boxShadow: `0 0 8px ${theme.accent}` }}
            title={d}
          />
        ))}
      </div>

      {/* Sparkles */}
      {[...Array(10)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full"
          style={{ left: `${(i * 11 + 5) % 95}%`, top: `${(i * 17) % 40 + 5}%`, background: theme.accent }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.5, 1.4, 0.5] }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
        />
      ))}

      {/* Message */}
      {message && (
        <div className="absolute inset-x-0 bottom-5 text-center">
          <p className="font-display text-lg italic" style={{ color: theme.accent }}>“{message}”</p>
        </div>
      )}
    </div>
  );
}
