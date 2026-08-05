import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";
import { useEffect, useState } from "react";
import { useCart, cartCount } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/menu", label: "Menu" },
  { to: "/no-maida-no-sugar", label: "No Maida No Sugar" },

  { to: "/cake-studio", label: "Cake Studio" },
  { to: "/our-kitchen", label: "Our Kitchen" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const user = useAuth((s) => s.user);
  const count = cartCount(items);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "glass-heavy" : "bg-transparent"
        }`}
      >
        <div className="container-luxe flex h-20 items-center justify-between">
          <Link to="/" className="group flex items-center gap-2.5">
            <img
              src={logoAsset.url}
              alt="C & It's Magic logo"
              className="h-11 w-11 object-contain transition-transform duration-500 group-hover:rotate-6"
            />

            <span className="flex flex-col leading-none">
              <span className="font-display text-lg tracking-tight text-cream">
                C &amp; It's <span className="gold-text italic">Magic</span>
              </span>
              <span className="mt-0.5 text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
                Crafted · Delivered
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="group relative text-sm font-medium text-cream/85 transition-colors hover:text-primary"
                activeProps={{ className: "text-primary" }}
              >
                {n.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-transparent via-primary to-transparent transition-all duration-500 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to={user ? "/account" : "/auth"}
              aria-label="Account"
              className="grid h-10 w-10 place-items-center rounded-full border border-border/70 text-cream/85 transition-colors hover:border-primary/60 hover:text-primary"
            >
              <User className="h-4 w-4" />
            </Link>
            <button
              onClick={openCart}
              aria-label="Cart"
              className="relative grid h-10 w-10 place-items-center rounded-full border border-border/70 text-cream/85 transition-colors hover:border-primary/60 hover:text-primary"
            >
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full border border-border/70 text-cream md:hidden"
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="container-luxe flex h-full flex-col justify-center gap-8 pt-24">
              {NAV.map((n, i) => (
                <motion.div
                  key={n.to}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="font-display text-4xl text-cream hover:text-primary"
                  >
                    {n.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative mt-32 border-t border-border/60 bg-ink/60">
      <div className="container-luxe grid gap-14 py-20 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <img src={logoAsset.url} alt="C & It's Magic logo" className="h-12 w-12 object-contain" loading="lazy" />
            <span className="font-display text-2xl text-cream">
              C &amp; It's <span className="gold-text italic">Magic</span>
            </span>

          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            A cloud kitchen crafting cakes, desserts and gourmet food with obsessive care —
            delivered within 20 km of Lakkur, Malur.
          </p>
          <p className="eyebrow mt-8">Crafted with Passion. Delivered with Magic.</p>
        </div>
        <div>
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-2.5 text-sm text-cream/80">
            <li><Link to="/menu" className="hover:text-primary">Menu</Link></li>
            <li><Link to="/no-maida-no-sugar" className="hover:text-primary">No Maida No Sugar</Link></li>
            <li><Link to="/cake-studio" className="hover:text-primary">Cake Studio</Link></li>

            <li><Link to="/our-kitchen" className="hover:text-primary">Our Kitchen</Link></li>
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/serviceability" className="hover:text-primary">Delivery Areas</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Reach us</p>
          <ul className="space-y-2.5 text-sm text-cream/80">
            <li>Lakkur, Malur</li>
            <li>Karnataka, India</li>
            <li><a href="tel:+919110283949" className="hover:text-primary">+91 91102 83949</a></li>
            <li><a href="mailto:canditsmagic@gmail.com" className="hover:text-primary">canditsmagic@gmail.com</a></li>
            <li className="flex gap-3 pt-2">
              <a href="https://www.instagram.com/canditsmagic" target="_blank" rel="noreferrer" className="hover:text-primary">Instagram</a>
              <a href="https://www.youtube.com/@cookwithcharan" target="_blank" rel="noreferrer" className="hover:text-primary">YouTube</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="gold-hairline" />
      <div className="container-luxe flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted-foreground md:flex-row">
        <p>© {new Date().getFullYear()} C &amp; It's Magic. All rights reserved.</p>
        <div className="flex gap-5">
          <Link to="/privacy" className="hover:text-primary">Privacy</Link>
          <Link to="/terms" className="hover:text-primary">Terms</Link>
          <Link to="/refund" className="hover:text-primary">Refund</Link>
          <Link to="/faq" className="hover:text-primary">FAQ</Link>
        </div>
      </div>
    </footer>
  );
}

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove } = useCart();
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            onClick={close}
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col glass-heavy"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-5">
              <div>
                <p className="eyebrow">Your selection</p>
                <h3 className="mt-1 font-display text-2xl text-cream">The Cart</h3>
              </div>
              <button onClick={close} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full border border-border">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-primary/40 text-primary">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <p className="mt-5 font-display text-2xl text-cream">Nothing here yet</p>
                    <p className="mt-2 text-sm text-muted-foreground">Discover something magical.</p>
                    <Link
                      to="/menu"
                      onClick={close}
                      className="btn-gold btn-gold-hover mt-6 inline-flex items-center rounded-full px-6 py-2.5 text-sm font-medium"
                    >
                      Browse Menu
                    </Link>
                  </div>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((i) => (
                    <li key={i.slug} className="flex gap-4 rounded-xl border border-border/60 bg-card/60 p-3">
                      <img src={i.image} alt={i.name} className="h-20 w-20 rounded-lg object-cover" />
                      <div className="flex flex-1 flex-col">
                        <p className="text-sm font-medium text-cream">{i.name}</p>
                        {i.variant && (
                          <p className="mt-0.5 inline-flex w-fit items-center rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                            {i.variant}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          ₹{i.price.toLocaleString("en-IN")} × {i.qty} = <span className="text-cream">₹{(i.price * i.qty).toLocaleString("en-IN")}</span>
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-border">
                            <button onClick={() => setQty(i.slug, i.qty - 1)} className="px-2.5 py-1 text-cream">−</button>
                            <span className="min-w-6 text-center text-sm">{i.qty}</span>
                            <button onClick={() => setQty(i.slug, i.qty + 1)} className="px-2.5 py-1 text-cream">+</button>
                          </div>
                          <button onClick={() => remove(i.slug)} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {items.length > 0 && (
              <div className="border-t border-border/60 px-6 py-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Total</span>
                  <span className="font-display text-2xl text-cream">₹{total.toLocaleString("en-IN")}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={close}
                  className="btn-gold btn-gold-hover mt-4 flex w-full items-center justify-center rounded-full py-3 text-sm font-medium"
                >
                  Proceed to Checkout
                </Link>
                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Cakes need 24 hrs · Food delivered within 3 hours
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/** Session listener + hydration */
export function AuthListener() {
  const setUser = useAuth((s) => s.setUser);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setUser(data.session?.user ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [setUser]);
  return null;
}

export function SmoothScroll() {
  useEffect(() => {
    let raf = 0;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    import("lenis").then((mod) => {
      const Lenis = mod.default;
      lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }) as unknown as typeof lenis;
      const loop = (t: number) => { lenis?.raf(t); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    });
    return () => { cancelAnimationFrame(raf); lenis?.destroy(); };
  }, []);
  return null;
}
