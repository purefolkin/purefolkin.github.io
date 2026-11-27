# Purefolk cart, combinations and merchandising rules v1

Status: Working architecture. This document records the current discussion and separates working direction from decisions that still need validation.
Scope: Website + Nucleus + shared catalogue/order domain.
Related documents:
- [Product and catalogue model](./product-model-v1.md)
- [Order lifecycle](./order-lifecycle-working-v1.md)
- [Application boundaries](./application-boundaries-v1.md)

## 1. Purpose

Define how a customer can configure a purchase, add products and optional extras, discover complementary items, buy curated combinations, and receive eligible discounts.

The cart must remain flexible and customer-controlled. Nucleus configures the rules and recommendations; the Website presents valid choices; the server validates and calculates the transaction.

This is a domain contract, not a Supabase migration or a claim that the current website already implements these behaviours.

## 2. Keep these concepts separate

| Concept | Meaning | Example | Cart behaviour |
|---|---|---|---|
| Product | Stable customer-facing food concept | Pure Protein Taco | Customer browses the product |
| Product Variant | Concrete sellable version | Regular / large, or materially different formulation | Customer selects one variant |
| Add-on | Independently sellable extra | Dip, topping, side | Added as its own priced cart line, linked to its parent item where appropriate |
| Add-on Group | Rules for a set of allowed extras | “Choose a dip” | Controls eligibility, min/max selection and quantity rules |
| Related Recommendation | Optional cross-sell suggestion | “Pairs well with this taco” | Never added unless the customer accepts |
| Bundle | A deliberately grouped commercial offer containing multiple products/variants | Taco + drink + dip combo | Represented as a bundle purchase with its component identities and pricing preserved |
| Promotion / Discount | A rule that changes the eligible selling price or order total | Combo saving, limited offer, cart threshold | Evaluated by the pricing service; not hard-coded into product cards |

Do not use “variant”, “add-on”, “bundle” and “discount” as interchangeable terms.

## 3. Product configuration and add-on groups

A Product Variant may expose zero or more applicable Add-on Groups.

An Add-on Group should define:
- Name and customer-facing instructions.
- Eligible product variants.
- Eligible add-on variants.
- Minimum and maximum selections.
- Whether a selection is optional or required.
- Per-add-on quantity limits, where needed.
- Display order and active dates/status.
- Whether multiple different add-ons can be selected.
- Whether the same add-on can be selected more than once, if the business permits it.

Example:

```text
Pure Protein Taco (selected variant)
  └── Choose a dip (0–1)
       ├── Mint Dip
       └── Tomato Dip

Customer may skip the group if minimum = 0.
```

An add-on remains independently identifiable and priced. Its relationship to the parent cart line records why it was offered/selected; it must not be hidden inside a free-text product name.

## 4. Add-to-cart behaviour

Working direction from the discussion:

1. Customer selects a product and a valid variant.
2. Customer configures any applicable required/optional add-on groups.
3. Customer selects quantity and adds the configured purchase to the cart.
4. After the item is added, the Website may show a small, non-blocking complementary recommendation.
5. The customer may add the suggested item, adjust its quantity, or dismiss/ignore the suggestion.
6. The customer can continue shopping without accepting anything.
7. The cart itself may contain a separate “You might also enjoy” section with eligible recommendations.

Customer-control rules:
- Recommendations are suggestions, never automatic additions.
- Do not interrupt the customer with a blocking modal.
- Do not repeatedly show the same dismissed suggestion in the same cart session without a meaningful reason.
- Do not recommend an item already present in the cart, unless the configured rule explicitly allows a quantity/top-up suggestion.
- Revalidate current publication, availability, price and compatibility before adding.
- A customer can remove an added recommendation or change its quantity like any other eligible cart line.
- If no eligible recommendation exists, show nothing; do not use unrelated filler.
- The recommendation engine/configuration is controlled through Nucleus, but the customer always makes the final choice.

Nucleus recommendation configuration should support:
- Source product/variant.
- Recommended target product/variant or bundle.
- Placement: after-add-to-cart, cart, or both.
- Priority/rank.
- Eligibility conditions and exclusions.
- Active dates/status.
- Optional campaign or rationale label.
- Performance measurement reference (impressions, accepted additions, revenue), subject to analytics/privacy design.

## 5. Bundles and product combinations

A Bundle is a commercial grouping, not merely a visual category or a list of recommendations.

Working model should allow two broad patterns, subject to final business validation:

### Fixed bundle
The business defines the exact component variants and quantities.

Example:
```text
Taco Combo
- Pure Protein Taco × 1
- Drink × 1
- Dip × 1
```

### Configurable / mix-and-match bundle
The business defines component groups and selection limits; the customer chooses from eligible options.

Example:
```text
Snack Box
- Choose any 2 eligible snacks
- Choose 1 eligible drink
```

A bundle definition should be able to describe:
- Bundle identity, name, description, image and customer-facing URL if published as a page.
- Fixed components or configurable component groups.
- Component variant eligibility and quantity rules.
- Bundle price or pricing rule.
- Effective dates, lifecycle, publication and availability.
- Applicable promotions and exclusions.
- How component availability affects bundle availability.
- Whether component substitutions are permitted (open policy; never assume).
- Fulfilment/recipe/packaging references needed by operations.

Do not assume every combination needs a new Product or a new Variant. Use a Bundle entity when the grouping itself has a commercial identity, offer, configuration or reporting need. A simple optional extra remains an Add-on.

## 6. Promotions and discounts

Keep base price and promotional discount logic separate.

A price record answers: “What is the current approved selling price for this variant/bundle?”
A promotion answers: “Under what conditions may a customer receive a discount?”

A promotion rule may need:
- Promotion ID, name and internal description.
- Discount type: fixed amount, percentage, bundle price, or other explicitly supported type.
- Value and currency (INR).
- Eligible products, variants, add-ons, bundles, categories or cart conditions.
- Minimum quantity/order value where applicable.
- Start/end date and time.
- Usage limits and customer/order limits, if required.
- Priority and stacking/exclusivity rules.
- Maximum discount cap where applicable.
- Coupon/code requirement, if any.
- Status and approval/audit information.
- Reason/source/campaign reference.

Rules:
- Never silently overwrite the base product price to represent a temporary offer.
- Calculate all discounts on the server from current eligible rules.
- Explain the saving clearly to the customer before order confirmation.
- Define whether discounts apply to a line, bundle, delivery fee or order subtotal; do not infer scope.
- Define stacking order and whether promotions can combine before implementation.
- Preserve the applied promotion identity, rule/version and exact discount amount in the order snapshot.
- If a promotion expires or changes after a cart is created, revalidate and show the customer the updated total before checkout.
- Prevent negative line totals or discounts greater than the eligible amount.
- Tax treatment must follow the approved accounting/tax rules; do not hard-code a generic assumption.

## 7. Cart data contract

The cart is a mutable customer-intent record, not the final financial authority. The server must revalidate catalogue state, compatibility, quantity, serviceability and pricing at checkout.

Conceptual cart structure:

```text
Cart
- cart_id
- customer/session reference
- currency
- status
- created_at / updated_at
  |
  └── Cart Lines
      - cart_line_id
      - line_type: product_variant | addon_variant | bundle
      - product_id (when applicable)
      - variant_id (when applicable)
      - bundle_id (when applicable)
      - parent_cart_line_id (for attached add-ons/components where applicable)
      - quantity
      - selected option/configuration snapshot
      - displayed price snapshot (informational only; revalidate)
      - applied promotion references (provisional until checkout)
      - line notes / customer instructions, where supported
```

For a configurable bundle, preserve the selected component variants and quantities as structured child selections. For a standalone add-on, preserve its own sellable variant identity and price, plus the parent relationship when attached to a product.

The final relational schema/table names are OPEN. This conceptual contract must be mapped to the existing Supabase schema only after inspecting the live schema and agreeing the migration plan.

## 8. Order snapshot and price integrity

At successful order creation, convert the validated cart into immutable order-line/component snapshots.

Preserve at minimum:
- Product, variant, add-on and bundle identities and customer-facing names at purchase.
- Selected options and component quantities.
- Unit prices, base prices, applied discounts, tax amounts and final line totals.
- Promotion IDs and the exact applied rule/version where relevant.
- Parent-child relationships between a primary item and attached extras.
- The final order subtotal, fees, tax, discount and payable total.
- Any customer instructions that are part of the order.

Later catalogue, price, bundle or promotion edits must not rewrite historical orders.

## 9. Nucleus control surface

Nucleus should allow authorised staff to manage these records without code changes for routine merchandising work:

- Add-on groups and eligible add-on variants.
- Product-to-product and variant-to-variant recommendations.
- Recommendation placement, priority, eligibility and active dates.
- Bundle definitions, component groups and quantity rules.
- Promotion/discount definitions, eligibility, dates, limits and stacking policy.
- Preview customer-facing presentation before publication.
- Activate, pause, expire and archive configurations with audit history.

Nucleus must distinguish draft, approved/published, active, paused and expired states where relevant. Permissions for creating, approving and activating financial promotions remain to be defined.

## 10. Conceptual data entities / tables

These are logical entities for architecture discussion, not approved physical table names:

| Logical entity | Responsibility | Status |
|---|---|---|
| Cart | Customer's current shopping session | Required concept |
| Cart Line | Product/variant/bundle purchase and quantity | Required concept |
| Cart Line Selection | Selected options and structured bundle components | Required concept; exact normalisation open |
| Add-on Group | Rules for selectable extras | Already part of product-model direction |
| Add-on Group Item | Allowed add-on variants for a group | Required relationship |
| Product Recommendation | Configured optional cross-sell relationship and placement | Working requirement |
| Bundle | Commercial identity for a product combination | Working requirement; scope to validate |
| Bundle Component / Component Group | Fixed or selectable bundle contents | Working requirement |
| Promotion | Discount campaign/rule identity and conditions | Working requirement |
| Promotion Eligibility | Products/variants/bundles/customer/cart conditions | Required relationship; exact schema open |
| Applied Discount Snapshot | Exact discount applied to a cart/order line or order | Required transactional record |
| Order Line Snapshot | Immutable purchased item facts | Already required by order lifecycle |

Do not create all of these tables just because they appear in this conceptual list. Normalise after checking the existing Supabase tables, access patterns, constraints, RLS and reporting needs. Some concepts may be represented through join tables or versioned records rather than one table each.

## 11. Validation and exception cases

Before checkout, the server must handle:
- Product or variant unpublished, paused or unavailable.
- Add-on no longer eligible for the selected parent variant.
- Required add-on group left incomplete.
- Selection exceeds min/max or quantity limits.
- Bundle component becomes unavailable.
- Bundle selection is invalid or incomplete.
- Promotion expired, exhausted, ineligible or non-stackable.
- Price changed since the cart was created.
- Quantity outside configured limits.
- Duplicate add-on/component selection where not allowed.
- Cart contains a product that cannot be delivered to the entered PIN/locality/time.
- Concurrent changes to availability or promotion state during checkout.

The customer should receive a clear explanation and a chance to review the revised cart. Never silently substitute a product, remove a paid component or change the final total.

## 12. Status and open decisions

### Working direction captured
- Add-ons remain separate sellable items with explicit eligibility rules.
- Add-on groups define which extras can be selected and how many.
- Related recommendations can appear after Add to Cart and inside the cart.
- Recommendations are optional; the customer may accept, adjust quantity or skip.
- Nucleus controls recommendation configuration.
- Bundles are distinct from add-ons and recommendations.
- Base prices and promotions are separate concepts.
- Cart values are revalidated server-side.
- Order snapshots preserve the exact purchase and discount facts.

### Still open — do not implement by assumption
1. Whether bundles are needed in the first launch or can follow after basic cart/add-ons.
2. Exact fixed-bundle and mix-and-match customer experience.
3. Whether add-ons can be attached to a bundle, and whether bundle components can have their own add-ons.
4. Promotion types required at launch.
5. Discount stacking, priority and coupon rules.
6. Tax treatment for discounts and bundles, to be confirmed with the accounting/tax approach.
7. Guest cart versus authenticated cart and cart merge behaviour.
8. Cart expiry and abandoned-cart retention.
9. Exact physical table names, indexes, constraints and RLS policies.
10. Whether recommendations are manually configured only in V1 or later supported by rules/analytics.

## 13. Build gate

This document does not authorise production implementation.

Before creating or changing Supabase tables or enabling live checkout:
1. Compare these logical entities with the current database schema and legacy data.
2. Finalise the Product/Variant/Add-on/Bundle semantics against real Purefolk products.
3. Approve the launch promotion rules and tax treatment.
4. Approve the cart and order snapshot contract.
5. Define Nucleus roles and approval permissions.
6. Design and test server validation, idempotency, RLS and audit logging in a development environment.
7. Test availability/price/promotion changes between add-to-cart and checkout.

No production database schema or live customer ordering behaviour is changed by this documentation update.
