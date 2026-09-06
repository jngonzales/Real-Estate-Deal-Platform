# Contributing

Use the repository's [Issues](https://github.com/jngonzales/Real-Estate-Deal-Platform/issues) page to discuss a larger change before implementation, and submit patches through [Pull requests](https://github.com/jngonzales/Real-Estate-Deal-Platform/pulls). Keep a pull request focused and describe the user-visible change, the affected area, and the checks you ran.

## Local workflow

1. Use Node.js 20.9 or newer and follow [development setup](development-setup.md).
2. Create a branch for the change and avoid committing `.env*` files, real user data, or provider credentials.
3. Run the relevant checks before opening a pull request:

   ```sh
   npm run lint
   npm run build
   ```

   The repository does not define a test script. State clearly if a change depends on Supabase or a third-party service that you could not verify locally.

## Code and database changes

- Keep new route handlers in the App Router structure under `src/app/` and reuse existing Supabase clients and server-action patterns where appropriate.
- Preserve user-scoped access and RLS. The Supabase service-role client bypasses RLS and should be limited to server-side operations that require it.
- Before changing SQL, identify how the change relates to the existing migration files. This snapshot has no canonical migration runner or verified fresh-install sequence; do not reorder or bulk-apply historical scripts without maintainer guidance.
- Treat keys with a `NEXT_PUBLIC_` prefix as browser-visible. Never place service-role, webhook, or provider secrets there.

## Repository terms

The repository snapshot does not include a `LICENSE` file. Do not assume a license or redistribute code on the basis that the repository is public. Confirm usage terms with the repository owner if they are needed for your contribution or project.
