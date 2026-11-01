# Architecture register

## System ownership
- NUCLEUS: canonical shared identity, access governance, business validation, shared identifiers, APIs/events governance and audit.
- WEBSITE: customer experience and customer input.
- SPIRIT: kitchen execution and kitchen operational records.
- EATFOLK: delivery execution, rider safety and delivery operational records.
- BUSYFOLK: restricted management visibility and analytics; consumes authorised source records.

## Integration rule
Systems communicate through controlled, documented contracts. A system must not write another system's operational records directly. Cross-system commands are validated by NUCLEUS where required; events are used for asynchronous notifications and workflow progression.

## Environment rule
Development, integration/UAT and production remain separate. No production secrets or personal/customer data in development. No production deployment without explicit founder approval.

## Open decisions
Technology stack beyond this initial Next.js NUCLEUS shell, database/provider, authentication provider, deployment topology, API/event transport, exact canonical schemas, retention policy and backup objectives remain open. Do not silently lock them through implementation.
