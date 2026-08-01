import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, MapPin, XCircle } from "lucide-react";
import { checkServiceability, type ServiceabilityResult } from "@/lib/delivery.functions";
import { usePin } from "@/lib/pin-store";

type Props = {
  /** Compact variant for product pages, full for the dedicated page. */
  variant?: "inline" | "panel";
  subtotal?: number;
  onResult?: (r: ServiceabilityResult) => void;
};

/**
 * Reusable FNP-style delivery pincode checker. Remembers the last
 * verified pincode across the session via the pin store.
 */
export function PinChecker({ variant = "inline", subtotal, onResult }: Props) {
  const saved = usePin((s) => s.pincode);
  const savePin = usePin((s) => s.set);
  const check = useServerFn(checkServiceability);

  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ServiceabilityResult | null>(null);

  useEffect(() => {
    if (saved) setPin(saved);
  }, [saved]);

  const run = async (value?: string) => {
    const p = (value ?? pin).trim();
    if (!/^\d{6}$/.test(p)) {
      setResult({ ok: false, reason: "Please enter a valid 6-digit pincode.", settings: { min_order_amount: 0, free_delivery_threshold: 0, delivery_radius_km: 20, delivery_enabled: true } });
      return;
    }
    setLoading(true);
    try {
      const r = await check({ data: { pincode: p, subtotal } });
      setResult(r);
      savePin({ pincode: p, serviceable: r.ok, areaLabel: r.areas?.[0] ?? "", distanceKm: r.distance_km ?? null });
      onResult?.(r);
    } catch {
      setResult({ ok: false, reason: "Could not check delivery right now. Please try again.", settings: { min_order_amount: 0, free_delivery_threshold: 0, delivery_radius_km: 20, delivery_enabled: true } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={variant === "panel" ? "rounded-3xl border border-border/60 bg-card/40 p-6" : "rounded-2xl border border-border/60 bg-card/40 p-5"}>
      <div className="flex items-center gap-2 text-primary">
        <MapPin className="h-4 w-4" />
        <span className="text-[11px] uppercase tracking-widest">Check delivery</span>
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onKeyDown={(e) => { if (e.key === "Enter") void run(); }}
          placeholder="Enter 6-digit pincode"
          inputMode="numeric"
          maxLength={6}
          aria-label="Delivery pincode"
          className="flex-1 rounded-xl border border-border bg-input/50 px-4 py-3 text-sm tracking-widest text-cream placeholder:tracking-normal placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <button
          onClick={() => void run()}
          disabled={loading}
          className="btn-gold btn-gold-hover inline-flex items-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Checking" : "Check"}
        </button>
      </div>

      {result && (
        <div className={`mt-4 flex items-start gap-3 rounded-xl border p-3 text-xs ${result.ok ? "border-primary/40 bg-primary/5" : "border-destructive/40 bg-destructive/10"}`}>
          {result.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />}
          <div className="text-cream">
            {result.ok ? (
              <>
                <p className="font-medium">
                  Delivering to {result.pincode} · {result.eta_label}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {result.district ? `${titleCase(result.district)} · ` : ""}
                  {result.distance_km} km from our Lakkur kitchen · delivery{" "}
                  <span className="text-primary">{result.delivery_fee === 0 ? "Free" : `₹${result.delivery_fee}`}</span>
                </p>
                {result.areas?.length ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">Covers: {result.areas.slice(0, 4).join(", ")}</p>
                ) : null}
              </>
            ) : (
              <p>{result.reason}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function titleCase(s: string) {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
