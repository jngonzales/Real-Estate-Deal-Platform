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

- **Routes and interface.** App Router pages and layouts handle initial rendering and request-scoped data reads. Client Components handle interactive UI and can invoke server actions or HTTP endpoints. [Routes](../src/app/) · [Components](../src/components/)
- **Authenticated workspace.** The dashboard layout checks the current Supabase user and redirects unauthenticated requests to `/login`. Individual pages and actions enforce their own role and data checks. [Dashboard layout](../src/app/dashboard/layout.tsx)
- **Server operations.** Server actions handle operations invoked from the app. Route handlers provide HTTP entry points, including the auth callback and AI scoring. [Server actions](../src/lib/actions/) · [API handlers](../src/app/api/) · [Auth callback](../src/app/auth/callback/route.ts)
- **Supabase access.** The browser and server clients use the public Supabase connection settings and the user's session. The server client reads request cookies through Next.js. The server-only `createServiceClient()` uses a service-role key and bypasses RLS. [Browser client](../src/utils/supabase/client.ts) · [Server client](../src/utils/supabase/server.ts)
- **External services.** The app reads credentials and deployment-specific provider configuration from its environment. [Integration wrappers](../src/lib/integrations/) · [Development setup](development-setup.md)
- **Database.** The SQL files record the repository's schema and policy changes. A fresh install requires a separately verified migration sequence. [Migrations](../supabase/migrations/) · [Development setup](development-setup.md)
- **System status.** The root app serves `/admin/status` under a layout that checks the authenticated user's email against `ADMIN_EMAIL`. [Admin layout](../src/app/admin/layout.tsx) · [Health checks](../src/lib/health-checks.ts) · [Status components](../src/components/status-checker/)

The separate `status-checker/` directory contains only empty placeholder files in this snapshot. Its `package.json` and `tsconfig.json` are empty, so it has no standalone install, typecheck, or build workflow. The root `npm run build` builds the app under `src/`; the root TypeScript check follows the repository-wide globs in `tsconfig.json`.

## Public and authenticated features

Routes under `/calculators/` implement client-side tools that can be used without signing into the workspace. The ARV calculator, for example, starts with sample comparables and computes from the values in the form; those sample values are not live market data.

The dashboard routes under `/dashboard/` use Supabase authentication and database access. Public sharing, scout submissions, AI scoring, messaging, billing, and other integrations have separate route handlers and may require additional environment variables. A route or integration wrapper in source does not establish that its external account is configured in a particular deployment.

The deals list limits queries to the current user's `agent_id` unless the user is an admin or underwriter. The stage-update action checks for one of those roles or ownership or assignment on the target deal. Both operations use the current session, so the database policies still govern access. [Deal actions](../src/lib/actions/deal-actions.ts) · [Deals page](../src/app/dashboard/deals/page.tsx)

User management reads the caller's role and organization from their authenticated profile. Listing members and changing roles require an admin with an organization, and both restrict the target profile rows to that organization. The update also rejects changes to the caller's own role. The comparable-deals action reads the subject from the caller's organization or through direct ownership or assignment for a legacy deal without an organization. Both lookups use the caller's session and remain subject to RLS. Peer results come from closed deals in the caller's organization with the same city and property type. Callers without an organization can still see their authorized legacy deal's context. [User actions](../src/lib/actions/user-actions.ts) · [Comparable-deals action](../src/lib/actions/recommendation-actions.ts)

The documents page uses the same organization and legacy owner or assignee scope for the deal lookup. It then loads attachments by deal ID and resolves uploader IDs in the caller's organization. For callers without an organization, the uploader lookup is limited to their own profile. Intake photos can use `file_url` and a `photo` type. The page maps those and document uploads to a common display shape, using `storage_path`, `file_url`, or `file_path` in that order. Intake uploads use the `deal-attachments` bucket and document uploads use `deal-documents`. Legacy intake photos remain available to view and download. The grid and list show Delete for supported document-bucket paths. The deletion action checks the path and requires successful object removal before deleting the attachment row. [Documents page](../src/app/dashboard/deals/%5Bid%5D/documents/page.tsx) · [Document library](../src/components/documents/document-manager.tsx) · [Intake upload](../src/lib/actions/deal-actions.ts) · [Document actions](../src/lib/actions/attachment-actions.ts)

The authenticated score and formula handlers call a server-only Gemini module. It creates a shared `@google/genai` client on first use with `GOOGLE_GEMINI_API_KEY`. The default model is `gemini-3.5-flash-lite`, with a server-side `GOOGLE_GEMINI_MODEL` override. The module parses generated output and returns the existing fallbacks on provider or parsing failure. The score handler can save its result through the current user's Supabase session. [Scoring module](../src/lib/ai/deal-scoring.ts) · [Score handler](../src/app/api/deals/score/route.ts) · [Formula handler](../src/app/api/deals/formula/route.ts)

## Request flow and limits

Middleware refreshes Supabase sessions and copies session cookies and SDK-supplied headers onto the response. The auth callback passes SDK-supplied headers through to its redirects when exchanging an auth code. When both Upstash Redis variables are set, middleware limits API requests outside the health routes. If the limiter backend is unavailable, the code logs the failure and continues the request. [Middleware](../src/middleware.ts) · [Session refresh](../src/utils/supabase/middleware.ts) · [Auth callback](../src/app/auth/callback/route.ts)

Supabase applies the deployed Postgres RLS policies to user-scoped table requests. Attachment metadata is subject to the `attachments` table policies. File access is governed separately by Storage bucket visibility and the policies on `storage.objects`. Check both sets of policies in the target environment before changing data or file access. Repository SQL documents policy definitions, and the deployed rules require independent verification. Use the session-scoped client for ordinary workspace reads and writes. [Workspace policies](../supabase/migrations/20250601_multi_tenancy.sql) · [Attachment table policies](../supabase/migrations/20250602_multi_tenancy_sync.sql)

For local commands and manual verification, see [contributing](contributing.md). Deployment settings and operational checks are in [deployment and troubleshooting](deployment-and-troubleshooting.md).
