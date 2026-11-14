import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Privacy Policy — C & It's Magic" },
      { name: "description", content: "How C & It's Magic collects, uses and safeguards your personal information." },
      { property: "og:title", content: "Privacy Policy — C & It's Magic" },
      { property: "og:description", content: "Your data, respected." },
    ],
  }),
  component: () => (
    <div className="pt-32 pb-24">
      <div className="container-luxe max-w-3xl space-y-6 text-muted-foreground">
        <h1 className="font-display text-5xl text-cream">Privacy Policy</h1>
        <p>We collect only what we need to make and deliver your order: your name, contact, address, and cake preferences. We never sell your data.</p>
        <p>Payments are processed by our PCI-compliant partners. We do not store card details on our servers.</p>
        <p>You can request a full export or deletion of your data anytime at <a className="text-primary hover:underline" href="mailto:hello@canditsmagic.com">hello@canditsmagic.com</a>.</p>
      </div>
    </div>
  ),
});
