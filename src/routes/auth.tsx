import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — C & It's Magic" },
      { name: "description", content: "Sign in or create your account with C & It's Magic to save cakes, addresses and orders." },
      { property: "og:title", content: "Sign in — C & It's Magic" },
      { property: "og:description", content: "Your account for the C & It's Magic experience." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: "/account" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: { full_name: fullName, phone },
          },
        });
        if (error) throw error;
        toast.success("Welcome. Check your inbox to verify.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        navigate({ to: "/account" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error(result.error.message ?? "Google sign-in failed");
    else if (!result.redirected) navigate({ to: "/account" });
  };

  return (
    <div className="grid min-h-screen grid-cols-1 pt-24 md:grid-cols-2">
      {/* Poster */}
      <div className="relative hidden overflow-hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-br from-cocoa/40 via-ink to-ink" />
        <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-[100px]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2 text-cream">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-primary/40 text-primary"><Sparkles className="h-4 w-4" /></span>
            <span className="font-display text-lg">C &amp; It's <span className="italic gold-text">Magic</span></span>
          </div>
          <div>
            <p className="eyebrow">Welcome</p>
            <h1 className="mt-4 font-display text-6xl leading-[1.02] text-cream">
              Your seat at the <span className="italic gold-text">chef's table</span>.
            </h1>
            <p className="mt-5 max-w-md text-sm text-muted-foreground">
              Save your favourite cakes, track orders in real time, and unlock loyalty rewards.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} C &amp; It's Magic — Malur</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center px-6 py-16 md:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex gap-1 rounded-full border border-border p-1">
            <button onClick={() => setMode("sign-in")} className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all ${mode === "sign-in" ? "bg-primary text-primary-foreground" : "text-cream/70"}`}>Sign in</button>
            <button onClick={() => setMode("sign-up")} className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all ${mode === "sign-up" ? "bg-primary text-primary-foreground" : "text-cream/70"}`}>Create account</button>
          </div>

          <button onClick={google} className="mb-6 flex w-full items-center justify-center gap-3 rounded-full border border-border bg-card/60 py-3 text-sm font-medium text-cream transition-colors hover:border-primary/50">
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.8h5.4c-.24 1.3-1.72 3.8-5.4 3.8-3.25 0-5.9-2.7-5.9-6s2.65-6 5.9-6c1.85 0 3.1.79 3.8 1.47l2.6-2.5C16.7 3.3 14.6 2.4 12 2.4 6.86 2.4 2.7 6.6 2.7 12s4.16 9.6 9.3 9.6c5.36 0 8.9-3.76 8.9-9.05 0-.6-.06-1.07-.13-1.54H12z"/></svg>
            Continue with Google
          </button>

          <PhoneOtp onDone={() => navigate({ to: "/account" })} />

          <div className="mb-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "sign-up" && (
              <>
                <Field label="Full name" value={fullName} onChange={setFullName} required />
                <Field label="Phone" type="tel" value={phone} onChange={setPhone} />
              </>
            )}
            <Field label="Email" type="email" value={email} onChange={setEmail} required icon={<Mail className="h-4 w-4" />} />
            <Field label="Password" type="password" value={password} onChange={setPassword} required minLength={6} />
            <button type="submit" disabled={loading} className="btn-gold btn-gold-hover w-full rounded-full py-3 text-sm font-semibold disabled:opacity-60">
              {loading ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

function PhoneOtp({ onDone }: { onDone: () => void }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const full = `+91${phone.replace(/\D/g, "").slice(-10)}`;

  const send = async () => {
    if (phone.replace(/\D/g, "").length < 10) return toast.error("Enter a valid 10-digit mobile number");
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: full });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSent(true);
    toast.success("OTP sent to your mobile");
  };
  const verify = async () => {
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ phone: full, token: code.trim(), type: "sms" });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in");
    onDone();
  };

  return (
    <div className="mb-6 rounded-2xl border border-border bg-card/40 p-4">
      <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Mobile number + OTP</p>
      <div className="flex gap-2">
        <span className="grid place-items-center rounded-xl border border-border px-3 text-sm text-cream/80">+91</span>
        <input type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={sent} placeholder="98765 43210" maxLength={14}
          className="w-full rounded-xl border border-border bg-input/50 px-3 py-2.5 text-sm text-cream focus:border-primary focus:outline-none" />
        {!sent && <button onClick={send} disabled={busy} className="rounded-xl border border-primary/60 px-4 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50">{busy ? "…" : "Send OTP"}</button>}
      </div>
      {sent && (
        <div className="mt-3 flex gap-2">
          <input inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit OTP" maxLength={6}
            className="w-full rounded-xl border border-border bg-input/50 px-3 py-2.5 text-sm tracking-widest text-cream focus:border-primary focus:outline-none" />
          <button onClick={verify} disabled={busy || code.length < 6} className="btn-gold rounded-xl px-4 text-sm font-semibold disabled:opacity-50">{busy ? "…" : "Verify"}</button>
        </div>
      )}
      {sent && <button onClick={() => { setSent(false); setCode(""); }} className="mt-2 text-[11px] text-muted-foreground hover:text-primary">Change number / resend</button>}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, minLength, icon }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; minLength?: number; icon?: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          className={`w-full rounded-xl border border-border bg-input/50 py-3 text-sm text-cream placeholder:text-muted-foreground focus:border-primary focus:outline-none ${icon ? "pl-10 pr-3" : "px-3"}`}
        />
      </div>
    </label>
  );
}
