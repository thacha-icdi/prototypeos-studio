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

-- Global hard cap. Serialized inserts prevent concurrent requests exceeding 2,000.
-- Existing records are never deleted automatically.
CREATE OR REPLACE FUNCTION prototypeos_enforce_project_limit()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(2040, 2000);
  IF (SELECT count(*) FROM prototypes) >= 2000 THEN
    RAISE EXCEPTION 'PrototypeOS project capacity reached (2000)'
      USING ERRCODE = 'P2000';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS prototypeos_project_limit ON prototypes;
CREATE TRIGGER prototypeos_project_limit
BEFORE INSERT ON prototypes
FOR EACH ROW EXECUTE FUNCTION prototypeos_enforce_project_limit();

-- Prevent accidental or intentional project deletion, including cascading deletes.
CREATE OR REPLACE FUNCTION prototypeos_prevent_project_delete()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Project deletion is disabled';
END;
$$;
DROP TRIGGER IF EXISTS prototypeos_no_project_delete ON prototypes;
CREATE TRIGGER prototypeos_no_project_delete
BEFORE DELETE ON prototypes
FOR EACH ROW EXECUTE FUNCTION prototypeos_prevent_project_delete();

-- Anonymous project ownership via unguessable edit key; never store plaintext keys.
ALTER TABLE prototypes ADD COLUMN IF NOT EXISTS edit_key_hash text;
CREATE UNIQUE INDEX IF NOT EXISTS prototypes_client_id_global_idx ON prototypes(client_id);
CREATE INDEX IF NOT EXISTS prototypes_recent_idx ON prototypes(updated_at DESC);
-- The API is the only route for writes; grant no public database credentials.

-- Append-only history: preserve the previous revision whenever a project changes.
-- Existing projects are retained; this migration does not truncate or delete data.
CREATE TABLE IF NOT EXISTS prototype_revisions (
 prototype_id uuid NOT NULL REFERENCES prototypes(id) ON DELETE RESTRICT,
 revision bigint NOT NULL,
 title text NOT NULL,
 kind text NOT NULL,
 payload jsonb NOT NULL,
 recorded_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(prototype_id, revision)
);
CREATE OR REPLACE FUNCTION prototypeos_archive_before_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 INSERT INTO prototype_revisions(prototype_id,revision,title,kind,payload)
 VALUES(OLD.id,OLD.revision,OLD.title,OLD.kind,OLD.payload)
 ON CONFLICT(prototype_id,revision) DO NOTHING;
 RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS prototypeos_keep_old_revisions ON prototypes;
CREATE TRIGGER prototypeos_keep_old_revisions
BEFORE UPDATE ON prototypes
FOR EACH ROW WHEN (
 OLD.revision IS DISTINCT FROM NEW.revision OR
 OLD.payload IS DISTINCT FROM NEW.payload OR
 OLD.title IS DISTINCT FROM NEW.title OR
 OLD.kind IS DISTINCT FROM NEW.kind
)
EXECUTE FUNCTION prototypeos_archive_before_update();
DROP TRIGGER IF EXISTS prototypeos_no_revision_delete ON prototype_revisions;
CREATE TRIGGER prototypeos_no_revision_delete
BEFORE DELETE ON prototype_revisions
FOR EACH ROW EXECUTE FUNCTION prototypeos_prevent_project_delete();
