import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader, SiteFooter, CartDrawer, AuthListener, SmoothScroll } from "../components/site-chrome";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 font-display text-6xl text-cream">Lost the recipe</h1>
        <p className="mt-4 text-sm text-muted-foreground">The page you're looking for has slipped out of the kitchen.</p>
        <Link to="/" className="btn-gold btn-gold-hover mt-8 inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold">
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow text-destructive">Something broke</p>
        <h1 className="mt-3 font-display text-4xl text-cream">This page didn't load</h1>
        <p className="mt-3 text-sm text-muted-foreground">Try again or head back to the entrance.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="btn-gold btn-gold-hover inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold"
          >
            Try again
          </button>
          <a href="/" className="btn-outline-gold btn-outline-gold-hover inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "C & It's Magic — Luxury Cloud Kitchen | Malur" },
      { name: "description", content: "Handcrafted cakes, gourmet desserts, and cinematic cooking — delivered fresh within 20 km of Lakkur, Malur. Crafted with Passion. Delivered with Magic." },
      { name: "author", content: "C & It's Magic" },
      { name: "theme-color", content: "#0d0906" },
      { property: "og:site_name", content: "C & It's Magic" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "C & It's Magic — Luxury Cloud Kitchen" },
      { property: "og:description", content: "Handcrafted cakes, gourmet desserts, and cinematic cooking, delivered with magic." },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@canditsmagic" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Restaurant",
        name: "C & It's Magic",
        description: "Luxury cloud kitchen crafting cakes, desserts and gourmet food.",
        servesCuisine: ["Indian", "Bakery", "Desserts", "Continental"],
        priceRange: "₹₹₹",
        telephone: "+91-9110283949",
        email: "canditsmagic@gmail.com",
        address: { "@type": "PostalAddress", addressLocality: "Lakkur, Malur", addressRegion: "Karnataka", addressCountry: "IN" },
        sameAs: ["https://www.instagram.com/canditsmagic", "https://www.youtube.com/@cookwithcharan"],
      }),
    }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthListener />
      <SmoothScroll />
      <SiteHeader />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <SiteFooter />
      <CartDrawer />
      <Toaster position="top-center" theme="dark" richColors />
    </QueryClientProvider>
  );
}
