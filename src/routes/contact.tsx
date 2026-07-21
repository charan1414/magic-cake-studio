import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { Eyebrow } from "@/components/motion-primitives";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — C & It's Magic" },
      { name: "description", content: "Talk to C & It's Magic — for orders, private events, corporate catering and partnerships." },
      { property: "og:title", content: "Contact — C & It's Magic" },
      { property: "og:description", content: "We're here for celebrations big and small." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [state, setState] = useState({ name: "", email: "", message: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent. We'll be in touch shortly.");
    setState({ name: "", email: "", message: "" });
  };
  return (
    <div className="pt-32">
      <section className="container-luxe pb-20">
        <Eyebrow>Get in touch</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-6xl leading-[1.02] text-cream md:text-7xl">
          Let's plan something <span className="italic gold-text">unforgettable</span>.
        </h1>
      </section>

      <section className="container-luxe grid gap-8 pb-24 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <Card icon={<Phone className="h-4 w-4" />} label="Phone" value="+91 98800 00000" />
          <Card icon={<MessageCircle className="h-4 w-4" />} label="WhatsApp" value="+91 98800 00000" />
          <Card icon={<Mail className="h-4 w-4" />} label="Email" value="hello@canditsmagic.com" />
          <Card icon={<MapPin className="h-4 w-4" />} label="Studio" value="Lakkur, Malur — Karnataka" />
          <Card icon={<Instagram className="h-4 w-4" />} label="Instagram" value="@canditsmagic" />
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-border/60 bg-card/40 p-6">
          <Field label="Your name" value={state.name} onChange={(v) => setState({ ...state, name: v })} required />
          <Field label="Email" type="email" value={state.email} onChange={(v) => setState({ ...state, email: v })} required />
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">Message</span>
            <textarea rows={5} value={state.message} onChange={(e) => setState({ ...state, message: e.target.value })} required maxLength={1000}
              className="w-full resize-none rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-cream placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          </label>
          <button type="submit" className="btn-gold btn-gold-hover w-full rounded-full py-3 text-sm font-semibold">Send message</button>
        </form>
      </section>
    </div>
  );
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card/40 p-5">
      <span className="grid h-10 w-10 place-items-center rounded-full border border-primary/40 text-primary">{icon}</span>
      <div><p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p><p className="mt-0.5 text-cream">{value}</p></div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full rounded-xl border border-border bg-input/50 px-4 py-3 text-sm text-cream placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
    </label>
  );
}
