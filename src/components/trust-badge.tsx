import { Leaf, ShieldCheck } from "lucide-react";

/** "No Added Colours. No Preservatives." — compact trust highlight. */
export function TrustBadge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 ${className}`}
    >
      <Leaf className="h-4 w-4 shrink-0 text-primary" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-cream sm:text-xs">
        No Added Colours. No Preservatives.
      </span>
    </div>
  );
}

/** Full-width band version for pages/sections. */
export function TrustBand() {
  return (
    <section className="container-luxe py-10">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-border/60 bg-card/40 px-6 py-8 text-center sm:flex-row sm:justify-center sm:gap-10 sm:text-left">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/40 text-primary">
            <Leaf className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-xl text-cream">No Added Colours</p>
            <p className="text-xs text-muted-foreground">Only what nature gives the ingredient.</p>
          </div>
        </div>
        <div className="hidden h-10 w-px bg-border/60 sm:block" />
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/40 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-xl text-cream">No Preservatives</p>
            <p className="text-xs text-muted-foreground">Baked fresh, delivered the same day.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
