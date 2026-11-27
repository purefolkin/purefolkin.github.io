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
- Working checkout fields: full name, mobile number, house/flat/building, street/road, area/locality and PIN code; landmark and delivery instructions are optional. Confirm exact required/optional validation before implementation.
- Customers may select a saved address or add a new one. Address labels may include Home, Office and Other.
- Validate serviceability by configured PIN/locality/service area before payment/order submission. If not serviceable, block normal checkout; do not accept payment and promise delivery.
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

The final release gate is unresolved: earlier working notes specify automatic routing after all configured checks pass, while a later spoken recap mentioned an explicit Admin acceptance step. Admin handles failed checks and exceptions in either model. Do not implement either release-gate interpretation until the founder confirms it; see the Master Decision Register (ORD-03).

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
- Exact start event for the two-hour pending-payment window, grace/override rule and late-payment handling.
- Final reminder timing and customer-facing wording.
- Retention periods and privacy notice wording.
- Applicable tax invoice/receipt requirements.
- Partial fulfilment and substitution approval flow.

## 11. Implementation boundary

This document does not authorise production database migrations, live payment processing, live order writes or a public launch. Implement only after policy review, shared data-model approval, server-side validation, role/permission design, audit logging and development-environment testing.


---

## 12. Pending-payment window and reminders — 27 November 2026

### Payment window

- The working business choice is a maximum **two-hour Pending payment window**.
- The exact event that starts the two-hour clock is not yet specified. It must be defined consistently before implementation.
- At expiry, an unpaid order must not be released to Kitchen. The system should record expiry and stop future reminders.
- A payment arriving after expiry must be reconciled against the bank/provider record before any fulfilment decision. Do not automatically reopen or release it. Admin must follow the approved late-payment rule once defined.
- An authorised exception/extension, if allowed, must record actor, reason, new expiry and timestamp.

### Reminder schedule

- Reminder around **15–20 minutes** and another at **60 minutes** are proposals, not confirmed final timings.
- Send only while payment remains pending and only through a permitted, consented channel.
- Cancel scheduled reminders once payment is verified, the order is cancelled/expired, or the customer has opted out of that channel.
- Record attempt, provider message/reference, sent/delivered/failed status where available. Do not equate an attempted send with delivery.
- Automated WhatsApp reminders require an eligible WhatsApp Business Platform/API setup, approved templates and current policy compliance. A normal WhatsApp app is not the automation mechanism.

### WhatsApp order handoff

- Website may open WhatsApp with a prefilled order summary and Order ID.
- The customer must manually press Send. Opening WhatsApp or the prefilled chat is not evidence that the message reached Purefolk.
- Nucleus remains authoritative even if the customer never sends the optional message. The order/payment workflow must not depend on an unobservable WhatsApp-send event.

## 13. Checkout consent evidence

At checkout, keep separate choices for:
1. Necessary order/fulfilment communication and the specific transactional updates/reminders the customer is agreeing to receive.
2. Optional marketing/promotional communication.

Do not preselect optional marketing consent or infer it from a phone number, order submission or transactional consent. Store the purpose, exact wording/version, timestamp and withdrawal/opt-out record. Final copy and legal basis require privacy/legal review.
