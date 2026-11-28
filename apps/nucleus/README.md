# Purefolk Nucleus

Internal business-control application. This app has a separate layout, navigation and authentication boundary from the public Website.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Set the Supabase URL, publishable key and server-only `PUREFOLK_ADMIN_USER_IDS` allowlist.
3. Run `npm install`, then `npm run dev`.

The initial modules are navigation/workflow placeholders. No database write operations are enabled. Authorization is checked server-side with verified Supabase claims and a server-only UUID allowlist. Database RLS is still mandatory; the UI gate is not a data security boundary.
