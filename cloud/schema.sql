-- PrototypeOS Cloud schema, run in Neon SQL editor.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS app_users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 external_subject text NOT NULL UNIQUE,
 email text,
 role text NOT NULL DEFAULT 'student' CHECK(role IN ('student','lecturer','admin')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS prototypes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 client_id text NOT NULL,
 kind text NOT NULL CHECK(kind IN ('product','process','business')),
 title text NOT NULL,
 payload jsonb NOT NULL DEFAULT '{}'::jsonb,
 revision bigint NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(owner_id,client_id),
 CHECK(jsonb_typeof(payload)='object')
);
CREATE INDEX IF NOT EXISTS prototypes_owner_updated_idx ON prototypes(owner_id,updated_at DESC);
CREATE TABLE IF NOT EXISTS prototype_evidence (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 prototype_id uuid NOT NULL REFERENCES prototypes(id) ON DELETE CASCADE,
 owner_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
 description text NOT NULL DEFAULT '',
 object_key text,
 created_at timestamptz NOT NULL DEFAULT now()
);
-- Do not expose Neon connection credentials to GitHub Pages.
-- All data access must pass through an authenticated backend which verifies ownership.
