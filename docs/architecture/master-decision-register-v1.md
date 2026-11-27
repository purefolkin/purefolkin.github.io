# Purefolk Master Decision Register v1

Status: Consolidated working register; not a final legal, food-safety or implementation approval
Last consolidated: 27 November 2026
Scope: Purefolk Website, Nucleus, catalogue/cart, order, payment, Kitchen and fulfilment foundations

## 1. How to read this register

This register is the index of decision status. It does not turn a proposal or an old discussion into a confirmed rule.

- **CONFIRMED (working decision):** explicitly agreed direction; still subject to legal, safety and technical validation where noted.
- **WORKING DIRECTION:** a design direction supported by discussion but not yet fully specified.
- **PROPOSED:** recommended option; founder confirmation is still required.
- **PENDING:** a choice or required detail remains unresolved.
- **CONFLICT:** source notes contain incompatible directions; do not implement until resolved.
- **DEFERRED:** deliberately not part of the current phase.
- **REQUIRES REVIEW:** legal, regulatory, food-safety, accounting, payment-provider or security validation is required.

The latest explicit founder decision takes precedence over older drafts. An assistant recap or a technical suggestion is not itself founder approval.

## 2. Architecture and system boundaries

| ID | Decision | Status | Current record / constraint |
|---|---|---|---|
| ARC-01 | Nucleus is the source of truth for governed business records and operations. | CONFIRMED (working decision) | Website and future operational interfaces consume the same governed records. |
| ARC-02 | Website is the customer-facing application; Nucleus is the private internal control application. | CONFIRMED (working decision) | Separate route trees, authentication boundaries and deployments. |
| ARC-03 | Kitchen initially exists as a workspace inside Nucleus. | CONFIRMED (working decision) | A standalone SPIRIT application is deferred. |
| ARC-04 | Future SPIRIT, EATFOLK and BUSYFOLK must not create duplicate order identities or competing order databases. | CONFIRMED (working decision) | They are future interfaces/capabilities over shared authoritative records. |
| ARC-05 | Preserve production website, main branch and existing database until replacement is reviewed and approved. | CONFIRMED (safety constraint) | No destructive migration, live checkout or production cutover through these documentation changes. |
| ARC-06 | Use a shared domain contract; logical entities are not automatically physical database tables. | WORKING DIRECTION | Inspect existing schema, design RLS and test migrations in development before implementation. |

## 3. Catalogue and cart

| ID | Decision | Status | Current record / constraint |
|---|---|---|---|
| CAT-01 | Product is the stable customer-facing food concept; Variant is the concrete sellable version. | CONFIRMED (working decision) | Recipe versions can change independently of product identity. |
| CAT-02 | SKU is an optional internal stock/fulfilment identifier for a variant. | WORKING DIRECTION | Do not add SKU complexity without a real stock-control need. |
| CAT-03 | Snacks, Food and Drinks are selling formats; add-ons are separately sellable cart items. | CONFIRMED (working decision) | Preserve each item identity and price. |
| CAT-04 | Add-ons are configured through eligible add-on groups with min/max and quantity rules. | WORKING DIRECTION | Exact launch configuration should be validated against real products. |
| CAT-05 | Related recommendations are optional and never auto-added. | CONFIRMED (working decision) | Customer may accept, adjust or dismiss. |
| CAT-06 | Bundles and promotions are distinct from products, variants, add-ons and recommendations. | WORKING DIRECTION | Whether bundles/discount rules are needed at first launch remains pending. |
| CAT-07 | Server revalidates prices, availability, compatibility and totals at checkout. | CONFIRMED (technical requirement) | Cart display is not the financial or stock authority. |
| CAT-08 | Preserve immutable order-line snapshots of what the customer bought. | CONFIRMED (working decision) | Later catalogue edits must not rewrite historical orders. |

## 4. Checkout, address and customer records

| ID | Decision | Status | Current record / constraint |
|---|---|---|---|
| CHK-01 | Collect delivery address on website checkout before order submission. | CONFIRMED (working decision) | WhatsApp is not the source of the delivery address. |
| CHK-02 | Guest checkout is allowed; account creation is optional. | CONFIRMED (working decision) | Do not force an account to place an order. |
| CHK-03 | Customers may maintain multiple saved addresses. | CONFIRMED (working decision) | Labels may include Home, Office and Other. |
| CHK-04 | Existing orders retain an immutable address snapshot. | CONFIRMED (working decision) | Editing a saved address does not change an existing order. |
| CHK-05 | Checkout captures name, mobile, flat/house/building, street/road, locality/area, PIN; landmark and delivery instructions are optional. | WORKING DIRECTION | Final validation and required/optional fields need implementation review. |
| CHK-06 | Check delivery serviceability before payment/order acceptance. | CONFIRMED (working decision) | Use configured PIN/locality/service area and approved fees/windows; do not invent launch values. |

## 5. WhatsApp, payment and receipts

| ID | Decision | Status | Current record / constraint |
|---|---|---|---|
| PAY-01 | Website creates one order with one Order ID; Nucleus is authoritative. | CONFIRMED (working decision) | WhatsApp is a communication channel, not the order ledger. |
| PAY-02 | Website may open WhatsApp with a prefilled order message; customer manually presses Send. | CONFIRMED (working decision) | Do not assume the message was sent merely because the link was opened. |
| PAY-03 | Current proposed payment flow is manual UPI QR/instructions, followed by actual bank-credit verification. | WORKING DIRECTION | Receiving account eligibility and provider/bank rules require review before launch. |
| PAY-04 | Screenshot/customer claim alone is not payment proof. | CONFIRMED (control) | Verify actual bank credit or trusted provider confirmation. |
| PAY-05 | Order Receipt at creation and Payment Receipt after verification, same Order ID. | CONFIRMED (working decision) | Do not label a receipt as GST tax invoice unless legally compliant. |
| PAY-06 | Payment state and order state are separate. | CONFIRMED (technical requirement) | Payment Pending/Paid/Failed/refund states do not replace order workflow states. |
| PAY-07 | Maximum pending-payment window is two hours. | CONFIRMED (working operating choice) | Exact start event, expiry job, grace/exception handling and customer wording still need specification. |
| PAY-08 | Reminders around 15–20 minutes and 60 minutes. | PROPOSED | Exact timings and channel must be confirmed; cancel reminders after verified payment. |
| PAY-09 | Automated WhatsApp reminders need an eligible Business Platform/API setup and compliant templates. | REQUIRES REVIEW | Ordinary WhatsApp app alone does not provide this automation. |
| PAY-10 | Transactional updates/reminders consent is separate from marketing consent. | CONFIRMED (working decision) | Record purpose, wording/version, timestamp and withdrawal. |

## 6. Order acceptance and Kitchen workflow

| ID | Decision | Status | Current record / constraint |
|---|---|---|---|
| ORD-01 | Payment verification, order state and Kitchen work state are separate. | CONFIRMED (working decision) | Do not infer one state from another. |
| ORD-02 | Validate payment, product/add-on availability, stock reservation, address serviceability and Kitchen availability before Kitchen release. | CONFIRMED (working validation set) | Failed checks go to an exception workflow. |
| ORD-03 | Whether Admin must explicitly accept every paid order before Kitchen release, or Nucleus automatically routes orders after all checks pass. | CONFLICT | Earlier recorded working decision says automatic routing with Admin handling exceptions. A later spoken recap mentioned an Admin acceptance step. Founder must explicitly resolve this before implementation. |
| KIT-01 | Kitchen is a Nucleus workspace with individual authenticated staff identities. | CONFIRMED (working decision) | Staff ID alone is not authentication; permissions are server-enforced. |
| KIT-02 | Queue arrival is not preparation start; staff explicitly starts preparation. | CONFIRMED (working decision) | Record actor and server timestamp. |
| KIT-03 | Preparation complete is separate from QC & packing; Ready for Dispatch follows completion of required checks. | CONFIRMED (working direction) | Exact checklists and responsible roles remain pending. |
| KIT-04 | Staff self-claim vs Admin assignment vs hybrid. | PENDING | Do not implement an assumed assignment policy. |
| KIT-05 | Whole-order work vs item-level work, collaboration, station routing and queue priority. | PENDING | Determine from actual kitchen operating model. |
| KIT-06 | Customer sees only safe progress statuses, not staff identities, internal notes or queue details. | CONFIRMED (working decision) | Customer status is a projection of internal state. |

## 7. Refunds and customer remedies

| ID | Decision | Status | Current record / constraint |
|---|---|---|---|
| REF-01 | Refund workflow begins only against verified received payment. | CONFIRMED (control) | Reconcile the original payment. |
| REF-02 | Current proposed reasons include Purefolk fulfilment error, wrong/missing/damaged item, duplicate/excess payment and post-payment unavailability caused by system/operational failure. | WORKING DIRECTION | Preserve evidence and line-level impact. |
| REF-03 | Customer changing mind is not an automatic refund reason under the proposed business policy. | REQUIRES REVIEW | Cannot override mandatory statutory rights or remedies. |
| REF-04 | Partial/line-level remedy may be used where only part of the order is affected. | WORKING DIRECTION | Customer approval and policy rules must be defined. |
| REF-05 | Refund states: Requested → Under Review → Initiated → Completed. | CONFIRMED (working control) | Completed only after bank/provider confirmation. |

## 8. Privacy, access and records

| ID | Decision | Status | Current record / constraint |
|---|---|---|---|
| PRI-01 | Collect only data needed for ordering, fulfilment, support and required records. | CONFIRMED (working principle) | Access, retention, deletion/anonymisation and customer request workflows remain to be specified. |
| PRI-02 | Role-based access and audit history for privileged operations. | CONFIRMED (technical requirement) | Enforce server-side; do not rely on browser-provided role metadata. |
| PRI-03 | Customer-safe publication data is distinct from internal recipe, supplier, cost and SOP data. | WORKING DIRECTION | Reveal accurate customer-critical information; protect legitimate business secrets. |
| PRI-04 | Legal notices, privacy wording, consent language and retention schedule. | REQUIRES REVIEW | Review against applicable Indian law before launch. |

## 9. Deferred scope

- Standalone SPIRIT, EATFOLK and BUSYFOLK applications.
- Multi-location operations, advanced staff scheduling and station optimisation.
- Subscriptions until offer and repeat demand are validated.
- Advanced analytics and AI before reliable operational data exists.
- Live payment integrations and automated WhatsApp reminders until provider setup and compliance are approved.
- Production schema changes, live order writes and public checkout until development testing and approval.

## 10. Open decision queue — do not silently fill

1. Resolve ORD-03: Admin acceptance gate vs automatic routing after validation.
2. Select Kitchen assignment model (KIT-04).
3. Decide whole-order vs item-level work and staff collaboration (KIT-05).
4. Approve QC checklist, packing checklist, responsible roles and exception authority.
5. Define Kitchen hours, capacity, queue priority, prep estimates and delay thresholds.
6. Finalise service areas, delivery fees, cut-offs, order windows and capacity values.
7. Confirm payment collection account/provider and exact manual reconciliation permissions.
8. Define the two-hour payment expiry start point, grace/override rule and customer wording.
9. Confirm reminder timing/channel and WhatsApp API provider if automation is wanted.
10. Finalise cancellation, substitution and partial-fulfilment policy subject to consumer law.
11. Define delivery assignment, proof/OTP and fallback proof.
12. Finalise privacy notice, consent copy, retention and deletion workflows.
13. Confirm tax/receipt/invoice treatment with a qualified accounting/tax review.
14. Map logical entities to existing database schema; approve roles/RLS and migration plan.
15. Finalise launch bundle/promotion/tax and cart persistence behaviour.

## 11. Canonical working documents

- [Product and catalogue model](product-model-v1.md)
- [Cart and merchandising rules](cart-merchandising-working-v1.md)
- [Application boundaries](application-boundaries-v1.md)
- [Page inventory](page-inventory-v1.md)
- [Order lifecycle](order-lifecycle-working-v1.md)
- [Order, payment and refund policy draft](../policies/order-payment-refund-working-v1.md)
- [Kitchen module specification](../nucleus/kitchen-module-working-spec-v1.md)
- [Order exception handling register](../operations/order-exception-handling-working-v1.md)

## 12. Change control

When a new decision is made:
1. Record the founder's exact decision and date.
2. Mark the previous entry superseded if it is replaced; preserve the history.
3. Update this register and the relevant detailed document in the same documentation pass.
4. Record operational, data, UI, permission, legal and customer-communication impacts.
5. Do not implement a pending/conflicting decision as if it were confirmed.

This register is a working index, not proof that all policies are legally final or that software has been implemented.
