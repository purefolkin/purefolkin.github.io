# ADR 0001: Isolated parallel development branch

- Status: Accepted for development scaffold
- Date: 2026-11-01

## Decision
Use the dedicated Git branch `build/purefolk-v1-parallel` for the new Purefolk platform scaffold.

## Boundaries
The branch is separate from `main`, `neclues-uat` and `build/neclues-foundation`. Existing branch history is retained. The new branch may replace its own working tree, but must not modify or delete files on other branches.

## Deployment
No Vercel project is connected or configured by this change. No deployment is requested or authorised by this ADR. Production remains untouched.

## Rationale
A clean, isolated workspace permits a new architecture without destabilising the existing website or UAT work.
