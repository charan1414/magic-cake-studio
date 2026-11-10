# Roadmap

## Milkshakes section (uploaded brief, Oct 22) — DONE
- [x] Images for 15 milkshakes + hero
- [x] DB: `milkshakes` table + validation trigger + RLS; `site_sections` CMS table; storage policies
- [x] Seed 15 milkshakes + milkshakes section row; private `product-images` bucket
- [x] `src/lib/milkshakes.ts`, `src/components/milkshakes.tsx`, `/milkshakes` page
- [x] Admin `/admin/milkshakes` (CRUD, image upload, sizes, customisations, badges, status, featured, order, duplicate, section settings)
- [x] Wired nav + footer + homepage section + menu-page chip + account admin button
- [x] Verified in preview (15 cards, admin rows, no console errors)

## Website improvement doc (Oct 22/23 briefs) — DONE
1. [x] Mobile-first pass: headings/space reduced, overflow fixed (0px at 320–430), category tiles
2. [x] Homepage compacted: slim first-order offer strip, category tile grid, no new dishes
3. [x] 3-column compact grid on /menu + category pages (6+ dishes per screen), sorting (Popular/Price/A–Z)
4. [x] Compact sticky search: "Search cakes, desserts, snacks…", clear button, no-results state
5. [x] Offers: gold offer strip + existing voucher admin + signup 10% first-order flow
6. [x] "C & It's Magic Rewards" membership card: benefits, optional birthday (profiles.birthday), terms
7. [x] Marketing opt-in toggle (profiles.marketing_opt_in) on account page
8. [x] Add-to-cart toast feedback; cart shows weight/qty; checkout unchanged
9. [x] QA at 320/375/390/430 — no horizontal overflow, no console errors

## Backlog / open
- [x] Compact homepage dish sections into three-column mobile grids that fit screen widths
- [x] Finish and verify compact checkout layout: add-ons row, upsells, delivery/payment, summary
- [ ] Two older security-scan warnings (pre-existing; awaiting user go-ahead)
- [ ] Phone OTP needs SMS provider enabled by the owner (Cloud → Auth Settings)
- [ ] WELCOME100 sample voucher details may be edited by the owner
