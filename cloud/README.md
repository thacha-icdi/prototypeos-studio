# PrototypeOS Cloud — preparation only

The current GitHub Pages site continues using local storage. This folder is a backend scaffold, **not a live sync feature**.

## Setup (free tiers subject to limits)
1. Create a Neon Free PostgreSQL project. Run `schema.sql` in Neon SQL Editor.
2. Choose an OpenID Connect provider that issues signed JWT access tokens, publishes a JWKS endpoint and supports issuer/audience validation. Do not use arbitrary browser-supplied user IDs. Configure OIDC_ISSUER and OIDC_AUDIENCE for that provider.
3. In Cloudflare Workers, install dependencies from `package.json`; set DATABASE_URL with `wrangler secret put DATABASE_URL` (never commit it). Set OIDC_ISSUER, OIDC_AUDIENCE as environment variables.
4. Deploy and test /health, unauthorized 401, cross-user isolation, conflicting revisions, payload validation, and backups **before** wiring the browser to this API.
5. Add a deliberate import/merge screen: export local JSON first, preview projects, detect duplicate client IDs, and ask the user to confirm import. Never overwrite local records automatically.
6. For images, use private object storage with signed uploads and per-user authorization. This scaffold does not upload images.
7. Keep Cloud Sync disabled until real login, migration, error handling and recovery tests pass.

Security: the public GitHub Pages frontend must never contain a Neon database URL or a Worker secret. Browser data is not automatically migrated. Cloudflare Worker / Neon free allowances can change.
