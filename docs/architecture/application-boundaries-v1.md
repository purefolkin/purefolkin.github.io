# Purefolk application boundaries v1

## Applications

- `apps/website`: public customer experience.
- `apps/nucleus`: private internal control experience.
- Shared backend: one Supabase project, with a reviewed public read model and privileged operations protected by server authorization and RLS.

The two applications are separate deployable Next.js apps in one repository. They have separate route trees, layouts, navigation, authentication requirements and environment configuration. Do not share a browser session or admin navigation with the public site.

## Deployment

Configure two Vercel projects from the same Git repository:

- Purefolk Website: Root Directory `apps/website`, public domain only.
- Purefolk Nucleus: Root Directory `apps/nucleus`, private admin domain/subdomain with access restrictions.

Do not deploy either app to production until its build, auth, security headers, RLS, domain and preview behaviour are verified. Nucleus must remain noindex and should have an additional deployment access boundary where feasible.

## Data ownership

Nucleus is the control surface for product, recipe, commercial, publication and service records. The Website consumes only published customer-safe data. A single order identity and lifecycle is authoritative; future SPIRIT/EATFOLK/BUSYFOLK interfaces must consume that same record rather than create duplicate orders.

## Explicitly not enabled

- Production schema migration
- Legacy table or record deletion
- Live checkout, payments or customer order writes
- Product CRUD or delivery-rule writes
- Real product/price/nutrition/service seeding

These require the shared data model, access matrix, RLS tests and operational exception flow to be reviewed first.
