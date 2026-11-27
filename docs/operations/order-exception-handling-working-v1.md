# Purefolk order and fulfilment exception handling — working register v1

Status: Working operational design; owners, time thresholds and customer-facing policies require approval
Last updated: 27 November 2026
Scope: Website checkout → Nucleus → payment → Kitchen → QC/packing → delivery → refund/support

## 1. Common exception record

Every exception should create or update a traceable case linked to the Order ID and, where relevant, the order line, payment or work item.

Required fields:
- Exception ID and type.
- Order ID; affected line/item/payment/work item where applicable.
- Current order, payment and fulfilment states (kept separate).
- Detected time and detection source.
- Responsible role/actor and current owner.
- Severity/priority and next-action deadline (thresholds to be configured, not invented).
- Facts, reason, evidence/reference and attempted actions.
- Customer communication, channel, time and outcome.
- Decision, approval actor and any customer consent required.
- Resolution, financial impact and final timestamps.
- Audit events for every state/owner/decision change.

Do not store payment credentials, UPI PINs or unnecessary sensitive customer data in an exception record.

## 2. Checkout and order creation

| Exception | Detection / immediate control | Responsible owner | Resolution to define |
|---|---|---|---|
| Invalid/incomplete address | Validate required fields and PIN/locality before order submission. | Website validation; Nucleus/Admin for override cases | Ask customer to correct; never silently guess address. |
| Address not serviceable | Block payment/order submission for normal flow. | Nucleus service rules; Admin for exception review | Customer may change address or stop checkout; no manual override without an approved service rule. |
| Price/availability changed after cart | Server revalidates before order creation. | Checkout service; Admin for unresolved case | Show changed cart and obtain customer confirmation before proceeding. |
| Required add-on/variant selection invalid | Validate eligibility, min/max and quantity rules. | Checkout service | Ask customer to correct; do not silently remove or replace. |
| Duplicate submission | Idempotency key and duplicate detection. | Order service; Admin reconciliation | Retain one authoritative order; reconcile duplicate payment/order attempts. |
| Customer unreachable before order confirmation | Record contact attempts and timestamps. | Admin/customer support | Timeout and cancellation rules remain pending. |

## 3. Payment and communication

| Exception | Detection / immediate control | Responsible owner | Resolution to define |
|---|---|---|---|
| Customer opens WhatsApp but does not send message | Do not infer message delivery from link open. | Customer; Admin sees no verified communication | Order remains governed by Nucleus state; contact only through consented channel. |
| Payment pending | Start configured payment window; do not release prepaid order to Kitchen. | Payment operator / Nucleus | Two-hour maximum pending window is the working choice; exact start event and expiry automation need confirmation. |
| Payment reminder due | Check current payment state before sending. | Nucleus + approved messaging provider | 15–20 minute and 60 minute reminders are proposed, not approved final timings. Cancel reminders after verified payment. |
| Payment screenshot but no bank credit | Do not mark Paid. | Authorised payment verifier | Ask customer to allow reconciliation; verify bank/provider record. |
| Wrong amount / short payment / excess payment | Reconcile actual credited amount against Order ID and payment reference. | Authorised payment verifier | Define top-up, partial payment or excess refund handling before launch. |
| Duplicate payment | Detect repeated transaction references/credits. | Authorised payment verifier | Link all credits; refund verified excess using approved refund workflow. |
| Delayed/failed provider callback | Keep payment unverified until trusted evidence/reconciliation. | Payment operator / technical owner | Reconcile without creating a second order or double credit. |
| Payment expires but customer pays late | Recheck bank credit before any fulfilment. | Admin/payment verifier | Define whether to reopen, accept if capacity allows or refund; do not auto-release. |
| WhatsApp/API send failure or opt-out | Record send/delivery/failure separately; respect opt-out. | Messaging owner | Use another permitted contact channel where appropriate; marketing and transactional consent remain distinct. |

## 4. Acceptance, stock and Kitchen release

| Exception | Detection / immediate control | Responsible owner | Resolution to define |
|---|---|---|---|
| Payment verified but acceptance/routing decision unresolved | Keep order in a controlled pre-Kitchen state. | Admin/business owner | Resolve the conflict: explicit Admin acceptance vs automatic routing after all configured checks. |
| Product/variant/add-on unavailable before Kitchen release | Fail validation; do not queue as ready work. | Nucleus inventory/catalogue; Admin | Customer-approved alternative, partial fulfilment or cancellation/refund under approved policy. |
| Ingredient shortage after order acceptance | Block affected work item and record shortage. | Kitchen lead; Admin for customer/commercial decision | Confirm substitute/partial/cancel with customer; do not silently substitute. |
| Kitchen closed or capacity unavailable | Prevent normal release or flag exception. | Nucleus operating rules; Admin | Rebook/decline/refund according to approved customer policy. |
| Staff does not claim/start queued work | Queue-age threshold should raise a visible alert. | Kitchen lead/Admin | Threshold and reassignment authority pending. |
| Two staff claim/start same work | Server-side atomic claim/lock; reject conflicting transition. | Nucleus system; Kitchen lead | Show current owner and log denied attempt. |
| Staff becomes unavailable mid-preparation | Preserve work state and actor history. | Kitchen lead/Admin | Reassign remaining work with explicit handover record; do not erase original actor. |
| Preparation delay | Record expected/actual times and reason. | Assigned staff/Kitchen lead | Notify customer when approved threshold is crossed; threshold and message pending. |
| Preparation failure / item unusable | Mark affected item blocked/failed; do not mark preparation complete. | Kitchen lead | Remake, customer-approved alternative, partial fulfilment or cancellation/refund. |
| Staff offline/session expires | Do not assume action succeeded unless server confirms it. | Staff/Kitchen lead; system owner | Re-authenticate and reconcile last persisted state; avoid duplicate start/complete events. |

## 5. Quality check and packing

| Exception | Detection / immediate control | Responsible owner | Resolution to define |
|---|---|---|---|
| QC check fails | Record failed check, item/batch and evidence; prevent Ready status. | Authorised QC role | Remake/rework/reject and repeat required checks. |
| Wrong or missing item detected before dispatch | Compare packed contents against order snapshot. | Packing/QC role | Correct pack and recheck. |
| Packaging damaged or unsuitable | Stop handover; record packaging issue. | Packing role | Repack and recheck; update dispatch estimate if delayed. |
| Allergen/dietary instruction cannot be safely met | Do not make an unsupported safety assurance. | Kitchen lead/Admin | Escalate and contact customer; define safe refusal/cancellation/refund path. |
| QC/packing actor or checklist not configured | Block implementation of final Ready transition. | Admin/operations owner | Approve checklist, role and evidence requirements before launch. |

## 6. Delivery and handover

| Exception | Detection / immediate control | Responsible owner | Resolution to define |
|---|---|---|---|
| No delivery partner/driver available | Keep order Ready; do not mark handed over. | Delivery/Admin | Assignment timeout and customer update pending. |
| Pickup/handover mismatch | Verify Order ID, package count and handover actor/time. | Kitchen + delivery owner | Reconcile before departure. |
| Customer unreachable at delivery | Record attempts and time/location where appropriate. | Delivery owner | Return/retry/cancel and cost policy pending. |
| Wrong address discovered after dispatch | Stop or redirect only under approved process. | Delivery owner/Admin | Confirm with customer; record extra fee/time if approved. |
| Delivery delay | Record reason, revised ETA and contact attempts. | Delivery owner | Customer update and escalation thresholds pending. |
| Wrong/missing/damaged item reported | Link complaint to order line and evidence. | Customer support/Admin | Remedy under approved policy; investigate kitchen/packing/delivery stage. |
| OTP/proof fails or unavailable | Do not falsely mark Delivered. | Delivery owner/Admin | Define approved fallback proof and audit it. |
| Order marked delivered but customer disputes receipt | Preserve delivery proof and communication; open issue. | Customer support/Admin | Investigate and resolve; do not overwrite original events. |

## 7. Cancellation, refund and complaints

| Exception | Detection / immediate control | Responsible owner | Resolution to define |
|---|---|---|---|
| Customer cancellation request | Record request time and current preparation/dispatch state. | Admin/customer support | Eligibility and cut-off rules must be approved; statutory rights remain applicable. |
| Purefolk rejects/cancels order | Record reason, actor and customer notice. | Admin | If payment received, initiate applicable verified-payment refund/reversal. |
| Partial order unavailable | Identify affected line and value. | Admin + Kitchen | Customer-approved alternative, partial fulfilment or line-level refund. |
| Duplicate/excess payment | Link duplicate credit to original order/payment. | Payment verifier/Admin | Refund verified excess and track completion. |
| Refund delayed/failed | Keep state Initiated/Under Review; do not mark Completed. | Finance/payment owner | Reconcile provider/bank reference and update customer. |
| Complaint escalated | Severity, owner and response deadline required. | Customer support/Admin | Define severity levels, SLA and closure evidence. |

## 8. Privacy, access and system failures

| Exception | Detection / immediate control | Responsible owner | Resolution to define |
|---|---|---|---|
| Unauthorised staff action | Server-side permission check denies action and logs actor/resource. | Security/Admin | Review role assignment; do not bypass RLS or audit. |
| Customer data exposed to wrong role | Restrict access and preserve incident record. | Admin/security owner | Incident response, containment and legally required communication/reports. |
| Data correction/deletion request | Verify requester and record scope. | Privacy/Admin owner | Define lawful retention exceptions and response workflow. |
| Website/Nucleus/API outage | Correlation ID, error log and safe retry; no false success. | Technical owner | Reconcile pending orders/payments after recovery. |
| Repeated event/webhook | Idempotent processing and duplicate detection. | Technical owner | Preserve one state transition and reconcile external transaction. |
| Audit/timestamp failure | Do not accept untraceable privileged transition. | Technical owner/Admin | Restore reliable event capture before resuming privileged workflow. |

## 9. Launch blockers and decisions required

Before live order fulfilment:
1. Resolve Admin acceptance vs automatic Kitchen routing.
2. Define order cancellation, late payment, substitution and partial fulfilment rules.
3. Confirm payment collection account/provider and reconciliation permissions.
4. Define payment expiry start event, grace/override and reminder schedule.
5. Approve WhatsApp provider, templates, consent and opt-out handling if automation is used.
6. Define Kitchen assignment, work granularity, collaboration and reassignment.
7. Approve Kitchen capacity, queue priority, delay thresholds and alerts.
8. Approve QC/allergen/packing checklists and responsible roles.
9. Define delivery assignment, failed-delivery, OTP and fallback proof.
10. Approve customer-facing refund/cancellation terms subject to applicable law.
11. Define incident response, privacy retention and role-access matrix.
12. Test idempotency, audit, RLS, retries and state transitions in development.

No exception path should be silently “handled” by changing a status manually without recording the reason, actor, time, customer impact and resolution.
