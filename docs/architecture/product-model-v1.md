# Purefolk product and catalogue model v1

Status: Working architecture for implementation; not yet a production database migration.

## The key distinction

- **Product** = the customer-facing food concept and stable identity.
- **Variant** = a concrete selectable and sellable version. Use a variant when portion/pack size, recipe/formulation or another material attribute changes what is delivered.
- **SKU** = an internal stock/fulfilment code for a sellable variant. It identifies a variant; it is not another product layer. It can remain optional while Purefolk is made-to-order and does not need SKU-level stock control.
- **Add-on** = an independently defined sellable variant attached through an allowed add-on group.
- **Sellable choice** = one active Product Variant plus zero or more permitted add-ons. V1 does not introduce a separate Sellable Configuration table; that would duplicate variant identity before a real use case proves it is needed.

## Relationships

```text
Category ──< Product ──< Product Variant ──┬── SKU (optional)
                                          ├── Versioned Price
                                          ├── Recipe Version
                                          ├── Nutrition / verified claims
                                          └── Allowed Add-on Groups ──< Add-on Variants

Product ── Website Publication ──> Public Website
Product Variant ── Order Line Snapshot ──> One Order Lifecycle
```

## Where a choice belongs

| Example | Model it as | Reason |
|---|---|---|
| Pure Protein Taco | Product | Stable food concept |
| Regular / large portion | Variants | Different sellable portions |
| 250 g / 500 g pack | Variants | Different sellable quantities |
| Jain formulation that changes ingredients or preparation | Separate variant, own recipe version and reviewed claims | Materially different food |
| “High protein”, “Satvik”, “Jain-friendly” when it is a verified property | Attributes/claims on product or variant | Discovery and evidence, not duplicate taxonomy |
| Extra dip or topping sold separately | Add-on variant in an allowed group | Has its own identity and price |
| “Coming soon” | Product/variant lifecycle and availability | Not a fake product or hard-coded card |
| Price change | Versioned price record | Existing orders retain the price paid |

If a supposed option changes ingredients, allergen exposure, nutrition, preparation or fulfilment materially, review whether it needs its own variant and recipe.

## Core entities

1. **Product**: stable ID, name, slug, customer copy, category, lifecycle, images, dietary attributes and reviewed claims.
2. **Product Variant**: stable ID, parent product, customer-facing name, option values, unit, lifecycle, availability, optional SKU, recipe-version link, price references and permitted add-on groups.
3. **Category**: navigational taxonomy, distinct from dietary attributes and curated collections.
4. **Variant Price**: INR amounts stored as integer paise, with effective dates. Never overwrite an old price snapshot.
5. **Add-on Group**: selection rules (minimum/maximum) and allowed add-on variants.
6. **Recipe / Recipe Version**: recipe is the identity; recipe version is the tested/approved formula and method used for a variant.
7. **Nutrition Record / Product Claim**: provenance and review state. Do not publish unsupported nutrition or health claims.
8. **Website Publication**: approval and publication lifecycle separate from product lifecycle and availability.
9. **Order Line Snapshot**: exact purchased product, variant, add-ons, quantities and prices. Catalogue edits must never rewrite historical orders.

## Four separate controls — do not collapse them

- **Lifecycle**: Is this product/variant being developed, actively offered, or retired?
- **Publication**: Has customer-facing content been reviewed and published?
- **Availability**: Can a customer order it now, pre-order it, or not order it?
- **Ordering switch / serviceability**: Is Purefolk accepting orders at all, and can this customer address/time be served?

A published product may be unavailable. An active product may be unpublished. A product can be visible for discovery while ordering is closed. The website must never infer one control from another.

## Publication rule

Nucleus owns product and variant records. Website reads only customer-safe, approved and published information. A product must not be published unless:
- at least one active sellable variant exists;
- each offered variant has a valid current price;
- required ingredient/allergen/nutrition/claim review is complete for the information being displayed;
- images, descriptions, URL slug and SEO metadata pass content review;
- availability and ordering rules are respected at request time.

The shared domain helper is not a security boundary. The production server and database must enforce access and publication rules too.

## V1 scope

Build now:
- Product identity and category.
- One or more variants per product.
- Variant-specific price records.
- Dietary attributes and evidence-reviewed claims.
- Publication, lifecycle and availability as separate controls.
- Optional SKU field, unique when supplied.
- Recipe-version relationship and add-on-group relationship in the contract.
- Immutable order-line snapshot contract.

Do not build yet:
- A separate Sellable Configuration entity.
- Complex matrix configurators.
- Inventory ledger, purchasing or supplier ERP.
- Automatic nutrition calculation presented as verified lab data.
- Subscription billing or recurring fulfilment.
- Multi-location price books or advanced promotions.

## Legacy migration notes

The old website used a single `pf_products` table with fields including name, description, image, price, original price, category, dietary flags, availability, sort order and `tally_param`. The old Admin also managed WhatsApp, Tally order/subscription URLs, order acceptance, delivery rules/areas and subscription plans.

Treat those records as a migration source only. Do not copy old sample dishes/prices into the new live catalogue without confirming they are still offered and correctly costed. `tally_param` is a legacy form-integration detail, not a core product identity field; retain it only in a migration mapping until the Tally workflow is retired.

## Implementation boundary

The shared TypeScript contract lives in `packages/catalogue-domain` and is imported by both Website and Nucleus. It is storage-agnostic; it defines domain meaning, not a Supabase schema.

**No Supabase schema has been created or changed by this step.** Before the first migration, validate the model against current legacy data, finalize role/permission rules, review the current Supabase changelog/docs, design RLS policies and test the migration in development.
