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
- When all required conditions pass, Nucleus automatically routes the order to the Kitchen queue.
- Orders that fail validation or require a human decision remain in the Nucleus Admin exception workflow; Admin should not manually approve every normal order.
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
