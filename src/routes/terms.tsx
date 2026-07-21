import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — C & It's Magic" },
      { name: "description", content: "The terms that govern use of the C & It's Magic website and ordering platform." },
      { property: "og:title", content: "Terms of Service — C & It's Magic" },
      { property: "og:description", content: "Legal terms of use." },
    ],
  }),
  component: () => (
    <div className="pt-32 pb-24">
      <div className="container-luxe max-w-3xl space-y-6 text-muted-foreground">
        <h1 className="font-display text-5xl text-cream">Terms of Service</h1>
        <p>By using this site you agree to our order lead times, delivery zone, and cancellation policy. Signature cakes require 24-hour notice and are non-refundable once production begins. Food orders may be cancelled up to 20 minutes after placement.</p>
        <p>All prices are inclusive of applicable taxes unless stated. Delivery is free above ₹999 within our 20 km zone.</p>
        <p>Content on this site (photography, recipes, and design) is © C &amp; It's Magic.</p>
      </div>
    </div>
  ),
});
