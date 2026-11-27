# Purefolk platform architecture

Scope: customer website + Nucleus Admin + Supabase. SPIRIT, EATFOLK and BUSYFOLK are outside this phase.

Catalogue hierarchy: Category → Subcategory → Product → Variant. Add-on groups and add-ons are attachable choices. Product identity is distinct from a purchasable variant and SKU.

Orders retain immutable product, variant and add-on snapshots. Checkout must validate product IDs, variants, add-on selections, availability, serviceability, cut-off, slot capacity, price, tax and total on the server. Browser-supplied totals are untrusted. Public clients must not insert orders directly.

RLS is mandatory on every exposed table. Public users read published catalogue and active delivery information only. Admin requires verified Supabase Auth claims with app_metadata.role=admin or a server-only UUID allowlist. Never authorize from user_metadata. Never expose service-role keys to browser code.

SEO: server-rendered pages, unique metadata, canonical URLs, sitemap, robots, preview noindex, semantic HTML, image alt text and structured data only for verified facts. India defaults: en-IN, INR, Asia/Kolkata. Money is integer paise. Operating hours, fees, slots and delivery areas are configurable.

The SQL migration is a proposal. It has NOT been applied to production. Review it against existing pf_* tables and Auth policies before applying to a development database.
