# Development setup

The public calculators do not require a workspace account. Saved deals and team features use Supabase Auth and Postgres. For the route map, see [architecture](architecture.md); for deployment configuration, see [deployment and troubleshooting](deployment-and-troubleshooting.md).

## Prerequisites

- Node.js 26.x, as declared in `package.json`
- npm with support for lockfile version 3. The local maintenance run uses Node.js 26.13.0 and npm 12.2.3 on Windows x64. Node.js 26.13.0 and 26.13.1 ship with npm 11.20.0. [Node.js release index](https://nodejs.org/dist/index.json)
- A Supabase project for authentication and database-backed workspace features

## Install and run

```sh
git clone https://github.com/jngonzales/Real-Estate-Deal-Platform.git
cd Real-Estate-Deal-Platform
npm ci --engine-strict --strict-peer-deps
```

There is no checked-in `.env.example`. Create `.env.local` in the repository root with values from your own services. This example uses placeholders only:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Optional comma-separated allowlist for /admin/status.
ADMIN_EMAIL=you@example.com
```

Keep `.env.local` private. Never use a service-role key in a `NEXT_PUBLIC_*` variable or commit real credentials. The checked-in `.gitignore` excludes `.env*` files. A clean build needs the three Supabase variables shown above. The current build imports the Stripe webhook route, which creates a service-role Supabase client at module load; therefore `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` must be defined even if Stripe is not being used. Syntactically valid placeholders can be used for a build-only check, but they cannot run database-backed features.

Start the local server:

```sh
npm run dev
```

Visit `http://localhost:3000`. To use login and password-reset flows, configure the matching local site and callback URLs in Supabase Auth. The callback route is `/auth/callback`.

## Dependency and lockfile checks

Next.js and `eslint-config-next` are paired at 16.4.6. React and React DOM are paired at 19.3.1. TypeScript stays on 6.0.3 because the configured typescript-eslint parser supports versions below 6.1.0. ESLint stays on 9.39.5 because the Next lint config still resolves React, JSX accessibility, and import plugins whose peers exclude ESLint 10. ESLint 9 has reached end of life. [Next lint config dependencies](https://registry.npmjs.org/eslint-config-next/16.4.6) · [typescript-eslint parser metadata](https://registry.npmjs.org/@typescript-eslint%2fparser/8.74.0) · [ESLint version support](https://eslint.org/version-support/)

For an intentional dependency update, run a normal strict `npm install` to refresh the lockfile, then verify the written lockfile with `npm ci`. npm 12 can reject Tailwind's bundled Oxide fallback during `--package-lock-only` resolution even with the official registry selected. The normal install path succeeded with the default npm protections. [npm issue #9800](https://github.com/npm/cli/issues/9800)

To verify that a clean install leaves the lockfile byte-for-byte intact, run this from the checkout in PowerShell.

```powershell
$lotMeritLockBefore = (Get-FileHash -LiteralPath 'package-lock.json' -Algorithm SHA256).Hash
npm ci --engine-strict --strict-peer-deps --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'Lockfile install failed' }
$lotMeritLockAfter = (Get-FileHash -LiteralPath 'package-lock.json' -Algorithm SHA256).Hash
if ($lotMeritLockBefore -ne $lotMeritLockAfter) { throw 'package-lock.json changed during npm ci' }
```

## Database setup

Supabase supplies Auth and Postgres. The application expects tables such as `deals` and `profiles`; the database health route checks connectivity by querying `deals`.

The repository contains SQL under `supabase/migrations/`, but this snapshot has no `supabase/config.toml`, migration runner script, or single baseline schema. The filenames mix numbered, dated, and manual repair scripts, so they do not establish a safe fresh-database order. Do not run every SQL file against a production or existing database. Confirm the intended schema baseline and migration sequence with the project maintainer before applying changes.

`supabase/seed.sql` is optional example data. It selects the first user in `auth.users` and inserts sample property and deal records for that account. Review the script and use it only in a disposable development database, never production.

## Environment variables

Values are read by the code paths listed here. Configure only the integrations you plan to use; an environment variable name in source does not confirm that a production service is configured.

### Supabase and application

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL used by browser and server clients. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public/anon key used by browser, server, and middleware clients. Database access still depends on the project's RLS policies. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key used by selected sharing, invitation, scout, webhook, and administrative operations. The current build also requires it because the Stripe webhook route creates its Supabase client at module load. It bypasses RLS; do not expose it to the browser. |
| `NEXT_PUBLIC_APP_URL` | Origin used for invite links, email links, and Stripe return URLs. Set it to `http://localhost:3000` locally and the deployed origin in production. |
| `NEXT_PUBLIC_SITE_URL` | Origin used by password-reset links; if unset, the code falls back to the production site URL. |
| `ADMIN_EMAIL` | Comma-separated email allowlist for `/admin/status`; this is not the dashboard's database role system. |

### Optional integrations and operations

| Feature | Variables |
| --- | --- |
| AI deal scoring | Set the server-only `GOOGLE_GEMINI_API_KEY` to enable Gemini. The optional server-only `GOOGLE_GEMINI_MODEL` overrides the default `gemini-3.5-flash-lite`. [Gemini model documentation](https://aistudio.google.com/docs/models/gemini-3.5-flash-lite) |
| Geoapify address/property lookups | `NEXT_PUBLIC_GEOAPIFY_KEY`; other integration helpers also read `NEXT_PUBLIC_GEOAPIFY_API_KEY` or `GEOAPIFY_API_KEY`. |
| Email | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and/or `EMAIL_FROM` are read by separate email paths. Without a Resend key, some email actions are skipped. |
| Turnstile CAPTCHA | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` |
| API rate limiting | `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Without both, the middleware does not create rate limiters. |
| Stripe billing | `STRIPE_SECRET_KEY` is used by server checkout and portal routes; the pricing page reads `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` for its client-side redirect. The webhook route also needs `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`. Checkout creates inline `price_data` from the plan amounts in source. `STRIPE_PRO_PRICE_ID` and `STRIPE_ENTERPRISE_PRICE_ID` are used by webhook subscription updates to map Stripe prices to plans; their source defaults are placeholders, so set them to the actual Stripe price IDs if using those events. |
| Scheduled routes | `CRON_SECRET`; set this in deployed environments. The keep-alive route also accepts Vercel's cron header. |
| Maintenance mode | Set `MAINTENANCE_MODE=true` to make middleware return HTTP 503 outside `/api/health/*`. |
| PropStream | `PROPSTREAM_API_KEY` |
| DocuSign | `DOCUSIGN_INTEGRATION_KEY`, `DOCUSIGN_ACCESS_TOKEN`, `DOCUSIGN_ACCOUNT_ID`, `DOCUSIGN_BASE_URL`, and `DOCUSIGN_SECRET_KEY` |
| Google Maps | `GOOGLE_MAPS_API_KEY` |
| Cloudinary | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` |
| Slack notifications | `SLACK_WEBHOOK_URL` |
| SMS notifications | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` |
| Security helper salt | `HASH_SALT` |

`NEXT_PUBLIC_*` values are bundled for browser access. Only use public keys there; keep API secrets and service-role keys server-side.

## Check the local build

```sh
npm run typecheck
npm run lint
npm run build
```

`npm run typecheck` does not connect to Supabase or optional providers. The root build needs syntactically valid Supabase values because the Stripe webhook route creates a service-role client when its module loads; placeholders allow a compile check but do not verify a database connection. There is no `test` script in `package.json`, and a build or lint pass does not exercise a configured Supabase database or optional external services.
