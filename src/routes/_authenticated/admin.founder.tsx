import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Eyebrow } from "@/components/motion-primitives";
import { Text, TextArea } from "@/components/admin-form";
import { FOUNDER_FALLBACK, type FounderProfile, type TimelineEntry } from "@/lib/founder";

export const Route = createFileRoute("/_authenticated/admin/founder")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    if (!isAdmin) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Admin · Founder — C & It's Magic" },
      { name: "description", content: "Manage the founder profile shown on the About page." },
      { property: "og:title", content: "Admin · Founder — C & It's Magic" },
      { property: "og:description", content: "Founder profile management." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminFounder,
});

function AdminFounder() {
  const [p, setP] = useState<FounderProfile>(FOUNDER_FALLBACK);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("founder_profile")
      .select("*")
      .maybeSingle()
      .then(({ data }) => {
        if (data) setP({ ...FOUNDER_FALLBACK, ...data, timeline: (data.timeline as unknown as TimelineEntry[]) ?? [] });
      });
  }, []);

  const set = (patch: Partial<FounderProfile>) => setP((prev) => ({ ...prev, ...patch }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("founder_profile").upsert({ id: true, ...p, timeline: p.timeline as never });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Founder profile saved");
  };

  return (
    <div className="pt-32">
      <section className="container-luxe pb-8">
        <Eyebrow>Admin</Eyebrow>
        <h1 className="mt-3 font-display text-5xl text-cream md:text-6xl">
          Founder <span className="italic gold-text">Profile</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Everything here renders on the About page and in the site's structured data.</p>
      </section>

      <section className="container-luxe pb-24">
        <div className="grid gap-4 rounded-3xl border border-border/60 bg-card/30 p-6 md:grid-cols-3">
          <Text label="Name" value={p.name} onChange={(v) => set({ name: v })} />
          <Text label="Designation" value={p.designation} onChange={(v) => set({ designation: v })} />
          <Text label="Company" value={p.company} onChange={(v) => set({ company: v })} />
          <Text label="Founded" value={p.founded} onChange={(v) => set({ founded: v })} />
          <Text label="Location" value={p.location} onChange={(v) => set({ location: v })} />
          <Text label="Photo URL (optional)" value={p.photo_url ?? ""} onChange={(v) => set({ photo_url: v || null })} placeholder="Leave blank to use the bundled portrait" />
          <Text label="Instagram URL" value={p.instagram_url ?? ""} onChange={(v) => set({ instagram_url: v || null })} />
          <Text label="LinkedIn URL" value={p.linkedin_url ?? ""} onChange={(v) => set({ linkedin_url: v || null })} />
          <div />
          <TextArea label="Biography" value={p.bio} onChange={(v) => set({ bio: v })} rows={6} className="md:col-span-3" />
          <TextArea label="Mission" value={p.mission} onChange={(v) => set({ mission: v })} rows={3} className="md:col-span-3" />
          <TextArea label="Vision" value={p.vision} onChange={(v) => set({ vision: v })} rows={3} className="md:col-span-3" />

          <div className="md:col-span-3">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Journey timeline</p>
              <button onClick={() => set({ timeline: [...p.timeline, { year: "", title: "", detail: "" }] })} className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 px-3 py-1.5 text-xs text-primary hover:bg-primary/10">
                <Plus className="h-3 w-3" /> Add milestone
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {p.timeline.map((entry, idx) => (
                <div key={idx} className="grid gap-3 rounded-xl border border-border/50 p-4 md:grid-cols-[7rem_1fr_2fr_auto]">
                  <Text value={entry.year} onChange={(v) => set({ timeline: p.timeline.map((t, i) => (i === idx ? { ...t, year: v } : t)) })} placeholder="Year" />
                  <Text value={entry.title} onChange={(v) => set({ timeline: p.timeline.map((t, i) => (i === idx ? { ...t, title: v } : t)) })} placeholder="Title" />
                  <Text value={entry.detail} onChange={(v) => set({ timeline: p.timeline.map((t, i) => (i === idx ? { ...t, detail: v } : t)) })} placeholder="Detail" />
                  <button onClick={() => set({ timeline: p.timeline.filter((_, i) => i !== idx) })} aria-label="Remove" className="self-center text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <button onClick={save} disabled={saving} className="btn-gold btn-gold-hover inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60">
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save founder profile"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
