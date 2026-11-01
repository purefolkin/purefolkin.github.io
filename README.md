# Purefolk Platform

This repository contains the isolated Purefolk V1 parallel-development workspace.

## Systems
- `apps/nucleus` — central business rules, shared records, identity/access governance, APIs and audit.
- `apps/website` — customer-facing experience (scaffold only).
- `apps/spirit` — kitchen operations (scaffold only).
- `apps/eatfolk` — delivery operations (scaffold only).
- `apps/busyfolk` — restricted founder and management workspace (scaffold only).
- `packages/contracts` — shared, versioned integration contracts (initial placeholder).

## Development safeguards
- This branch is isolated: `build/purefolk-v1-parallel`.
- Do not merge to `main`, the existing UAT branches, or deploy to production without explicit founder approval.
- Do not place production secrets, customer data, payment data, or real employee personal data in this repository.
- Each system must own its operational records. NUCLEUS governs shared identifiers, validation, access, and cross-system coordination.
- A visible screen is not acceptance. Each module needs behaviour, permissions, tests, failure handling, audit coverage and documented acceptance.

## Current status
Stage 1 repository scaffold. Technology and data-store choices remain subject to explicit architecture decisions before production implementation.
