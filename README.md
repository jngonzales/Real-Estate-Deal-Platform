# LotMerit

LotMerit brings six public real-estate calculators and a Supabase-backed workspace together for evaluating and tracking property deals.

- [Open the live app](https://real-estate-deal-platform.vercel.app) · [Try the public calculators](https://real-estate-deal-platform.vercel.app/calculators)

The calculators are available without signing in. The saved workspace uses Supabase Auth, Postgres, and row-level security. AI scoring, email, Stripe billing, CAPTCHA, and property or document integrations are optional and require separate provider configuration.

## Try the public calculators

Open [all calculators](https://real-estate-deal-platform.vercel.app/calculators), choose ARV, Repairs, MAO, ROI, Financing, or 1031, then adjust the assumptions and review the estimate. Results use entered or sample values; they are not live market data.

## Save and track a deal

The workspace requires Supabase configuration. Create an account at `/login`, submit a property, and review it in the dashboard. Local setup and database limitations are covered in [development setup](docs/development-setup.md).

## Develop locally

Use Node.js 26.x and npm. Configure the local environment and install from the checked-in lockfile before starting the app. [Development setup](docs/development-setup.md)

```sh
npm ci --engine-strict --strict-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The SQL files in `supabase/migrations/` do not currently define a verified one-command fresh-database setup; read the database setup notes before applying them.

Common project commands:

```sh
npm run typecheck
npm run lint
npm run build
npm run start
```

## Documentation

- [Development setup and environment variables](docs/development-setup.md)
- [Architecture](docs/architecture.md)
- [Deployment and troubleshooting](docs/deployment-and-troubleshooting.md)
- [Contributing](docs/contributing.md)
- [LotMerit design](DESIGN.md)

## Project layout

```text
src/app/                  Next.js pages, layouts, and API route handlers
src/components/           Shared interface components
src/lib/actions/          Server actions and application operations
src/lib/integrations/      Optional third-party integrations
src/utils/supabase/        Browser, server, and middleware Supabase clients
status-checker/            Empty placeholders; no standalone app target in this snapshot
supabase/migrations/       SQL changes and historical fixes
supabase/seed.sql          Optional example records; review before use
```

The repository snapshot does not include a `LICENSE` file. See [contribution notes](docs/contributing.md) before reusing or redistributing code.
