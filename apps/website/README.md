# Purefolk Website

Customer-facing application. This app is intentionally separate from Nucleus.

## Local development

1. Copy `.env.example` to `.env.local` and provide the Supabase project URL and publishable key when the reviewed catalogue read model is ready.
2. Run `npm install`, then `npm run dev`.

The current pages are a safe, non-transactional shell. Live product data, cart, checkout, customer accounts and order tracking are not enabled. Do not add hard-coded sample offers or claims.
