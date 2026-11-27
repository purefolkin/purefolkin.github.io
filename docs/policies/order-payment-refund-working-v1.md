# Purefolk order, payment and refund policies — working v1

Status: Working policy draft; not a final legal policy  
Last updated: 27 November 2026  
Applies to: Website checkout, Nucleus order administration and future fulfilment interfaces

## 1. Purpose

Record the operating rules agreed for order-time customer information, payment verification, stock validation, receipts, communication consent and refunds. Nucleus is the source of truth for order and payment records. WhatsApp is a communication channel, not the authoritative order or payment ledger.

This document records business intent. Customer-facing terms must be reviewed against applicable Indian consumer, privacy, tax and payment-provider requirements before launch.

## 2. Order and address record

- Collect the delivery address on the Website checkout before order submission.
- Permit guest checkout; do not force account creation merely to place an order.
- A customer may maintain multiple saved addresses (for example Home, Office and Other).
- Keep the customer's saved address separate from the order's address snapshot.
- On order submission, preserve the exact address used for that order. Later changes to a saved address must not alter historical orders.
- Nucleus must retain the order reference and the minimum customer/contact details needed to fulfil and support that order, subject to access and retention controls.

## 3. Payment verification

### Current manual UPI operating flow

1. Customer submits the order on the Website.
2. The order is created once and is visible in Nucleus under one Order ID.
3. The Website can direct the customer to WhatsApp with a prefilled order summary; the customer must manually send that message.
4. Purefolk sends the payment QR/instructions through the agreed communication channel.
5. Customer makes the payment.
6. An authorised operator checks the actual credit in the receiving bank account.
7. The operator records the payment reference/UTR where available, amount, method, payment time, verifier and verification time in Nucleus.
8. Only after successful verification does Nucleus mark payment as verified and release a prepaid order to the normal Kitchen validation flow.

A screenshot, forwarded message or customer claim is not sufficient proof by itself. Later, a supported payment provider/webhook may automate verification, but Nucleus must still validate the trusted provider event and reconcile exceptions.

### Payment states

Payment status must be independent of order status. Use a controlled state model such as Pending, Paid, Failed, Partially Refunded and Refunded; refine exact values during the shared data-model review.

## 4. Order and payment receipts

- **Order Receipt:** generated when the order is created; includes Order ID, items, variants, add-ons, quantities, prices, charges and total. It may clearly show Payment Pending.
- **Payment Receipt:** generated only after payment verification; includes amount paid, method, transaction reference where available and verification details.
- Both receipts refer to the same Order ID.
- A normal order/payment receipt must not be represented as a GST tax invoice unless the applicable legal and tax requirements are satisfied.

## 5. Stock validation and Kitchen release

Before releasing a prepaid order to the Kitchen queue, Nucleus validates:
- Payment has been verified as paid.
- Products, variants and selected add-ons are active and available.
- Required stock can be reserved.
- Delivery address is serviceable.
- Kitchen is open and able to accept work.

If all configured conditions pass, Nucleus automatically routes the order to Kitchen. Admin handles exceptions where validation fails or a human decision is required; Admin should not manually approve every normal order.

Stock controls should prevent ordering quantities that are no longer available. If a system or operational failure nevertheless creates a paid order for an unavailable item, record the affected line and contact the customer with an approved resolution, such as a customer-approved alternative, partial fulfilment or refund.

## 6. Communication consent

- Transactional WhatsApp communication (such as order updates and payment reminders) and marketing messages are separate purposes.
- Ask for separate consent for transactional updates/reminders and for marketing.
- Do not infer marketing consent from a customer providing a phone number or agreeing to order updates.
- Record consent purpose, wording/version, timestamp and withdrawal/opt-out where applicable.
- Automated WhatsApp messages require an eligible WhatsApp Business Platform/API setup, applicable templates and policy compliance; an ordinary WhatsApp app does not itself provide the agreed automated reminder workflow.

## 7. Refund eligibility — current proposed business policy

Refunds are initiated only for payments verified as received.

Current proposed valid reasons:
- Purefolk made an order fulfilment error.
- Wrong item supplied.
- Item missing from the order.
- Food/item damaged.
- Duplicate or excess payment.
- An item became unavailable after payment due to a system or operational failure.

A customer simply changing their mind is not an automatic refund reason under the current proposed business policy. This rule is subject to mandatory consumer rights and remedies and must not be used to deny a remedy required by applicable law.

If one item is affected but the remaining order can be fulfilled, evaluate a customer-approved replacement or line-level/partial refund rather than automatically refunding the full order.

## 8. Refund workflow and evidence

Use distinct states:
1. **Refund Requested**
2. **Under Review**
3. **Initiated**
4. **Completed**

Do not mark a refund Completed merely because an operator has submitted or initiated it. Completed means the bank/payment provider confirms the funds have been returned.

For every refund, retain:
- Order ID and affected order line(s), if partial.
- Verified original payment reference.
- Reason and supporting notes/evidence where appropriate.
- Refund amount and currency.
- Decision-maker/authorised actor.
- Requested, reviewed, initiated and completed timestamps as applicable.
- Bank/provider refund reference and confirmation.
- Customer communication and final resolution.

Failed, delayed and partial refunds must remain visible for reconciliation and must not be silently marked complete.

## 9. Privacy and retention

- Limit staff access to customer details to what their operational role requires.
- Keep order snapshots immutable while allowing correction of customer profile data separately.
- Store consent evidence and payment references needed for accountability, but do not store banking credentials, UPI PINs or unnecessary sensitive information.
- Define retention, deletion/anonymisation, access logging and customer request handling before launch.

## 10. Open items before implementation

- Final customer-facing cancellation and refund terms, including statutory rights.
- Final bank/payment-provider collection method and permitted account type.
- Exact payment and refund state vocabulary and permissions.
- Whether payment reminders are sent through an approved WhatsApp Business Platform/API provider.
- Retention periods and privacy notice wording.
- Applicable tax invoice/receipt requirements.
- Partial fulfilment and substitution approval flow.

## 11. Implementation boundary

This document does not authorise production database migrations, live payment processing, live order writes or a public launch. Implement only after policy review, shared data-model approval, server-side validation, role/permission design, audit logging and development-environment testing.
