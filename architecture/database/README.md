# Purefolk V1 — Database Architecture & Data Ownership
Status: PROPOSED BASELINE (not a production migration)
Date: 2026-11-01
Branch: build/purefolk-v1-parallel

## 1. Architecture decision

Use one PostgreSQL database initially, organised into bounded domain schemas with explicit write ownership. This is a modular-monolith data architecture, not five independent databases and not unrestricted shared-table access.

Why:
- One small team and a constrained budget do not justify distributed databases or microservices yet.
- Referential integrity and transactional order workflows matter.
- Domain schemas and ownership boundaries preserve the option to split services/databases later if scale or team structure proves the need.
- Reuse the existing Supabase/PostgreSQL direction as a candidate because the legacy site already used Supabase Auth and tables. The exact Supabase project, plan, migration strategy and connection are NOT selected or changed by this document.

Production, integration/UAT and development databases must be separate. Development/UAT use synthetic data only. No credentials or real customer/payment/employee data in Git.

## 2. Ownership rules

1. Every business entity has one authoritative owning domain.
2. Other systems read through approved views/APIs or receive events; they do not directly update another domain's records.
3. NUCLEUS governs global identity, access, IDs, master references, shared rules, audit envelope, integration contracts and cross-domain validation.
4. NUCLEUS does not take over kitchen or delivery execution records.
5. WEBSITE is an interface, not the system of record for catalogue, prices, orders or delivery state.
6. BUSYFOLK is a restricted management/read and reporting interface; it does not rewrite operational source records.
7. Important records are archived/soft-deleted or superseded; do not hard-delete business history.
8. Order lines preserve purchase-time snapshots even if products, recipes, prices, addresses or names later change.
9. All material state changes carry actor, timestamp, source, reason where applicable, correlation ID and audit reference.
10. Payment card/bank credentials are never stored. Store provider references and verified payment state only.

## 3. Domain ownership matrix

| Domain | Owner | Authoritative records | Other systems may |
|---|---|---|---|
| Identity & access | NUCLEUS | accounts, role grants, permissions, sessions/revocation references, service identities | request authentication/authorisation |
| Business master | NUCLEUS | legal/business units, locations, operating configuration, global ID registry, reference lists | read approved values |
| Product catalogue | NUCLEUS (catalogue domain) | products, classification, attributes, collections, sellable configurations when approved, media metadata, lifecycle/visibility | Website reads published projection; SPIRIT reads production-relevant spec |
| Ingredients & suppliers | NUCLEUS (supply domain) | ingredient master, supplier master, supplier-item mapping, approved specs, lot/expiry reference master | SPIRIT records receiving/use/consumption evidence |
| Recipe & kitchen execution | SPIRIT | recipe versions, ingredient quantities/yields, kitchen SOP execution, prep tasks, production batches, QC, packaging, kitchen handover | NUCLEUS reads status/summary; EATFOLK receives release manifest |
| Pricing & cost | NUCLEUS | cost snapshots, price books, price rules, taxes/charge configuration, discount rules | Website requests quotes; SPIRIT sees only operationally necessary data |
| Cart & order | NUCLEUS (commerce domain) | cart quote, canonical order, order lines/snapshots, payment attempts/references, refunds, order state | Website initiates commands and displays state; SPIRIT/EATFOLK execute assigned work |
| Customer & consent | NUCLEUS | customer identity/contact, addresses, consent/preferences, privacy requests | Website collects/updates through authorised commands; delivery sees minimum necessary |
| Delivery execution | EATFOLK | delivery task, rider assignment, package custody, journey, incident, POD, delivery communications | NUCLEUS validates canonical order transitions and consumes delivery events |
| Workforce global identity | NUCLEUS | employee identity, employment status and global access identity (minimum necessary) | SPIRIT/EATFOLK manage domain-specific operational qualifications and assignments |
| Kitchen workforce ops | SPIRIT | kitchen role/station eligibility, training evidence, shifts/tasks, hygiene and safety checks | BUSYFOLK reads authorised summaries |
| Rider operations | EATFOLK | rider operational eligibility, shift, vehicle assignment, readiness, safety and delivery performance evidence | BUSYFOLK reads authorised summaries |
| Management analytics | BUSYFOLK (read model) | metric definitions, report snapshots, management annotations/decisions | reads authorised source views/events; no operational source mutation |
| Customer feedback | NUCLEUS (feedback domain) | feedback record, order/item references, moderation/investigation state | operational systems submit evidence/response; attribution is evidence-based |
| Website presentation | WEBSITE | page/content presentation configuration only where not canonical business data | reads published catalogue, price and availability APIs |

## 4. PostgreSQL schema map (proposed)

- nucleus: global IDs, business units/locations, identity/access references, permissions, audit events, integration inbox/outbox, reference data.
- catalog: products, category taxonomy, attributes, collections, product-media metadata, lifecycle and publication projection.
- supply: ingredients, suppliers, supplier-item links, receiving/lot master references and approved specifications.
- recipes: recipe definitions and immutable recipe versions; owned by SPIRIT domain even if physically stored in same Postgres instance.
- kitchen: production batches, order preparation tasks, SOP execution, QC, packaging and kitchen handovers.
- commerce: carts, quote snapshots, orders, order lines, payment attempts/references, refunds and order state history.
- customers: customer profiles, addresses, consent and privacy requests.
- pricing: cost snapshots, price books, price rules, tax/fee rules, discounts/coupons.
- delivery: delivery tasks, rider assignments, manifests, custody events, journeys, incidents, POD and delivery communications.
- workforce: minimal global employee records and employment status; operational qualifications remain in kitchen/delivery domain schemas.
- feedback: feedback, moderation, evidence links and investigation.
- analytics: governed read models/materialised views and metric definitions; BUSYFOLK consumes these read-only.
- website: optional CMS/presentation configuration only; never duplicate canonical product, price or order truth.

Physical schema placement is a PROPOSED organisation. Domain ownership is the important rule. Schema names and table placement can be adjusted before migrations.

## 5. Core entity groups and relationships

### Identity and governance
- business_unit 1—N location
- principal 1—N role_grant; role 1—N role_permission
- principal can be a human account or service identity
- audit_event records sensitive reads/exports and material changes
- integration_event uses event_id, event_type, schema_version, aggregate_type/id, occurred_at, producer, correlation_id, causation_id, payload and delivery state
- idempotency_key is unique per principal/operation scope

### Catalogue and supply
- product 1—N product_translation/name history
- product N—M customer_category through product_category
- product N—M attribute through product_attribute
- product N—M collection through collection_product
- product 1—N sellable_configuration (OPEN: exact configuration/SKU rules not yet approved)
- product 1—N product_lifecycle_event and publication/visibility records
- ingredient 1—N supplier_item; supplier N—M ingredient through supplier_item
- ingredient lot/batch references retain supplier, received quantity, received date, expiry, acceptance/rejection and traceability

### Recipe and kitchen
- recipe 1—N recipe_version (immutable once approved)
- recipe_version N—M ingredient through recipe_ingredient (quantity, unit, prep state, loss/yield assumptions, optionality)
- recipe_version 1—N recipe_step / method step
- recipe_version links to approved SOP versions and QC criteria
- production_batch references exact recipe_version and ingredient lots used
- order_item 1—N preparation_task; preparation task references recipe_version used
- QC checks and packaging manifest link to item/task/batch and performer evidence

### Commerce and fulfilment
- customer 1—N address
- cart 1—N cart_line; quote stores price/availability/fee snapshots
- order 1—N order_line; order_line stores product/configuration/name/price/tax/discount/customisation snapshots
- order 1—N payment_attempt and refund records
- order 1—N order_state_event
- order creates kitchen work; kitchen release creates delivery task through validated command/event
- delivery_task 1—N rider_assignment, journey_event, incident and POD attempt
- package_manifest and custody confirmations link SPIRIT handover to EATFOLK receipt
- feedback can link to order, order_line, delivery_task or product; staff attribution requires verifiable involvement

## 6. Important data rules

### Permanent IDs
Use opaque, immutable primary IDs (UUID/ULID decision OPEN). IDs must not encode product name, price, category, date, location, employee name or status. Product ID is not SKU.

### Historical snapshots
Order lines preserve product name, configuration, unit price, discounts, tax/fees, customer instructions and relevant product details at purchase time. Recipe execution stores the exact recipe/SOP version used. Delivery stores the validated address/manifest at assignment/handover. Never recalculate past transactions from current master data.

### State separation
Do not collapse these into one boolean:
- product lifecycle
- website visibility/publication
- availability
- ordering enabled
- order lifecycle
- kitchen execution status
- delivery lifecycle
- journey condition
- incident lifecycle
- proof-of-delivery status
- payment/refund state

### Units and money
Quantities require explicit unit and precision. Money uses fixed-precision decimal or integer minor units with explicit currency; never floating-point arithmetic. India default currency INR is a business configuration, not a hard-coded universal assumption.

### Time
Store timestamps in UTC; retain the relevant business/location timezone for display and scheduling. Store effective_from/effective_to for rules that change over time.

### Food traceability
Ingredient lots, supplier, receiving/acceptance/rejection, expiry, storage/consumption and recipe batch usage must be linkable. Exact food-safety fields and retention periods require operational and legal validation before launch.

### Privacy and access
Separate personal contact data from operational summaries. EATFOLK sees only delivery-required customer details. SPIRIT does not see payment credentials or unnecessary customer data. BUSYFOLK uses authorised, purpose-limited views. Restrict exports and log sensitive access.

## 7. Write boundaries and integration

- A domain writes only its own authoritative tables.
- Cross-domain requests use application services/commands with server-side permission and business-rule validation.
- Use a transactional outbox for events emitted after a committed state change; consumers use an inbox/deduplication key.
- Use idempotency keys for order creation, payment callbacks, kitchen release, rider assignment and POD submission.
- No direct browser-to-database privileged writes. Client uses authenticated server APIs/RPCs.
- Read-only views or APIs may expose minimum necessary projections.
- NUCLEUS canonical order state is updated only after validated domain events/commands. SPIRIT and EATFOLK retain their own execution states.
- Analytics is eventually consistent and never authoritative for live operational decisions.

## 8. Security and operational controls

- Separate dev, UAT and production projects/databases and credentials.
- Least privilege at database and application layers; no shared admin/service credentials.
- Row-level security is defence in depth, not a replacement for server-side authorisation.
- Encrypt transport and managed storage; keep secrets outside Git and client bundles.
- Backups plus tested restore process; define RPO/RTO before production.
- Migration files are reviewed, ordered, reversible where practical, and tested against disposable development data.
- Audit security-sensitive reads, exports, permission changes and state transitions.
- No real card details, passwords, OTP values or secrets in logs.
- Retention/deletion, consent and data-principal workflows require DPDP/legal mapping before launch.

## 9. Existing-system facts and migration caution

The earlier Purefolk architecture notes identify an existing prototype using Supabase Auth and tables:
pf_products, pf_delivery_areas, pf_delivery_rules, pf_subscription_plans, pf_settings.
The old site has a mixture of Supabase-backed and hard-coded pages and is not the final source of truth.

Do not drop, rename or migrate these legacy tables yet. First inspect the actual connected Supabase project, schema, policies, triggers, functions, auth users, dependencies and backups. Then map legacy records to the proposed model and write a tested migration/rollback plan. The current parallel branch does not connect to or alter the legacy database.

## 10. Open decisions (must remain open)

1. Confirm whether to reuse the existing Supabase project or create a separate development project; inspect billing/plan limits first.
2. Exact database provider/region and dev/UAT/prod project separation.
3. UUID vs ULID ID standard.
4. Exact canonical table/column definitions and naming convention.
5. Sellable configuration, variant and SKU model.
6. Customer identity/guest checkout and account merge rules.
7. Payment provider, webhook verification and refund workflow.
8. Exact recipe, ingredient unit, yield, batch and lot traceability model from approved recipe/SOP materials.
9. Tax, packaging, delivery and fee calculation rules.
10. Retention, consent, privacy request and deletion schedule.
11. RPO/RTO, backup frequency and restore-test cadence.
12. Whether a separate CMS is needed or website content stays in catalogue/CMS projections.

## 11. Acceptance gates before first migration

- Every entity has exactly one owning domain and named write boundary.
- Product classification remains separated: Product Type, Customer Category, Attributes, Collections/Customer Intent, Search/Discoverability.
- Product ID remains distinct from SKU; configuration model stays OPEN until validated.
- Historical order and recipe snapshots are demonstrated in tests.
- Role and service access tests prove cross-domain writes are blocked.
- Idempotent retries prove duplicate orders/events/payment callbacks cannot create duplicate business actions.
- Ingredient lot → recipe batch → order item traceability can be demonstrated.
- Audit records capture who/what/when/source/reason for critical transitions.
- Development/UAT contain synthetic data and no production credentials.
- Backup restore and migration rollback are tested before production use.

## 12. Immediate next step

Review and approve this logical ownership/schema baseline. Then inspect the existing Supabase project read-only and produce a legacy-to-target mapping. Only after that create the first SQL migration in a dedicated development database. No live database changes are authorised by this document.
