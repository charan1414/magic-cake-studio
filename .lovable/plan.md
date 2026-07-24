# Phase 3 — Staged Rollout

Pricing changes from this turn are already shipped. Phase 3 will land in **4 stages**, each with its own migration + UI + verification so you can review before the next.

## Stage 1 — Admin Orders + Status History + Notification Log
- **Schema**: `admin` role in `app_role`; `order_status_history(order_id, status, note, changed_by, created_at)`; `notification_logs(order_id, channel, event, recipient, status, error, created_at)`; extend `orders` with `status` enum expanded to 10 stages (received/confirmed/preparing/baking/decoration/quality_check/packed/out_for_delivery/delivered/cancelled) and `payment_status`, `delivery_type`.
- **Routes**: `/_authenticated/admin/orders` (list + search + filters + drawer with 10-stage status stepper). Status changes write to `order_status_history` and enqueue `notification_logs` rows.
- **RLS**: admin-only via `has_role(auth.uid(),'admin')`; customer read-own preserved.

## Stage 2 — Distance-based Serviceability (Lakkur 563160, 20 km)
- Server fn `checkServiceability({ pincode, address })` calling **Google Maps Distance Matrix** through the Lovable connector (I'll prompt you to connect Google Maps Platform if not already).
- Checkout: pincode field required before payment, road-distance ≤ 20 km enforced server-side, Place Order button disabled with the exact message you specified when out of range.
- Fallback: haversine if Google Maps not connected (already in `data.ts`).

## Stage 3 — Notifications (WhatsApp + Email)
- Email: use Lovable email domain (`email_domain` tools) with templated status emails.
- WhatsApp: **needs credentials from you** — either Twilio (recommended, has connector) or Meta WhatsApp Business Cloud API token. Server fn triggered by admin status update reads pending `notification_logs`, sends, records result.
- Templates: name, order code, current stage, ETA, support contact.

## Stage 4 — CRM + Inventory + Dynamic Pricing + Offers + Homepage CMS
- **Schema**: `products` table (migrate from static `data.ts` to DB — price, discounted_price, promo_start/end, stock_status, hidden), `customers` view over `profiles + orders` aggregates, `festival_offers(title, banner_url, starts_at, ends_at, active)`, `homepage_sections(kind, payload jsonb, sort_order)`, `marketing_subscribers`.
- **Admin routes**: `/admin/products`, `/admin/customers` (CSV export), `/admin/offers`, `/admin/homepage` (drag-reorder sections).
- **Site**: home reads sections/offers live; product cards show "Out of Stock" badge; ordering blocked for unavailable items.
- Note: Stage 4 is a **big** stage on its own — after Stage 3 I may ask to split it further.

## Order of execution
I'll ship them 1 → 4 in that order, one stage per turn. After each stage: migration approval, then code, then a short verification note.

## Confirmations I need before Stage 1
1. **Who is admin?** I'll grant the `admin` role to your account — reply with the email you signed up with, or say "make me admin" and I'll grant it to the currently signed-in user via a one-off `insert`.
2. **Existing 5-stage orders**: the current `orders.status` values (`placed`, `confirmed`, `preparing`, `out_for_delivery`, `delivered`) map to the new 10-stage set as `received`, `confirmed`, `preparing`, `out_for_delivery`, `delivered`. OK to migrate existing rows this way?

Reply with the admin email + a yes on the status mapping and I'll start Stage 1.
