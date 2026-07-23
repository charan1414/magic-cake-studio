import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Cake, Heart, LogOut, MapPin, Package, Sparkles, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Eyebrow } from "@/components/motion-primitives";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My Account — C & It's Magic" },
      { name: "description", content: "Manage your profile, addresses, saved designs, wishlist and orders at C & It's Magic." },
      { property: "og:title", content: "My Account — C & It's Magic" },
      { property: "og:description", content: "Your C & It's Magic account." },
    ],
  }),
  component: AccountPage,
});

type Design = { id: string; design_code: string; estimated_price: number; message: string | null; created_at: string; status: string };
type Order = { id: string; order_code: string; total: number; status: string; created_at: string };

function AccountPage() {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<{ full_name: string | null; loyalty_points: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, loyalty_points").eq("id", user.id).maybeSingle()
      .then(({ data }) => setProfile(data as any));
    supabase.from("cake_designs").select("id,design_code,estimated_price,message,created_at,status").order("created_at", { ascending: false })
      .then(({ data }) => setDesigns((data ?? []) as any));
    supabase.from("orders").select("id,order_code,total,status,created_at").order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as any));
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <div className="pt-32">
      <section className="container-luxe pb-6">
        <Eyebrow>Welcome back</Eyebrow>
        <div className="mt-4 flex items-end justify-between gap-6">
          <h1 className="font-display text-5xl leading-[1.02] text-cream md:text-6xl">
            {profile?.full_name ? <>Hello, <span className="italic gold-text">{profile.full_name.split(" ")[0]}</span>.</> : "Your account"}
          </h1>
          <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-cream/80 hover:border-primary hover:text-primary">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </section>

      <section className="container-luxe grid gap-4 pb-8 sm:grid-cols-3">
        <Stat icon={<Sparkles className="h-4 w-4" />} label="Loyalty points" value={profile?.loyalty_points ?? 0} />
        <Stat icon={<Cake className="h-4 w-4" />} label="Saved cake designs" value={designs.length} />
        <Stat icon={<Package className="h-4 w-4" />} label="Orders" value={orders.length} />
      </section>

      <section className="container-luxe grid gap-6 pb-12 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-border/60 bg-card/40 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl text-cream">Recent orders</h2>
            <Link to="/menu" className="text-xs text-primary hover:underline">Order again</Link>
          </div>
          {orders.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">No orders yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-cream">{o.order_code}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-IN")} · <span className="uppercase tracking-wider text-primary">{o.status.replace(/_/g, " ")}</span></p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-display gold-text">₹{Number(o.total).toLocaleString("en-IN")}</p>
                    <Link to="/track/$orderId" params={{ orderId: o.id }} className="rounded-full border border-primary/50 px-3 py-1.5 text-[11px] font-medium text-primary hover:bg-primary/10">Track</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <Panel icon={<UserIcon className="h-4 w-4" />} title="Profile" to="/account" desc="Name, phone, birthday" />
          <Panel icon={<MapPin className="h-4 w-4" />} title="Addresses" to="/account" desc="Delivery addresses" />
          <Panel icon={<Heart className="h-4 w-4" />} title="Wishlist" to="/account" desc="Saved dishes" />
        </div>
      </section>

      <section className="container-luxe pb-24">
        <div className="rounded-3xl border border-border/60 bg-card/40 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl text-cream">Saved cake designs</h2>
            <Link to="/cake-studio" className="text-xs text-primary hover:underline">+ New design</Link>
          </div>
          {designs.length === 0 ? (
            <div className="py-12 text-center">
              <Cake className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">No designs yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {designs.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-cream">{d.design_code}</p>
                    <p className="text-xs text-muted-foreground">{d.message ?? "No message"} · {new Date(d.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="font-display gold-text">₹{Number(d.estimated_price).toLocaleString("en-IN")}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
      <div className="flex items-center gap-2 text-primary">{icon}<span className="text-[11px] uppercase tracking-widest">{label}</span></div>
      <p className="mt-3 font-display text-4xl text-cream">{value}</p>
    </div>
  );
}

function Panel({ icon, title, desc, to }: { icon: React.ReactNode; title: string; desc: string; to: string }) {
  return (
    <Link to={to} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-primary/50">
      <span className="grid h-10 w-10 place-items-center rounded-full border border-primary/40 text-primary">{icon}</span>
      <span>
        <span className="block font-medium text-cream">{title}</span>
        <span className="text-xs text-muted-foreground">{desc}</span>
      </span>
    </Link>
  );
}
