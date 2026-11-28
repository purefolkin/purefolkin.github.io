# Purefolk Nucleus — Order Processing & Inventory Validation

**Status:** Working draft for founder discussion  
**Date:** 28 November 2026  
**Scope:** Order payment verification, system validation, inventory checks and Kitchen Queue transfer

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

## 7. Decisions Still Pending

The following points have not yet been finalised and must not be assumed during implementation:

- Exact clock times for morning, afternoon and evening inventory counts.
- Staff allocation for counting inventory.
- Who reviews and approves inventory discrepancies.
- How wastage, spoilage, purchases, production, transfers and other stock movements are recorded between scheduled counts.
- What happens when an item becomes unavailable after an order is placed, including customer choice of replacement or cancellation.
- The detailed Admin exception-handling procedure.

## 8. Implementation Boundary

This document records the current working decisions. It does not authorise live inventory deductions, automatic substitutions, cancellations, refunds or production changes. Those behaviours require separate decisions and testing before implementation.
