import { useState } from "react";
import { BellRing, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Out-of-stock capture: collects an email or WhatsApp number so the kitchen can
 * confirm availability when the product is restocked.
 */
export function NotifyMeButton({
  slug,
  productName,
  source = "healthy",
  className = "",
}: {
  slug: string;
  productName: string;
  source?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const raw = value.trim();
    if (!raw) return toast.error("Add an email or WhatsApp number");
    const isEmail = raw.includes("@");
    const digits = raw.replace(/\D/g, "");
    if (!isEmail && digits.length < 10) return toast.error("Enter a valid WhatsApp number");
    setBusy(true);
    const { error } = await supabase.from("notify_requests").insert({
      source,
      slug,
      product_name: productName,
      email: isEmail ? raw : null,
      phone: isEmail ? null : digits,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setOpen(false);
    setValue("");
    toast.success(`We'll ping you the moment ${productName} is back`);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-full border border-primary/60 px-5 py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 ${className}`}
      >
        <BellRing className="h-3.5 w-3.5" /> Notify me
      </button>
    );
  }

  return (
    <div className="flex w-full items-center gap-2">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Email or WhatsApp number"
        className="min-w-0 flex-1 rounded-full border border-border/60 bg-transparent px-4 py-2.5 text-xs text-cream placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
      />
      <button
        onClick={submit}
        disabled={busy}
        className="btn-gold btn-gold-hover inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellRing className="h-3.5 w-3.5" />} Notify
      </button>
    </div>
  );
}
