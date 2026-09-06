# DealFlow

DealFlow helps real-estate teams submit a property deal, estimate potential value and returns, and review its stage in a shared pipeline. Public calculators provide quick estimates from client-side inputs. Account access and database-backed workspace features require a configured Supabase project; optional AI, email, billing, and property integrations require provider setup.

- [Live app](https://real-estate-deal-platform.vercel.app) · [Try the calculators](https://real-estate-deal-platform.vercel.app/calculators)
- Stack: Next.js App Router, React, TypeScript, and Supabase Auth/Postgres
- Public calculators: ARV, repairs, maximum allowable offer (MAO), ROI, financing, and 1031 exchange
- Workspace: deal pipeline and underwriting, contacts, comparables, formulas, team tools, analytics, and document workflows

Typical workflow: submit a deal, estimate value and costs with the calculators, then review the deal's stage in the pipeline. Workspace data is backed by the configured Supabase database. AI scoring, email, payment processing, and third-party property or document integrations require their own credentials.

## Develop locally

Use Node.js 20.9 or newer and npm. Create a Supabase project, configure the environment variables described in [development setup](docs/development-setup.md), then install and run the app:

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The SQL files in `supabase/migrations/` do not currently define a verified one-command fresh-database setup; read the database setup notes before applying them.

Common project commands:

```sh
npm run lint
npm run build
npm run start
```

## Documentation

- [Development setup and environment variables](docs/development-setup.md)
- [Architecture](docs/architecture.md)
- [Deployment and troubleshooting](docs/deployment-and-troubleshooting.md)
- [Contributing](docs/contributing.md)

## Project layout

```text
src/app/                  Next.js pages, layouts, and API route handlers
src/components/           Shared interface components
src/lib/actions/           Server actions and application operations
src/lib/integrations/      Optional third-party integrations
src/utils/supabase/        Browser, server, and middleware Supabase clients
supabase/migrations/       SQL changes and historical fixes
supabase/seed.sql          Optional example records; review before use
```

The repository snapshot does not include a `LICENSE` file. See [contribution notes](docs/contributing.md) before reusing or redistributing code.
