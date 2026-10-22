# Neclues — Purefolk Admin & Control

Development branch: `build/neclues-foundation`

## Current implementation

- `index.html`: responsive Neclues control shell; product navigation opens the product editor.
- `products.html`: product catalogue UI with Supabase email/password sign-in, product listing/search, add/edit, availability toggle, form validation, safe text escaping and error states.
- `product-domain-spec.md`: planned field mapping and acceptance criteria (to be added as implementation progresses).
- Not deployed. No production schema changes have been applied by this development work.

## Product domain — current database facts

Existing `public.pf_products` fields: `id` (UUID primary key, generated), `name`, `description`, `category`, `price`, `original_price`, `image_path`, `image_alt`, `tally_param`, `is_available`, `is_jain`, `is_satvik`, `is_high_protein`, `sort_order`, `created_at`.

This is the current implementation, not a claim that the existing fields are the final architecture. Current database table has RLS enabled. Before relying on writes, test the real authenticated session and effective policies; a public/publishable key is not an authorization boundary.

## Locked architecture rules

- Product ID is permanent system identity, not SKU.
- Product name can change without changing Product ID.
- Historical order items must preserve purchased name, price and configuration snapshots.
- Product Type, Customer Category, Attributes, Collections / Customer Intent and Search / Discoverability are separate concepts.
- Product lifecycle, website publication, availability and orderability are separate dimensions.
- A published slug must not silently change when the product name changes.
- Avoid hard deletion of records referenced by orders; archive and audit instead.
- Never expose a service-role key in browser code.
- Do not apply production schema changes without reviewed migrations and tested RLS policies.

## Open design decision

Sellable Variant / Configuration is still OPEN. Do not silently choose how size/options, SKU, price, recipe mapping and order-line snapshots relate. Design these relationships before creating the variant schema.

## Build sequence

1. Product editor against existing fields, in development branch.
2. Verify authentication and effective RLS permissions.
3. Confirm product field semantics and validation.
4. Design the Product ↔ Sellable Configuration ↔ Recipe relationships.
5. Create reviewed, additive migrations and test in an isolated development database.
6. Connect reads and writes, then test all acceptance cases.
7. Add lifecycle, publishing, URL history, audit and historical order snapshots.
8. Deploy a protected preview, then review before production release.
