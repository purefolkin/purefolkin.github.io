# Purefolk order lifecycle — working design v1

Status: Working design, not a locked operating policy
Scope: Website + Nucleus. Future SPIRIT/EATFOLK interfaces must consume this same order record.

## 1. Purpose

Define one authoritative order record from customer intent through fulfilment, cancellation/refund and feedback. The Website and Nucleus must never create competing copies of the same order. The customer-facing status is a safe projection of the internal order state, not a second lifecycle.

## 2. Proposed happy path

1. **Browse** — customer views only published products and customer-safe information.
2. **Configure** — customer selects a sellable option and any permitted add-ons. Product, variant and add-on identities are captured.
3. **Cart** — server revalidates current product state, option validity, add-ons, price, availability and quantity. The cart is not authoritative for price or stock.
4. **Service check** — server validates address/PIN/locality, delivery eligibility, minimum order, fees, operating window, cut-off and slot capacity.
5. **Checkout** — customer confirms contact, address, instructions and order summary. Totals are calculated on the server.
6. **Payment / payment method** — payment intent or chosen payment method is recorded. The supported methods and payment timing remain to be confirmed.
7. **Order submission** — server creates one order and immutable line snapshots using validated values. Duplicate submission protection/idempotency is required.
8. **Acceptance** — an authorised operator accepts or rejects the order based on actual capacity and ingredient availability. Whether orders are auto-accepted or manually accepted is an open operating decision.
9. **Preparation** — kitchen work is started and progress is recorded. Future SPIRIT reads/writes the same order identity.
10. **Quality check and packing** — required checks and packing completion are recorded.
11. **Handover / delivery** — delivery assignment and handover are recorded. Future EATFOLK uses the same order identity.
12. **Delivered** — delivery completion is confirmed through a suitable proof/OTP process if selected.
13. **Feedback** — feedback is linked to customer, order and product where possible. Feedback can be private operational learning or an explicitly approved public testimonial.

## 3. Order state and payment state are separate

Do not create one overloaded status field.

Working order lifecycle states:
- awaiting_payment (only if online payment is selected)
- submitted
- under_review
- accepted
- rejected
- preparing
- quality_check
- packing
- ready_for_handover
- out_for_delivery
- delivered
- cancelled
- refund_pending
- refunded
- partially_refunded
- issue_open
- closed

Working payment states:
- not_required
- pending
- authorised
- paid
- failed
- partially_refunded
- refunded
- cash_due
- cash_collected

The final state vocabulary must be refined after the real payment and kitchen process is confirmed. State transitions must be explicit and permission-checked; a user must not be able to jump directly to an arbitrary state.

## 4. Exception paths that must be supported

| Exception | Required record / handling |
|---|---|
| Customer unreachable | Contact attempts, time, owner, timeout rule and final decision |
| Invalid or changed address | Revalidation, customer confirmation and serviceability outcome |
| Payment failure or delayed callback | Payment attempt IDs, reconciliation and safe retry |
| Duplicate order submission | Idempotency key and duplicate detection |
| Product becomes unavailable after cart | Revalidate before order creation; if already accepted, operator resolution and customer communication |
| Ingredient shortage | Affected line, decision owner, substitute/partial/cancel choice and customer approval |
| Order rejected by kitchen/operator | Reason, timestamp, customer notification and payment reversal where applicable |
| Preparation delay | Expected time, delay reason, owner and customer update |
| QC failure | Failed check, disposition, remake/refund/partial fulfilment decision |
| Packaging failure | Repack/recheck record and impact on dispatch time |
| Delivery delay | Assignment, location/contact attempts, revised ETA and resolution |
| Customer cancellation | Cancellation request time, policy decision, order state and refund state |
| Wrong, missing or damaged item | Affected line, evidence/notes, remedy and resolution |
| OTP/proof failure | Alternate authorised proof path and audit record |
| Complaint escalation | Severity, owner, response deadline and closure evidence |
| Privacy/access incident | Restricted incident record, responsible owner and response |
| Staff permission failure | Denied action, role, resource and audit event |
| API/system failure | Correlation ID, retry policy, safe customer message and reconciliation path |

Every exception should capture: state, responsible actor, timestamps, reason, customer communication, resolution and audit history.

## 5. Immutable order snapshots

At order creation, retain the exact customer purchase facts so later catalogue edits do not rewrite history:
- product and variant IDs plus names/SKUs as purchased
- selected add-ons and quantities
- description/option labels as purchased where necessary
- unit price, discounts, taxes, fees and totals
- ingredient/allergen/nutrition snapshot only where legally/operationally appropriate and supported
- delivery address and service terms applicable at purchase
- applied policy/version references

Do not store unnecessary sensitive information. Apply retention and access rules to customer details and operational notes.

## 6. Nucleus responsibilities

Nucleus is the control surface for:
- reviewing and accepting/rejecting orders
- seeing payment reconciliation state
- monitoring preparation and fulfilment status
- handling cancellations, refunds and exceptions
- assigning responsibility and recording communication/resolution
- viewing the full audit timeline

Future kitchen and delivery applications are separate interfaces, not separate order databases.

## 7. Decisions still open

Do not silently assume:
- prepaid, cash-on-delivery, UPI/manual payment or mixed payment support
- manual acceptance versus automatic acceptance
- same-day pre-order cut-off and exact service windows
- slot-based capacity versus simple daily capacity
- delivery assignment method and whether customer tracking is needed
- OTP requirement and approved fallback proof
- partial fulfilment/substitution policy
- cancellation/refund policy and timing
- exact operational state names and allowed transitions

These are business/operating decisions, not details to invent in code.

## 8. Build gate

Do not enable live checkout or order writes until:
1. Product/variant/add-on selection semantics are confirmed.
2. Serviceability, cut-off and capacity rules are defined.
3. Payment method and reconciliation process are defined.
4. State transitions and actor permissions are approved.
5. Exception and customer communication paths are tested.
6. Server-side validation, idempotency, RLS and audit logging are tested in development.


---

## 9. Kitchen workflow decisions — 27 November 2026

This section records decisions made after the original working draft. Where this section conflicts with an earlier open item, this dated section is the current working direction.

### Order release to Kitchen

- Nucleus validates the order before releasing it to the Kitchen queue.
- The agreed release conditions include verified payment, sellable products and selected add-ons being available, required stock being reservable, a serviceable delivery address, and the kitchen being open/able to accept work.
- The required validation conditions are checked before Kitchen release. **The final release gate is unresolved:** earlier working notes specify automatic routing when all checks pass, while a later spoken recap referred to an explicit Admin acceptance step. See section 11 and the Master Decision Register. Do not implement either interpretation until the founder confirms it.
- Orders that fail validation or require a human decision remain in the Nucleus Admin exception workflow.
- Payment verification and order/kitchen state remain separate records.

### Preparation start

- Arrival in the Kitchen queue does not mean preparation has started.
- A kitchen staff member must explicitly use **Start Preparation** when work actually begins.
- Record the actor (staff identity), order or work item, and timestamp. This provides a reliable preparation-start time distinct from order submission and queue-entry time.

### Preparation completion, QC and packing

- Staff explicitly marks preparation complete.
- Preparation completion does not mean the order is ready for dispatch.
- The order proceeds through a separate **Quality Check & Packing** stage.
- Only after required QC and packing are completed can the order move to **Ready for Dispatch / Handover**.
- The exact QC checklist, packing checklist, responsible role and customer-facing wording remain to be designed.

### Customer status projection

The working customer-safe progression is:
- Preparing
- Quality Check & Packing
- Ready for Dispatch

Internal queue, staff identity, assignment and audit details must not be exposed to customers.

### Staff and monitoring

- Kitchen operations are initially a workspace/module inside Nucleus, not a separate SPIRIT application.
- Each staff member needs an individual authenticated account/identity and role-based permissions. A Staff ID is an identifier, not by itself an authentication method.
- Nucleus records which staff member starts/completes work and when.
- Admin can monitor queue, active work, staff ownership, stage and exceptions.
- The exact assignment model (staff self-claim from a shared queue versus Admin assignment) is still open and must not be assumed.

The detailed module boundary and working screen specification are maintained separately in `docs/nucleus/kitchen-module-working-spec-v1.md`.


---

## 10. Confirmed payment, address and refund working rules — 27 November 2026

This section records the current operating decisions discussed with the founder. It is a working policy draft and must be checked against applicable consumer, tax, privacy and payment-provider requirements before launch.

### Payment verification before Kitchen release

- For the current manual UPI flow, the customer places the order and receives payment instructions separately.
- A payment is treated as verified only after the actual credit is checked in the receiving bank account or a trusted payment-provider confirmation is received.
- A customer-provided screenshot or message alone is not proof of payment.
- Nucleus records amount, method, transaction reference/UTR where available, payment time, verifier and verification time.
- An order requiring prepayment must not enter the normal Kitchen queue until payment is verified.
- Order state and payment state remain separate.

### Receipts

- Generate an Order Receipt when the order is created; it shows purchased items and amounts and may show Payment Pending.
- Generate a separate Payment Receipt after payment is verified; it records amount, method, transaction reference where available and verification details.
- Both receipts use the same Order ID.
- Do not label a receipt a GST tax invoice unless the applicable invoicing requirements are met.

### Address and consent records

- Collect the delivery address at website checkout, before order submission; do not rely on WhatsApp as the source of the address.
- Preserve an immutable order-time address snapshot. Later edits to a customer's saved address must not rewrite the address attached to an existing order.
- Transactional WhatsApp updates/payment reminders and marketing communication require separate consent choices. Do not treat transactional consent as marketing consent.
- Store only the consent evidence and customer data needed for the stated purpose, with access and retention controls.

### Stock and order acceptance

- Nucleus must validate sellable product/variant/add-on availability and reserve the required stock before releasing an order to Kitchen.
- The release-gate choice remains unresolved: automatic routing after validation versus an explicit Admin acceptance step. Do not treat either as final until the founder confirms the conflict recorded in section 11.
- Stock exhaustion should prevent new orders for the unavailable quantity. If a system failure nevertheless allows an unavailable item to be ordered, record the affected line and resolve with the customer through an approved replacement/partial-fulfilment or refund path.

### Refund eligibility and controls

- Initiate a refund only against a payment that has been verified as received.
- The current proposed valid reasons are Purefolk fulfilment error, wrong item, missing item, damaged item/food, duplicate or excess payment, and an item becoming unavailable due to a system/operational failure after payment.
- A customer simply changing their mind is not, under the current proposed business policy, an automatic refund reason. This policy must not override any mandatory rights or remedies under applicable law.
- Where only one line is affected and the rest of the order can be fulfilled, consider a line-level/partial refund or a customer-approved alternative rather than treating the whole order as refunded.
- Record the reason, affected order/line, amount, decision-maker, timestamps, customer communication and payment-provider/bank reference.
- Keep refund workflow states distinct: **Refund Requested → Under Review → Initiated → Completed**.
- Mark a refund **Completed** only after the return of funds is confirmed by the bank/payment provider. “Initiated” is not “Completed”.
- Reconcile failed, delayed or partial refunds; preserve the audit trail.

### Policy boundary

This is an operational working policy, not legal advice. Before live launch, review customer-facing cancellation/refund wording, privacy notice, consent language, tax receipt/invoice treatment and payment collection method for legal and provider compliance.


---

## 11. Decision reconciliation and exception handling — 27 November 2026

### Admin acceptance vs automatic Kitchen routing — CONFLICT / PENDING

The current notes contain two incompatible descriptions:
- Earlier working direction: Nucleus checks payment, availability, stock reservation, serviceability and Kitchen availability; if all pass, it automatically routes the order. Admin handles exceptions only.
- A later spoken recap described an Admin acceptance step after payment and before Kitchen queue entry.

The spoken recap was an assistant summary, not an explicit founder decision. Therefore this document does not silently replace the earlier direction or treat the Admin gate as confirmed. Keep the release gate configurable/unimplemented until the founder explicitly chooses. The Master Decision Register records this as ORD-03.

### Detailed exception register

The full working exception matrix is maintained in [Order and fulfilment exception handling](../operations/order-exception-handling-working-v1.md). It covers:
- Checkout/address/serviceability and cart validation.
- Duplicate order submissions and price/availability changes.
- Pending, late, short, excess, duplicate and unverified payments.
- WhatsApp message-send uncertainty, reminder failures and opt-outs.
- Acceptance/routing, stock and ingredient shortages.
- Kitchen queue ageing, staff claim conflicts, staff unavailability and preparation failures.
- QC, allergen/dietary safety, missing items and packaging failures.
- Delivery assignment, failed handover, customer unreachable, delay and proof/OTP failure.
- Cancellation, partial fulfilment, complaints, refunds, privacy/access and system outages.

Each exception must preserve an owner, timestamps, reason, evidence/reference, customer communication, decision, resolution and audit history. Exact owners, SLAs and customer-facing remedies remain pending where not approved.

### Canonical decision index

See [Master Decision Register](master-decision-register-v1.md) for status definitions and the consolidated list of confirmed working decisions, proposals, conflicts, pending choices and deferred scope.
