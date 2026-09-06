# Architecture

LotMerit is a single Next.js application. The browser, server-rendered pages, server actions, and API route handlers are all part of the App Router project.

```text
Browser
  └─ Next.js App Router
       ├─ pages and layouts in src/app/
       ├─ server actions in src/lib/actions/
       ├─ API handlers in src/app/api/
       ├─ session middleware in src/middleware.ts
       └─ Supabase clients in src/utils/supabase/
            └─ Supabase Auth and Postgres (RLS policies)

Optional integrations: Gemini, Geoapify, Resend, Stripe, PropStream,
DocuSign, Google Maps, Cloudinary, Slack, and Twilio
```

## Application layers

- **Routes and interface:** `src/app/` contains public pages, calculators, the dashboard, and API route handlers. `src/components/` contains shared UI and feature components.
- **Authenticated workspace:** `src/app/dashboard/layout.tsx` reads the current Supabase user and redirects unauthenticated requests to `/login`.
- **Server operations:** `src/lib/actions/` contains server actions; `src/app/api/` contains HTTP handlers for operations that need an API endpoint.
- **Supabase access:** `src/utils/supabase/client.ts`, `server.ts`, and `middleware.ts` create browser, server, and session-refresh clients. Most access uses the user's Supabase session and is subject to RLS. `createServiceClient()` uses a service-role key and bypasses RLS, so it must remain server-side.
- **External services:** `src/lib/integrations/` holds optional service wrappers. Credentials and provider-side configuration are not included in the repository.
- **Database:** `supabase/migrations/` contains SQL changes, but the current snapshot does not include a canonical migration runner or verified fresh-install sequence. See [development setup](development-setup.md) before applying SQL.

## Public and authenticated features

Routes under `/calculators/` implement client-side tools that can be used without signing into the workspace. The ARV calculator, for example, starts with sample comparables and computes from the values in the form; those sample values are not live market data.

The dashboard routes under `/dashboard/` use Supabase authentication and database access. Public sharing, scout submissions, AI scoring, messaging, billing, and other integrations have separate route handlers and may require additional environment variables. A route or integration wrapper in source does not establish that its external account is configured in a particular deployment.

## Request flow and limits

The middleware refreshes Supabase sessions. When both Upstash Redis variables are present, it also applies API rate limits; if the limiter backend is unavailable, the code logs a warning and continues the request. Without those variables, rate limiting is not initialized.

Database authorization is enforced by Supabase RLS in addition to the dashboard's signed-in check. Review both application code and the policies for a table when changing data access. Avoid using the service-role client for ordinary user-scoped reads or writes.
