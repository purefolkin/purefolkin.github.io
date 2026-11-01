-- Purefolk V1 — initial private schema namespace baseline
-- REVIEW FILE ONLY. Not applied to any database.
-- Target: purefolk-development (Supabase project ref: dkikrpyfpjtksmwjdwrm)
-- This establishes domain boundaries only. It creates no tables, policies,
-- functions, triggers, users, credentials, or production objects.
--
-- Security posture:
-- - These schemas are not intended to be exposed through the Supabase Data API.
-- - No access is granted to anon/authenticated.
-- - Application/service grants will be added only after the auth and API model
--   is approved and tested. Do not solve access issues by granting broad access.

begin;

create schema if not exists nucleus;
create schema if not exists audit;
create schema if not exists integration;

create schema if not exists catalog;
create schema if not exists supply;
create schema if not exists recipes;
create schema if not exists kitchen;
create schema if not exists commerce;
create schema if not exists customers;
create schema if not exists pricing;
create schema if not exists delivery;
create schema if not exists workforce;
create schema if not exists feedback;
create schema if not exists analytics;
create schema if not exists website;

comment on schema nucleus is
  'NUCLEUS-owned global identity/access references, business master data, global IDs and shared governance.';

comment on schema audit is
  'Restricted audit records for sensitive access, exports, permission changes and material state transitions.';

comment on schema integration is
  'Restricted integration inbox/outbox, event contracts, deduplication and idempotency records.';

comment on schema catalog is
  'NUCLEUS catalogue domain: products, classification, attributes, collections and publication projections.';

comment on schema supply is
  'NUCLEUS supply domain: ingredient and supplier master data and approved specifications.';

comment on schema recipes is
  'SPIRIT-owned recipe definitions and immutable approved recipe versions.';

comment on schema kitchen is
  'SPIRIT-owned kitchen execution: preparation, batches, SOP execution, QC, packaging and handover.';

comment on schema commerce is
  'NUCLEUS commerce domain: carts, quotes, canonical orders, payment references and refunds.';

comment on schema customers is
  'NUCLEUS customer domain: customer identity, addresses, consent and privacy requests.';

comment on schema pricing is
  'NUCLEUS pricing domain: cost snapshots, price books, taxes, fees and discount rules.';

comment on schema delivery is
  'EATFOLK-owned delivery tasks, rider assignment, custody, journeys, incidents and proof of delivery.';

comment on schema workforce is
  'NUCLEUS-owned minimum global workforce identity and employment references; operational qualifications stay in their owning domains.';

comment on schema feedback is
  'NUCLEUS-owned customer feedback, moderation and evidence-based investigation records.';

comment on schema analytics is
  'Governed read models and metric definitions for BUSYFOLK; not authoritative operational write tables.';

comment on schema website is
  'WEBSITE-owned presentation configuration only; never canonical product, price, order or delivery truth.';

-- Explicitly deny API roles schema access. No tables are created in this baseline.
do $$
declare
  schema_name text;
begin
  foreach schema_name in array array[
    'nucleus', 'audit', 'integration', 'catalog', 'supply', 'recipes',
    'kitchen', 'commerce', 'customers', 'pricing', 'delivery',
    'workforce', 'feedback', 'analytics', 'website'
  ]
  loop
    execute format('revoke all on schema %I from public', schema_name);
    execute format('revoke all on schema %I from anon', schema_name);
    execute format('revoke all on schema %I from authenticated', schema_name);
  end loop;
end
$$;

commit;

-- Post-apply verification (run separately in SQL editor):
-- select schema_name
-- from information_schema.schemata
-- where schema_name in (
--   'nucleus','audit','integration','catalog','supply','recipes','kitchen',
--   'commerce','customers','pricing','delivery','workforce','feedback',
--   'analytics','website'
-- )
-- order by schema_name;
--
-- Expected: exactly 15 rows.
--
-- Confirm no API-role schema privileges:
-- select n.nspname, r.rolname, has_schema_privilege(r.rolname, n.nspname, 'USAGE') as can_use
-- from pg_namespace n
-- cross join pg_roles r
-- where n.nspname in (
--   'nucleus','audit','integration','catalog','supply','recipes','kitchen',
--   'commerce','customers','pricing','delivery','workforce','feedback',
--   'analytics','website'
-- )
-- and r.rolname in ('anon','authenticated')
-- order by n.nspname, r.rolname;
-- Expected: can_use = false for every row.
