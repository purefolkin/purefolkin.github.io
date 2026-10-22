# Product Editor — Acceptance Checks

Branch: `build/neclues-foundation`

## Purpose
Manage existing Purefolk catalogue records through an authenticated Neclues interface without changing the production schema.

## Scope
- Sign in and sign out using Supabase Auth.
- List and search `public.pf_products`.
- Create and edit records using only the current columns.
- Toggle `is_available`.
- Preserve generated UUIDs and `created_at`.
- Do not hard-delete products.

## Required validation
- Name is required and trimmed.
- Price is a non-negative integer in the current database's integer unit (confirm whether this means whole rupees before launch).
- Original price is optional and, when supplied, must be a non-negative integer.
- Sort order must be a valid integer.
- Category and descriptive text must not be treated as trusted HTML.
- Failed requests must show an error and must not display a false success state.

## Security acceptance
- No service-role key in browser code.
- Unauthenticated requests must not read or mutate protected product records.
- Authenticated user must have only the intended product permissions.
- Verify effective RLS policies and actual sign-in/read/create/update behavior before calling this production-ready.
- Do not add permissive policies just to make the UI work.

## Not yet in scope
- Variants/sellable configurations, recipe relationships, lifecycle, publishing, SEO slugs, audit log, historical order snapshots.
- Those need domain decisions and a reviewed migration before implementation.
