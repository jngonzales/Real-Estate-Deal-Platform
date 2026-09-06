# Deployment and troubleshooting

## Deployment configuration

The repository includes `vercel.json` configured for the Next.js framework. Vercel uses `npm run build`, `npm run dev`, and `npm install`; the local lockfile workflow is `npm ci`.

The Vercel configuration applies to the root Next.js app under `src/`. The `status-checker/` directory is an empty placeholder tree in this snapshot, not a second deployable app. See [architecture](architecture.md) for repository boundaries and [development setup](development-setup.md) for environment variables.

The production URL provided for this project is [https://real-estate-deal-platform.vercel.app](https://real-estate-deal-platform.vercel.app). A URL in this document is not a health check or confirmation of current deployment configuration.

For a deployment, set the Supabase project URL and anon key, the deployed `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL`, and any server-side credentials needed by the features you enable. Configure Supabase Auth's allowed site and redirect URLs for the deployed origin and `/auth/callback`. Keep service-role, API, webhook, and cron secrets in server-side environment settings; do not prefix them with `NEXT_PUBLIC_`.

The current build also needs `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL` because the Stripe webhook route creates its Supabase service client at module load, even when Stripe is not enabled. Keep the service-role key configured as a server-only secret.

The checked-in code creates Stripe checkout, customer portal, and webhook handlers under `/api/stripe/*`. Checkout currently builds an inline `price_data` line item from the plan amount in source; it does not use configured price IDs to create the checkout session. The pricing page reads `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and the server checkout/portal routes use `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_APP_URL`. The webhook needs `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`. `STRIPE_PRO_PRICE_ID` and `STRIPE_ENTERPRISE_PRICE_ID` are used when webhook subscription updates map Stripe prices back to plans; the checked-in defaults are placeholders. Configure those IDs to match the Stripe prices if using these events. An unrecognized webhook price ID currently falls back to the `pro` tier, so test subscription tier updates with Stripe's sandbox before relying on them. Do not infer that Stripe is active in production from the presence of these files.

## Scheduled jobs

`vercel.json` schedules `GET /api/cron/keep-alive` daily at **09:00 UTC** (`0 9 * * *`). The handler runs a read-only query against `deals` and returns database health. Set `CRON_SECRET` in the deployment; the route checks a matching bearer token or Vercel's cron header when the secret is configured. If it is unset, the route accepts requests without a bearer secret.

An optional GitHub Actions workflow at `.github/workflows/keep-alive.yml` runs on a roughly five-day schedule and can also be started manually. It expects repository secrets named `KEEP_ALIVE_APP_URL`, `KEEP_ALIVE_SUPABASE_URL`, and `KEEP_ALIVE_SUPABASE_ANON_KEY`. The workflow converts ping failures into warnings, so a green workflow result alone does not prove that both pings succeeded.

Other cron handlers exist in `src/app/api/cron/`, but `vercel.json` schedules only the keep-alive route. In particular, the cleanup handler requires `CRON_SECRET`; it is not scheduled by the checked-in Vercel configuration.

## Local checks

```sh
npm ci
npm run typecheck
npm run lint
npm run build
npm run start
```

`npm run start` serves a production build. The project does not define a test script. Build/lint checks do not verify remote Supabase configuration, RLS policies, cron invocation, or optional provider credentials.

## Troubleshooting

| Symptom | Checks |
| --- | --- |
| Dashboard redirects to login or cannot load data | Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; verify the Supabase Auth site/redirect URLs and that the database schema and RLS policies match the application. |
| `/api/health/database` returns an error | The handler queries `deals`. Check the URL/key, table availability, and returned database error. The endpoint checks database access, not every application feature. |
| Invite acceptance or public share/scout flows fail | Check whether that path needs `SUPABASE_SERVICE_ROLE_KEY`. Keep this key server-side; it bypasses RLS. |
| Password reset link uses the wrong host | Set `NEXT_PUBLIC_SITE_URL` to the correct origin and allow the resulting `/auth/callback` URL in Supabase Auth. |
| Address lookup, email, CAPTCHA, AI, or billing does not work | Check the provider-specific optional keys in [development setup](development-setup.md) and the provider's own configuration. Local or public calculator behavior does not prove an integration is configured. |
| API rate limits do not apply | Both Upstash URL and token must be set. If Redis is unreachable, middleware fails open and logs a warning. |
| Keep-alive did not run | Check the Vercel cron entry for `/api/cron/keep-alive`, its 09:00 UTC schedule, deployment status, and `CRON_SECRET`. The GitHub workflow is a separate optional backup. |
| Build fails after dependency changes | Use Node.js 20.9 or newer, run `npm ci` from the lockfile, then `npm run lint` and `npm run build`. |

The SQL files do not document a verified fresh-database migration order. For schema errors, confirm the intended baseline with the maintainer before applying historical or repair scripts to an existing database.
