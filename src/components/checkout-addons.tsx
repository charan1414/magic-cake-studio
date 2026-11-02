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
    <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg text-cream">Add-ons</h2>
        <p className="text-[11px] text-muted-foreground">Tap to add or remove</p>
      </div>
      {/* One compact, swipeable row on mobile; wraps into a tidy grid on larger screens. */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        {addons.map((a) => {
          const slug = addonSlug(a.id);
          const selected = items.some((i) => i.slug === slug);
          const priced = a.price != null;
          const img = addonImage(a.name);
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
              className={`flex shrink-0 items-center gap-2 rounded-xl border py-2 pl-2.5 pr-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                selected ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/50"
              }`}
            >
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border text-primary"}`}>
                {selected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              </span>
              {img ? (
                <img src={img} alt={a.name} loading="lazy" className="h-9 w-9 rounded-lg object-cover" />
              ) : (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 font-display text-sm text-primary">{a.name.slice(0, 1).toUpperCase()}</span>
              )}
              <span className="text-xs font-medium leading-tight text-cream">{a.name}</span>
              <span className="text-xs font-medium gold-text">{priced ? `₹${Number(a.price).toLocaleString("en-IN")}` : "—"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
