# Purefolk website integration and link preservation register

Status: Recovered from the current `main` branch and the prior website code audit. This is a preservation register, not approval to keep every old flow live.

**Rule:** Do not delete, rotate, replace, or silently redirect any listed integration during the rebuild. First preserve the identifier, confirm account ownership/access, export submissions where possible, then deliberately migrate and test. Never put private API tokens or service-role keys in this document.

## Verified external integrations

| Integration | Exact identifier / URL | Where found | Current purpose | Rebuild treatment |
|---|---|---|---|---|
| Google Analytics 4 | Measurement ID `G-9W45BZ0BB5` | `index.html`, `menu.html`, `delivery.html`, `subscription.html`, `review.html`, `nutrition.html`, `high-protein.html`, `jain-food.html`, `satvik-food.html`, `drink.html` | Existing page-level analytics | Preserve property/measurement ID. Verify GA4 account access, data stream, domain settings and historical data before switching the new site. Add event tracking only after baseline preservation. |
| Tally — general/order form | [https://tally.so/r/obbJBN](https://tally.so/r/obbJBN) | Homepage, menu, delivery, nutrition, high-protein; Admin setting `tally_order_url` | Main order/pre-order form | Preserve form and submissions. Confirm form owner, notification destinations, hidden fields and current status. Keep ordering closed until business approval. |
| Tally — subscription form | [https://tally.so/r/jae5WQ](https://tally.so/r/jae5WQ) | `subscription.html`; Admin setting `tally_subscription_url` | Subscription enquiry/order form; current code appends `plan` and `uid` query parameters | Preserve form and response history. Verify the plan/UID prefill still works before migration. Subscription itself remains a launch-scope decision. |
| Formspree — reviews | [https://formspree.io/f/mvgjdwzv](https://formspree.io/f/mvgjdwzv) | `review.html`, form id `pf-review-form` | Review/feedback submission | Preserve endpoint and export submissions. New feedback should eventually be stored centrally, but do not disable Formspree until data export and replacement are verified. |
| WhatsApp Business/contact number | Display: `8010342375`; international: `918010342375`; URL pattern: `https://wa.me/918010342375` | Homepage, menu, delivery, subscription, nutrition; Admin setting `whatsapp_number` | Order enquiries and manual confirmation | Preserve number and chat history/account. Make number configurable in Nucleus; don't hard-code it across pages. Verify account is still the intended business destination. |

## Verified platform / technical dependencies

| Service | Identifier / URL | Existing use | Rebuild treatment |
|---|---|---|---|
| Supabase project | Project ref `sckfdujwszairutiwmwu`; URL `https://sckfdujwszairutiwmwu.supabase.co` | Products, settings, delivery/subscription records and order-gate read | Preserve project and all legacy data. No destructive migration. Use one reviewed source of truth after schema/RLS review. |
| Supabase JS client | `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2` | Loaded by menu/high-protein legacy pages | New Next.js apps use installed packages; do not copy the old CDN script blindly. |
| Google Fonts | Playfair Display + Inter via `https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Inter:wght@300;400;500;600&display=swap` | Legacy pages | Preserve as a visual reference; confirm final typography/licensing/performance approach with brand design. |
| Sitemap | `https://purefolkin.github.io/sitemap.xml` | Legacy `robots.txt` points here | Preserve current URL list as migration input; replace with a verified sitemap for the chosen canonical domain after URL mapping. |
| Legacy canonical domain | `https://purefolkin.github.io/` | Legacy homepage canonical and sitemap | This differs from the `purefolk.in` URL used in earlier project discussions. Confirm the authoritative production domain and redirects before launch. |

## Legacy ordering behaviour to preserve until explicitly replaced

- Main order Tally form: `obbJBN`.
- Subscription Tally form: `jae5WQ`, with `plan` and `uid` query parameters.
- WhatsApp UID pattern on homepage: `PF-YYMMDD-HHMMSS`.
- Subscription UID pattern: `PF-SUB-YYMMDD-XXXX`.
- Delivery form DOM id: `pf-delivery-form`; it calculates a summary and opens WhatsApp.
- Review form DOM id: `pf-review-form`.
- Global ordering gate: `order-gate.js`; reads `pf_settings.is_accepting_orders` and blocks known Tally/WhatsApp order actions when ordering is closed.
- The legacy website had a fail-closed order-gate implementation. Keep the business requirement (closed means no order pathway) but reimplement server-side; client-side click blocking alone is not security.

## Items not yet verified — do not invent

| Item | Status / next verification |
|---|---|
| Google Tag Manager container ID | Not found in inspected legacy pages; GA4 gtag.js is directly installed. |
| Meta Pixel / Meta Dataset ID | Not verified in inspected code. |
| Google Search Console property | SEO work and sitemap exist, but property ownership/access is not verified from code. |
| Google Business Profile | Not verified. |
| Instagram / Facebook / YouTube profile URLs | No exact official profile URL verified in the inspected pages. |
| Tally owner account, form notifications, exports and hidden-field configuration | Requires access to the Tally account. |
| Formspree owner account, notification recipients and export | Requires access to the Formspree account. |
| GA4 account owner, property permissions, conversion definitions and historical retention | Requires GA4 access. |
| WhatsApp Business account owner, linked devices, catalogue and message history | Requires account access. |
| Exact current Supabase values for WhatsApp/Tally settings | Legacy Admin reads/writes `pf_settings`; confirm live values in the database before treating them as authoritative. |

## Migration checklist

- [ ] Confirm the production domain (purefolk.in vs purefolkin.github.io).
- [ ] Confirm GA4 access and preserve Measurement ID `G-9W45BZ0BB5`.
- [ ] Export and archive Tally responses for `obbJBN` and `jae5WQ`.
- [ ] Export and archive Formspree submissions for `mvgjdwzv`.
- [ ] Confirm the WhatsApp number/account and preserve business chat history.
- [ ] Confirm Supabase project access and backup legacy records.
- [ ] Map old URLs to new routes and prepare 301 redirects where routes change.
- [ ] Recreate consent/privacy disclosures and analytics settings appropriate to the new site.
- [ ] Test every migrated form, notification, prefill parameter and WhatsApp message.
- [ ] Keep old integrations active until replacement is verified; then retire only with explicit approval.

## Source notes

Exact identifiers above were extracted from the repository's `main` branch files, including `index.html`, `menu.html`, `delivery.html`, `subscription.html`, `review.html`, `nutrition.html`, `high-protein.html`, `admin.html`, `robots.txt` and `sitemap.xml`. Historical page audit also confirms the same integrations and their roles.
