# Purefolk Nucleus — Order Processing & Inventory Validation

**Status:** Working draft for founder discussion  
**Last updated:** 28 November 2026  
**Scope:** Payment verification, order validation, physical inventory counts, stock movements, production feasibility, staff access and customer-facing product availability.

> **Decision discipline:** This document separates agreed working direction, proposed recommendations and unresolved decisions. Examples are illustrative, not actual Purefolk recipes, quantities or operating rules.

## 1. Payment Verification

- Every incoming order must undergo payment verification.
- Payment verification is a human-controlled process.
- An authorised staff member or Admin must verify the payment before the order proceeds.
- An order must not enter the Kitchen Queue without payment approval.
- The verification result and responsible staff identity must be recorded.

## 2. Automatic Order Validation

After payment approval, Nucleus automatically validates the order.

The system must check:
- Product, variant and add-on availability.
- Inventory conditions and the latest recorded stock quantity.
- Required stock reservations.
- Order details and required information.
- Any other configured conditions required for Kitchen processing.

If all required checks pass, the system automatically transfers the order to the Kitchen Queue.

If a check fails, stock is uncertain, or human judgement is required, the order must be held for Admin review. Admin intervention is for exceptions; routine valid orders do not require manual Admin acceptance.

## 3. Inventory Counting Schedule

Physical inventory must be checked and counted three times daily:

1. Morning
2. Afternoon
3. Evening

- Staff are responsible for checking and counting inventory at each scheduled check.
- Every inventory item must be counted during each scheduled check.
- Each count must be recorded in Nucleus.
- The record should include the inventory item, observed quantity and unit, date and time, and responsible staff identity.
- Previous count records must remain available for audit; a new count must not erase earlier records.

Exact clock times and staff assignment details are not yet defined.

## 4. Inventory Data Used for Order Validation

- Nucleus uses the latest recorded physical count as the stock baseline.
- Known reservations and recorded stock movements after that count must be accounted for.
- The system must distinguish the last physical count from calculated available stock.
- A scheduled physical count must not be represented as a real-time stock check.
- If available quantity is insufficient, inconsistent or uncertain, the order must be held for Admin review rather than released as a normal Kitchen order.

## 5. Kitchen Queue Transfer

An order can enter the Kitchen Queue only when:
- Payment has been verified and approved by an authorised person.
- Automatic system validation has succeeded.
- All required order conditions are satisfied.

Once these conditions are met, Nucleus automatically transfers the order to the Kitchen Queue dashboard for preparation by Kitchen staff.

## 6. Current Responsibility Summary

| Process | Responsibility |
|---|---|
| Payment verification | Authorised human staff / Admin |
| Physical inventory counting | Staff — three times daily |
| Order and stock validation after payment approval | Nucleus system |
| Kitchen Queue transfer after successful validation | Nucleus system |
| Kitchen preparation | Kitchen staff |
| Failed or uncertain validation | Admin exception review |

## 7. Event-Based Stock Movement Tracking — Discussed Concept

Event-based tracking means recording a stock movement when a stock-changing event happens, rather than relying only on the three scheduled physical counts.

The intended record for a movement should capture, at minimum:
- Inventory item.
- Quantity and unit.
- Movement/event type.
- Date and time (system-recorded where possible).
- Staff identity.
- Reason or reference, where relevant.

Examples discussed:
- Stock received / purchase received.
- Production completed (finished goods added to stock).
- Wastage or spoilage.
- Stock reserved for an order.
- Reservation released after cancellation.
- Stock issued to Kitchen.
- Stock adjustment after a discrepancy is reviewed.

### Important stock distinctions

Nucleus should distinguish:
1. **Physical stock:** quantity actually counted or held.
2. **Reserved stock:** quantity held for accepted orders and not available for another order.
3. **Available-to-sell stock:** quantity that can still be offered to customers under the configured rules.
4. **Stock movement ledger:** the chronological record explaining why quantities changed.

An order reservation is not automatically the same as physical stock consumption. The exact point at which stock is deducted from physical/on-hand stock (for example, when issued to Kitchen) must be defined before implementation. Cancellation should release a reservation according to the final order-state rules.

A physical count remains necessary. Event records explain expected changes; physical counts verify what is actually present.

## 8. Stock Ledger, Balance and Physical Count

The proposed architecture separates:
- **Stock Ledger:** append-only history of movements and adjustments; corrections should be recorded as new events rather than silently overwriting old history.
- **Inventory Balance:** the calculated current quantities, including reserved and available quantities.
- **Physical Count:** the observed quantity entered during the scheduled count.

The balance must be reconcilable against the ledger and physical counts. The exact reconciliation and discrepancy approval workflow is pending.

## 9. Staff Access and Role-Based Interface — Agreed Working Direction

Nucleus is the central system; this does not mean every employee should receive unrestricted access to the full Nucleus interface.

Working direction discussed:
- Keep staff workflows inside Nucleus rather than creating a separate application or website for each role.
- Provide role-based, limited interfaces so each person sees only the actions and information needed for their work.
- Kitchen staff can report relevant movements (such as production completion or wastage) through a restricted staff interface.
- Inventory staff / authorised Admin handle inventory verification, adjustments and discrepancy approvals.
- Admin retains broader oversight and approval permissions.

### Initial access approach

The founder agreed that a **shared device with individual staff PINs** can be used as an initial approach.

This is a working direction, not a complete authentication specification. PIN security, session timeout, staff onboarding/offboarding, audit logging and whether individual accounts are later required still need definition. A shared device must still identify the individual who submits each movement.

## 10. Production Feasibility and Raw Material Requirements — Discussed Concept

A product may require multiple inputs to make one saleable unit. For example, an illustrative 100g packaged product might require:
- A defined quantity of raw ingredient.
- One packaging pouch.
- One label.

The system should not assume that a partial quantity of an input can produce a complete saleable unit. For each product/variant, a recipe or bill of materials (BOM) would need to define the required ingredients, packaging and units.

A possible production-feasibility calculation is:

**Maximum producible quantity = the lowest whole-unit quantity supported by each required input**, after accounting for reserved/committed inputs, yield rules and any configured production constraints.

Illustrative example only:
- Raw ingredient: 750g, requirement 100g per packet → supports 7 complete packets.
- Pouches: 7, requirement 1 per packet → supports 7.
- Labels: 5, requirement 1 per packet → supports 5.
- Maximum producible quantity from these inputs: 5 packets.

Actual recipes, acceptable yield/loss, measurement precision, minimum batch sizes and packaging requirements have not yet been supplied or finalised. The example must not be treated as a real Purefolk recipe.

## 11. Customer Website Availability — Discussed, Not Finalised

The customer-facing website should receive an availability status from Nucleus; it should not independently calculate raw-material stock.

The discussion identified these distinct conditions:
- Finished goods are available for immediate sale.
- Finished goods are unavailable, but raw materials may support further production.
- Required raw material or packaging is insufficient to make a complete saleable unit.
- A product has been manually or temporarily disabled by an authorised person.

Potential customer-facing labels discussed include **In Stock**, **Available / Made to Order**, **Out of Stock** and **Currently Unavailable**. The final labels, display rules and whether to expose a reason to customers are pending.

### Provisional recommendation, not an approved final rule

The initial recommendation was conservative: if finished stock is zero, do not accept an order merely because raw materials appear sufficient. First complete production and confirm finished goods stock; then make the product available.

This avoids accepting orders without confirmed production capacity or a reliable preparation-time commitment. The founder deferred the decision for the next discussion. Therefore, this rule is **not locked**.

The alternative—accepting a Made-to-Order order based on calculated production feasibility—would require further decisions about capacity, preparation time, batch planning, order limits, ingredient reservations and failure handling.

## 12. Customer Website and Nucleus Responsibility Boundary

Proposed responsibility split:
- **Nucleus:** owns inventory records, stock movements, recipe/BOM requirements, production feasibility calculations, reservations and the authoritative availability decision.
- **Customer website:** displays the availability state supplied by Nucleus and applies the customer-facing purchase rules configured for that state.

The website should not display a product as available merely because some raw material remains. A complete saleable unit must be possible under the approved recipe/BOM and operating rules, or finished goods must already be available.

## 13. Decisions Still Pending

The following points have not yet been finalised and must not be assumed during implementation:

### Operations and counting
- Exact clock times for morning, afternoon and evening inventory counts.
- Staff allocation for counting inventory.
- Who reviews and approves inventory discrepancies.
- The discrepancy tolerance, recount process and approval rules.
- How stock movements are recorded and verified between scheduled counts.

### Stock movement and order lifecycle
- Which roles may submit each movement type.
- Exact stock impact and timing for reservations, Kitchen issue, production completion, wastage and cancellation.
- Whether Kitchen staff report a movement only or can submit the movement directly for later verification.
- Required evidence or reason fields for wastage and adjustments.

### Production
- Actual product/variant recipes or BOMs, units and required quantities.
- Yield, process loss, minimum batch size and fractional quantity rules.
- How production plans reserve raw materials and packaging.
- Who confirms completed production and when finished goods enter stock.

### Customer availability
- Whether zero finished stock always means Out of Stock until production is completed (the conservative recommendation), or whether Made to Order can be offered.
- Final customer-facing availability labels and wording.
- Whether availability is calculated continuously or refreshed at defined points.
- How to handle stock becoming unavailable after an order is placed, including customer choice of replacement or cancellation.
- The Admin override and temporary product-disable rules.

### Access and security
- Staff roles and exact permissions.
- PIN rules, session handling and audit requirements for the shared-device approach.
- Whether a dedicated individual login will be required later.

## 14. Implementation Boundary

This document records the current working decisions and discussion as of 28 November 2026. It is a planning document, not an implementation specification.

It does not authorise live inventory deductions, automatic substitutions, cancellations, refunds, production changes or automatic Made-to-Order acceptance. Those behaviours require explicit decisions, detailed workflows and testing before implementation.
