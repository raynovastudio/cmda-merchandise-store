# CMDA Nigeria Merchandise Store — Build Plan

This is a large build (storefront + cart + checkout + user dashboard + admin dashboard + auth + file uploads + email). I'll ship it in phases so you can see progress and course-correct. Lovable Cloud will power the backend (database, auth, file storage, email).

## Brand & Design System
- Colors from your logo: CMDA Purple (`#8B2C6B`), CMDA Green (`#0F8A3F`), warm off-white background, deep charcoal text.
- Typography: **Fraunces** (display, headings) + **Inter** (body) — premium, mission-focused, modern.
- Rounded cards (2xl), soft shadows, generous spacing, subtle hover/tap motion.
- Logo variations uploaded will be used: full lockup in header, icon-only for favicon/mobile.
- Mobile-first, fully responsive.

## Phase 1 — Foundations & Storefront (this turn)
1. Design system in `src/styles.css` (purple/green tokens, fonts, shadows, radii).
2. Import logo assets via Lovable Assets.
3. Public routes:
   - `/` — Hero, featured products, categories, trust strip, footer.
   - `/shop` — All merchandise with search + category filter + availability filter.
   - `/product/$id` — Product detail with size selector, quantity, availability badge, add to cart.
   - `/cart` — Line items, edit qty, remove, subtotal.
4. Cart state via Zustand + localStorage (persistent across sessions).
5. Seed the 5 products (Cargo Shirt, Face Cap, Wholeness Polo, Wholeness Magazine, Logo Exploration Handbook) with placeholder generated images.
6. SEO: per-route head(), sitemap.xml, robots.txt.

## Phase 2 — Backend, Auth & Checkout
1. Enable Lovable Cloud.
2. Schema: `products`, `product_variants` (sizes), `conferences`, `orders`, `order_items`, `payment_proofs`, `order_status_events`, `profiles`, `user_roles` (admin/customer).
3. Storage buckets: `product-images` (public), `payment-proofs` (private).
4. Email/password + Google auth; profile auto-created on signup.
5. Checkout flow (`/checkout`):
   - Customer details
   - Fulfillment: Conference pickup / Someone else picks up / Waybill delivery
   - OPay payment info card with Copy button
   - Payment proof upload (JPG/PNG/PDF) + amount + date + reference
   - Submit → generates order number `CMDA-YYYY-NNNNNN`
6. Order confirmation page with order number + timeline.

## Phase 3 — User Dashboard
- `/account/orders` list + `/account/orders/$orderNumber` detail
- Status timeline, download receipt (PDF), update delivery address / pickup person before lock
- Pickup QR code for conference orders

## Phase 4 — Admin Dashboard (`/admin`)
- Role-gated (admin role in `user_roles`).
- Product management (CRUD, images, stock, pre-order toggle, deadline, categories)
- Conference management (CRUD, dates, locations, enable/disable)
- Orders table with search + filters, drill-down, approve/reject payment, status transitions
- Print invoice / pickup slip, export CSV
- QR scanner page for pickup verification

## Phase 5 — Notifications
- Transactional emails (order received, payment verified, ready for pickup, shipped, completed) via Cloud email.
- WhatsApp/SMS: noted as optional; requires paid provider — will flag when we get there.

## Technical Notes
- Stack: TanStack Start, React, TypeScript, Tailwind v4, shadcn/ui, Lovable Cloud (Supabase under the hood).
- Payment: **no gateway integration** — manual OPay + proof upload as you specified.
- RLS on all tables; payment proofs private with signed URLs; admin checks via `has_role()` security-definer.
- Order numbers via Postgres sequence + trigger.

## What I need from you before Phase 2
- Confirm auth: email/password + Google sign-in OK as defaults?
- OPay placeholder values fine for now (you'll replace later) — confirmed?
- Any product categories to pre-create beyond "Apparel" and "Publications"?

## What I'll build right now (Phase 1)
Storefront + cart with the 5 seeded products, brand system, logo integration, and responsive layout — all frontend, no backend yet. You'll be able to browse, add to cart, and see the full look & feel before we wire the backend.

Approve to proceed with Phase 1, or tell me what to adjust.