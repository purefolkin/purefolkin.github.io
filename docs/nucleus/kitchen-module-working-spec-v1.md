# Nucleus Kitchen module — working specification v1

Status: Working specification; not a locked implementation contract  
Last updated: 27 November 2026  
Application: `apps/nucleus`  
Relationship: Uses the single authoritative order record; no separate Kitchen order database

## 1. Purpose and boundary

The Kitchen module is an internal operational workspace inside Nucleus. It gives kitchen staff a phone-friendly way to view and progress eligible orders, while Admin monitors activity and handles exceptions.

This is not a separate SPIRIT application. A future SPIRIT application may become a dedicated kitchen interface later, but it must use the same order identity and governed data.

## 2. Actors and access

### Admin
- Configures kitchen operating rules and staff access.
- Monitors the full Kitchen queue and active work.
- Can see which staff member owns or is working on an order/work item, its current stage and timestamps.
- Handles exceptions and authorised overrides.
- Can inspect the order's audit timeline.

### Kitchen staff
- Sign in with an individual authenticated account.
- Have a stable Staff ID linked to that account.
- See the Kitchen workspace on their phone or another authorised device.
- Can perform only actions allowed by their role and current assignment/ownership.
- Cannot change payment verification, commercial totals, customer account data or unrelated Admin settings.

A Staff ID is not a password or authentication factor. Authentication and server-side permission checks are required. Do not trust a staff identity supplied only by the browser.

## 3. Order entry into Kitchen

Nucleus validates an order before releasing it to Kitchen. The agreed working conditions are:
- Payment is verified as paid.
- Ordered products, variants and selected add-ons are active and available.
- Required stock can be reserved.
- Delivery address is serviceable.
- Kitchen is open and able to accept work.

If all required conditions pass, Nucleus automatically routes the order into the Kitchen queue. If a condition fails or needs a human decision, the order goes to the Admin exception workflow rather than appearing as a normal ready-to-prepare order.

Admin should not need to manually accept every ordinary order after all automated checks pass.

## 4. Kitchen queue card

The queue card should show the minimum information needed to prepare accurately:
- Order ID and queue/received time.
- Food items, quantities and selected variants.
- Add-ons and their quantities.
- Customer preparation instructions (for example, less spicy).
- Current stage and priority/target time only where those values are configured and reliable.

Do not expose unnecessary customer personal data on the kitchen card. Show only fulfilment information required by the assigned staff.

## 5. Work lifecycle

The current agreed working progression is:

1. **Queued** — order passed Nucleus checks and is waiting for kitchen work. Queue arrival is not preparation start.
2. **Preparing** — a staff member explicitly presses **Start Preparation** when work actually begins. Record staff identity and timestamp.
3. **Preparation Complete** — staff explicitly marks the cooking/preparation work complete.
4. **Quality Check & Packing** — a separate stage; preparation completion must not mark the order ready for dispatch.
5. **Ready for Dispatch / Handover** — only after the required QC and packing steps are completed.

The exact state names, whether QC and packing are separate internal sub-stages, and the customer-visible wording require further review before implementation.

## 6. Staff ownership and assignment — pending

The user has described two staff members, each with a Staff ID, and wants Nucleus to show which staff member accepted and prepared which order or product.

The following design choices remain open:
- Staff self-claims an available order from a shared queue.
- Admin assigns an order to a specific staff member.
- Hybrid: Admin can assign, while staff can claim unassigned work within permitted rules.

Do not implement one of these as a confirmed business rule until selected. If work can be split by product/item, the data model must support item-level work ownership without losing the parent order identity.

## 7. Admin monitoring view

Admin should be able to monitor:
- New orders waiting in Kitchen.
- Orders currently being prepared.
- Staff member responsible for each active order/work item.
- Preparation start and completion times.
- QC and packing status.
- Ready-for-dispatch orders.
- Delayed, blocked or exception orders.

Monitoring must be based on recorded events and current state, not a manually maintained text label alone.

## 8. Audit and event records

For every meaningful action, record:
- Order ID and, if applicable, order-line/work-item ID.
- Action and previous/new state.
- Staff/Admin actor ID.
- Server-recorded timestamp.
- Reason or note when an exception, override or failure occurs.

The server is authoritative for timestamps and state transitions. Prevent duplicate or invalid transitions and preserve the event history.

## 9. Customer-facing status

Customer status is a safe projection, not a copy of the internal staff dashboard. The current working sequence is:
- Preparing
- Quality Check & Packing
- Ready for Dispatch

Do not expose staff names/IDs, internal notes, queue position, kitchen capacity or other internal operational details to customers.

## 10. Reliability and exception handling

The module must eventually define handling for:
- Staff does not start a queued order.
- Staff starts work but becomes unavailable.
- Two staff attempt to claim/start the same work.
- Item or ingredient becomes unavailable after queue entry.
- Preparation is delayed or fails.
- QC fails and an item must be remade or otherwise resolved.
- Packing fails or an order is incomplete.
- Staff loses connectivity or a device session expires.
- An unauthorised user attempts a state change.

For each case, define owner, permitted action, customer communication where needed, and audit event before launch.

## 11. Decisions still required

- Staff self-claim vs Admin assignment vs hybrid.
- Whether staff work on whole orders or individual order lines/products.
- Whether two staff can collaborate on the same order.
- Kitchen operating hours, capacity and queue priority rules.
- Whether QC and packing are one combined stage or two internal sub-stages.
- QC checklist, packing checklist and who is authorised to complete them.
- Preparation time estimates and delay thresholds.
- Exact staff permissions and Admin override rules.
- Exact internal state names and customer-visible status labels.

## 12. Implementation boundary

This document describes the workflow and module behaviour only. It does not authorise:
- Production database changes or migrations.
- Changes to the production website or main branch.
- Live order writes or payment processing.
- Building a separate SPIRIT application.

Before implementation, approve the pending decisions, map the shared order/work-item data model, define role permissions, and test state transitions and audit logging in a development environment.
