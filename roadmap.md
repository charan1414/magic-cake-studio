# Roadmap

## Current task: Milkshakes section (uploaded brief, Oct 22)
- [x] Images for 15 milkshakes + hero
- [x] DB: `milkshakes` table + validation trigger + RLS; `site_sections` CMS table; storage policies
- [x] Seed 15 milkshakes + milkshakes section row
- [ ] Storage bucket "product-images" (created private — public blocked by workspace policy)
- [x] `src/lib/milkshakes.ts`, `src/components/milkshakes.tsx`, `/milkshakes` page
- [x] Admin: `/admin/milkshakes` (CRUD, image upload/replace, sizes, customisations, badges, status, featured, order, duplicate) + section settings editor
- [x] Wire nav + footer + homepage + menu page links; homepage featured section
- [ ] Verify in preview (storefront + admin), typecheck

## Priority task: Website improvement doc (uploaded brief, Oct 22)
1. [ ] Mobile-first layout pass — navigation, spacing, oversized sections, touch targets
2. [ ] Compact homepage redesign (no new dishes): category tiles grid, offer banner, search, membership, nav
3. [ ] Two-column product grid on mobile; compact cards; sorting
   - Compact side-by-side grid brief (Oct 23): 3x2 mobile grid target, ~90-110px square images, compact add buttons; 320/375/390/430px QA. NOTE: referenced "AMINTIRI screenshot" was NOT uploaded — following text spec.
4. [ ] Compact sticky search on /menu, placeholder "Search cakes, desserts, snacks…", no-results state, clear button
5. [ ] Offers: homepage premium offer banner + admin offer management (reuse vouchers system)
6. [ ] "C & It's Magic Rewards" membership presentation on account page (rewards exist; add birthday field config + terms)
7. [ ] Marketing opt-in notifications + unsubscribe
8. [ ] Ordering journey polish: cart feedback, checkout clarity
9. [ ] Mobile performance + final QA
