# Purefolk Web Platform

Next.js App Router + TypeScript + Supabase. This app lives under apps/web so the existing GitHub Pages site at the repository root remains unchanged while the replacement is developed.

## Local development
1. Copy .env.example to .env.local.
2. Set the Supabase URL and publishable key.
3. Set PUREFOLK_ADMIN_USER_IDS to the trusted admin Auth UUIDs.
4. Run npm install, npm run dev.

## Safety
- Never expose Supabase secret/service-role keys in browser code or NEXT_PUBLIC variables.
- Admin authorization is checked server-side using verified Auth claims and a server-only allowlist.
- RLS remains mandatory; page protection is not a database security boundary.
- Preview deployments must be noindex.
- Do not enable production writes until reviewed migrations and RLS tests are complete.
