# PrototypeOS Cloud — no-login edition (NOT LIVE YET)

The GitHub Pages site remains local-first. The Worker code is prepared in GitHub but is not deployed. The Neon schema amendments must be applied before deployment.

## Design
- No login. Public list shows project titles and types; project detail is publicly readable. Do not put private student information in projects.
- Every project is created with a cryptographically random 32-byte hex edit key, stored only on the owner's device or exported backup. The database stores only its SHA-256 hash.
- POST requires Cloudflare Turnstile verification to reduce automated project flooding. Turnstile site key must be configured in frontend before enabling creation.
- PUT requires project edit key and current revision to avoid blind overwrites. No DELETE route.
- Database trigger blocks all deletion and caps total project count at 2,000. A revision-history trigger archives the prior version before every project update.
- API has no automatic migration. Backup local projects and explicitly confirm import before Cloud upload.

## Steps before enabling
1. In Neon SQL Editor rerun updated `schema.sql` against the correct database; it is designed to preserve existing projects. **Back up database before changing schema.**
2. Create a Cloudflare Turnstile widget for the GitHub Pages hostname. Obtain site key (public) and secret key (private).
3. Configure GitHub Actions secrets for deployment: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `DATABASE_URL`, `TURNSTILE_SECRET`. Never commit credentials.
4. Deploy through manual workflow `Deploy PrototypeOS Cloud API (manual)` after secrets are configured. Confirm Worker URL and test GET, POST with Turnstile, PUT with correct/wrong edit key, concurrency cap and no DELETE.
5. The GitHub Pages frontend now includes optional Cloud Workspace on the Projects screen. Paste the exact deployed https://prototypeos-cloud-api.SUBDOMAIN.workers.dev URL and the Turnstile *site key* (public), then click Check Cloud; manually publish and import projects. The site does NOT auto-upload existing local records. No cloud functionality should be described as live until database migration and deployment are tested.
6. Embedded images or large records above roughly 235 KB cannot be published; keep original local JSON backups. There is no separate online photo storage.

## Important limitations
A missing edit key means the project cannot be edited from a new computer. No-login is not the same as no authorization. Anyone can view public project details. Free quotas apply and may change. A no-delete API does not prevent a database administrator from deleting records; retain offline backups.

## Frontend controls
The Projects page has optional Check Cloud, list/open remote projects, Publish new project, Save cloud changes, export/import edit keys. Publishing is explicit and requires a solved Turnstile challenge. Opening a remote project does not overwrite any project with the same ID on the device. Keep edit-key files private. The Cloudflare dashboard page URL is *not* the Worker API URL: the API URL is visible under the Worker route / workers.dev domain in Cloudflare.
