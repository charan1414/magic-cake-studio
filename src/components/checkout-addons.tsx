import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart-store";
import addonSnowImg from "@/assets/addon-snow.jpg";
import addonBlastImg from "@/assets/addon-blast.jpg";
import addonTopperImg from "@/assets/addon-cake-topper.jpg";
import addonCandlesImg from "@/assets/addon-candles.jpg";

export type Addon = { id: string; name: string; price: number | null; active: boolean; display_order: number };
export const addonSlug = (id: string) => `addon-${id}`;

/** Bundled product shots for well-known add-ons; name-matched, admin rows without one fall back to initials. */
const ADDON_IMAGES: Record<string, string> = {
  snow: addonSnowImg,
  blast: addonBlastImg,
  "cake topper": addonTopperImg,
  topper: addonTopperImg,
  candles: addonCandlesImg,
  candle: addonCandlesImg,
};
const addonImage = (name: string) => ADDON_IMAGES[name.trim().toLowerCase()];

/** Admin-managed add-ons (candles, toppers…) — toggled in and out of the cart. */
export function CheckoutAddons() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const items = useCart((s) => s.items);
  const add = useCart((s) => s.add);
  const remove = useCart((s) => s.remove);

  useEffect(() => {
    (supabase.from("addons" as never) as any)
      .select("*").eq("active", true).order("display_order")
      .then(({ data }: { data: Addon[] | null }) => setAddons(data ?? []));
  }, []);

  if (addons.length === 0) return null;

  return (
    <div className="rounded-3xl border border-border/60 bg-card/40 p-6">
      <h2 className="font-display text-2xl text-cream">Add-ons</h2>
      <p className="mt-1 text-xs text-muted-foreground">Make the celebration complete. Tap to add or remove.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {addons.map((a) => {
          const slug = addonSlug(a.id);
          const selected = items.some((i) => i.slug === slug);
          const priced = a.price != null;
          return (
            <button
              key={a.id}
              type="button"
              disabled={!priced}
              onClick={() => {
                if (selected) remove(slug);
                else add({ slug, name: a.name, price: Number(a.price), image: addonImage(a.name) ?? "", variant: "Add-on" });
                useCart.getState().close();
              }}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                selected ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/50"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className={`grid h-6 w-6 place-items-center rounded-full border ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border text-primary"}`}>
                  {selected ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </span>
                {img ? (
                  <img src={img} alt={a.name} loading="lazy" width={1024} height={1024} className="h-12 w-12 rounded-xl object-cover" />
                ) : (
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 font-display text-lg text-primary">{a.name.slice(0, 1).toUpperCase()}</span>
                )}
                <span className="text-sm font-medium text-cream">{a.name}</span>
              </span>
              <span className="text-sm gold-text">{priced ? `₹${Number(a.price).toLocaleString("en-IN")}` : "Coming soon"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
