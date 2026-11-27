# Purefolk Website + Nucleus — Page Inventory v1

Status: Working implementation baseline
Branch: rebuild/purefolk-website-nucleus-v1
Scope: Customer Website + Nucleus only. SPIRIT, EATFOLK and BUSYFOLK remain future separate systems.

## 1. Platform boundaries

Purefolk has two distinct applications backed by a shared, governed data layer:

- Website: customer discovery, trust, product selection, ordering, service information and feedback.
- Nucleus: internal business control, product and recipe management, commercial controls, publication, orders, customers and service configuration.
- Shared data layer: stable records and business rules. Nucleus is the operational source of truth for approved catalogue and service data. The Website reads only customer-publishable information. Customer transactions must be validated server-side.

The applications must have separate navigation, layouts, access controls and deployment/security boundaries. They must not maintain separate copies of product facts, prices, availability or order state.

## 2. Customer Website — page inventory

| Route / destination | Decision | Scope |
|---|---|---|
| / Home | Keep | Explain what Purefolk offers, who it serves and where; route visitors to menu, trust information and service details. |
| /menu Menu | Keep | Unified product discovery with categories, filters and collections. |
| /menu/[slug] Product detail | Keep | Product description, sellable options, ingredients, allergens, verified nutrition, dietary attributes, price and availability. |
| /food-standards Food philosophy & standards | Merge | Combine useful material from Nutrition and food-philosophy content. Publish only substantiated ingredient, preparation and nutrition statements. |
| /delivery Delivery | Keep | Verified service areas, delivery charges, minimums, service windows and practical instructions. |
| /about About | Keep | Brand purpose, story and operating principles. |
| /faq FAQ | Keep | Customer questions about products, ingredients, ordering, delivery and policies. |
| /contact Contact | Keep | Customer support and contact routes. |
| /cart Cart | Conditional | Build when checkout is ready; never trust browser totals or availability. |
| /checkout Checkout | Conditional | Server-side validation of product, option, price, serviceability, cut-off, capacity, tax and totals. |
| /order/[reference] Order status | Conditional | Customer-safe order confirmation/status; expose no private operational data. |
| Feedback flow | Keep function | Capture feedback linked to an order/product where possible. May be a contextual flow rather than a top-level navigation page. |

### Consolidation rules

- Jain, Satvik and High Protein are attributes or customer-intent collections, not automatically separate product pages. Use filters/collections in Menu. Create an indexable landing page only when it has distinct useful content and a distinct search intent.
- Drinks is a Menu category, not a separate application page.
- Nutrition content is consolidated into Food Philosophy & Standards. Product-specific verified nutrition remains on product detail pages.
- Subscription is deferred until a real, validated subscription offer exists.
- Review remains a feedback capability; it does not need a permanent top-level navigation item.
- Order is a transaction flow, not a marketing/content page.
- Do not publish products, prices, dietary suitability, nutrition, delivery coverage or claims from hard-coded duplicate page content.

## 3. Nucleus — navigation inventory

| Destination | Decision | Scope |
|---|---|---|
| Overview | Keep | Today's work, order summary, operational alerts and a small set of useful business indicators. |
| Orders | Keep | Order list, detail, lifecycle, payment state, exceptions, cancellations and refund workflow. |
| Catalogue | Keep | Categories, subcategories, products, variants, add-on groups, add-ons, publication and availability controls. |
| Product development | Keep | Recipes, recipe versions, ingredients, supplier references and product-linked preparation information. |
| Delivery & service | Keep | Service areas, PIN/locality coverage, fees, minimum order values, windows, cut-offs and capacity rules. |
| Customers & feedback | Keep | Customer profiles, order history, feedback, complaints and resolution history with appropriate privacy controls. |
| Website & content | Keep | Homepage/content blocks, customer-facing pages, SEO metadata, structured content and publishing review. |
| Settings | Keep | User access, roles, business rules, ordering switch, audit and system configuration. |

### Nucleus consolidation rules

- Pricing and costing are product/commercial details within Catalogue and Product development; do not create a separate Pricing destination in v1.
- Analytics starts with actionable summaries in Overview. A dedicated analytics destination is deferred until reliable event and transaction data exists.
- Subscription management is deferred until subscriptions are validated as an actual offer.
- Operations exceptions live in the relevant workflow (especially Orders and Delivery) rather than creating an empty generic Operations page.
- Supplier management starts within Product development. Expand only when procurement complexity requires it.
- Avoid duplicate Order records across systems. The same order identity and lifecycle must be used by all future operational interfaces.

## 4. Product and publication rules

Keep these as independent dimensions:

- Product lifecycle status
- Website visibility / publication status
- Operational availability
- Ordering permission (global and, where needed, product-specific)

A product may be active internally but unpublished; published but temporarily unavailable; or visible while ordering is globally closed. These states must not be collapsed into one boolean.

Working product relationship:

Category → Subcategory → Product → Variant

Add-on groups and add-ons are attachable selections. Product identity is distinct from a purchasable variant and SKU. Do not lock variant/SKU semantics until the customer selection → cart → order → kitchen → costing/inventory flow has been fully mapped.

Product data should connect to recipes, ingredients, supplier references, costs, pricing, preparation/QC, packaging, website presentation, orders and feedback.

## 5. Explicitly out of scope for this phase

- SPIRIT kitchen dashboard
- EATFOLK delivery application
- BUSYFOLK business intelligence application
- Multi-location operations, staff scheduling and advanced automation
- Subscription commerce before offer validation
- Advanced analytics before trustworthy event/transaction data exists
- AI features without a concrete validated workflow

Design the data model so these systems can be added later without building their interfaces now.

## 6. Technical and safety constraints

- Keep the existing production website and main branch unchanged until the replacement is tested and approved.
- Preserve all legacy database tables and records. Do not apply the existing draft SQL proposal without a reviewed development migration and RLS tests.
- Do not seed old sample products/prices as current live offers.
- RLS is required for exposed tables. Public access is read-only and limited to published catalogue and active service information.
- Nucleus access must be verified server-side. Never authorize using user-editable metadata or expose service-role/secret keys in browser code.
- Validate cart and checkout inputs, prices, stock/availability, serviceability, time windows, capacity, tax and totals on the server.
- Preview deployments must be noindex.
- Keep URLs, metadata, canonical tags, sitemap, robots, structured data and mobile performance part of the Website build.
- Use configurable operating hours, delivery fees, cut-offs, service areas and ordering controls; do not invent launch values.

## 7. Delivery sequence

1. Review this inventory and confirm any page-level corrections.
2. Map the customer journey and operational order lifecycle, including failure/exception paths.
3. Define the shared data model and access boundaries.
4. Build Website and Nucleus as separate applications in the same repository, sharing typed contracts and business rules where safe.
5. Implement catalogue and publishing before live checkout.
6. Implement order lifecycle and service configuration before enabling ordering.
7. Test on a development environment, review security/RLS and only then plan production cutover.

## 8. Decision status

This file is a working v1 implementation baseline. It records the current consolidation decisions and deferred scope; it does not authorize production database migrations, deletion of legacy data, live ordering, or replacement of the production website.


---

## 9. Kitchen workspace clarification — 27 November 2026

The earlier “SPIRIT kitchen dashboard” out-of-scope item means a separate SPIRIT application is deferred; it does **not** mean kitchen operations are excluded from Nucleus.

For the current phase:
- Add a **Kitchen** workspace/module within Nucleus.
- Kitchen staff access it using individual authenticated staff accounts and role-based permissions.
- Admin monitors kitchen work from Nucleus.
- Kitchen uses the same authoritative order record as Orders; it must not create a second order database or duplicate order identity.
- A future standalone SPIRIT application remains deferred until operational scale justifies it.
- Staff assignment/self-claim behaviour, station-based routing and detailed screen permissions remain pending decisions.

See `docs/nucleus/kitchen-module-working-spec-v1.md` for the separate working specification.
