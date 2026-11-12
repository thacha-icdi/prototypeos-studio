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


## Approved product direction: no account login, 200 projects, no deletion

The intended user experience is **no signup and no login**. This is a product requirement, not an indication that the existing OIDC Worker has been replaced: **the current Worker still requires authentication and cloud sync remains disabled**.

Implementation requirements before enabling public writes:

1. Never expose `DATABASE_URL`, an administrative API key, or an editable global project collection to the browser.
2. Issue an unpredictable, per-project **edit capability** on project creation. Store only its cryptographic hash server-side; return the secret once and allow an owner to export it as a recovery key. Without the key, viewers cannot edit the project. A shared/public read view must not include the key.
3. Prevent automated abuse with Cloudflare Turnstile, rate limiting, strict payload limits, and request validation. CORS alone is not authentication.
4. Enforce a **global maximum of 200 projects** atomically in the database, including concurrent creation requests. When the limit is reached, reject new creation without deleting or overwriting any existing project. Counting only client-side projects is insufficient.
5. Expose no DELETE endpoint, bulk clear operation, automatic eviction, or destructive migration. Make local Clear affect only an unsaved form, never stored projects.
6. Preserve all existing browser-local projects (including balm and Smart Campus Companion) until a user-controlled export/import with preview, duplicate detection, and explicit confirmation has been tested.
7. Implement explicit Save, cloud status, recoverable revision conflicts, download backup, and restore. Back up the database before migrations; a no-delete policy alone does not protect against outages or data loss.
8. Clearly explain that losing an edit/recovery key may make a project uneditable from another device. No-login access does not provide automatic identity or device synchronization.
9. Add tests for unauthorized edits, guessed keys, simultaneous project #200/#201 creation, backup recovery, and preservation of existing local data.

Do not deploy the existing OIDC workflow as a no-login solution. First implement and test the separate capability-based backend and frontend migration flow. Free plans have usage limits and are not guaranteed to remain free.
