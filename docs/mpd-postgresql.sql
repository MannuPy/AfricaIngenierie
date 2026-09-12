-- MPD PostgreSQL  -  Africa Ingénierie
-- Statut au 28/08/2026 : modèle SQL de conception et de référence métier.
-- Le schéma exécuté localement est celui des migrations Payload dans
-- apps/cms/src/migrations/. Il utilise notamment users.role comme enum et les
-- tables natives de versionnage Payload. Ne pas exécuter ce fichier à la place
-- de `pnpm migrate`.
-- Version 1.0  -  modèle cible Payload/PostgreSQL
-- Exécuter dans une base dédiée. Les migrations de production seront versionnées.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE SCHEMA IF NOT EXISTS cms;
SET search_path = cms, public;

CREATE TYPE content_status AS ENUM ('draft', 'review', 'published', 'archived');
CREATE TYPE message_status AS ENUM ('new', 'in_progress', 'replied', 'closed', 'redacted');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'publish', 'unpublish', 'archive', 'delete', 'login', 'logout', 'settings_change');

CREATE TABLE roles (
  id text PRIMARY KEY CHECK (id IN ('administrator', 'publisher', 'editor')),
  label_fr text NOT NULL,
  label_en text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO roles (id, label_fr, label_en) VALUES
  ('administrator', 'Administrateur', 'Administrator'),
  ('publisher', 'Publicateur', 'Publisher'),
  ('editor', 'Éditeur', 'Editor')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_key text NOT NULL UNIQUE,
  original_filename text NOT NULL,
  mime_type text NOT NULL CHECK (mime_type IN ('image/jpeg','image/png','image/webp','image/avif','application/pdf')),
  byte_size bigint NOT NULL CHECK (byte_size > 0 AND byte_size <= 20971520),
  width integer CHECK (width IS NULL OR width > 0),
  height integer CHECK (height IS NULL OR height > 0),
  alt_fr text NOT NULL CHECK (char_length(btrim(alt_fr)) >= 5),
  alt_en text CHECK (alt_en IS NULL OR char_length(btrim(alt_en)) >= 5),
  caption_fr text,
  caption_en text,
  rights_note text,
  is_public boolean NOT NULL DEFAULT false,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL UNIQUE,
  password_hash text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role_id text NOT NULL REFERENCES roles(id),
  locale text NOT NULL DEFAULT 'fr' CHECK (locale IN ('fr','en')),
  is_active boolean NOT NULL DEFAULT true,
  must_change_password boolean NOT NULL DEFAULT true,
  failed_login_count integer NOT NULL DEFAULT 0 CHECK (failed_login_count >= 0),
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE media_assets
  ADD CONSTRAINT media_assets_uploaded_by_fk FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE site_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  site_name_fr text NOT NULL,
  site_name_en text NOT NULL,
  baseline_fr text NOT NULL,
  baseline_en text NOT NULL,
  phone text,
  phone_raw text,
  whatsapp text,
  email citext,
  address_line1 text,
  address_line2 text,
  city text,
  country text,
  logo_media_id uuid REFERENCES media_assets(id) ON DELETE SET NULL,
  favicon_media_id uuid REFERENCES media_assets(id) ON DELETE SET NULL,
  default_locale text NOT NULL DEFAULT 'fr' CHECK (default_locale IN ('fr','en')),
  enabled_locales text[] NOT NULL DEFAULT ARRAY['fr','en'] CHECK (enabled_locales <@ ARRAY['fr','en']::text[] AND 'fr' = ANY(enabled_locales)),
  cookie_title_fr text NOT NULL,
  cookie_title_en text NOT NULL,
  cookie_text_fr text NOT NULL,
  cookie_text_en text NOT NULL,
  seo_title_fr text NOT NULL,
  seo_title_en text NOT NULL,
  seo_description_fr text NOT NULL,
  seo_description_en text NOT NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  network text NOT NULL CHECK (network IN ('linkedin','facebook','youtube')),
  label_fr text NOT NULL,
  label_en text NOT NULL,
  url text,
  position integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  UNIQUE (network)
);

CREATE TABLE navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES navigation_items(id) ON DELETE CASCADE,
  label_fr text NOT NULL,
  label_en text NOT NULL,
  href text NOT NULL CHECK (left(href, 1) = '/' OR left(href, 1) = '#'),
  position integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  UNIQUE (parent_id, position)
);

CREATE TABLE legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_key text NOT NULL UNIQUE CHECK (document_key IN ('legal_notice','privacy_policy')),
  title_fr text NOT NULL,
  title_en text NOT NULL,
  body_fr text NOT NULL,
  body_en text NOT NULL,
  status content_status NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  label_fr text NOT NULL,
  label_en text NOT NULL,
  title_fr text NOT NULL,
  title_en text NOT NULL,
  intro_fr text,
  intro_en text,
  cta_label_fr text,
  cta_label_en text,
  cta_href text,
  position integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE expertises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  icon_key text,
  title_fr text NOT NULL,
  title_en text NOT NULL,
  summary_fr text NOT NULL,
  summary_en text NOT NULL,
  body_fr text NOT NULL,
  body_en text NOT NULL,
  service_points jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(service_points) = 'array'),
  media_id uuid REFERENCES media_assets(id) ON DELETE SET NULL,
  status content_status NOT NULL DEFAULT 'draft',
  seo_title_fr text NOT NULL,
  seo_title_en text NOT NULL,
  seo_description_fr text NOT NULL,
  seo_description_en text NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title_fr text NOT NULL,
  title_en text NOT NULL,
  summary_fr text NOT NULL,
  summary_en text NOT NULL,
  body_fr text NOT NULL,
  body_en text NOT NULL,
  client_name text,
  country text,
  start_date date,
  expertise_id uuid REFERENCES expertises(id) ON DELETE SET NULL,
  status content_status NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE realisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title_fr text NOT NULL,
  title_en text NOT NULL,
  client_name text,
  year smallint CHECK (year BETWEEN 1900 AND 2200),
  sector text,
  country text,
  expertise_id uuid REFERENCES expertises(id) ON DELETE SET NULL,
  summary_fr text NOT NULL,
  summary_en text NOT NULL,
  context_fr text NOT NULL,
  context_en text NOT NULL,
  solution_fr text NOT NULL,
  solution_en text NOT NULL,
  results_fr text NOT NULL,
  results_en text NOT NULL,
  metrics jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(metrics) = 'array'),
  before_media_id uuid REFERENCES media_assets(id) ON DELETE SET NULL,
  after_media_id uuid REFERENCES media_assets(id) ON DELETE SET NULL,
  before_alt_fr text,
  before_alt_en text,
  after_alt_fr text,
  after_alt_en text,
  is_featured boolean NOT NULL DEFAULT false,
  status content_status NOT NULL DEFAULT 'draft',
  seo_title_fr text NOT NULL,
  seo_title_en text NOT NULL,
  seo_description_fr text NOT NULL,
  seo_description_en text NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE formations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  theme text NOT NULL,
  title_fr text NOT NULL,
  title_en text NOT NULL,
  duration text NOT NULL,
  format_fr text NOT NULL,
  format_en text NOT NULL,
  summary_fr text NOT NULL,
  summary_en text NOT NULL,
  audience_fr text NOT NULL,
  audience_en text NOT NULL,
  prerequisites_fr text,
  prerequisites_en text,
  objectives jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(objectives) = 'array'),
  status content_status NOT NULL DEFAULT 'draft',
  seo_title_fr text NOT NULL,
  seo_title_en text NOT NULL,
  seo_description_fr text NOT NULL,
  seo_description_en text NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE formation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id uuid NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  location_name text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  seats integer CHECK (seats IS NULL OR seats > 0),
  status content_status NOT NULL DEFAULT 'draft',
  UNIQUE (formation_id, starts_at)
);

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  type_fr text NOT NULL,
  type_en text NOT NULL,
  title_fr text NOT NULL,
  title_en text NOT NULL,
  summary_fr text NOT NULL,
  summary_en text NOT NULL,
  body_fr text NOT NULL,
  body_en text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  location_name text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  calendar_url text,
  status content_status NOT NULL DEFAULT 'draft',
  seo_title_fr text NOT NULL,
  seo_title_en text NOT NULL,
  seo_description_fr text NOT NULL,
  seo_description_en text NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR ends_at >= starts_at)
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  category_fr text NOT NULL,
  category_en text NOT NULL,
  title_fr text NOT NULL,
  title_en text NOT NULL,
  summary_fr text NOT NULL,
  summary_en text NOT NULL,
  description_fr text NOT NULL,
  description_en text NOT NULL,
  availability_fr text NOT NULL,
  availability_en text NOT NULL,
  lead_time_fr text,
  lead_time_en text,
  specs jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(specs) = 'array'),
  media_id uuid REFERENCES media_assets(id) ON DELETE SET NULL,
  alt_fr text NOT NULL CHECK (char_length(btrim(alt_fr)) >= 5),
  alt_en text,
  cta_label_fr text NOT NULL DEFAULT 'Demander un devis',
  cta_label_en text NOT NULL DEFAULT 'Request a quotation',
  cta_href text NOT NULL DEFAULT '/contact',
  is_featured boolean NOT NULL DEFAULT false,
  status content_status NOT NULL DEFAULT 'draft',
  seo_title_fr text NOT NULL,
  seo_title_en text NOT NULL,
  seo_description_fr text NOT NULL,
  seo_description_en text NOT NULL,
  og_media_id uuid REFERENCES media_assets(id) ON DELETE SET NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  role_fr text NOT NULL,
  role_en text NOT NULL,
  bio_fr text NOT NULL,
  bio_en text NOT NULL,
  portrait_media_id uuid REFERENCES media_assets(id) ON DELETE SET NULL,
  linkedin_url text,
  position integer NOT NULL DEFAULT 0,
  status content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  logo_media_id uuid REFERENCES media_assets(id) ON DELETE SET NULL,
  external_url text,
  position integer NOT NULL DEFAULT 0,
  status content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_fr text NOT NULL,
  quote_en text NOT NULL,
  person_name text NOT NULL,
  role_fr text,
  role_en text,
  company text,
  portrait_media_id uuid REFERENCES media_assets(id) ON DELETE SET NULL,
  consent_received_at timestamptz NOT NULL,
  status content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE homepage_products (
  section_id uuid NOT NULL REFERENCES homepage_sections(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  PRIMARY KEY (section_id, product_id)
);

CREATE TABLE homepage_realisations (
  section_id uuid NOT NULL REFERENCES homepage_sections(id) ON DELETE CASCADE,
  realisation_id uuid NOT NULL REFERENCES realisations(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  PRIMARY KEY (section_id, realisation_id)
);

CREATE TABLE homepage_formations (
  section_id uuid NOT NULL REFERENCES homepage_sections(id) ON DELETE CASCADE,
  formation_id uuid NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  PRIMARY KEY (section_id, formation_id)
);

CREATE TABLE homepage_events (
  section_id uuid NOT NULL REFERENCES homepage_sections(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  PRIMARY KEY (section_id, event_id)
);

CREATE TABLE contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email citext NOT NULL,
  company text,
  need text NOT NULL,
  message text NOT NULL,
  consent_at timestamptz NOT NULL,
  status message_status NOT NULL DEFAULT 'new',
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  ip_hash text,
  user_agent_hash text,
  retention_until date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE redirects (
  source_path text PRIMARY KEY CHECK (left(source_path, 1) = '/'),
  target_path text NOT NULL CHECK (left(target_path, 1) = '/'),
  status_code smallint NOT NULL DEFAULT 301 CHECK (status_code IN (301, 308)),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  version_number integer NOT NULL CHECK (version_number > 0),
  snapshot jsonb NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id, version_number)
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role_active ON users(role_id, is_active);
CREATE INDEX idx_content_status ON expertises(status);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_realisations_status_featured ON realisations(status, is_featured);
CREATE INDEX idx_formations_status ON formations(status);
CREATE INDEX idx_events_status_start ON events(status, starts_at);
CREATE INDEX idx_products_status_category ON products(status, category_fr);
CREATE INDEX idx_messages_status_created ON contact_messages(status, created_at DESC);
CREATE INDEX idx_messages_retention ON contact_messages(retention_until);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id, created_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['media_assets','users','site_settings','legal_documents','homepage_sections','expertises','projects','realisations','formations','events','products','team_members','partners','testimonials','contact_messages'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON cms.%I', 'trg_'||t||'_updated_at', t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON cms.%I FOR EACH ROW EXECUTE FUNCTION cms.set_updated_at()', 'trg_'||t||'_updated_at', t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION prevent_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only';
END;
$$;

CREATE TRIGGER trg_audit_no_update BEFORE UPDATE ON audit_logs FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();
CREATE TRIGGER trg_audit_no_delete BEFORE DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();

-- Le contrôle “publiable” reste dans Payload/hooks : les champs SEO, FR/EN et alt
-- sont requis avant le passage à published. Les règles SQL protègent les invariants.
