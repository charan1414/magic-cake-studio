import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const DISMISS_KEY = "cim-signup-popup";
const PENDING_KEY = "cim-promo-pending";
export const FIRST_ORDER_PERCENT = 10;

/** Applies the pending 10% first-order promo to a freshly signed-in account. */
export async function claimPendingPromo(userId: string) {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(PENDING_KEY) !== "1") return;
  const { data } = await supabase
    .from("profiles")
    .select("first_order_discount_percent, first_order_discount_used")
    .eq("id", userId)
    .maybeSingle();
  const row = data as never as { first_order_discount_used?: boolean } | null;
  if (row?.first_order_discount_used) {
    localStorage.removeItem(PENDING_KEY);
    return;
  }
  const { error } = await supabase
    .from("profiles")
    .update({ first_order_discount_percent: FIRST_ORDER_PERCENT } as never)
    .eq("id", userId);
  if (!error) {
    localStorage.removeItem(PENDING_KEY);
    localStorage.setItem(DISMISS_KEY, "signed-up");
  }
}

export function SignupPopup() {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    const t = setTimeout(() => setOpen(true), 6000);
    return () => clearTimeout(t);
  }, [user]);

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(DISMISS_KEY, "dismissed");
    } catch { /* storage unavailable */ }
  };

  const submit = async () => {
    const value = contact.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isPhone = /^\+?[0-9\s-]{8,15}$/.test(value);
    if (!isEmail && !isPhone) {
      toast.error("Enter a valid email or phone number");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("signup_leads").insert({
      email: isEmail ? value : null,
      phone: isPhone ? value : null,
      discount_percent: FIRST_ORDER_PERCENT,
    } as never);
    setSaving(false);
    if (error) {
      toast.error("Could not register you just now — please try again.");
      return;
    }
    try {
      localStorage.setItem(PENDING_KEY, "1");
      localStorage.setItem(DISMISS_KEY, "signed-up");
    } catch { /* storage unavailable */ }
    setOpen(false);
    toast.success("10% off unlocked — finish signing up to claim it.");
    navigate({ to: "/auth" });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-label="Sign up and get 10% off your first order"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 z-[90] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-primary/30 glass-heavy p-7 shadow-luxe"
          >
            <button
              onClick={dismiss}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-border text-cream/80 hover:border-primary/60 hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>

            <span className="grid h-11 w-11 place-items-center rounded-full border border-primary/40 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <p className="eyebrow mt-5">Welcome offer</p>
            <h2 className="mt-2 font-display text-3xl leading-tight text-cream">
              Sign up now and get <span className="gold-text italic">10% OFF</span> on your first order!
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Drop your email or phone — your discount applies automatically at checkout.
            </p>

            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void submit(); }}
              placeholder="you@email.com or +91…"
              className="mt-5 w-full rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-cream placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <button
              onClick={submit}
              disabled={saving}
              className="btn-gold btn-gold-hover mt-3 w-full rounded-full py-3 text-sm font-semibold disabled:opacity-60"
            >
              {saving ? "Just a moment…" : "Sign Up"}
            </button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              One-time offer for new accounts. No spam, ever.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
