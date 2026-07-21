
# C & It's Magic — Build Plan

Your login requirement needs a database, so I'll enable Lovable Cloud for auth + customer data + orders. The rest of the backend (kitchen/delivery/inventory/analytics) stays as UI shells wired to Cloud in later phases. 3D is deferred — cinematic video + Framer Motion + Lenis smooth scroll first.

Given the spec's size (30+ pages, full admin, kitchen, delivery, AI, 3D cake studio), one turn can't ship all of it at production quality. I'll build in phases, starting with the highest-impact luxury surface + your explicit login requirement.

---

## Phase 1 (this build)

### Design foundation
- Luxury Black / Metallic Gold / Dark Chocolate / Cream White tokens in `src/styles.css` (oklch).
- Typography: serif display (Cormorant / Instrument Serif) + refined sans (Inter/Jakarta) — loaded via `<link>` in `__root.tsx`.
- Global chrome: glassmorphic sticky nav with brand mark, animated gold underlines, footer with contact + socials.
- Lenis smooth scroll, Framer Motion page transitions, cursor glow, animated text reveal utility.

### Pages (routes)
- `/` Home — cinematic video hero (looping bakery/cooking B-roll via a curated video URL), tagline, 3 CTAs, scroll-reveal signature dishes strip, "Our Craft" storytelling, testimonial marquee, featured categories, CTA to Cake Studio.
- `/menu` — full menu with category filter chips, search, sort. Curated seed subset (~5 per category) across Cakes, Cupcakes, Desserts, Fried Chicken, Burgers, Snacks, Main Course, Rolls, Street Food.
- `/menu/$category` — category grid.
- `/product/$slug` — luxury product page: gallery, ingredients, prep time, calories, veg/non-veg badge, quantity, add-to-cart, related.
- `/cake-studio` — configurator UI shell: shape / size / flavor / sponge / filling / frosting / color theme / decorations / message / reference image upload / live price estimation / save design. 2D cinematic preview now (SVG + Framer layers); real 3D in Phase 2.
- `/about`, `/our-kitchen`, `/gallery`, `/contact` — brand storytelling pages.
- `/serviceability` — pincode + "Use my location" GPS check against 20km radius from Lakkur (12.9536°N, 77.9455°E, haversine). Shows premium "Currently Not Serviceable" state when outside.
- `/auth` — luxury login/signup (email + password; Google sign-in via Cloud).
- `/_authenticated/account` — profile, addresses, order history (shell), wishlist (shell).
- `/checkout` — address + order summary + Razorpay placeholder button (keys later).
- `/track/$orderId`, `/wishlist`, `/cart` (slide-over cart globally).
- Legal shells: `/privacy`, `/terms`, `/refund`, `/faq`.
- `/_authenticated/_admin/*` — admin shell: dashboard, orders, products, categories, coupons, customers, blog, media, SEO (UI scaffolding, data wired in later phase).

### Data (Lovable Cloud)
Tables + RLS:
- `profiles` (id → auth.users, full_name, phone, birthday, created_at)
- `addresses` (user_id, label, line1, line2, city, pincode, lat, lng, is_default)
- `categories`, `products` (slug, name, description, price, category, veg, badges, image_url, is_active)
- `orders`, `order_items`
- `cake_designs` (user_id, config jsonb, reference_image_url, estimated_price, status)
- `user_roles` + `has_role()` security-definer function for admin gating
- Storage bucket `cake-references` (private, per-user RLS)

Auth: email/password + Google. Auto-create `profiles` row via trigger. Sign-in aware header (avatar menu / Sign out).

### Animations
Framer Motion transitions, scroll-reveals, gold shimmer borders, hover-lift cards, glass reflection, floating ingredient decorations (CSS/Framer), luxury loading screen.

---

## Phase 2 (next approval)
- Real R3F 3D cake studio (live shape/tier/color/decor).
- R3F floating ingredients + rotating cake on home.
- Cart + Razorpay checkout end-to-end, invoice generation, order lifecycle, live tracking map.
- Real order pipeline hooked to admin.

## Phase 3
- Kitchen dashboard (KOT, timers, statuses), delivery dashboard (assign, GPS, OTP).
- Inventory + raw materials + vendors + expiry + purchase orders.
- Marketing (email/WhatsApp), coupons/offers engine, loyalty + referrals.
- AI chatbot, AI recommendations, voice search, blog CMS, SEO manager, analytics dashboards.

---

## Technical notes
- Stack: TanStack Start (existing), Tailwind v4, shadcn, Framer Motion, Lenis, Zustand for cart, Zod for forms, Lovable Cloud (Supabase) for auth/data/storage.
- Serviceability: haversine vs Lakkur origin; pincode lookup via a small local mapping for Malur-area pins + browser geolocation.
- Images: AI-generated hero/food placeholders via imagegen (premium video not generated — use a curated free cinematic looping poster + subtle Ken Burns; real video assets can be swapped in later).
- Razorpay: button + order intent stubbed; secret added when you're ready.
- SEO: per-route `head()` with unique title/description/og for every content route; JSON-LD Restaurant schema on home.

Approve to start Phase 1.
